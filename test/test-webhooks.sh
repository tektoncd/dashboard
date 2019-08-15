#bash/bin
source test/credentials.sh
source test/util.sh

function github_download_and_change() {
  cd $baseDir
  if [ -d $DOWNLOAD_FOLDER ] ; then
    rm -rf $DOWNLOAD_FOLDER
  fi 
  git clone git@$GITHUB_URL_NO_HTTPS:$GITHUB_REPO.git
  cd $DOWNLOAD_FOLDER
  echo 'Hello, I am a temp file' >temp.txt
  git add temp.txt
  git commit -m "Adding a temp file"
  git push 

  return 0
}

function github_download_cleanup {
  cd $baseDir/$DOWNLOAD_FOLDER
  git rm temp.txt
  git add . 
  git commit -m "Removing a temp file"
  git push 
  rm -rf $baseDir/$DOWNLOAD_FOLDER

  return 0
}

function cleanup_previous_runs() {
  kubectl delete pipelineruns --all -n ${DASHBOARD_INSTALL_NS} 
  kubectl delete githubsource ghe-test -n ${DASHBOARD_INSTALL_NS}
  kubectl delete secret docker-push -n ${DASHBOARD_INSTALL_NS}
  kubectl delete secret github-secret -n ${DASHBOARD_INSTALL_NS}
  kubectl delete secret gh-secret -n ${DASHBOARD_INSTALL_NS}
}

function cleanup_webhooks_test() {
  kubectl delete configmap githubwebhook -n ${DASHBOARD_INSTALL_NS}
  kubectl delete --all ksvc -n ${DASHBOARD_INSTALL_NS}
  kubectl delete deployment myapp -n ${DASHBOARD_INSTALL_NS}
  kubectl delete svc simple-service -n ${DASHBOARD_INSTALL_NS}
  kubectl delete githubsource ghe-test -n ${DASHBOARD_INSTALL_NS}
  kubectl delete --all pipelineruns -n ${DASHBOARD_INSTALL_NS}
	kubectl delete --all pipelineresources -n ${DASHBOARD_INSTALL_NS}
  return 0
}

function test_webhooks() {
  cleanup_previous_runs
  if ! task_and_pipeline_download ; then 
    echo "Something went wrong with the download of the pipeline hotel"
    return 1 
  fi

  # github-secret is used to created webhooks
  kubectl create secret generic gh-secret \
    --from-literal=accessToken=$GITHUB_TOKEN_GHE \
    --from-literal=secretToken=$(cat /dev/urandom | LC_CTYPE=C tr -dc a-zA-Z0-9 | fold -w 32 | head -n 1) \
    --namespace $DASHBOARD_INSTALL_NS

  # docker-push secret used to push images to dockerhub
  post_data='{
      "name": "docker-push",
      "namespace": "'"${TARGET_NS}"'", 
      "type": "userpass",
      "username": "'"${DOCKERHUB_USERNAME}"'",
      "password": "'"${DOCKERHUB_PASSWORD}"'",
      "serviceaccount": "'"${SERVICE_ACCOUNT}"'",
      "url": {"tekton.dev/docker-0": "https://index.docker.io/v1/"}
  }'
  curl -X POST --header Content-Type:application/json -d "$post_data" http://localhost:9097/v1/namespaces/${DASHBOARD_INSTALL_NS}/credentials
  echo 'created docker-push'

  # github-repo-access-secret is used to check code out of github
  post_data='{
      "name": "github-secret",
      "namespace": "'"${TARGET_NS}"'",
      "type": "userpass", 
      "username": "'"${GITHUB_USERNAME}"'",
      "password": "'"${GITHUB_TOKEN_GHE}"'", 
      "serviceaccount": "'"${SERVICE_ACCOUNT}"'",
      "url": {"tekton.dev/git-0": "'"${GITHUB_URL}"'"}
  }'
  curl -X POST --header Content-Type:application/json -d "$post_data" http://localhost:9097/v1/namespaces/${DASHBOARD_INSTALL_NS}/credentials
  echo 'created github-secret'

  #Create webhook
  post_data='{
    "name": "ghe-test",
    "gitrepositoryurl": "'"${GITHUB_URL}"/"${GITHUB_REPO}"'",
    "accesstoken": "gh-secret",
    "namespace": "'"${DASHBOARD_INSTALL_NS}"'",
    "pipeline": "simple-pipeline",
    "serviceaccount": "'"${SERVICE_ACCOUNT}"'",
    "dockerregistry": "'"${DOCKERHUB_USERNAME}"'"
  }'
  curl -X POST --header Content-Type:application/json -d "$post_data" http://localhost:9097/v1/extensions/webhooks-extension/webhooks

  #Download github source and make a chnage to trigger the webhook
  github_download_and_change
}

function test_webhook_response() {
  #Kubectl wait is experimental and can work differently on different versions of kubernetes 
  #so checks multiple conditions to ensure result is accurate  
  pipelineRunExists=false 
  buildPassed=false
  pushPassed=false
  passed=false

  for i in {1..30}
  do
    # Check pipelinerun is successful
    webhookWait=$(kubectl wait --namespace ${DASHBOARD_INSTALL_NS} --for=condition=Succeeded pipelineruns -l gitRepo=${REPO_NAME} --timeout=30s) 
    if [[ "$webhookWait" == *"pipelinerun.tekton.dev/ghe-test-"* ]] && [[ "$webhookWait" == *"condition met"* ]] ; then
      passed="true"
      break
    fi
    
    #Backup to pipelinerun, both build and deploy must pass to be considered a pass  
    webhookWaitPush=$(kubectl wait --namespace ${DASHBOARD_INSTALL_NS} --for=condition=Succeeded taskrun -l tekton.dev/task=deploy-simple-kubectl-task --timeout=30s)
    if [[ "$webhookWaitPush" == *"taskrun.tekton.dev/ghe-test"* ]] && [[ "$webhookWaitPush" == *"condition met"* ]] ; then
      passed="true"
      break
    else
      sleep 5
    fi
  done
  
  if [ "$passed" == true ] ; then 
    echo "Webhooks test passed, was succesful for the webhook connected to $GITHUB_URL/$GITHUB_REPO "
    return 0
  elif [ "$passed" == "false" ] ; then
    echo "Test Failure, PipelineRun was not succesful for the webhook connected to $GITHUB_URL/$GITHUB_REPO" 
    return 1    
  fi  
}

function run_webhooks_install_and_test() {
  webhooksTestPassed=false

  if install_webhooks_extension ; then 
    echo "Installed webhooks extension successfully"
    test_webhooks
    if test_webhook_response ; then 
      webhooksTestPassed=true
    fi
  else 
    echo "Failed to install webhooks extension correctly"
  fi

  #Clean up the github / tasks and pipeline folders
  github_download_cleanup
  task_and_pipeline_cleanup
  cleanup_webhooks_test
  uninstall_webhooks_extension

  if [ $webhooksTestPassed == true ] ; then 
    return 0 
  else 
    return 1 
  fi	
}

function check_webhooks_combinations() {
	latestWorkingPipeline=${pipelineDashboardWorksArray[${#pipelineDashboardWorksArray[@]}-2]}
	latestWorkingDashboard=${pipelineDashboardWorksArray[${#pipelineDashboardWorksArray[@]}-1]}
	if ! install_tekton_pipelines $latestWorkingPipeline ; then
			echo "Something went wrong with the install of tekton-pipelines version $latestWorkingPipeline"
			uninstall_tekton_pipelines $latestWorkingPipeline
			exit 1
	fi 
	if ! install_dashboard $latestWorkingDashboard ; then
		echo "Something went wrong with the install of tekton dashboard version $latestWorkingDashboard"
		uninstall_tekton_pipelines $latestWorkingPipeline
		if ! uninstall_dashboard $latestWorkingDashboard ; then 
      echo "Something went wrong with the uninstall of tekton dashboard"
      exit 1
	  fi
		exit 1
	fi
	 
	kubectl port-forward $(kubectl get pod --namespace ${DASHBOARD_INSTALL_NS} -l app=tekton-dashboard -o name)  --namespace ${DASHBOARD_INSTALL_NS} 9097:9097 &
	dashboardForwardPID=$!
	if  ! checkPortForward ; then
			echo "Problem with the port forward, the port forwarded address was not available"
	else 
    create_docker_secret
		istio_install_and_check
	fi 

	kill -9 $dashboardForwardPID

	uninstall_tekton_pipelines $latestWorkingPipeline
  if ! uninstall_dashboard $latestWorkingDashboard ; then 
    echo "Something went wrong with the uninstall of tekton dashboard"
    exit 1
	fi
}
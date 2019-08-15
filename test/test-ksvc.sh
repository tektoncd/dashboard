#!/bin/bash
source test/util.sh
source test/credentials.sh

function cleanup_ksvc_test() {
	kubectl delete ksvc knative-helloworld -n default
	kubectl delete --all pipelineruns -n ${DASHBOARD_INSTALL_NS}
	kubectl delete --all pipelineresources -n ${DASHBOARD_INSTALL_NS}

	#Make sure all pods deleted
	ksvcPodsDeleted=false
	for i in {1..25} ; do
		if check_all_pods_in_namespace_deleted "default" ; then
			ksvcPodsDeleted=true
			break
		fi
		sleep 5
	done 

	if [ "$ksvcPodsDeleted" == true ] ; then 
		return 0 
	else 
		return 1 
	fi
}

function test_ksvc_creation() {
	patch_docker_sa

	#API configuration
	PIPELINE_NAME="simple-pipeline"
	IMAGE_SOURCE_NAME="docker-image"
	GIT_RESOURCE_NAME="git-source"
	GIT_COMMIT="master"
	REPO_NAME="knative-helloworld"
	REPO_URL="https://github.com/a-roberts/knative-helloworld"
	KSVC_NAME="knative-helloworld"
	KSVC_SERVICE_ACCOUNT="ksvc-tekton-dashboard"

	post_data='{
		"pipelinename": "'${PIPELINE_NAME}'",
		"imageresourcename": "'${IMAGE_SOURCE_NAME}'",
		"gitresourcename": "'${GIT_RESOURCE_NAME}'",
		"gitcommit": "'${GIT_COMMIT}'",
		"reponame": "'${REPO_NAME}'",
		"repourl": "'${REPO_URL}'",
		"registrylocation": "'${DOCKERHUB_USERNAME}'",
		"serviceaccount": "'${KSVC_SERVICE_ACCOUNT}'"
	}'

	echo $post_data

	curlNodePort="http://127.0.0.1:9097/v1/namespaces/${DASHBOARD_INSTALL_NS}/pipelineruns/"
	curl -X POST --header Content-Type:application/json -d "$post_data" $curlNodePort 

	if ! wait_for_ksvc_ready ; then 
		echo "Test Failure, the KSVC was not created succesfully"
		return 1
	else 
		return 0
	fi

	cleanup_deployment
}

function wait_for_ksvc_ready() {
	ksvcExists=false
  for i in {1..30}
  do
		ksvcWait=$(kubectl wait --namespace default --for=condition=ready kservice/knative-helloworld --timeout=30s)
    if [ "$ksvcWait" == "service.serving.knative.dev/knative-helloworld condition met" ] ; then
      ksvcExists=true
			break
    else
      sleep 5
    fi
  done

	if [ "$ksvcExists" == "true" ] ; then
    return 0
  else
		echo "Test Failure, KSVC creation was not succesfull" 
    return 1
  fi  
}

function create_ksvc_enabled_sa() {
  kubectl apply -f $testDir/ksvc-sa-test.yaml
}

function patch_docker_sa() {
	kubectl patch sa ksvc-tekton-dashboard -n $TARGET_NS \
		--type=json \
		-p="[{\"op\":\"add\",\"path\":\"/secrets/0\",\"value\":{\"name\": \"registry-secret\"}}]"
}

function delete_ksvc_enabled_sa() {
  kubectl delete -f $testDir/ksvc-sa-test.yaml
}

function run_ksvc_test() { 
	create_ksvc_enabled_sa
	task_and_pipeline_download

	ksvcTestPassed=false
  if test_ksvc_creation ; then 
    echo "Tested creation of a ksvc successfully"
		ksvcTestPassed=true
  else 
    echo "Failed to create a ksvc correctly"
  fi

  delete_ksvc_enabled_sa
	task_and_pipeline_cleanup
	cleanup_ksvc_test

  if [ $ksvcTestPassed == true ] ; then 
    return 0 
  else 
    return 1 
  fi 

}
#!/bin/bash

source test/util.sh
source test/credentials.sh

function pre_test_cleanup() {
	docker rmi $(docker images |grep 'gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/creds-init')
}

function cleanup_test() {
	kubectl delete deployment go-hello-world -n tekton-pipelines
	kubectl delete --all pipelineruns -n tekton-pipelines
	kubectl delete --all pipelineresources -n tekton-pipelines
	kubectl delete secret registry-secret -n tekton-pipelines
}

function test_pipeline_and_dashboard() {
	kubectl port-forward $(kubectl get pod --namespace tekton-pipelines -l app=tekton-dashboard -o name)  --namespace tekton-pipelines 9097:9097 &
	dashboardForwardPID=$!

	#API configuration
	APP_SERVICE_ACCOUNT="tekton-dashboard"
	PIPELINE_NAME="simple-pipeline"
	IMAGE_SOURCE_NAME="docker-image"
	GIT_RESOURCE_NAME="git-source"
	GIT_COMMIT="master"
	REPO_NAME="go-hello-world"
	REPO_URL="https://github.com/ncskier/go-hello-world"
	EXPECTED_RETURN_VALUE="Hello World! "
	REGISTRY="docker.io/${DOCKERHUB_USERNAME}"

	post_data='{
		"pipelinename": "'${PIPELINE_NAME}'",
		"imageresourcename": "'${IMAGE_SOURCE_NAME}'",
		"gitresourcename": "'${GIT_RESOURCE_NAME}'",
		"gitcommit": "'${GIT_COMMIT}'",
		"reponame": "'${REPO_NAME}'",
		"repourl": "'${REPO_URL}'",
		"registrylocation": "'$REGISTRY'",
		"registrysecret": "docker-push",
		"serviceaccount": "'${APP_SERVICE_ACCOUNT}'"
	}'

	if  ! checkPortForward ; then
			echo "Problem with the port forward, the port forwarded address was not available"
			cleanup_portForward $dashboardForwardPID
			return 1 
	fi 

	namespaceResponse=$(curl -X GET --header Content-Type:application/json http://localhost:9097/proxy/api/v1/namespaces)

	if [[ $namespaceResponse != *"NamespaceList"* ]]; then
			echo "Test Failure, namespaceResponse returned an inncorrect value"
			cleanup_portForward $dashboardForwardPID
			return 1 
	fi

	curlNodePort="http://127.0.0.1:9097/v1/namespaces/tekton-pipelines/pipelineruns/"
	curl -X POST --header Content-Type:application/json -d "$post_data" $curlNodePort

	deploymentExist=false
	for i in {1..30}
	do
		wait=$(kubectl wait --namespace tekton-pipelines --for=condition=available deployments/go-hello-world --timeout=30s)
		if [ "$wait" = "deployment.extensions/go-hello-world condition met" ]; then
			deploymentExist=true
			break
		else
			sleep 5
		fi
	done

	if [ "$deploymentExist" = "false" ]; then
	  echo "Test Failure, go-hello-world deployment is not running" 
		cleanup_portForward $dashboardForwardPID
		return 1 
	fi

	kubectl port-forward $(kubectl get pod  --namespace tekton-pipelines -l app=go-hello-world -o name) --namespace tekton-pipelines 8080 &
	podForwardPID=$!

	podCurled=false
	for i in {1..30}
	do
		resp=$(curl -k  http://127.0.0.1:8080)
		if [ "$resp" != "" ]; then
			podCurled=true
			if [ "$EXPECTED_RETURN_VALUE" = "$resp" ]; then
				break
			else
					echo "Test Failure, Return value from the pod is different than expected"
					cleanup_portForward $dashboardForwardPID $podForwardPID
					return 1 
			fi
		else
			sleep 5
		fi
	done

	if [ "$podCurled" = "false" ]; then
			echo "Test Failure, Was unable to curl the pod"
			cleanup_portForward $dashboardForwardPID $podForwardPID
			return 1 
	fi

	cleanup_portForward $dashboardForwardPID $podForwardPID

	return 0
}

function install_dashboard_and_pipelines() {
	#Test pipeline / dashbaord compatibility 
	pre_test_cleanup
	create_pipeline_and_dashboard_output_file
	for i in "${tektonPipelinesArray[@]}" ; do 
		versionL=$i
		echo "versionL is $versionL"
		
		if ! install_tekton_pipelines $versionL ; then
			echo "Something went wrong with the install of tekton-pipelines version $versionL"
		else    
			for i in "${tektonDashboardArray[@]}" ; do 
				versionX=$i
				echo "versionX is $versionX"
				if ! install_dashboard $versionX ; then 
					echo "Something went wrong with the install of tekton dashbaord version $versionX"
					break
				fi
				echo "Testing tekton_pipelines version $versionL with dashboard version $versionX" 
				create_docker_secret
				task_and_pipeline_download

				if ! test_pipeline_and_dashboard ; then
					echo "Something went wrong with the tests of tekton-pipelines version $versionL and dashboard version $versionX"
				else 
					output_to_pipeline_and_dashboard_file $versionL $versionX
					pipelineDashboardWorksArray+=($versionL $versionX)
				fi
				cleanup_test
				task_and_pipeline_cleanup
				echo "delete dashbaord version $versionX"
				if ! uninstall_dashboard $versionX ; then 
					echo "Something went wrong with the uninstall of tekton dashboard"
					break
				fi
				done
		fi

		uninstall_tekton_pipelines $versionL
	done
}
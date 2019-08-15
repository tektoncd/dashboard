#!/bin/bash
export baseDir="$GOPATH/src/github.com/tektoncd"
export testDir="$baseDir/dashboard/test"

# Wait until all pods in a namespace are Running or Complete
# wait_for_ready [namespace] [timeout] <sleepTime>
# <sleepTime> is optional
function wait_for_ready_pods() {
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage ERROR for function: wait_for_ready_pods [namespace] [timeout] <sleepTime>"
    [ -z "$1" ] && echo "Missing [namespace]"
    [ -z "$2" ] && echo "Missing [timeout]"
    exit 1
  fi
  namespace=$1
  timeout_period=$2
  timeout ${timeout_period} "kubectl get pods -n ${namespace} && [[ \$(kubectl get pods -n ${namespace} --no-headers 2>&1 | grep -c -v -E '(Running|Completed|Terminating)') -eq 0 ]]"
}

function timeout() {
  SECONDS=0; TIMEOUT=$1; shift
  until eval $*; do
    sleep 5
    [[ $SECONDS -gt $TIMEOUT ]] && echo "ERROR: Timed out" && exit 1
  done
}

# Waits until all pods are running in the given namespace.
# Parameters: $1 - namespace.
function wait_until_pods_running() {
  echo -n "Waiting until all pods in namespace $1 are up"
  for i in {1..150}; do  # timeout after 5 minutes
    local pods="$(kubectl get pods --no-headers -n $1 2>/dev/null)"
    # All pods must be running
    local not_running=$(echo "${pods}" | grep -v Running | grep -v Completed | wc -l)
    if [[ -n "${pods}" && ${not_running} -eq 0 ]]; then
      local all_ready=1
      while read pod ; do
        local status=(`echo -n ${pod} | cut -f2 -d' ' | tr '/' ' '`)
        # All containers must be ready
        [[ -z ${status[0]} ]] && all_ready=0 && break
        [[ -z ${status[1]} ]] && all_ready=0 && break
        [[ ${status[0]} -lt 1 ]] && all_ready=0 && break
        [[ ${status[1]} -lt 1 ]] && all_ready=0 && break
        [[ ${status[0]} -ne ${status[1]} ]] && all_ready=0 && break
      done <<< $(echo "${pods}" | grep -v Completed)
      if (( all_ready )); then
        echo -e "\nAll pods are up:\n${pods}"
        return 0
      fi
    fi
    echo -n "."
    sleep 2
  done
  echo -e "\n\nERROR: timeout waiting for pods to come up\n${pods}"
  return 1
}

function wait_for_ready_kservice() {
    if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
        echo "Usage ERROR for function: wait_for_ready_kservice [kservice] [namespace] [timeout] <sleepTime>"
        [ -z "$1" ] && echo "Missing [kservice]"
        [ -z "$2" ] && echo "Missing [namespace]"
        [ -z "$3" ] && echo "Missing [timeout]"
        exit 1
    fi
    kservice="$1"
    namespace="$2"
    timeout="$3"
    sleepTime=${4:-"2"}
    ctr=0
    until [ "0" = "$(kservice_is_ready "$kservice" "$namespace")" ]; do
        echo "waiting for ready $kservice kservice in namespace $namespace:"
        kubectl get ksvc "$kservice" --namespace $namespace
        if [ "$timeout" -ne "-1" ] && [ "$timeout" -le "$ctr" ]; then
            echo "ERROR: kservice $kservice was not ready in install namespace ${namespace} after waiting ${timeout} seconds."
            kubectl describe ksvc $kservice --namespace $namespace
            return 1
        fi
        sleep "$sleepTime"
        ctr=$((ctr+sleepTime))
    done
    kubectl get ksvc $kservice --namespace $namespace
}

# Output 0 if the kservice "Ready" condition is True, 1 otherwise
function kservice_is_ready() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Usage ERROR for function: kservice_is_ready [kservice] [namespace]"
        [ -z "$1" ] && echo "Missing [kservice]"
        [ -z "$2" ] && echo "Missing [namespace]"
        exit 1
    fi
    kservice=$1
    namespace=$2

    kubectl get ksvc "$kservice" -n "$namespace" -o json \
        | jq '.status.conditions[] | select(.type == "Ready") | {status}' \
        | grep "True" > /dev/null \
        ; echo $?
}

function install_knative_serving() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_serving [version]"
      echo "Missing [version]"
      exit 1
  fi
  versionKs="$1"
	echo "version is $versionKs"
  curl -L https://github.com/knative/serving/releases/download/${versionKs}/serving.yaml \
  | kubectl apply --filename -  
}

function install_knative_eventing() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_eventing [version]"
      echo "Missing [version]"
      exit 1
  fi
  versionKe="$1"
  kubectl apply --filename https://github.com/knative/eventing/releases/download/${versionKe}/release.yaml
}

# Note that eventing-sources.yaml was renamed from release.yaml in the v0.5.0 release, so this won't work for earlier releases as-is. 
function install_knative_eventing_sources() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_eventing_sources [version]"
      echo "Missing [version]"
      exit 1
  fi
  versionKes="$1"
  if [ "$versionKes" == "v0.7.0" ] || [ "$versionKes" == "v0.7.1" ] ; then
    kubectl apply --filename https://github.com/knative/eventing-sources/releases/download/${versionKes}/github.yaml
  else
    kubectl apply --filename https://github.com/knative/eventing-sources/releases/download/${versionKes}/eventing-sources.yaml
  fi
}


#-------Tekton-Pipelines-------
function install_tekton_pipelines() {
	if [ "$#" -eq 0 ] ; then 
  	echo "You have not provided a version for installing tekton_pipelines"
  	exit 1
	elif [ "$#" -gt 1 ] ; then
  	echo "You have provided too many arguments for installing tekton_pipelines"
  	exit 1
	fi
  version=$1
  installAttempt=$(kubectl apply --filename https://storage.googleapis.com/tekton-releases/previous/$version/release.yaml)
  if [[ $installAttempt == "" ]] ; then 
		return 1
		exit 1
	else
    wait_for_ready_pods tekton-pipelines 180 20
    return 0
  fi
}

function uninstall_tekton_pipelines() {
	if [ "$#" -eq 0 ] ; then 
		echo "You have not provided a version for uninstalling tekton_pipelines"
		exit 1
	elif [ "$#" -gt 1 ] ; then
		echo "You have provided too many arguments for uninstalling tekton_pipelines"
		exit 1
	fi
	versionP=$1 
	echo "version deleting is $versionP"
	kubectl delete --filename https://storage.googleapis.com/tekton-releases/previous/$versionP/release.yaml
	kubectl delete namespace tekton-pipelines

	tektonPipelinesUninstalled=false
	for i in {1..25} ; do
		if check_namespace_deleted "tekton-pipelines" ; then
			tektonPipelinesUninstalled=true 
			break
		fi
		sleep 5
	done 

	if [ "$tektonPipelinesUninstalled" == true ] ; then 
		return 0 
	else 
		return 1
	fi
}

#-------Tekton-Dashboard-------
function install_dashboard() {
	if [ "$#" -eq 0 ] ; then 
		echo "You have not provided a version for installing tekton dashboard"
		exit 1
	elif [ "$#" -gt 1 ] ; then
		echo "You have provided too many arguments for installing tekton dashboard"
		exit 1
	fi
	versionD=$1 
  kubectl apply --filename https://github.com/tektoncd/dashboard/releases/download/$versionD/release.yaml
  wait_for_ready_pods tekton-pipelines 180 20
  wait_until_pods_running tekton-pipelines
}

function uninstall_dashboard() {
	if [ "$#" -eq 0 ] ; then 
		echo "You have not provided a version for uninstalling tekton dashboard"
		exit 1
	elif [ "$#" -gt 1 ] ; then
		echo "You have provided too many arguments for uninstalling tekton dashboard"
		exit 1
	fi
	versionD=$1 
  kubectl delete --filename https://github.com/tektoncd/dashboard/releases/download/$versionD/release.yaml

	tektonDashboardUninstalled=false
	for i in {1..25} ; do
		if check_pod_deleted "tekton-dashboard" "tekton-pipelines" ; then
			tektonDashboardUninstalled=true
			break
		fi
		sleep 5
	done 

	if [ "$tektonDashboardUninstalled" == true ] ; then 
		return 0 
	else
		return 1
	fi
}


#-------Istio-------
function uninstall_istio() {
	versionIstio=$1
	echo "Deleting isio version $versionIstio"
	cd $testDir
	for i in istio-$versionIstio/install/kubernetes/helm/istio-init/files/crd*yaml; do 
		kubectl delete -f $i 
	done
	rm -rf istio-${versionIstio}

	kubectl delete namespace istio-system

	istioNamespaceRemoved=false
	for i in {1..25} ; do
		if check_namespace_deleted "istio-system" ; then
			istioNamespaceRemoved=true 
			break
		fi
		sleep 5
	done 

	if [ "$istioNamespaceRemoved" == true ] ; then 
		return 0 
	else  
		return 1
	fi
}

function uninstall_knative_eventing() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_eventing [version]"
      echo "Missing [version]"
      exit 1
  fi
  version="$1"
  kubectl delete --filename https://github.com/knative/eventing/releases/download/${version}/release.yaml

	kubectl delete namespace knative-eventing

	knativeEventingNamespaceRemoved=false
	for i in {1..25} ; do
		if check_namespace_deleted "knative-eventing" ; then
			knativeEventingNamespaceRemoved=true 
			break
		fi
		sleep 5
	done 
	
	if [ "$knativeEventingNamespaceRemoved" == true ] ; then 
		return 0 
	else  
		return 1
	fi
}

# Note that eventing-sources.yaml was renamed from release.yaml in the v0.5.0 release, so this won't work for earlier releases as-is. 
function uninstall_knative_eventing_sources() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_eventing_sources [version]"
      echo "Missing [version]"
      exit 1
  fi
  version="$1"
	if [ "$version" == "v0.7.0" ] || [ "$version" == "v0.7.1" ] ; then
  	kubectl delete --filename https://github.com/knative/eventing-sources/releases/download/${version}/github.yaml
  else
  	kubectl delete --filename https://github.com/knative/eventing-sources/releases/download/${version}/eventing-sources.yaml
  fi

	echo "Deleted knative-sources yaml"
  kubectl delete namespace knative-sources

	knativeSourcesNamespaceRemoved=false
	for i in {1..25} ; do
		if check_namespace_deleted "knative-sources" ; then
			knativeSourcesNamespaceRemoved=true 
			break
		fi
		sleep 5
	done 
	
	if [ "$knativeSourcesNamespaceRemoved" == true ] ; then 
		return 0 
	else  
		return 1
	fi
}

function uninstall_knative_serving() {
  if [ -z "$1" ]; then
      echo "Usage ERROR for function: install_knative_serving [version]"
      echo "Missing [version]"
      exit 1
  fi
  version="$1"
	echo "version is $version"
  curl -L https://github.com/knative/serving/releases/download/${version}/serving.yaml \
  | kubectl delete --filename -

	echo "deleting namespace knative-serving"
	kubectl delete namespace knative-serving

	knativeServingNamespaceRemoved=false
	for i in {1..25} ; do
		if check_namespace_deleted "knative-serving" ; then
			knativeServingNamespaceRemoved=true 
			break
		fi
		sleep 5
	done 
	
	if [ "$knativeServingNamespaceRemoved" == true ] ; then 
		return 0 
	else  
		return 1
	fi
}

function check_namespace_deleted() {
	nsToDelete=$1
	namespaces=$(kubectl get namespaces)
	for i in $namespaces ; do 
		if [ "$i" == $nsToDelete ] ; then 
			return 1 
		fi
	done

	return 0
}

function check_pod_deleted() {
	podToDelete=$1
	namespace=$2
	pods=$(kubectl get pods -n $namespace)
	for i in $namespaces ; do 
		if [ "$i" == *"$podToDelete"* ] ; then 
			return 1 
		fi
	done

	return 0
}

function check_all_pods_in_namespace_deleted() {
	nsToDeletePods=$1
	podsDeleted=false
	pods=$(kubectl get pods -n $nsToDeletePods)
	if [ "$pods" == "" ] ; then 
			podsDeleted=true
			break
	fi
	if [ "$podsDeleted" == "true" ] ; then 
		return 0
	else 
		return 1
	fi
}

#-------Webhooks-Extension-------
function download_webhooks_extension() {
	echo "Starting installing webhooks"
	cd $baseDir
  if [ -d "experimental" ] ; then
    rm -rf experimental
  fi 
  echo "Git cloning experimental"
	git clone https://github.com/tektoncd/experimental.git
}

function pre_webhooks_extension_setup() {
	cd $baseDir/experimental/webhooks-extension

	export KO_DOCKER_REPO=docker.io/$DOCKERHUB_USERNAME 
	docker login --username=$DOCKERHUB_USERNAME --password=$DOCKERHUB_PASSWORD
  npm ci
  npm rebuild node-sass
  npm run build_ko
  dep ensure -v

	return 0
}

function install_webhooks_extension() {
	cd $baseDir/experimental/webhooks-extension

    timeout 60 "ko apply -f config -n $DASHBOARD_INSTALL_NS"

    wait_for_ready_pods tekton-pipelines 180 20
    wait_until_pods_running tekton-pipelines
    wait_for_ready_kservice webhooks-extension-sink tekton-pipelines 180

		ip=$(ifconfig | grep netmask | sed -n 2p | cut -d ' ' -f2)
		kubectl patch configmap config-domain --namespace knative-serving --type='json'  --patch '[{"op": "add", "path": "/data/'"${ip}.nip.io"'", "value": ""}]'

    return 0
}

function uninstall_webhooks_extension() {
    cd $baseDir
    ko delete -f experimental/webhooks-extension/config -n tekton-pipelines
}

function create_docker_secret() {

	kubectl create secret docker-registry registry-secret \
		--docker-server https://index.docker.io/v1/ \
		--docker-username $DOCKERHUB_USERNAME \
		--docker-password $DOCKERHUB_PASSWORD \
		--docker-email $DOCKERHUBEMAIL \
		--namespace $TARGET_NS

  kubectl patch secret registry-secret -p='{"metadata":{"annotations": {"tekton.dev/docker-0": "https://index.docker.io/v1/"}}}' \
  --namespace $TARGET_NS

	kubectl patch sa tekton-dashboard -n $TARGET_NS \
		--type=json \
		-p="[{\"op\":\"add\",\"path\":\"/secrets/0\",\"value\":{\"name\": \"registry-secret\"}}]"

}

function checkPortForward() {
	portForwardExists=false
	for i in {1..30}
	do
		respF=$(curl -k  http://127.0.0.1:9097)
		if [ "$respF" != "" ]; then
			portForwardExists=true
		else    
			sleep 5  
		fi
	done

	if [ "$portForwardExists" = "false" ]; then
		return 1
	else 
		return 0		
	fi 	
}

function task_and_pipeline_download() {
  cd $baseDir
  if [ -d "example-pipelines" ] ; then
    rm -rf example-pipelines
  fi 
  git clone https://github.com/pipeline-hotel/example-pipelines.git
  kubectl apply -f example-pipelines/config/build-task.yaml -n ${DASHBOARD_INSTALL_NS}
  kubectl apply -f example-pipelines/config/deploy-task.yaml -n ${DASHBOARD_INSTALL_NS}
  kubectl apply -f example-pipelines/config/pipeline.yaml -n ${DASHBOARD_INSTALL_NS}

	if wait_for_hotel_pipeline ; then 
		return 0
	else 
		return 1
	fi
}

function wait_for_hotel_pipeline() {
	pipeline_up=false

	for i in {1..10}; do 
		pipelineResponse=$(kubectl get pipelines -n ${DASHBOARD_INSTALL_NS})

		for i in $pipelineResponse ; do 
			if [ "$i" == "simple-pipeline" ] ; then 
				pipeline_up=true 
				break
			else 
				sleep 5
			fi
		done
		if [ "$pipeline_up" == true ] ; then 
			break 
		fi
	done

	if [ "$pipeline_up" == false ] ; then 
		return 1 
	else 
		return 0 
	fi 
}

function task_and_pipeline_cleanup() {
  cd $baseDir
  kubectl delete -f example-pipelines/config/build-task.yaml -n ${DASHBOARD_INSTALL_NS}
  kubectl delete -f example-pipelines/config/deploy-task.yaml -n ${DASHBOARD_INSTALL_NS}
  kubectl delete -f example-pipelines/config/pipeline.yaml -n ${DASHBOARD_INSTALL_NS}
  rm -rf example-pipelines

	return 0
}

function cleanup_portForward() {
	if [ "$#" -eq 0 ] ; then 
  	echo "You have not provided anything to stop port forwarding"
	elif [ "$#" -eq 1 ] ; then
  	kill -9 $1
	else 
		kill -9 $1
		kill -9 $2
	fi
	
}
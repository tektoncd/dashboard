#bin/bash 

function tektonPipelinesExist() {
  projects=$(oc get projects)
  for i in $projects; do 
    if [ $i == "tekton-pipelines" ] ; then
      return 0
    fi
  done
  return 1
}

function getCurrentProject () {
	currentProject=$(cat ~/.kube/config 2>/dev/null| grep -o '^current-context: [^/]*' | cut -d' ' -f2)
	echo "$currentProject"
}

if [ "$#" -eq 0 ] ; then 
  if ! tektonPipelinesExist ; then 
    oc new-project tekton-pipelines
  fi
  if [[ $( getCurrentProject ) != "tekton-pipelines" ]] ; then
    oc project tekton-pipelines
  fi 
	
	oc process -f config/templates/deploy.yaml | oc apply -f - 
  oc process -f config/templates/build.yaml | oc apply -f - 

elif [ "$#" -eq 2 ] ; then
  if [ $1 != "-n" ] ; then
    echo "You have entered an invalid command, please use the command by running either ./minishift-install-dashboard.sh -n {NAMESPACE} OR ./minishift-install-dashboard.sh"
    exit 1
  fi 
  namespace=$2 
 
  cp config/templates/deploy.yaml config/templates/deployEdited.yaml

  sed -i '' "s/tekton-pipelines/$namespace/" config/templates/deployEdited.yaml

  oc process -f config/templates/deployEdited.yaml | oc apply -f - -n $namespace
  oc process -f config/templates/build.yaml | oc apply -f - -n $namespace

	rm -f config/templates/deployEdited.yaml
else 
  echo "You have entered an invalid command, please use the command by running either ./minishift-install-dashboard.sh -n {NAMESPACE} OR ./minishift-install-dashboard.sh"
  exit 1
fi
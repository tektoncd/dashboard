#bin/bash 

if [ "$#" -eq 0 ] ; then 
  projectToDelete="tekton-pipelines"
  oc process -f config/templates/deploy.yaml | oc delete -f - -n $projectToDelete
  oc process -f config/templates/build.yaml | oc delete -f - -n $projectToDelete
elif [ "$#" -eq 2 ] ; then
	if [ $1 != "-n" ] ; then
    echo "You have entered an invalid command, please use the command ./minishift-delete-dashboard -n {NAMESPACE} OR ./minishift-delete-dashboard"
    exit 1
  fi 
  namespace=$2 
  oc process -f config/templates/deploy.yaml | oc delete -f - -n $namespace
  oc process -f config/templates/build.yaml | oc delete -f - -n $namespace
else
  echo "You have entered an invalid command, please use the command ./minishift-delete-dashboard -n {NAMESPACE} OR ./minishift-delete-dashboard"
  exit 1
fi
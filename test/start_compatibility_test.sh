#!/bin/bash

source test/util.sh
source test/credentials.sh
source test/test-webhooks.sh
source test/test-ksvc.sh
source test/output_compatible_versions.sh
source test/test-istio-and-knative.sh
source test/test-pipelines-and-dashboard.sh
source test/test-webhooks.sh

#Running this script will run a automated test for checking the compatibility between the versions of tekton pipelines, 
#tekton dashboard, istio, knative and the webhooks extension. This test install and uninstall the different versions of 
#tekton pipelines and dashbaord and test that they are compatibile. It will also install and uninstall the different 
#versions of istio and knative and check they are compatibile, will then install and uninstall the versions of the 
#webhooks extension and check the istio/knative and webhooks extension compatibility. It will do this by cloning 
#the specified repository from your github, making a change and pushing the change back to github to trigger a webhook. 
#
#If you are running this behind a firewall and cannot receive webhooks from github then you will have to use your 
#enterprise github account.
#
#To run this test you must have the following:
#		Have a docker account 
#		Have a github account
#		Kubernetes installed (Tested working on version v1.11.1 and higher) 
#		Your device must stay connected to the internet throughout the test
#		Have a GOPATH set
#		Ensure nothing is being run on port 9097
#		Have a fresh docker for desktop cluster (No Tekton / istio / knative installed)
#
#Prerequisites to running the test:
#		Fork the following repository into your github - https://github.com/CarolynMabbott/sample 		
#		Update the test/credentials.sh file with your credentials
#		If you have the tekton experimental cloned then it is advisable to push changes to github before running this script 
#			as this script is recommended to run with the latest experimental code
#		
#The test will create three text files during the run which will contain the compatibile versions of tekton pipelines, 
#tekton dashbaord, istio, knative and webhook extension versions.
#
#If the test fails for any reason before running the test again you must:
#		Ensure the webhooks are deleted from the github repository
#		Ensure that the github repository no longer has the "temp.txt" file which gets pushed
#
#To run the test be in the tektoncd/dashboard directory and run the command ./test/start_compatibility_test.sh 



#Check whether experimental has been cloned and whether it is the latest 
function check_webhooks_installed() { 
	webhooksOverwrite=false
	cd $baseDir
  if [ -d "experimental" ] ; then
		cd experimental 
		gitLatestCommit=$(git rev-parse HEAD)
		gitCurrentCommit=$(git log HEAD^..HEAD --pretty="%H" HEAD)
		if [ $gitLatestCommit != $gitCurrentCommit ] ; then 
			if askAboutWebhooks ; then 
				webhooksOverwrite=true
			fi
		fi
		cd ..
  else 
		webhooksOverwrite=true
	fi 

	if [ $webhooksOverwrite == true ] ; then 
		download_webhooks_extension
	fi
	if ! pre_webhooks_extension_setup ; then 
		return 1
	else 
		return 0
	fi
}

function askAboutWebhooks() {
	echo "You have a version of experimental that is not the latest commit"
	echo "It is highly recomended to run this script with the latest version of experimental"
	echo "You can either run the script with your version of experimental or the latest version of experimental will be downloaded"
	echo "Would you like to run this script with the latest version of experimental? This will delete your version of experimental from your device"
	echo "Press 'Y' to to download the latest version of experimental or press 'N' to use the version already on your device"
	
	while [ true ] ; do
		read -t 5 -n 1
	if [ $? == "Y" ] || [ $? == "y" ]; then
		echo "You have selected to overwrite your version of experimental with the latest version"
		return 0
	elif [ $? == "N" ] || [ $? == "n" ]; then
		echo "You have selected to use your version of experimental"
		echo "This is not recomended"
		return 1
	else
		echo "Waiting for your selection, press 'Y' to overwrite your version of experimental or 'N' to continue using your version of experimental"
	fi
	done
}

#Get all versions of tekton pipelines 
declare -a tektonPipelinesArray
input="$testDir/versions/tekton_pipelines_versions"
while IFS= read -r line
do
  tektonPipelinesArray+=($line)
done < "$input"

#Get all versions of tekton dashboard 
declare -a tektonDashboardArray
input="$testDir/versions/tekton_dashboard_versions"
while IFS= read -r line
do
  tektonDashboardArray+=($line)
done < "$input"

#Get versions of istio
declare -a istioArray
input="$testDir/versions/istio_versions"
while IFS= read -r line
do
  istioArray+=($line)
done < "$input"

#Gets all versions of knative 
declare -a knativeArray
input="$testDir/versions/knative_versions"
while IFS= read -r line
do
  knativeArray+=($line)
done < "$input"

#Arrays of what works 
declare -a pipelineDashboardWorksArray
declare -a knativeIstioWorksArray
declare -a webhooksIstioKnativeWorksArray

if ! check_webhooks_installed ; then 
	echo "Something went wrong with checking webhooks extension"
	echo "Exiting"
	exit 1
fi

install_dashboard_and_pipelines

#If pipelinearray is zero then exit 
if [ ${#pipelineDashboardWorksArray[@]} -eq 0 ] ; then 
	echo "There are no compatable version of pipelines and dashboard"
	echo "exiting"
	exit 1 
fi

check_webhooks_combinations ${pipelineDashboardWorksArray[@]}

echo "Finished checking compatibility"

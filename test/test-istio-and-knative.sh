#!/bin/bash

source test/util.sh

function istio_install_and_check() {
	cd $baseDir
	create_istio_and_knative_output_file
	create_webhook_output_file
	for i in "${istioArray[@]}" ; do 
		versionI=$i
		echo "Installing istio version $versionI"
		$testDir/install_istio.sh $versionI
		wait_for_ready_pods istio-system 180 20
		if ! wait_until_pods_running istio-system ; then 
			echo "Failed to install istio version $versionI"
			break 
		fi

		knative_install_and_check $versionI
		
		cd $baseDir
		echo "Uninstalling Istio version $versionI"
		uninstall_istio $versionI

	done
}

function knative_install_and_check() {
	istioVersion=$1
		for t in "${knativeArray[@]}" ; do
			versionK=$t 
			echo "Installing knative version $versionK"
			install_knative_serving $versionK
			wait_for_ready_pods knative-serving 180 20
  		wait_until_pods_running knative-serving

			install_knative_eventing $versionK
			wait_for_ready_pods knative-eventing 180 20
			wait_until_pods_running knative-eventing

			install_knative_eventing_sources $versionK
			wait_for_ready_pods knative-sources 180 20
			wait_until_pods_running knative-sources

			if ! run_ksvc_test ; then 
				echo "Failure to create a ksvc, maybe something wrong with istio $istioVersion / knative $versionK combination"
			else 
				knativeIstioWorksArray+=($istioVersion $versionK)
				output_to_istio_and_knative_file $istioVersion $versionK
			fi 

			if ! run_webhooks_install_and_test ; then 
				echo "Failure to create a pipelinerun from a webhook, maybe something wrong with istio $istioVersion / knative $versionK combination"
      else 
				webhooksIstioKnativeWorksArray+=($istioVersion $versionK)
				output_to_webhook_file $istioVersion $versionK
			fi	

			# #Uninstall knative 
			echo "Uninstalling knative version $versionK"
			uninstall_knative_serving $versionK
			uninstall_knative_eventing $versionK

			# Can break on uninstall - checkKnativeUninstalled solves this
			uninstall_knative_eventing_sources $versionK &
			deleteKnativeSourcesPID=$!
			if check_knative_uninstalled ; then 
				kill -9 $deleteKnativeSourcesPID
			else 
				echo "Error with uninstalling knative-sources, the namespace was not removed"
			fi
			
			echo "Knative version $versionK has been uninstalled"
		done
}

function check_knative_uninstalled() {
	knativeUninstalled=false
	for i in {1..25} ; do
		if check_namespace_deleted "knative-sources" ; then
			knativeUninstalled=true 
			break
		fi
		sleep 5
	done 

	if [ "$knativeUninstalled" == true ] ; then 
		return 0 
	else 	
		return 1
	fi
}
#!/bin/bash
source test/util.sh

function create_pipeline_and_dashboard_output_file() {
	cd $testDir
	if [ -f "panddCompatibility.txt" ] ; then
    rm panddCompatibility.txt
  fi 
	printf "Pipeline and Dashboard Comaptibility \n Pipeline Version	Dashboard version \n"  >$testDir/panddCompatibility.txt
}

function create_istio_and_knative_output_file() {
	cd $testDir
	if [ -f "iandkCompatibility.txt" ] ; then
    rm iandkCompatibility.txt
  fi 
	printf "Pipeline and Dashboard Comaptibility \n Istio Version	Knative version \n"  >$testDir/iandkCompatibility.txt
}

function create_webhook_output_file() {
	cd $testDir
	if [ -f "webhookCompatibility.txt" ] ; then
    rm webhookCompatibility.txt
  fi 
	printf "Webhook Comaptibility \n Istio Version	Knative version \n"  >$testDir/webhookCompatibility.txt
}

function output_to_pipeline_and_dashboard_file() {
  if [ "$#" -eq 0 ] ; then
  	echo "Missing values to write to file"
	else 
		printf "$1 $2 \n" >> $testDir/panddCompatibility.txt
  fi
}

function output_to_istio_and_knative_file() {
  if [ "$#" -eq 0 ] ; then
  	echo "Missing values to write to file"
	else 
		printf "$1 $2 \n" >> $testDir/iandkCompatibility.txt
  fi
}

function output_to_webhook_file() {
  if [ "$#" -eq 0 ] ; then
  	echo "Missing values to write to file"
	else 
		printf "$1 $2 \n" >> $testDir/webhookCompatibility.txt
  fi
}
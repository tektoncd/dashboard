/*
Copyright 2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package endpoints

import (
	"os"
	"strconv"
	"strings"

	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get dashboard version
func GetDashboardVersion(r Resource, installedNamespace string) string {
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app=tekton-dashboard",
	}

	deployments, err := r.K8sClient.AppsV1().Deployments(installedNamespace).List(listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting dashboard deployment: %s", err.Error())
		return ""
	}

	for _, deployment := range deployments.Items {
		deploymentLabels := deployment.GetLabels()
		versionAttempt, err := deploymentLabels["version"]
		if err != true {
			logging.Log.Error("Error getting dashboard version from yaml")
			return ""
		} else {
			version = versionAttempt
		}
	}

	if version == "" {
		logging.Log.Error("Error getting the tekton dashboard deployment version. Version is unknown")
		return ""
	}
	return version
}

// IsReadOnly determines whether the Dashboard is running in read-only mode or not
func IsReadOnly() bool {
	asBool, err := strconv.ParseBool(os.Getenv("READ_ONLY"))
	if err == nil {
		logging.Log.Infof("Dashboard is in read-only mode: %s", asBool)
		return asBool
	}
	logging.Log.Warnf("Couldn't determine if the Dashboard is in read-only mode or not, assuming not")
	return false
}

// IsOpenShift determines whether the Dashboard is running on OpenShift or not
func IsOpenShift(r Resource, installedNamespace string) bool {
	namespaces, err := r.K8sClient.CoreV1().Namespaces().List(v1.ListOptions{})
	if err != nil {
		logging.Log.Errorf("Error getting the list of namespaces: %s", err.Error())
		return false
	}

	openshiftPipelineFound := false
	tektonPipelinesFound := false
	routeFound := false
	for _, namespace := range namespaces.Items {
		namespaceName := namespace.GetName()

		if namespaceName == "openshift-pipelines" {
			openshiftPipelineFound = SearchForDeployment(r, "pipelines", "openshift-pipelines")
		}
		if namespaceName == "tekton-pipelines" {
			tektonPipelinesFound = SearchForDeployment(r, "pipelines", "tekton-pipelines")
		}
	}

	routes, err := r.RouteClient.RouteV1().Routes(installedNamespace).List(v1.ListOptions{})
	if err != nil {
		logging.Log.Errorf("Error getting the list of routes: %s", err.Error())
	}

	for _, route := range routes.Items {
		routeA := route.GetName()
		if routeA == "tekton-dashboard" {
			routeFound = true
		}
	}

	if (openshiftPipelineFound == true || tektonPipelinesFound == true) && routeFound == true {
		return true
	}
	return false
}

// Get pipelines version
func GetPipelineVersion(r Resource, isOpenShift bool) string {
	version := ""
	namespacesToCheck := []string{"tekton-pipelines"}

	if isOpenShift {
		namespacesToCheck = append(namespacesToCheck, "openshift-pipelines")
	}
	// Go through possible namespaces Tekton Pipelines is installed in
	// For each namespace if the version is empty then it goes through to get the deployments within that namespace to try and locate the Tekton Pipelines deployment to get the version
	for _, versionAttempt := range namespacesToCheck {
		if version == "" {
			version = getDeployments(r, "pipelines", versionAttempt)
		}
	}

	if version == "" {
		logging.Log.Error("Error getting the Tekton Pipelines deployment version. Version is unknown")
		return ""
	}
	return version
}

// Get Deployments for either Tekton Triggers or Tekton Pipelines and gets the version
func getDeployments(r Resource, thingSearchingFor string, namespace string) string {
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-" + thingSearchingFor,
	}

	deployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return ""
	}

	for _, deployment := range deployments.Items {
		deploymentLabels := deployment.GetLabels()

		if version == "" {
			version = deploymentLabels[thingSearchingFor+".tekton.dev/release"]
		}

		if version == "" {
			version = deploymentLabels["version"]
		}

		// Installs through the OpenShift Operator displays version differently
		// This deals with the OpenShift Operator install
		if version == "" {
			if namespace == "openshift-pipelines" {
				deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
				if strings.Contains(deploymentImage, "openshift-pipeline/tektoncd-"+thingSearchingFor+"-controller") && strings.Contains(deploymentImage, ":") {
					s := strings.SplitAfter(deploymentImage, ":")
					if s[1] != "" {
						version = s[1]
					}
				}
			}
		}
	}

	if version == "" && thingSearchingFor == "pipelines" {
		for _, deployment := range deployments.Items {
			deploymentLabels := deployment.GetLabels()
			labelsToCheck := []string{"pipeline.tekton.dev/release", "version"} // To handle both beta and pre-beta versions
			for _, label := range labelsToCheck {
				potentialVersion := deploymentLabels[label]
				if potentialVersion != "" {
					version = potentialVersion
				}
			}

			if namespace == "openshift-pipelines" {
				deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
				if strings.Contains(deploymentImage, "openshift-pipeline/tektoncd-pipeline-controller") && strings.Contains(deploymentImage, ":") {
					s := strings.SplitAfter(deploymentImage, ":")
					if s[1] != "" {
						version = s[1]
					}
				}
			}

			deploymentAnnotations := deployment.Spec.Template.GetAnnotations()
			annotationsToCheck := []string{"pipeline.tekton.dev/release", "tekton.dev/release"} // To handle 0.10.0 and 0.10.1
			for _, label := range annotationsToCheck {
				potentialVersion := deploymentAnnotations[label]
				if potentialVersion != "" {
					version = potentialVersion
				}
			}

			// For Tekton Pipelines 0.9.0 - 0.9.2
			if version == "" {
				deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
				if strings.Contains(deploymentImage, "pipeline/cmd/controller") && strings.Contains(deploymentImage, ":") && strings.Contains(deploymentImage, "@") {
					s := strings.SplitAfter(deploymentImage, ":")
					if strings.Contains(s[1], "@") {
						t := strings.Split(s[1], "@")
						version = t[0]
					}
				}
			}
		}
	}

	return version
}

// Get triggers version
func GetTriggersVersion(r Resource, isOpenShift bool) string {
	version := ""
	namespacesToCheck := []string{"tekton-pipelines"}

	if isOpenShift {
		namespacesToCheck = append(namespacesToCheck, "openshift-pipelines")
	}

	// Go through possible namespaces Tekton Triggers is installed in
	// For each namespace if the version is empty then it goes through to get the deployments within that namespace to try and locate the Tekton Triggers deployment to get the version
	for _, versionAttempt := range namespacesToCheck {
		if version == "" {
			version = getDeployments(r, "triggers", versionAttempt)
		}
	}

	if version == "" {
		logging.Log.Error("Error getting the Tekton Triggers deployment version. Version is unknown")
		version = "UNKNOWN"
	}
	return version
}

// Check whether Tekton Triggers is installed
func IsTriggersInstalled(r Resource, isOpenShift bool) bool {
	isTriggersInstalled := false
	namespacesToCheck := []string{"tekton-pipelines"}

	if isOpenShift {
		namespacesToCheck = append(namespacesToCheck, "openshift-pipelines")
	}

	// Go through possible namespaces Tekton Triggers is installed in
	// For each namespace if the version is empty then it goes through to get the deployments within that namespace to try and locate the Tekton Triggers deployment to get the version
	for _, namespaceToCheck := range namespacesToCheck {
		if isTriggersInstalled == false {
			isTriggersInstalled = SearchForDeployment(r, "triggers", namespaceToCheck)
		}
	}

	return isTriggersInstalled
}

// Go through Triggers deployments and find if it is installed
func SearchForDeployment(r Resource, thingSearchingFor string, namespace string) bool {
	listOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-" + thingSearchingFor,
	}

	deployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return false
	}

	for _, deployment := range deployments.Items {
		if deployment.GetName() == "tekton-"+thingSearchingFor+"-controller" {
			return true
		}
	}

	return false
}

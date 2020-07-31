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
	"strings"

	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get dashboard version
func getDashboardVersion(r Resource, installedNamespace string) string {
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

// Get pipelines version
func getPipelineVersion(r Resource, namespace string) string {
	version := getDeployments(r, "pipelines", namespace)

	if version == "" {
		logging.Log.Error("Error getting the Tekton Pipelines deployment version. Version is unknown")
	}

	return version
}

// Get Deployments for either Tekton Triggers or Tekton Pipelines and gets the version
func getDeployments(r Resource, thingSearchingFor string, namespace string) string {
	version := ""

	oldListOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-" + thingSearchingFor,
	}
	oldDeployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(oldListOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return ""
	}
	newListOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=controller,app.kubernetes.io/part-of=tekton-" + thingSearchingFor,
	}
	newDeployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(newListOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return ""
	}

	deployments := append(oldDeployments.Items, newDeployments.Items...)

	for _, deployment := range deployments {
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
			deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
			if strings.Contains(deploymentImage, "openshift-pipeline/tektoncd-"+thingSearchingFor+"-controller") && strings.Contains(deploymentImage, ":") {
				s := strings.SplitAfter(deploymentImage, ":")
				if s[1] != "" {
					version = s[1]
				}
			}
		}
	}

	if version == "" && thingSearchingFor == "pipelines" {
		for _, deployment := range deployments {
			deploymentLabels := deployment.GetLabels()
			labelsToCheck := []string{"pipeline.tekton.dev/release", "version"} // To handle both beta and pre-beta versions
			for _, label := range labelsToCheck {
				potentialVersion := deploymentLabels[label]
				if potentialVersion != "" {
					version = potentialVersion
				}
			}

			deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
			if strings.Contains(deploymentImage, "openshift-pipeline/tektoncd-pipeline-controller") && strings.Contains(deploymentImage, ":") {
				s := strings.SplitAfter(deploymentImage, ":")
				if s[1] != "" {
					version = s[1]
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
func getTriggersVersion(r Resource, namespace string) string {
	version := getDeployments(r, "triggers", namespace)

	if version == "" {
		logging.Log.Error("Error getting the Tekton Triggers deployment version. Version is unknown")
		version = "UNKNOWN"
	}

	return version
}

// Check whether Tekton Triggers is installed
func IsTriggersInstalled(r Resource, namespace string) bool {
	return searchForDeployment(r, "triggers", namespace)
}

// Go through Triggers deployments and find if it is installed
func searchForDeployment(r Resource, thingSearchingFor string, namespace string) bool {
	oldListOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-" + thingSearchingFor,
	}
	oldDeployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(oldListOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return false
	}
	newListOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=controller,app.kubernetes.io/part-of=tekton-" + thingSearchingFor,
	}
	newDeployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(newListOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", thingSearchingFor, err.Error())
		return false
	}

	deployments := append(oldDeployments.Items, newDeployments.Items...)

	for _, deployment := range deployments {
		if deployment.GetName() == "tekton-"+thingSearchingFor+"-controller" {
			return true
		}
	}

	return false
}

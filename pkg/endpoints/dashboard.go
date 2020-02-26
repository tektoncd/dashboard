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
			version = getPipelineDeployments(r, versionAttempt)
		}
	}

	if version == "" {
		logging.Log.Error("Error getting the Tekton Pipelines deployment version. Version is unknown")
		return ""
	}
	return version
}

// Get whether running on openshift or not
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
			openshiftPipelineFound = SearchForPipelineDeployments(r, "openshift-pipelines")
		}
		if namespaceName == "tekton-pipelines" {
			tektonPipelinesFound = SearchForPipelineDeployments(r, "tekton-pipelines")
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

// Get Deployments in namespace  and search for tekton-pipelines-controller
func SearchForPipelineDeployments(r Resource, namespace string) bool {
	deployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(v1.ListOptions{})
	if err != nil {
		logging.Log.Errorf("Error getting the %s deployment: %s", namespace, err.Error())
		return false
	}

	for _, deployment := range deployments.Items {
		deploymentName := deployment.ObjectMeta.GetName()
		if deploymentName == "tekton-pipelines-controller" {
			return true
		}
	}
	return false
}

// Go through pipeline deployments and find what version it is
func getPipelineDeployments(r Resource, namespace string) string {
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-pipelines",
	}

	deployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton Pipelines deployment: %s", err.Error())
		return ""
	}

	for _, deployment := range deployments.Items {
		deploymentAnnotations := deployment.Spec.Template.GetAnnotations()

		if namespace == "openshift-pipelines" {
			deploymentImage := deployment.Spec.Template.Spec.Containers[0].Image
			if strings.Contains(deploymentImage, "openshift-pipeline/tektoncd-pipeline-controller") && strings.Contains(deploymentImage, ":") {
				s := strings.SplitAfter(deploymentImage, ":")
				if s[1] != "" {
					version = s[1]
				}
			}
		}

		// For master of Tekton Pipelines
		if version == "" {
			version = deploymentAnnotations["pipeline.tekton.dev/release"]
		}

		// For Tekton Pipelines 0.10.0 + 0.10.1
		if version == "" {
			version = deploymentAnnotations["tekton.dev/release"]
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

	return version
}

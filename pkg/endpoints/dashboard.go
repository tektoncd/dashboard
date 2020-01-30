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
	"strings"

	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get dashboard version
func GetDashboardVersion(r Resource) string {
	properties := Properties{InstallNamespace: os.Getenv("INSTALLED_NAMESPACE")}
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app=tekton-dashboard",
	}

	deployments, err := r.K8sClient.AppsV1().Deployments(properties.InstallNamespace).List(listOptions)
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
func GetPipelineVersion(r Resource) string {
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/component=controller,app.kubernetes.io/name=tekton-pipelines",
	}

	deployments, err := r.K8sClient.AppsV1().Deployments("tekton-pipelines").List(listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the tekton pipelines deployment: %s", err.Error())
		return ""
	}

	for _, deployment := range deployments.Items {
		deploymentAnnotations := deployment.Spec.Template.GetAnnotations()

		// For master of Tekton Pipelines
		version = deploymentAnnotations["pipeline.tekton.dev/release"]

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

	if version == "" {
		logging.Log.Error("Error getting the tekton pipelines deployment version. Version is unknown")
		return ""
	}
	return version
}

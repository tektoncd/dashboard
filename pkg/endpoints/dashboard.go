/*
Copyright 2020-2021 The Tekton Authors
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
	"context"

	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Get installed version of the requested Tekton project
func getVersion(r Resource, projectName string, namespace string) string {
	version := ""

	listOptions := metav1.ListOptions{
		LabelSelector: "app.kubernetes.io/part-of=tekton-" + projectName,
	}
	deployments, err := r.K8sClient.AppsV1().Deployments(namespace).List(context.TODO(), listOptions)
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s deployment: %s", projectName, err.Error())
		return ""
	}

	for _, deployment := range deployments.Items {
		deploymentLabels := deployment.GetLabels()

		version = deploymentLabels["app.kubernetes.io/version"]
		if version != "" {
			return version
		}
	}

	return version
}

func getDashboardVersion(r Resource, namespace string) string {
	version := getVersion(r, "dashboard", namespace)

	if version == "" {
		logging.Log.Error("Error getting the Tekton Dashboard deployment version. Version is unknown")
	}

	return version
}

func getPipelineVersion(r Resource, namespace string) string {
	version := getVersion(r, "pipelines", namespace)

	if version == "" {
		logging.Log.Error("Error getting the Tekton Pipelines deployment version. Version is unknown")
	}

	return version
}

func getTriggersVersion(r Resource, namespace string) string {
	version := getVersion(r, "triggers", namespace)

	if version == "" {
		logging.Log.Error("Error getting the Tekton Triggers deployment version. Version is unknown")
	}

	return version
}

func IsTriggersInstalled(r Resource, namespace string) bool {
	version := getTriggersVersion(r, namespace)
	return version != ""
}

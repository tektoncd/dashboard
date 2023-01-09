/*
Copyright 2020-2023 The Tekton Authors
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
	configMap, err := r.K8sClient.CoreV1().ConfigMaps(namespace).Get(context.TODO(), projectName+"-info", metav1.GetOptions{})
	if err != nil {
		logging.Log.Errorf("Error getting the Tekton %s info ConfigMap: %s", projectName, err.Error())
		return ""
	}

	return configMap.Data["version"]
}

// GetDashboardVersion returns the version string for the Tekton Dashboard
func (r Resource) GetDashboardVersion() string {
	version := getVersion(r, "dashboard", r.Options.InstallNamespace)

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

// IsTriggersInstalled returns true if it can detect a Triggers install in the cluster, false otherwise
func IsTriggersInstalled(r Resource, namespace string) bool {
	version := getTriggersVersion(r, namespace)
	return version != ""
}

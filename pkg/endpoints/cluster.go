/*
Copyright 2019-2021 The Tekton Authors
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
	"encoding/json"
	"net/http"
)

// Properties : properties we want to be able to retrieve via REST
type Properties struct {
	DashboardNamespace string `json:"dashboardNamespace"`
	DashboardVersion   string `json:"dashboardVersion"`
	ExternalLogsURL    string `json:"externalLogsURL"`
	LogoutURL          string `json:"logoutURL,omitempty"`
	PipelineNamespace  string `json:"pipelinesNamespace"`
	PipelineVersion    string `json:"pipelinesVersion"`
	ReadOnly           bool   `json:"isReadOnly"`
	StreamLogs         bool   `json:"streamLogs"`
	TenantNamespace    string `json:"tenantNamespace,omitempty"`
	TriggersNamespace  string `json:"triggersNamespace,omitempty"`
	TriggersVersion    string `json:"triggersVersion,omitempty"`
}

// GetProperties is used to get the installed namespace for the Dashboard,
// the version of the Tekton Dashboard, the version of Tekton Pipelines,
// when one's in read-only mode and Tekton Triggers version (if Installed)
func (r Resource) GetProperties(response http.ResponseWriter, request *http.Request) {
	pipelineNamespace := r.Options.GetPipelinesNamespace()
	triggersNamespace := r.Options.GetTriggersNamespace()
	dashboardVersion := getDashboardVersion(r, r.Options.InstallNamespace)
	pipelineVersion := getPipelineVersion(r, pipelineNamespace)

	properties := Properties{
		DashboardNamespace: r.Options.InstallNamespace,
		DashboardVersion:   dashboardVersion,
		PipelineNamespace:  pipelineNamespace,
		PipelineVersion:    pipelineVersion,
		ReadOnly:           r.Options.ReadOnly,
		LogoutURL:          r.Options.LogoutURL,
		TenantNamespace:    r.Options.TenantNamespace,
		StreamLogs:         r.Options.StreamLogs,
	}

	if r.Options.ExternalLogsURL != "" {
		properties.ExternalLogsURL = "/v1/logs-proxy"
	}

	isTriggersInstalled := IsTriggersInstalled(r, triggersNamespace)

	if isTriggersInstalled {
		triggersVersion := getTriggersVersion(r, triggersNamespace)
		properties.TriggersNamespace = triggersNamespace
		properties.TriggersVersion = triggersVersion
	}

	response.Header().Set("Content-Type", "application/json")
	response.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	response.Header().Set("Pragma", "no-cache")
	response.Header().Set("Expires", "0")
	json.NewEncoder(response).Encode(properties)
}

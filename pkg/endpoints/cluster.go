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
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	restful "github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/utils"
)

// Properties : properties we want to be able to retrieve via REST
type Properties struct {
	DashboardNamespace string `json:"DashboardNamespace"`
	DashboardVersion   string `json:"DashboardVersion"`
	PipelineNamespace  string `json:"PipelineNamespace"`
	PipelineVersion    string `json:"PipelineVersion"`
	TriggersNamespace  string `json:"TriggersNamespace,omitempty"`
	TriggersVersion    string `json:"TriggersVersion,omitempty"`
	IsOpenShift        bool   `json:"IsOpenShift"`
	ReadOnly           bool   `json:"ReadOnly"`
	LogoutURL          string `json:"LogoutURL,omitempty"`
	TenantNamespace    string `json:"TenantNamespace,omitempty"`
	StreamLogs         bool   `json:"StreamLogs"`
	ExternalLogsURL    string `json:"ExternalLogsURL"`
}

// ProxyRequest does as the name suggests: proxies requests and logs what's going on
func (r Resource) ProxyRequest(request *restful.Request, response *restful.Response) {
	parsedURL, err := url.Parse(request.Request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	uri := request.PathParameter("subpath") + "?" + parsedURL.RawQuery

	if statusCode, err := utils.Proxy(request.Request, response, r.Config.Host+"/"+uri, r.HttpClient); err != nil {
		utils.RespondError(response, err, statusCode)
	}
}

// GetProperties is used to get the installed namespace for the Dashboard,
// the version of the Tekton Dashboard, the version of Tekton Pipelines, whether or not one's
// running on OpenShift, when one's in read-only mode and Tekton Triggers version (if Installed)
func (r Resource) GetProperties(request *restful.Request, response *restful.Response) {
	pipelineNamespace := r.Options.GetPipelinesNamespace()
	triggersNamespace := r.Options.GetTriggersNamespace()
	dashboardVersion := getDashboardVersion(r, r.Options.InstallNamespace)
	pipelineVersion := getPipelineVersion(r, pipelineNamespace)

	properties := Properties{
		DashboardNamespace: r.Options.InstallNamespace,
		DashboardVersion:   dashboardVersion,
		PipelineNamespace:  pipelineNamespace,
		PipelineVersion:    pipelineVersion,
		IsOpenShift:        r.Options.IsOpenShift,
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

	response.WriteEntity(properties)
}

func handleRequestError(response *restful.Response, responseBody []byte, requestError error) {
	errorInfo := string(responseBody)
	errorInfo = strings.Replace(errorInfo, "\"", "", -1)
	errorInfo = strings.Replace(errorInfo, "\\", "", -1)
	errorInfo = strings.Replace(errorInfo, "\n", "", -1)
	// Checks if an error code can be found in the response
	if strings.LastIndex(errorInfo, "code:") != -1 {
		errorCodeString := strings.LastIndex(errorInfo, "code:")
		// Checks if the code is 3-digits long
		if len(errorInfo[errorCodeString+5:errorCodeString+8]) == 3 {
			errorCode := errorInfo[errorCodeString+5 : errorCodeString+8]
			errorCodeFormatted, err := strconv.Atoi(errorCode)
			// Checks if the code can be converted to an integer without error
			if err != nil {
				utils.RespondError(response, requestError, http.StatusInternalServerError)
				return
			}
			utils.RespondError(response, errors.New(errorInfo), errorCodeFormatted)
			return
		}
		utils.RespondError(response, requestError, http.StatusInternalServerError)
		return
	}
	utils.RespondError(response, requestError, http.StatusInternalServerError)
}

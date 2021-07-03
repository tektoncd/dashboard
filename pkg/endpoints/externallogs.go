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
	"net/http"
	"net/url"
	"strings"

	"github.com/tektoncd/dashboard/pkg/utils"
)

func (r Resource) LogsProxy(response http.ResponseWriter, request *http.Request) {
	parsedURL, err := url.Parse(request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	uri := strings.TrimPrefix(request.URL.Path, "/v1/logs-proxy") + "?" + parsedURL.RawQuery

	if statusCode, err := utils.Proxy(request, response, r.Options.ExternalLogsURL+"/"+uri, http.DefaultClient); err != nil {
		utils.RespondError(response, err, statusCode)
	}
}

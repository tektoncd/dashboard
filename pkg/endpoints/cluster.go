/*
Copyright 2019 The Tekton Authors
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
	restful "github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/logging"
	"net/http"
	"net/url"
	"os"

	"github.com/tektoncd/dashboard/pkg/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Properties : properties we want to be able to retrieve via REST
type Properties struct {
	InstallNamespace string
}

/* Get all tasks in a given namespace */
func (r Resource) ProxyRequest(request *restful.Request, response *restful.Response) {
	parsedUrl, err := url.Parse(request.Request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	uri := request.PathParameter("subpath") + "?" + parsedUrl.RawQuery
	forwardRequest := r.K8sClient.CoreV1().RESTClient().Verb(request.Request.Method).RequestURI(uri).Body(request.Request.Body)
	forwardRequest.SetHeader("Content-Type", request.HeaderParameter("Content-Type"))
	forwardResponse := forwardRequest.Do()

	responseBody, requestError := forwardResponse.Raw()
	if requestError != nil {
		utils.RespondError(response, requestError, http.StatusNotFound)
		return
	}

	logging.Log.Debugf("Forwarding to url : %s", forwardRequest.URL().String())
	response.Header().Add("Content-Type", utils.GetContentType(responseBody))
	response.Write(responseBody)
}

func (r Resource) GetIngress(request *restful.Request, response *restful.Response) {
	requestNamespace := utils.GetNamespace(request)

	ingress, err := r.K8sClient.ExtensionsV1beta1().Ingresses(requestNamespace).Get("tekton-dashboard", metav1.GetOptions{})

	ingressHost := ingress.Spec.Rules[0].Host

	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(ingressHost)
}

func (r Resource) GetProperties(request *restful.Request, response *restful.Response) {

	properties := Properties{InstallNamespace: os.Getenv("INSTALLED_NAMESPACE")}
	response.WriteEntity(properties)
}

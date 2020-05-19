/*
Copyright 2019-2020 The Tekton Authors
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
	"regexp"
	"strconv"
	"strings"

	restful "github.com/emicklei/go-restful"
	"github.com/gorilla/csrf"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
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
}

const (
	tektonDashboardIngressName string = "tekton-dashboard"
	tektonDashboardRouteName   string = "tekton-dashboard"
)

var secretsURIPattern *regexp.Regexp = regexp.MustCompile("/secrets[?/]")

// ProxyRequest does as the name suggests: proxies requests and logs what's going on
func (r Resource) ProxyRequest(request *restful.Request, response *restful.Response) {
	parsedURL, err := url.Parse(request.Request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	uri := request.PathParameter("subpath") + "?" + parsedURL.RawQuery
	forwardRequest := r.K8sClient.CoreV1().RESTClient().Verb(request.Request.Method).RequestURI(uri).Body(request.Request.Body)
	forwardRequest.SetHeader("Content-Type", request.HeaderParameter("Content-Type"))
	forwardResponse := forwardRequest.Do()

	if secretsURIPattern.Match([]byte(uri)) {
		handleSecretsResponse(response, forwardResponse)
		return
	}

	responseBody, requestError := forwardResponse.Raw()
	if requestError != nil {
		handleRequestError(response, responseBody, requestError)
		return
	}
	response.Header().Add("Content-Type", utils.GetContentType(responseBody))
	response.Write(responseBody)
}

// GetIngress returns the Ingress endpoint called "tektonDashboardIngressName" in the requested namespace
func (r Resource) GetIngress(request *restful.Request, response *restful.Response) {
	requestNamespace := utils.GetNamespace(request)

	ingress, err := r.K8sClient.ExtensionsV1beta1().Ingresses(requestNamespace).Get(tektonDashboardIngressName, metav1.GetOptions{})

	if err != nil || ingress == nil {
		logging.Log.Errorf("Unable to retrieve any ingresses: %s", err)
		utils.RespondError(response, err, http.StatusInternalServerError)
		return
	}

	noRuleError := "no Ingress rules found labelled " + tektonDashboardIngressName

	// Harden this block to avoid Go panics (array index out of range)
	if len(ingress.Spec.Rules) > 0 { // Got more than zero entries?
		if ingress.Spec.Rules[0].Host != "" { // For that rule, is there actually a host?
			ingressHost := ingress.Spec.Rules[0].Host
			response.WriteEntity(ingressHost)
			return
		}
		logging.Log.Errorf("found an empty Ingress rule labelled %s", tektonDashboardIngressName)
	} else {
		logging.Log.Error(noRuleError)
	}

	logging.Log.Error("Unable to retrieve any Ingresses")
	utils.RespondError(response, err, http.StatusInternalServerError)
	return
}

// GetIngress returns the Ingress endpoint called "tektonDashboardIngressName" in the requested namespace
func (r Resource) GetEndpoints(request *restful.Request, response *restful.Response) {
	type element struct {
		Type string `json:"type"`
		Url  string `json:"url"`
	}
	var responses []element
	requestNamespace := utils.GetNamespace(request)

	route, err := r.RouteClient.RouteV1().Routes(requestNamespace).Get(tektonDashboardIngressName, metav1.GetOptions{})
	noRuleError := "no Route found labelled " + tektonDashboardRouteName
	if err != nil || route == nil {
		logging.Log.Infof("Unable to retrieve any routes: %s", err)
	} else {
		if route.Spec.Host != "" { // For that rule, is there actually a host?
			routeHost := route.Spec.Host
			responses = append(responses, element{"Route", routeHost})
		} else {
			logging.Log.Error(noRuleError)
		}
	}

	ingress, err := r.K8sClient.ExtensionsV1beta1().Ingresses(requestNamespace).Get(tektonDashboardIngressName, metav1.GetOptions{})
	noRuleError = "no Ingress rules found labelled " + tektonDashboardIngressName
	if err != nil || ingress == nil {
		logging.Log.Infof("Unable to retrieve any ingresses: %s", err)
	} else {
		if len(ingress.Spec.Rules) > 0 { // Got more than zero entries?
			if ingress.Spec.Rules[0].Host != "" { // For that rule, is there actually a host?
				ingressHost := ingress.Spec.Rules[0].Host
				responses = append(responses, element{"Ingress", ingressHost})
			}
		} else {
			logging.Log.Error(noRuleError)
		}
	}

	if len(responses) != 0 {
		response.WriteEntity(responses)
	} else {
		logging.Log.Error("Unable to retrieve any Ingresses or Routes")
		utils.RespondError(response, err, http.StatusInternalServerError)
	}
}

// GetProperties is used to get the installed namespace for the Dashboard,
// the version of the Tekton Dashboard, the version of Tekton Pipelines, whether or not one's
// running on OpenShift, when one's in read-only mode and Tekton Triggers version (if Installed)
func (r Resource) GetProperties(request *restful.Request, response *restful.Response) {
	pipelineNamespace := r.Options.GetPipelinesNamespace()
	triggersNamespace := r.Options.GetTriggersNamespace()
	dashboardVersion := getDashboardVersion(r, r.Options.InstallNamespace)
	isOpenShift := isOpenShift(r, r.Options.InstallNamespace)
	pipelineVersion := getPipelineVersion(r, pipelineNamespace)

	properties := Properties{
		DashboardNamespace: r.Options.InstallNamespace,
		DashboardVersion:   dashboardVersion,
		PipelineNamespace:  pipelineNamespace,
		PipelineVersion:    pipelineVersion,
		IsOpenShift:        isOpenShift,
		ReadOnly:           r.Options.ReadOnly,
	}

	// If running on OpenShift, set the logout url
	if isOpenShift {
		properties.LogoutURL = "/oauth/sign_out"
	}

	isTriggersInstalled := isTriggersInstalled(r, triggersNamespace)

	if isTriggersInstalled {
		triggersVersion := getTriggersVersion(r, triggersNamespace)
		properties.TriggersNamespace = triggersNamespace
		properties.TriggersVersion = triggersVersion
	}

	response.WriteEntity(properties)
}

func (r Resource) GetToken(request *restful.Request, response *restful.Response) {
	response.Header().Add("X-CSRF-Token", csrf.Token(request.Request))
	response.Write([]byte("OK"))
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

func handleSecretsResponse(response *restful.Response, forwardResponse rest.Result) {
	responseBody, requestError := forwardResponse.Get()
	if requestError != nil {
		responseBodyRaw, requestError := forwardResponse.Raw()
		handleRequestError(response, responseBodyRaw, requestError)
		return
	}

	var responseObject interface{}

	list, _ := responseBody.(*corev1.SecretList)
	if list != nil {
		logging.Log.Debug("Processing SecretList response")
		secrets := make([]corev1.Secret, 0, len(list.Items))
		for _, secret := range list.Items {
			secrets = append(secrets, utils.SanitizeSecret(&secret, true).(corev1.Secret))
		}
		list.Items = secrets
		responseObject = list
	} else {
		secret, _ := responseBody.(*corev1.Secret)
		if secret != nil {
			logging.Log.Debug("Processing Secret response")
			responseObject = utils.SanitizeSecret(secret, true).(corev1.Secret)
		} else {
			responseObject = responseBody.(*metav1.Status)
		}
	}

	var statusCode *int = new(int)
	forwardResponse.StatusCode(statusCode)
	response.Header().Add("Content-Type", restful.MIME_JSON)
	response.WriteHeaderAndEntity(*statusCode, responseObject)
}

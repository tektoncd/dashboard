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
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	restful "github.com/emicklei/go-restful"
	"github.com/gorilla/csrf"
	"github.com/gorilla/websocket"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Properties : properties we want to be able to retrieve via REST
type Properties struct {
	InstallNamespace string `json:"InstallNamespace"`
	DashboardVersion string `json:"DashboardVersion"`
	PipelineVersion  string `json:"PipelineVersion"`
	TriggersVersion  string `json:"TriggersVersion,omitempty"`
	IsOpenShift      bool   `json:"IsOpenShift"`
	ReadOnly         bool   `json:"ReadOnly"`
	LogoutURL        string `json:"LogoutURL,omitempty"`
}

const (
	tektonDashboardIngressName string = "tekton-dashboard"
	tektonDashboardRouteName   string = "tekton-dashboard"
	defaultTriggersNamespace   string = "tekton-pipelines"
	defaultPipelineNamespace   string = "tekton-pipelines"
	triggersNamespaceEnvVar    string = "TRIGGERS_NAMESPACE"
	pipelineNamespaceEnvVar    string = "PIPELINE_NAMESPACE"
)

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

	responseBody, requestError := forwardResponse.Raw()
	if requestError != nil {
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

// getTriggersNamespace returns the namespace where Tekton Tiggers is installed.
func getTriggersNamespace() string {
	if e := os.Getenv(triggersNamespaceEnvVar); e != "" {
		return e
	}
	return defaultTriggersNamespace
}

// getPipelineNamespace returns the namespace where Tekton Pipelines is installed.
func getPipelineNamespace() string {
	if e := os.Getenv(pipelineNamespaceEnvVar); e != "" {
		return e
	}
	return defaultPipelineNamespace
}

// GetProperties is used to get the installed namespace for the Dashboard,
// the version of the Tekton Dashboard, the version of Tekton Pipelines, whether or not one's
// running on OpenShift, when one's in read-only mode and Tekton Triggers version (if Installed)
func (r Resource) GetProperties(request *restful.Request, response *restful.Response) {
	installedNamespace := os.Getenv("INSTALLED_NAMESPACE")
	triggersNamespace := getTriggersNamespace()
	pipelineNamespace := getPipelineNamespace()

	dashboardVersion := GetDashboardVersion(r, installedNamespace)
	isOpenShift := IsOpenShift(r, installedNamespace)
	isReadOnly := IsReadOnly()
	pipelineVersion := GetPipelineVersion(r, pipelineNamespace, isOpenShift)
	isTriggersInstalled := IsTriggersInstalled(r, triggersNamespace, isOpenShift)

	properties := Properties{
		InstallNamespace: installedNamespace,
		DashboardVersion: dashboardVersion,
		PipelineVersion:  pipelineVersion,
		IsOpenShift:      isOpenShift,
		ReadOnly:         isReadOnly,
	}

	// If running on OpenShift, set the logout url
	if isOpenShift {
		properties.LogoutURL = "/oauth/sign_out"
	}

	if isTriggersInstalled {
		triggersVersion := GetTriggersVersion(r, triggersNamespace, isOpenShift)
		properties.TriggersVersion = triggersVersion
	}

	response.WriteEntity(properties)
}

func (r Resource) GetToken(request *restful.Request, response *restful.Response) {
	response.Header().Add("X-CSRF-Token", csrf.Token(request.Request))
	response.Write([]byte("OK"))
}

func (r Resource) ProxyWebsocketRequest(bearerToken string) func(*restful.Request, *restful.Response) {
	return func(requestFromClient *restful.Request, responseToClient *restful.Response) {
		parsedURL, err := url.Parse(requestFromClient.Request.URL.String())
		if err != nil {
			http.Error(responseToClient, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		uri := requestFromClient.PathParameter("subpath") + "?" + parsedURL.RawQuery
		proxiedURI := r.K8sClient.CoreV1().RESTClient().Verb(requestFromClient.Request.Method).RequestURI(uri).URL().String()
		proxiedURI = strings.Replace(proxiedURI, "http", "ws", 1)

		dialer := websocket.Dialer{TLSClientConfig: &tls.Config{RootCAs: nil, InsecureSkipVerify: true}}
		requestHeader := http.Header{}
		requestHeader.Set("Authorization", "Bearer "+bearerToken)

		origin := requestFromClient.HeaderParameter("Origin")
		if origin != "" {
			requestHeader.Add("Origin", origin)
		}

		backendConnection, responseFromBackend, err := dialer.Dial(proxiedURI, requestHeader)
		if err != nil {
			logging.Log.Error("ProxyWebsocketRequest: failed dialling backend %s", err)
			if responseFromBackend != nil {
				if err := copyResponse(responseToClient, responseFromBackend); err != nil {
					logging.Log.Error("ProxyWebsocketRequest: failed writing response after bad backend handshake: %s", err)
				}
			} else {
				http.Error(responseToClient, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
			}
			return
		}
		defer backendConnection.Close()

		upgrader := &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 4096,
		}

		clientConnection, err := upgrader.Upgrade(responseToClient, requestFromClient.Request, nil)
		if err != nil {
			logging.Log.Error("ProxyWebsocketRequest: failed upgrade %s", err)
			return
		}
		defer clientConnection.Close()

		errClient := make(chan error, 1)
		errBackend := make(chan error, 1)
		proxyWebsocketConnection := func(destination, source *websocket.Conn, errorChannel chan error) {
			for {
				messageType, message, err := source.ReadMessage()
				if err != nil {
					closeMessage := websocket.FormatCloseMessage(websocket.CloseNormalClosure, fmt.Sprintf("%v", err))
					if e, ok := err.(*websocket.CloseError); ok {
						if e.Code != websocket.CloseNoStatusReceived {
							closeMessage = nil
							if e.Code != websocket.CloseAbnormalClosure && e.Code != websocket.CloseTLSHandshake {
								closeMessage = websocket.FormatCloseMessage(e.Code, e.Text)
							}
						}
					}
					errorChannel <- err
					if closeMessage != nil {
						destination.WriteMessage(websocket.CloseMessage, closeMessage)
					}
					break
				}
				err = destination.WriteMessage(messageType, message)
				if err != nil {
					errorChannel <- err
					break
				}
			}
		}

		go proxyWebsocketConnection(clientConnection, backendConnection, errClient)
		go proxyWebsocketConnection(backendConnection, clientConnection, errBackend)

		var message string
		select {
		case err = <-errClient:
			message = "ProxyWebsocketRequest: failed copying backend -> client: %v"
		case err = <-errBackend:
			message = "ProxyWebsocketRequest: failed copying client -> backend: %v"
		}
		e, ok := err.(*websocket.CloseError)
		if !ok || e.Code == websocket.CloseAbnormalClosure {
			logging.Log.Error(message, err)
		}
	}
}

func copyHeaders(destination http.Header, source http.Header) {
	for k, vv := range source {
		for _, v := range vv {
			destination.Add(k, v)
		}
	}
}

func copyResponse(responseToClient *restful.Response, responseFromBackend *http.Response) error {
	copyHeaders(responseToClient.Header(), responseFromBackend.Header)
	responseToClient.WriteHeader(responseFromBackend.StatusCode)
	defer responseFromBackend.Body.Close()

	_, err := io.Copy(responseToClient, responseFromBackend.Body)
	return err
}

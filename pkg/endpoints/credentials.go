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
	"fmt"
	"net/http"
	"strings"

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type credential struct {
	Id              string            `json:"id"`
	Username        string            `json:"username"`
	Password        string            `json:"password"`
	Description     string            `json:"description"`
	Type            string            `json:"type"` // must have the value 'accesstoken' or 'userpass'
	ResourceVersion string            `json:"resourceVersion,omitempty"`
	Url             map[string]string `json:"url"`
}

var LABEL_SELECTOR string = "restknative=true" // must have format "<key>=<value>"
var TYPE_ACCESS_TOKEN string = "accesstoken"
var TYPE_USER_PASS string = "userpass"

/* API route for getting all credentials in a given namespace
 * Required path parameters:
 *  - namespace
 */
func (r Resource) getAllCredentials(request *restful.Request, response *restful.Response) {
	// Get path parameter
	requestNamespace := request.PathParameter("namespace")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}

	// Get secrets from the resource K8sClient
	secrets, err := r.K8sClient.CoreV1().Secrets(requestNamespace).List(metav1.ListOptions{LabelSelector: LABEL_SELECTOR})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secrets from K8sClient: %s.", err.Error())
		response.WriteErrorString(http.StatusInternalServerError, errorMessage)
		logging.Log.Error(errorMessage)
		return
	}

	// Parse K8s secrets to credentials
	creds := []credential{}
	for _, secret := range secrets.Items {
		creds = append(creds, secretToCredential(&secret,true))
	}

	// Write the response
	response.AddHeader("Content-Type", "application/json")
	response.WriteEntity(creds)
}

/* API route for getting a given credential by name in a given namespace
 * Required path parameters:
 *  - namespace
 *  - id
 */
func (r Resource) getCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestId := request.PathParameter("id")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestId, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	secret, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Get(requestId, metav1.GetOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secret from K8sClient: %s.", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusInternalServerError)
		return
	}

	// Parse K8s secret to credential
	cred := secretToCredential(secret,true)

	// Write the response
	response.AddHeader("Content-Type", "application/json")
	response.WriteEntity(cred)
}

/* API route for creating a given credential
 * Required path parameters:
 *  - namespace
 * Required query parameters:
 *  - id
 *  - username
 *  - password
 *  - type (must have the value 'accesstoken' or 'userpass')
 */
func (r Resource) createCredential(request *restful.Request, response *restful.Response) {
	// Get path parameter
	requestNamespace := request.PathParameter("namespace")
	// Get query parameters
	cred := credential{}
	if err := getQueryEntity(&cred, request, response); err != nil {
		return
	}

	// Verify required query parameters are in cred
	if !r.verifyCredentialParameters(cred, response) {
		return
	}

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}

	// Create new secret struct
	secret, ok := credentialToSecret(cred, requestNamespace, response)
	if !ok {
		return
	}

	// Create new secret in K8s client
	if _, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Create(secret); err != nil {
		errorMessage := fmt.Sprintf("Error creating secret in K8sClient: %s", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusBadRequest)
		return
	}
	writeResponseLocation(request,response,cred.Id)
}

/* API route for updating a given credential
 * Cannot update the id field
 * Required path parameters:
 *  - namespace
 *  - id
 * Required query parameters:
 *  - username
 *  - password
 *  - type (must have the value 'accesstoken' or 'userpass')
 */
func (r Resource) updateCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestId := request.PathParameter("id")
	// Get query parameters
	cred := credential{}
	if err := getQueryEntity(&cred, request, response); err != nil {
		return
	}
	cred.Id = requestId

	// Verify required query parameters are in cred
	if !r.verifyCredentialParameters(cred, response) {
		return
	}

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestId, requestNamespace, response) {
		return
	}

	// Create secret struct
	secret, ok := credentialToSecret(cred, requestNamespace, response)
	if !ok {
		return
	}

	// Update secret in K8s client
	if _, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Update(secret); err != nil {
		errorMessage := fmt.Sprintf("Error updating secret in K8sClient: %s", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusBadRequest)
		return
	}
	writeResponseLocation(request,response,cred.Id)
}

/* API route for creating a given credential
 * Required path parameters:
 *  - namespace
 *  - id
 */
func (r Resource) deleteCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestId := request.PathParameter("id")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestId, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	err := r.K8sClient.CoreV1().Secrets(requestNamespace).Delete(requestId, &metav1.DeleteOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error deleting secret from K8sClient: %s.", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusInternalServerError)
		return
	}
}

// Returns true if the namespace exists in the resource K8sClient and false if it does not exist
func (r Resource) namespaceExists(namespace string) error {
	_, err := r.K8sClient.CoreV1().Namespaces().Get(namespace, metav1.GetOptions{})
	return err
}

// Sends error messages if the namespace does not exist in the resource K8sClient
func (r Resource) verifyNamespaceExists(namespace string, response *restful.Response) bool {
	if err := r.namespaceExists(namespace); err != nil {
		errorMessage := fmt.Sprintf("Namespace provided does not exist: '%s'.", namespace)
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusBadRequest)
		return false
	}
	return true
}

// Returns true if the secret exists in the resource K8sClient and false if it does not exist
func (r Resource) secretExists(secretName string, namespace string) error {
	_, err := r.K8sClient.CoreV1().Secrets(namespace).Get(secretName, metav1.GetOptions{})
	return err
}

// Sends error messages if the namespace does not exist in the resource K8sClient
func (r Resource) verifySecretExists(secretName string, namespace string, response *restful.Response) bool {
	if err := r.secretExists(secretName, namespace); err != nil {
		errorMessage := fmt.Sprintf("Error getting secret from K8sClient: '%s'.", secretName)
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusBadRequest)
		return false
	}
	return true
}

/* Verify required parameters are in credential struct
 * Required parameters:
 *  - Id
 *  - Username
 *  - Password
 *  - Type (must have the value 'accesstoken' or 'userpass')
 */
func (r Resource) verifyCredentialParameters(cred credential, response *restful.Response) bool {
	if cred.Id == "" ||
		cred.Username == "" ||
		cred.Password == "" ||
		cred.Url == nil ||
		(cred.Type != TYPE_ACCESS_TOKEN && cred.Type != TYPE_USER_PASS) {

		errorMessage := fmt.Sprintf("Error: username, password, id, url and type ('%s' or '%s') must all be supplied.", TYPE_ACCESS_TOKEN, TYPE_USER_PASS)
		utils.RespondErrorMessage(response, errorMessage, http.StatusBadRequest)
		return false
	}
	for key, _ := range cred.Url {
		if strings.Index(key, "tekton.dev/docker-") != 0 && strings.Index(key, "tekton.dev/git-") != 0 {
			errorMessage := fmt.Sprintf("Error: url key must start with \"tekton.dev/docker-\" or \"tekton.dev/get-\" invalid url: %s", key)
			utils.RespondErrorMessage(response, errorMessage, http.StatusBadRequest)
			return false
		}
	}

	return true
}

// Checks the Accept header and reads the content into the entityPointer.
func getQueryEntity(entityPointer interface{}, request *restful.Request, response *restful.Response) (err error) {
	if err := request.ReadEntity(entityPointer); err != nil {
		errorMessage := "Error parsing request body."
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusBadRequest)
		return err
	}
	return nil
}

// Convert K8s secret struct into credential struct
func secretToCredential(secret *corev1.Secret, mask bool) credential {
	cred := credential{
		Id:              secret.GetName(),
		Username:        string(secret.Data["username"]),
		Password:        string(secret.Data["password"]),
		Description:     string(secret.Data["description"]),
		Type:            string(secret.Data["type"]),
		Url:             secret.ObjectMeta.Annotations,
		ResourceVersion: secret.GetResourceVersion(),
	}
	if mask {
		cred.Password = "********"
	}
	return cred
}

// Convert credential struct into K8s secret struct
func credentialToSecret(cred credential, namespace string, response *restful.Response) (*corev1.Secret, bool) {
	// Create new secret struct
	secret := corev1.Secret{}
	secret.SetNamespace(namespace)
	secret.SetName(cred.Id)
	secret.Type = corev1.SecretTypeBasicAuth
	secret.Data = make(map[string][]byte)
	secret.Data["username"] = []byte(cred.Username)
	secret.Data["password"] = []byte(cred.Password)
	secret.Data["description"] = []byte(cred.Description)
	secret.Data["type"] = []byte(cred.Type)
	secret.ObjectMeta.Annotations = cred.Url

	// Add label
	keyValue := strings.Split(LABEL_SELECTOR, "=")
	if len(keyValue) != 2 {
		errorMessage := "Error setting label for secret"
		utils.RespondErrorMessage(response, errorMessage, http.StatusInternalServerError)
		return nil, false
	}
	key := keyValue[0]
	value := keyValue[1]
	labels := make(map[string]string)
	labels[key] = value
	secret.SetLabels(labels)

	// Return secret
	return &secret, true
}

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
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	typesPatch "k8s.io/apimachinery/pkg/types"
)

type credential struct {
	ID              string            `json:"id"`
	Username        string            `json:"username"`
	Password        string            `json:"password"`
	Description     string            `json:"description"`
	Type            string            `json:"type"` // must have the value 'accesstoken' or 'userpass'
	ResourceVersion string            `json:"resourceVersion,omitempty"`
	URL             map[string]string `json:"url"`
}

var labelSelector = "tektondashboard=true" // must have format "<key>=<value>"
var typeAccessToken = "accesstoken"
var typeUserPass = "userpass"

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
	secrets, err := r.K8sClient.CoreV1().Secrets(requestNamespace).List(metav1.ListOptions{LabelSelector: labelSelector})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secrets from K8sClient: %s.", err.Error())
		response.WriteErrorString(http.StatusInternalServerError, errorMessage)
		logging.Log.Error(errorMessage)
		return
	}

	// Parse K8s secrets to credentials
	creds := []credential{}
	for _, secret := range secrets.Items {
		creds = append(creds, secretToCredential(&secret))
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
	requestID := request.PathParameter("id")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestID, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	secret, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Get(requestID, metav1.GetOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secret from K8sClient: %s.", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusInternalServerError)
		return
	}

	// Parse K8s secret to credential
	cred := secretToCredential(secret)

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

	// Patch service account
	saName := ""
	providedSaName := os.Getenv("PIPELINE_RUN_SERVICE_ACCOUNT")
	if providedSaName != "" {
		saName = providedSaName
	} else {
		saName = "default"
	}
	if !r.addSecretToSA(saName, cred.ID, requestNamespace) {
		errorMessage := fmt.Sprintf("Error adding secret in service account: %s", saName)
		utils.RespondErrorAndMessage(response, nil, errorMessage, http.StatusBadRequest)
		return
	}

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
	requestID := request.PathParameter("id")
	// Get query parameters
	cred := credential{}
	if err := getQueryEntity(&cred, request, response); err != nil {
		return
	}
	cred.ID = requestID

	// Verify required query parameters are in cred
	if !r.verifyCredentialParameters(cred, response) {
		return
	}

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestID, requestNamespace, response) {
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
}

/* API route for creating a given credential
 * Required path parameters:
 *  - namespace
 *  - id
 */
func (r Resource) deleteCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestID := request.PathParameter("id")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestID, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	err := r.K8sClient.CoreV1().Secrets(requestNamespace).Delete(requestID, &metav1.DeleteOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error deleting secret from K8sClient: %s.", err.Error())
		utils.RespondErrorAndMessage(response, err, errorMessage, http.StatusInternalServerError)
		return
	}
	// Patch service account
	saName := ""
	providedSaName := os.Getenv("PIPELINE_RUN_SERVICE_ACCOUNT")
	if providedSaName != "" {
		saName = providedSaName
	} else {
		saName = "default"
	}
	r.removeSecretFromSA(saName, requestID, requestNamespace)
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
	if cred.ID == "" ||
		cred.Username == "" ||
		cred.Password == "" ||
		cred.URL == nil ||
		(cred.Type != typeAccessToken && cred.Type != typeUserPass) {

		errorMessage := fmt.Sprintf("Error: username, password, id, url and type ('%s' or '%s') must all be supplied.", typeAccessToken, typeUserPass)
		utils.RespondErrorMessage(response, errorMessage, http.StatusBadRequest)
		return false
	}
	for key := range cred.URL {
		if strings.Index(key, "tekton.dev/docker-") != 0 && strings.Index(key, "tekton.dev/git-") != 0 {
			errorMessage := fmt.Sprintf("Error: URL key must start with \"tekton.dev/docker-\" or \"tekton.dev/get-\" invalid URL: %s", key)
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
func secretToCredential(secret *corev1.Secret) credential {
	cred := credential{
		ID:              secret.GetName(),
		Username:        string(secret.Data["username"]),
		Password:        "********",
		Description:     string(secret.Data["description"]),
		Type:            string(secret.Data["type"]),
		URL:             secret.ObjectMeta.Annotations,
		ResourceVersion: secret.GetResourceVersion(),
	}
	return cred
}

// Convert credential struct into K8s secret struct
func credentialToSecret(cred credential, namespace string, response *restful.Response) (*corev1.Secret, bool) {
	// Create new secret struct
	secret := corev1.Secret{}
	secret.SetNamespace(namespace)
	secret.SetName(cred.ID)
	secret.Type = corev1.SecretTypeBasicAuth
	secret.Data = make(map[string][]byte)
	secret.Data["username"] = []byte(cred.Username)
	secret.Data["password"] = []byte(cred.Password)
	secret.Data["description"] = []byte(cred.Description)
	secret.Data["type"] = []byte(cred.Type)
	secret.ObjectMeta.Annotations = cred.URL

	// Add label
	keyValue := strings.Split(labelSelector, "=")
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

// addSecretToSA - Add secret to service account 
func (r Resource) addSecretToSA(saName string, secretName string , namespaceName string) bool {
	sa := corev1.ServiceAccount{
		Secrets: []corev1.ObjectReference {{Name: secretName},},
	}

	marshaledSA, err := json.Marshal(sa)
	if err != nil {
		logging.Log.Errorf("Failed to marshal payload")
		return false
	}

	logging.Log.Debugf("Service account to patch is %s", saName)
	logging.Log.Debugf("Namespace of service account is %s", namespaceName)
	logging.Log.Debugf("Patch string %s", string(marshaledSA))

	_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Get(saName, metav1.GetOptions{})

	if err != nil {
		logging.Log.Infof("Service Account %s doesn't exist. Creating..", saName)
		_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
			Create(&corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: saName,},})
		if err != nil {
			logging.Log.Errorf("Error occurred: %s", err.Error())
			return false
		}
	}

	_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Patch(saName, typesPatch.StrategicMergePatchType, marshaledSA)

	if err != nil {
		logging.Log.Errorf("Error occurred: %s", err.Error())
		return false
	}
	return true
}

// path - struct for patch operation
type patch struct {
	Op              string            `json:"op"`
	Path            string            `json:"path"`
}

// removeSecretFromSA - remove secret from service account 
func (r Resource) removeSecretFromSA(saName string, secretName string , namespaceName string) {
	logging.Log.Debugf("Service account to patch is %s", saName)
	logging.Log.Debugf("Namespace of service account is %s", namespaceName)

	sa, err := r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Get(saName, metav1.GetOptions{})
	if err != nil {
		logging.Log.Errorf("error getting service sccount %s: %s", saName, err.Error())
	}

	var entry int
	found := false
	for i, secret := range sa.Secrets {
		if secret.Name == secretName {
			found = true;
			entry = i
		}
	}
	if found {
		path := fmt.Sprintf("/secrets/%d", entry)
		data := patch { Op: "remove", Path: path } 
		patch, err := json.Marshal(data)
		logging.Log.Debugf("Patch JSON:%s", string(patch))
		_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
			Patch(saName, typesPatch.JSONPatchType, patch)
		if err != nil {
			logging.Log.Errorf("Error occurred: %+v", err)
		}
	}
	return
}

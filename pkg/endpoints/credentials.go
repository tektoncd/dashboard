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
	Name            string            `json:"name,omitempty"`
	Username        string            `json:"username,omitempty"`
	Password        string            `json:"password,omitempty"`
	Description     string            `json:"description,omitempty"`
	ResourceVersion string            `json:"resourceVersion,omitempty"`
	URL             map[string]string `json:"url,omitempty"`
	ServiceAccount  string            `json:"serviceAccount,omitempty"`
	Namespace       string            `json:"namespace,omitempty"`
}

const (
	serviceAccountLabelKey string = "service-account"
)

/* API route for getting all credentials in a given namespace
 * Required path parameters:
 *  - namespace
 */
func (r Resource) getAllCredentials(request *restful.Request, response *restful.Response) {
	// Get path parameter
	requestNamespace := utils.GetNamespace(request)

	// Get secrets from the resource K8sClient
	secrets, err := r.K8sClient.CoreV1().Secrets(requestNamespace).List(metav1.ListOptions{FieldSelector: "type=kubernetes.io/basic-auth"})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secrets from K8sClient: %s.", err.Error())
		response.WriteErrorString(http.StatusInternalServerError, errorMessage)
		logging.Log.Error(errorMessage)
		return
	}

	// Parse K8s secrets to credentials
	creds := []credential{}
	for _, secret := range secrets.Items {
		creds = append(creds, secretToCredential(&secret, true))
	}

	// Write the response
	response.AddHeader("Content-Type", "application/json")
	response.WriteEntity(creds)
}

/* API route for getting a given credential by name in a given namespace
 * Required path parameters:
 *  - Namespace
 *  - Name
 */
func (r Resource) getCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestName := request.PathParameter("name")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestName, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	secret, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Get(requestName, metav1.GetOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secret from K8sClient: %s.", err.Error())
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusInternalServerError)
		return
	}

	// Parse K8s secret to credential
	cred := secretToCredential(secret, true)

	// Write the response
	response.AddHeader("Content-Type", "application/json")
	response.WriteEntity(cred)
}

/* API route for creating a given credential
 * Required path parameters:
 *  - namespace
 * Required query parameters:
 *  - Name
 *  - Username
 *  - Password
 *  - Type (must have the value 'accesstoken' or 'userpass')
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
	secret := credentialToSecret(cred, requestNamespace, response)

	// Create new secret in K8s client
	if _, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Create(secret); err != nil {
		errorMessage := fmt.Sprintf("Error creating secret in K8sClient: %s", err.Error())
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusBadRequest)
		return
	}

	// Patch service account
	labels := secret.GetLabels()
	saName, _ := labels[serviceAccountLabelKey]
	if !r.addSecretToSA(saName, cred.Name, requestNamespace) {
		errorMessage := fmt.Sprintf("error adding secret in service account: %s", saName)
		utils.RespondErrorMessage(response, errorMessage, http.StatusBadRequest)
		return
	}

	writeResponseLocation(request, response, cred.Name)
}

/* API route for updating a given credential
 * Cannot update the Name field
 * Required path parameters:
 *  - Namespace
 *  - Name
 * Required query parameters:
 *  - Username
 *  - Password
 *  - Type (must have the value 'accesstoken' or 'userpass')
 */
func (r Resource) updateCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestName := request.PathParameter("name")
	// Get query parameters
	cred := credential{}
	if err := getQueryEntity(&cred, request, response); err != nil {
		return
	}
	cred.Name = requestName

	// Verify required query parameters are in cred
	if !r.verifyCredentialParameters(cred, response) {
		return
	}

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestName, requestNamespace, response) {
		return
	}

	// Create secret struct
	secret := credentialToSecret(cred, requestNamespace, response)

	// Update secret in K8s client
	if _, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Update(secret); err != nil {
		errorMessage := fmt.Sprintf("Error updating secret in K8sClient: %s", err.Error())
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusBadRequest)
		return
	}

	response.WriteHeader(204)
}

/* API route for creating a given credential
 * Required path parameters:
 *  - Namespace
 *  - Name
 */
func (r Resource) deleteCredential(request *restful.Request, response *restful.Response) {
	// Get path parameters
	requestNamespace := request.PathParameter("namespace")
	requestName := request.PathParameter("name")

	// Verify namespace exists
	if !r.verifyNamespaceExists(requestNamespace, response) {
		return
	}
	// Verify secret exists
	if !r.verifySecretExists(requestName, requestNamespace, response) {
		return
	}

	// Get secret from the resource K8sClient
	secret, err := r.K8sClient.CoreV1().Secrets(requestNamespace).Get(requestName, metav1.GetOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error getting secret from K8sClient: %s.", err.Error())
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusInternalServerError)
		return
	}

	// Parse K8s secret to credential
	cred := secretToCredential(secret, true)

	// Delete secret from the resource K8sClient
	err = r.K8sClient.CoreV1().Secrets(requestNamespace).Delete(requestName, &metav1.DeleteOptions{})
	if err != nil {
		errorMessage := fmt.Sprintf("Error deleting secret from K8sClient: %s.", err.Error())
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusInternalServerError)
		return
	}
	// Patch service account
	r.removeSecretFromSA(cred.ServiceAccount, requestName, requestNamespace)
	response.WriteHeader(204)
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
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusBadRequest)
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
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusBadRequest)
		return false
	}
	return true
}

/* Verify required parameters are in credential struct
 * Required parameters:
 *  - Name
 * If type == userpass
 *  - Username
 *  - Password
 */
func (r Resource) verifyCredentialParameters(cred credential, response *restful.Response) bool {
	errorMessage := ""
	if cred.Name == "" {
		errorMessage = fmt.Sprintf("Error: Name must be specified")
	} else if cred.Username == "" || cred.Password == "" {
		errorMessage = fmt.Sprintf("Error: Username and Password must all be supplied")
	}
	for key := range cred.URL {
		if strings.Index(key, "tekton.dev/docker-") != 0 && strings.Index(key, "tekton.dev/git-") != 0 {
			if errorMessage != "" {
				errorMessage += "\n"
			}
			errorMessage += fmt.Sprintf("Error: URL key must start with \"tekton.dev/docker-\" or \"tekton.dev/git-\" invalid URL: %s\n", key)
		}
	}
	if errorMessage != "" {
		utils.RespondErrorMessage(response, errorMessage, http.StatusBadRequest)
		return false
	}
	return true
}

// Checks the Accept header and reads the content into the entityPointer.
func getQueryEntity(entityPointer interface{}, request *restful.Request, response *restful.Response) (err error) {
	if err := request.ReadEntity(entityPointer); err != nil {
		errorMessage := "Error parsing request body."
		utils.RespondMessageAndLogError(response, err, errorMessage, http.StatusBadRequest)
		return err
	}
	return nil
}

// Convert K8s secret struct into credential struct
func secretToCredential(secret *corev1.Secret, mask bool) credential {
	labels := secret.GetLabels()
	saName, _ := labels[serviceAccountLabelKey]
	cred := credential{
		Name:            secret.GetName(),
		Username:        string(secret.Data["username"]),
		Password:        string(secret.Data["password"]),
		Description:     string(secret.Data["description"]),
		URL:             secret.ObjectMeta.Annotations,
		ResourceVersion: secret.GetResourceVersion(),
		ServiceAccount:  saName,
		Namespace:       secret.GetNamespace(),
	}
	if mask {
		cred.Password = "********"
	}
	return cred
}

// Convert credential struct into K8s secret struct
func credentialToSecret(cred credential, namespace string, response *restful.Response) *corev1.Secret {
	// Create new secret struct
	secret := corev1.Secret{}
	secret.SetNamespace(namespace)
	secret.SetName(cred.Name)
	secret.Data = make(map[string][]byte)
	secret.Type = corev1.SecretTypeBasicAuth
	secret.Data["namespace"] = []byte(namespace)
	secret.Data["username"] = []byte(cred.Username)
	secret.Data["password"] = []byte(cred.Password)
	secret.Data["description"] = []byte(cred.Description)
	secret.ObjectMeta.Annotations = cred.URL
	saName := ""
	if cred.ServiceAccount != "" {
		saName = cred.ServiceAccount
	} else {
		providedSaName := os.Getenv("PIPELINE_RUN_SERVICE_ACCOUNT")
		if providedSaName != "" {
			saName = providedSaName
		} else {
			saName = "default"
		}
	}
	labels := map[string]string{
		serviceAccountLabelKey: saName,
	}
	secret.SetLabels(labels)

	// Return secret
	return &secret
}

// addSecretToSA - Add secret to service account
func (r Resource) addSecretToSA(saName, secretName, namespaceName string) bool {
	logging.Log.Debugf("Service account to patch is %s", saName)
	logging.Log.Debugf("Namespace of service account is %s", namespaceName)
	sa := corev1.ServiceAccount{
		Secrets: []corev1.ObjectReference{{Name: secretName}},
	}

	marshaledSA, err := json.Marshal(sa)
	if err != nil {
		logging.Log.Errorf("failed to marshal the payload for the service account")
		return false
	}

	logging.Log.Debugf("Patch string %s", string(marshaledSA))
	_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Get(saName, metav1.GetOptions{})

	if err != nil {
		logging.Log.Infof("Service Account %s doesn't exist. Creating..", saName)
		_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
			Create(&corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: saName}})
		if err != nil {
			logging.Log.Errorf("error occurred: %s", err.Error())
			return false
		}
	}

	_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Patch(saName, typesPatch.StrategicMergePatchType, marshaledSA)

	if err != nil {
		logging.Log.Errorf("error occurred while patching service account %s: %s", saName, err.Error())
		return false
	}
	return true
}

// path - struct for patch operation
type Patch struct {
	Operation string `json:"op"`
	Path      string `json:"path"`
}

// removeSecretFromSA - remove secret from service account
func (r Resource) removeSecretFromSA(saName string, secretName string, namespaceName string) {
	logging.Log.Debugf("Service account to unpatch is %s", saName)
	logging.Log.Debugf("Namespace of service account is %s", namespaceName)

	sa, err := r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
		Get(saName, metav1.GetOptions{})
	if err != nil {
		logging.Log.Errorf("error getting service account %s: %s", saName, err.Error())
	}

	var entry int
	found := false
	for i, secret := range sa.Secrets {
		if secret.Name == secretName {
			found = true
			entry = i
			break
		}
	}
	if found {
		path := fmt.Sprintf("/secrets/%d", entry)
		data := []Patch{{Operation: "remove", Path: path}}
		patch, err := json.Marshal(data)
		logging.Log.Debugf("Patch JSON: %s", string(patch))
		_, err = r.K8sClient.CoreV1().ServiceAccounts(namespaceName).
			Patch(saName, typesPatch.JSONPatchType, patch)
		if err != nil {
			logging.Log.Errorf("error occurred while patching service account %s: %+v", saName, err)
		}
	}
	return
}

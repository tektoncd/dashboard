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
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http/httptest"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Test Credentials CRUD
func TestCredentials(t *testing.T) {
	// Create dummy entities for tests
	r := dummyResource()
	// Create the dummy namespace 'tekton-pipelines'
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	// Initialize test data
	expectCreds := []credential{}
	accessTokenCred := credential{
		ID:          "credentialaccesstoken",
		Username:    "personal-access-token",
		Password:    "passwordaccesstoken",
		Description: "access token credential",
		Type:        "accesstoken",
		URL: map[string]string{
			"tekton.dev/git-0": "https://github.com",
		},
	}
	userPassCred := credential{
		ID:          "credentialuserpass",
		Username:    "usernameuserpass",
		Password:    "passworduserpass",
		Description: "user password credential",
		Type:        "userpass",
		URL: map[string]string{
			"tekton.dev/docker-0": "https://gcr.io",
		},
	}

	// READ ALL credentials when there are none
	t.Log("READ all credentials when there are none")
	readAllCredentialsTest(namespace, expectCreds, "", r, t)

	// CREATE credential accesstoken
	t.Log("CREATE credential accesstoken")
	createCredentialTest(namespace, accessTokenCred, "", r, t)
	if !r.checkSecretInSa(namespace, "default", "credentialaccesstoken", t) {
		t.Error("FAIL: ERROR - service account doesn't have the secret: credentialaccesstoken")
	}

	// CREATE credential userpass
	t.Log("CREATE credential userpass")
	createCredentialTest(namespace, userPassCred, "", r, t)
	if !r.checkSecretInSa(namespace, "default", "credentialuserpass", t) {
		t.Error("FAIL: ERROR - service account doesn't have the secret: credentialuserpass")
	}

	// READ ALL credentials when there is the accesstoken credential and userpass credential
	t.Log("READ all credentials when there is 'credentialaccesstoken' and 'credentialuserpass'")
	expectCreds = []credential{
		accessTokenCred,
		userPassCred,
	}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)

	// READ credential accesstoken
	t.Log("READ credential 'credentialaccesstoken' when it exists")
	// Create dummy rest api request and response
	readCredentialTest(namespace, accessTokenCred, "", r, t)

	// READ credential userpass
	t.Log("GET credential 'credentialuserpass' when it exists")
	readCredentialTest(namespace, userPassCred, "", r, t)

	// UPDATE credential accesstoken
	t.Log("UPDATE credential 'credentialaccesstoken' when it exists")
	accessTokenCred.Username = "personal-access-token-updated"
	accessTokenCred.Password = "passwordaccesstoken-updated"
	accessTokenCred.Description = "access token credential updated"
	accessTokenCred.Type = "accesstoken"
	updateCredentialTest(namespace, accessTokenCred, "", r, t)

	// UPDATE credential userpass
	t.Log("UPDATE credential 'credentialuserpass' when it exists")
	userPassCred.Username = "usernameuserpassupdated"
	userPassCred.Password = "passworduserpassupdated"
	userPassCred.Description = "user password credential updated"
	userPassCred.Type = "userpass"
	updateCredentialTest(namespace, userPassCred, "", r, t)

	// READ ALL
	t.Log("READ all credentials when there is 'credentialaccesstoken' and 'credentialuserpass' (they were both just updated)")
	expectCreds = []credential{
		accessTokenCred,
		userPassCred,
	}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)

	// DELETE credential accesstoken
	t.Log("DELETE credential 'credentialaccesstoken' when it exists")
	deleteCredentialTest(namespace, accessTokenCred.ID, "", r, t)

	// READ ALL credentials when there is only the userpass credential
	t.Log("READ all credentials when there is only 'credentialuserpass' ('credentialaccesstoken' was just deleted)")
	expectCreds = []credential{
		userPassCred,
	}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)
	// fake patch function for service account may not be implemented
	//if r.checkSecretInSa(namespace, "default", "credentialaccesstoken", t) {
	//	t.Error("FAIL: ERROR - service account still has the secret: credentialaccesstoken")
	//}

	// DELETE credential userpass
	t.Log("DELETE credential 'credentialuserpass' when it exists")
	deleteCredentialTest(namespace, userPassCred.ID, "", r, t)

	// READ ALL credentials when there are none
	t.Log("READ all credentials when there are none ('credentialuserpass' was just deleted)")
	expectCreds = []credential{}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)
	// fake patch function for service account may not be implemented
	//if r.checkSecretInSa(namespace, "default", "credentialuserpass", t) {
	//	t.Error("FAIL: ERROR - service account still has the secret: credentialuserpass")
	//}
}

// Test Credentials CRUD error reporting
func TestCredentialsErrors(t *testing.T) {
	// Create dummy entities for tests
	r := dummyResource()
	// Create the dummy namespace 'tekton-pipelines'
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	// Initialize test data
	expectError := ""
	invalidCreds := []credential{}

	// (ERROR) CREATE and UPDATE invalid credentials missing username, password, ID, URL or type ('accesstoken' or 'userpass')
	invalidCreds = []credential{
		credential{
			Username:    "personal-access-token",
			Password:    "passordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			ID:          "credentialaccesstoken",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "bogustype",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "bogustype",
		},
	}
	for _, invalidCred := range invalidCreds {
		// Must match error message exactly in the verify function, careful if you change fields
		expectError = fmt.Sprintf("Error: username, password, id, url and type ('accesstoken' or 'userpass') must all be supplied.")
		createCredentialTest(namespace, invalidCred, expectError, r, t)
		updateCredentialTest(namespace, invalidCred, expectError, r, t)
	}

	invalidCreds = []credential{
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/gitaa-0": "https://github.com",
			},
		},
	}
	for _, invalidCred := range invalidCreds {
		expectError = fmt.Sprintf("Error: URL key must start with \"tekton.dev/docker-\" or \"tekton.dev/get-\" invalid URL: tekton.dev/gitaa-0")
		createCredentialTest(namespace, invalidCred, expectError, r, t)
		updateCredentialTest(namespace, invalidCred, expectError, r, t)
	}
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)

	// (ERROR) READ, UPDATE, and DELETE credentials that do not exist
	invalidCreds = []credential{
		credential{
			ID:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
		credential{
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		},
	}
	for _, invalidCred := range invalidCreds {
		expectError = fmt.Sprintf("Error getting secret from K8sClient: '%s'.", invalidCred.ID)
		readCredentialTest(namespace, invalidCred, expectError, r, t)
		deleteCredentialTest(namespace, invalidCred.ID, expectError, r, t)
	}
	expectError = fmt.Sprintf("Error getting secret from K8sClient: '%s'.", invalidCreds[0].ID)
	updateCredentialTest(namespace, invalidCreds[0], expectError, r, t)

	// (ERROR) CREATE, READ, UPDATE, and DELETE credentials in a namespace that does not exist
	bogusNamespace := "bogusnamespace"
	expectError = fmt.Sprintf("Namespace provided does not exist: '%s'.", bogusNamespace)
	cred := credential{
		ID:          "credentialaccesstoken",
		Username:    "personal-access-token",
		Password:    "passwordaccesstoken",
		Description: "access token credential",
		Type:        "accesstoken",
		URL: map[string]string{
			"tekton.dev/git-0": "https://github.com",
		},
	}
	createCredentialTest(bogusNamespace, cred, expectError, r, t)
	readAllCredentialsTest(bogusNamespace, []credential{cred}, expectError, r, t)
	readCredentialTest(bogusNamespace, cred, expectError, r, t)
	updateCredentialTest(bogusNamespace, cred, expectError, r, t)
	deleteCredentialTest(bogusNamespace, cred.ID, expectError, r, t)
}

/*
 * CREATE credential test
 * To function properly, [cred] must have the following fields:
 *  - ID
 *  - username
 *  - password
 *  - type (must have the value 'accesstoken' or 'userpass')
 */
func createCredentialTest(namespace string, cred credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("CREATE credential %+v", cred)
	// Create dummy rest api request and response
	jsonBody, _ := json.Marshal(cred)
	t.Logf("json body for create cred test: %s", jsonBody)
	httpReq := dummyHTTPRequest("POST", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/", bytes.NewBuffer(jsonBody))
	req := dummyRestfulRequest(httpReq, namespace, "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	// Test create credential
	r.createCredential(req, resp)

	// Read result
	resultCred := credential{}
	if !testParseResponse(httpWriter.Body, &resultCred, expectError, t) {
		return
	}

	// Verify agains K8s client
	testCredential(r.getK8sCredential(namespace, cred.ID), cred, t)
}

/*
 * READ ALL credentials test
 * To function properly, [expectCreds] must have the same number of credentials as there are in the system
 * and they must be in the correct order (alphabetical by ID field)
 */
func readAllCredentialsTest(namespace string, expectCreds []credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("READ all credentials. Expecting: %+v", expectCreds)
	// Create dummy REST API request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/", nil)
	req := dummyRestfulRequest(httpReq, namespace, "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	// Test to get all credentials
	r.getAllCredentials(req, resp)

	// Look for password "********"
	credPasswords := []string{}
	for i, cred := range expectCreds {
		credPassword := cred.Password
		credPasswords = append(credPasswords, credPassword)
		expectCreds[i].Password = "********"
	}
	// Read result
	resultCreds := []credential{}
	if !testParseResponse(httpWriter.Body, &resultCreds, expectError, t) {
		return
	}
	testCredentials(resultCreds, expectCreds, t)
	// Return password value
	for i := range expectCreds {
		expectCreds[i].Password = credPasswords[i]
	}

	// Verify against K8s client
	testCredentials(r.getK8sCredentials(namespace), expectCreds, t)
	t.Logf("Done in READ all credentials. Expecting: %+v", expectCreds)
}

/*
 * READ credential test
 * To function properly, [expectCred] must have the "ID" field
 */
func readCredentialTest(namespace string, expectCred credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("READ credential %s", expectCred.ID)
	// Create dummy rest api request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+expectCred.ID, nil)
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["id"] = expectCred.ID
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	// Test get all credentials
	r.getCredential(req, resp)

	// Look for password "********"
	expectCredPassword := expectCred.Password
	expectCred.Password = "********"
	// Read result
	resultCred := credential{}
	if !testParseResponse(httpWriter.Body, &resultCred, expectError, t) {
		return
	}
	testCredential(resultCred, expectCred, t)
	// Return password value
	expectCred.Password = expectCredPassword

	// Verify agains K8s client
	testCredential(r.getK8sCredential(namespace, expectCred.ID), expectCred, t)
}

/*
 * UPDATE credential test
 * To function properly, [cred] must have the following fields:
 *  - ID
 *  - username
 *  - password
 *  - type (must have the value 'accesstoken' or 'userpass')
 */
func updateCredentialTest(namespace string, cred credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("UPDATE credential %+v", cred)
	// Create dummy rest api request and response
	jsonBody, _ := json.Marshal(cred)
	httpReq := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+cred.ID, bytes.NewBuffer(jsonBody))
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["id"] = cred.ID
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	// Test get all credentials
	r.updateCredential(req, resp)

	// Read result
	resultCred := credential{}
	if !testParseResponse(httpWriter.Body, &resultCred, expectError, t) {
		return
	}

	// Verify agains K8s client
	testCredential(r.getK8sCredential(namespace, cred.ID), cred, t)
}

/*
 * DELETE credential test
 */
func deleteCredentialTest(namespace string, credID string, expectError string, r *Resource, t *testing.T) {
	t.Logf("DELETE credential %s", credID)
	// Create dummy rest api request and response
	httpReq := dummyHTTPRequest("DELETE", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+credID, nil)
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["id"] = credID
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	// Test create credential
	r.deleteCredential(req, resp)

	// Read result
	resultCred := credential{}
	if !testParseResponse(httpWriter.Body, &resultCred, expectError, t) {
		return
	}

	// Verify agains K8s client
	testCredential(r.getK8sCredential(namespace, credID), credential{}, t)
}

/*
 * Read the body and unmarshal it into the result pointer.
 * Check against the expectError if the unmarshal fails.
 * Returns true only when the result is populated properly.
 * Will error if expectError is not "" and the unmarshal succeeds
 */
func testParseResponse(body *bytes.Buffer, result interface{}, expectError string, t *testing.T) bool {
	b, err := ioutil.ReadAll(body)
	if err != nil {
		t.Errorf("FAIL: ERROR - reading response body: %s", err.Error())
		return false
	}
	err = json.Unmarshal(b, result)
	if err != nil {
		resultError := string(b)
		if resultError != expectError {
			t.Errorf("FAIL: ERROR - Error message == '%s', want '%s', body: %s", resultError, expectError, body)
		}
		return false
	}
	if expectError != "" {
		t.Errorf("FAIL: ERROR - Result == %+v, want error message '%s'", result, expectError)
	}
	return true
}

// Compares two lists of credentials
func testCredentials(result []credential, expectResult []credential, t *testing.T) {
	t.Logf("Resulting credentials: %+v\n", result)
	t.Logf("Expected credentials: %+v\n", expectResult)
	if len(result) != len(expectResult) {
		t.Errorf("FAIL: result == %+v, want %+v, different number of credentials", result, expectResult)
	}
	for i := range expectResult {
		expectCred := expectResult[i]
		resultCred := result[i]
		testCredential(resultCred, expectCred, t)
	}
}

// Compare two credentials
func testCredential(resultCred credential, expectCred credential, t *testing.T) {
	t.Logf("Resulting credential: %+v\n", resultCred)
	t.Logf("Expected credential: %+v\n", expectCred)
	// Result credential might have more fields than the expected one
	if resultCred.ID != expectCred.ID ||
		resultCred.Username != expectCred.Username ||
		resultCred.Password != expectCred.Password ||
		resultCred.Description != expectCred.Description ||
		resultCred.Type != expectCred.Type {
		t.Errorf("FAIL: result == %+v, want %+v", resultCred, expectCred)
	}
	for key := range expectCred.URL {
		if _, ok := resultCred.URL[key]; !ok || resultCred.URL[key] != expectCred.URL[key] {
			t.Errorf("FAIL: result == %+v, want %+v for key %s", resultCred.URL, expectCred.URL, key)
		}
	}
}

// Get all K8s client secrets with selector LABEL_SELECTOR
func (r Resource) getK8sCredentials(namespace string) (credentials []credential) {
	secrets, err := r.K8sClient.CoreV1().Secrets(namespace).List(metav1.ListOptions{LabelSelector: "tektondashboard=true"})
	if err != nil {
		return
	}
	for _, secret := range secrets.Items {
		credentials = append(credentials, secretToJSON(&secret))
	}
	return credentials
}

// Get K8s client secret
func (r Resource) getK8sCredential(namespace string, name string) (credential credential) {
	secret, err := r.K8sClient.CoreV1().Secrets(namespace).Get(name, metav1.GetOptions{})
	if err != nil {
		return
	}
	return secretToJSON(secret)
}

// Get check service account secret
func (r Resource) checkSecretInSa(namespace string, nameSa string, nameSecret string, t *testing.T) bool {
	sa, err := r.K8sClient.CoreV1().ServiceAccounts(namespace).Get(nameSa, metav1.GetOptions{})
	if err != nil {
		t.Logf("Couldn't read service account: %+v\n", err)		
		return false
	}
	for _, secret := range sa.Secrets {
		t.Logf("Got secret : %+v\n", secret.Name)		
		if secret.Name == nameSecret {	
			return true
		}
	}
	return false
}

// Convert K8s secret struct into credential struct
func secretToJSON(secret *corev1.Secret) credential {
	cred := credential{
		ID:              secret.GetName(),
		Username:        string(secret.Data["username"]),
		Password:        string(secret.Data["password"]),
		Description:     string(secret.Data["description"]),
		Type:            string(secret.Data["type"]),
		URL:             secret.ObjectMeta.Annotations,
		ResourceVersion: secret.GetResourceVersion(),
	}
	return cred
}

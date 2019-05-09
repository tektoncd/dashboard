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
	"reflect"
	"strings"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

/** TODO next: implement dockerconfigjson support in credentials.go
var (
	dockerRegistrySecret = credential{
		Name:           "dockerSecret",
		DockerServer:   "my.docker.server",
		DockerUsername: "myDockerName",
		DockerEmail:    "myDockerEmail",
		DockerPassword: "myDockerPassword",
		Description:    "its a docker password",
		Type:           "dockerregistry",
		URL: map[string]string{
			"tekton.dev/docker-0": "https://index.docker.io/v1/",
		},
		ServiceAccount: "sa2",
	}
)

func TestCreateDockerSecret(t *testing.T) {
	r := dummyResource()
	namespace := "newTestNamespace"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	t.Log("CREATE docker secret")
	createCredentialTest(namespace, dockerRegistrySecret, "", r, t)
	if !r.checkSecretInSa(namespace, "sa2", "dockerSecret", t) {
		t.Fatal("FAIL: ERROR - service account sa2 doesn't have the secret: dockerSecret")
	}
}
**/

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
		Name:        "credentialaccesstoken",
		Type:        "accesstoken",
		AccessToken: "personal-access-token",
		Description: "access token credential",
		URL: map[string]string{
			"tekton.dev/git-0": "https://github.com",
		},
		ServiceAccount: "sa1",
	}
	userPassCred := credential{
		Name:        "credentialuserpass",
		Username:    "usernameuserpass",
		Password:    "passworduserpass",
		Description: "user password credential",
		Type:        "userpass",
		URL: map[string]string{
			"tekton.dev/docker-0": "https://gcr.io",
		},
		ServiceAccount: "default",
	}

	// READ ALL credentials when there are none
	t.Log("READ all credentials when there are none")
	readAllCredentialsTest(namespace, expectCreds, "", r, t)

	// CREATE credential accesstoken
	t.Log("CREATE credential accesstoken")
	createCredentialTest(namespace, accessTokenCred, "", r, t)
	if !r.checkSecretInSa(namespace, "sa1", "credentialaccesstoken", t) {
		t.Fatal("FAIL: ERROR - service account doesn't have the secret: credentialaccesstoken")
	}

	// CREATE credential userpass
	t.Log("CREATE credential userpass")
	createCredentialTest(namespace, userPassCred, "", r, t)
	if !r.checkSecretInSa(namespace, "default", "credentialuserpass", t) {
		t.Fatal("FAIL: ERROR - service account doesn't have the secret: credentialuserpass")
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

	// UPDATE credential
	t.Log("UPDATE credential 'credentialaccesstoken' when it exists")
	accessTokenCred.AccessToken = "personal-access-token-updated"
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
	deleteCredentialTest(namespace, accessTokenCred.Name, "", r, t)

	// READ ALL credentials when there is only the userpass credential
	t.Log("READ all credentials when there is only 'credentialuserpass' ('credentialaccesstoken' was just deleted)")
	expectCreds = []credential{
		userPassCred,
	}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)

	// DELETE credential userpass
	t.Log("DELETE credential 'credentialuserpass' when it exists")
	deleteCredentialTest(namespace, userPassCred.Name, "", r, t)

	// READ ALL credentials when there are none
	t.Log("READ all credentials when there are none ('credentialuserpass' was just deleted)")
	expectCreds = []credential{}
	readAllCredentialsTest(namespace, expectCreds, "", r, t)
}

// Check error reporting for credentials created with no name or type, or bad types
func TestCreateCredentialsWithNoNameOrType(t *testing.T) {
	r := dummyResource()
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	invalidCreds := []credential{
		credential{
			Type: "accesstoken",
		},
		credential{
			Name: "goodNameNoType",
		},
		credential{
			Type: "badtype",
		},
	}
	expectedError := fmt.Sprintf("Error: Name and Type ('%s', '%s' or '%s' must be specified", typeAccessToken, typeUserPass, typeDockerRegistry)
	for _, invalidCred := range invalidCreds {
		createCredentialTest(namespace, invalidCred, expectedError, r, t)
		updateCredentialTest(namespace, invalidCred, expectedError, r, t)
	}
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)
}

func TestCreateBadUserPass(t *testing.T) {
	r := dummyResource()
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	badUserPass := []credential{
		credential{
			Name:     "badCredNoUsername",
			Type:     "userpass",
			Password: "badpw1",
		},
		credential{
			Name:     "badCredNoPassword",
			Type:     "userpass",
			Username: "someone",
		},
	}
	expectedError := fmt.Sprintf("Error: Username and Password must all be supplied for Type %s", typeUserPass)
	for _, invalidCred := range badUserPass {
		createCredentialTest(namespace, invalidCred, expectedError, r, t)
		updateCredentialTest(namespace, invalidCred, expectedError, r, t)
	}
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)
}

func TestCreateBadAccessToken(t *testing.T) {
	r := dummyResource()
	namespace := "access-tokens"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	badAccessToken := credential{
		Name:     "badToken",
		Type:     "accesstoken",
		Password: "shouldHaveBeenAnAccessToken",
	}
	expectedError := fmt.Sprintf("Error: AccessToken must be supplied for Type %s", typeAccessToken)
	createCredentialTest(namespace, badAccessToken, expectedError, r, t)
	updateCredentialTest(namespace, badAccessToken, expectedError, r, t)
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)
}

func TestCreateBadDockerSecrets(t *testing.T) {
	r := dummyResource()
	namespace := "docker-secrets"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	badDockerCreds := []credential{
		credential{
			Name:           "noDockerServer",
			Type:           "dockerregistry",
			DockerUsername: "name",
			DockerPassword: "pass",
		},
		credential{
			Name:           "noDockerUsername",
			Type:           "dockerregistry",
			DockerServer:   "server",
			DockerPassword: "pass",
		},
		credential{
			Name:           "noDockerPassword",
			Type:           "dockerregistry",
			DockerUsername: "name2",
			DockerPassword: "pass",
		},
	}
	expectedError := fmt.Sprintf("Error: DockerServer, Username and Password must be supplied for Type %s", typeDockerRegistry)
	for _, invalidCred := range badDockerCreds {
		createCredentialTest(namespace, invalidCred, expectedError, r, t)
		updateCredentialTest(namespace, invalidCred, expectedError, r, t)
	}
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)
}

func TestCreateCredentialsWithBadUrls(t *testing.T) {
	r := dummyResource()
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	credsWithBadUrls := []credential{
		credential{
			Name:     "userpass",
			Type:     "userpass",
			Username: "user",
			Password: "pass",
			URL: map[string]string{
				"tekton.dev/gitaa-0": "https://github.com",
			},
		},
		credential{
			Name:           "docker",
			Type:           "dockerregistry",
			DockerServer:   "my.docker.reg",
			DockerUsername: "myName",
			DockerPassword: "pass",
			URL: map[string]string{
				"tekton/docker-0": "https://my.docker.registry.com",
			},
		},
	}
	expectedError := fmt.Sprintf("Error: URL key must start with \"tekton.dev/docker-\" or \"tekton.dev/git-\" invalid URL:")
	for _, invalidCred := range credsWithBadUrls {
		createCredentialTest(namespace, invalidCred, expectedError, r, t)
		updateCredentialTest(namespace, invalidCred, expectedError, r, t)
	}
	// Verify no credentials have been created
	readAllCredentialsTest(namespace, []credential{}, "", r, t)
}

// READ, UPDATE, and DELETE credentials that do not exist
func TestCredentialsRUDThatDoNotExist(t *testing.T) {
	r := dummyResource()
	namespace := "tekton-pipelines"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	bogusNamespace := "bogusnamespace"
	expectedError := fmt.Sprintf("Namespace provided does not exist: '%s'.", bogusNamespace)
	cred := credential{
		Name:        "credentialaccesstoken",
		Type:        "accesstoken",
		AccessToken: "personal-access-token",
		Description: "access token credential",
		URL: map[string]string{
			"tekton.dev/git-0": "https://github.com",
		},
	}
	createCredentialTest(bogusNamespace, cred, expectedError, r, t)
	readAllCredentialsTest(bogusNamespace, []credential{cred}, expectedError, r, t)
	readCredentialTest(bogusNamespace, cred, expectedError, r, t)
	updateCredentialTest(bogusNamespace, cred, expectedError, r, t)
	deleteCredentialTest(bogusNamespace, cred.Name, expectedError, r, t)
}

/*
 * CREATE credential test
 * To function properly, [cred] must have the following fields:
 *  - Type (must have the value 'accesstoken' 'userpass' or 'dockerregistry)
 *  - Name
 * If type == userpass
 *  - Username
 *  - Password
 * Else if type = accesstoken
 *  - AccessToken
 * else if type == dockerregistry
 *  - DockerServer
 *  - DockerUsername
 *  - DockerPassword
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

	// Verify against K8s client
	testCredential(r.getK8sCredential(namespace, cred.Name), cred, t)
}

/*
 * READ ALL credentials test
 * To function properly, [expectCreds] must have the same number of credentials as there are in the system
 * and they must be in the correct order (alphabetical by Name field)
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
 * To function properly, [expectCred] must have the "Name" field
 */
func readCredentialTest(namespace string, expectCred credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("READ credential %s", expectCred.Name)
	// Create dummy rest api request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+expectCred.Name, nil)
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["name"] = expectCred.Name
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
	testCredential(r.getK8sCredential(namespace, expectCred.Name), expectCred, t)
}

/*
 * UPDATE credential test
 * To function properly, [cred] must have the following fields:
 *  - Name
 *  - Username
 *  - Password
 *  - Type (must have the value 'accesstoken' or 'userpass')
 */
func updateCredentialTest(namespace string, cred credential, expectError string, r *Resource, t *testing.T) {
	t.Logf("UPDATE credential %+v", cred)
	// Create dummy rest api request and response
	jsonBody, _ := json.Marshal(cred)
	httpReq := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+cred.Name, bytes.NewBuffer(jsonBody))
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["name"] = cred.Name
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
	testCredential(r.getK8sCredential(namespace, cred.Name), cred, t)
}

/*
 * DELETE credential test
 */
func deleteCredentialTest(namespace string, credName string, expectError string, r *Resource, t *testing.T) {
	t.Logf("DELETE credential %s", credName)
	// Create dummy rest api request and response
	httpReq := dummyHTTPRequest("DELETE", "http://wwww.dummy.com:8383/v1/namespaces/"+namespace+"/credentials/"+credName, nil)
	req := dummyRestfulRequest(httpReq, namespace, "")
	params := req.PathParameters()
	params["name"] = credName
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
	testCredential(r.getK8sCredential(namespace, credName), credential{}, t)
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
		t.Fatalf("FAIL: ERROR - reading response body: %s", err.Error())
		return false
	}
	err = json.Unmarshal(b, result)
	if err != nil {
		resultError := string(b)
		if !strings.HasPrefix(resultError, expectError) {
			t.Fatalf("FAIL: ERROR - Error message == '%s', want '%s', body: %s", resultError, expectError, body)
		}
		return false
	}
	if expectError != "" {
		t.Fatalf("FAIL: ERROR - Result == %+v, want error message '%s'", result, expectError)
	}
	return true
}

// Compares two lists of credentials
func testCredentials(result []credential, expectResult []credential, t *testing.T) {
	if len(result) != len(expectResult) {
		t.Fatalf("ERROR: Result == %+v, want %+v, different number of credentials", len(result), len(expectResult))
	}
	for i := range expectResult {
		testCredential(result[i], expectResult[i], t)
	}
}

// Compare two credentials
func testCredential(resultCred credential, expectCred credential, t *testing.T) {
	t.Logf("Result cred: %+v\n", resultCred)
	t.Logf("Expect cred: %+v\n", expectCred)
	if !reflect.DeepEqual(resultCred, expectCred) {
		t.Fatal("Credentials not equal")
	}
}

// Get all K8s client secrets with selector LABEL_SELECTOR
func (r Resource) getK8sCredentials(namespace string) (credentials []credential) {
	secrets, err := r.K8sClient.CoreV1().Secrets(namespace).List(metav1.ListOptions{LabelSelector: dashboardLabelSelector})
	if err != nil {
		return
	}
	for _, secret := range secrets.Items {
		credentials = append(credentials, secretToCredential(&secret, false))
	}
	return credentials
}

// Get K8s client secret
func (r Resource) getK8sCredential(namespace string, name string) (credential credential) {
	secret, err := r.K8sClient.CoreV1().Secrets(namespace).Get(name, metav1.GetOptions{})
	if err != nil {
		return
	}
	return secretToCredential(secret, false)
}

// Get check service account secret
func (r Resource) checkSecretInSa(namespace string, nameSa string, nameSecret string, t *testing.T) bool {
	sa, err := r.K8sClient.CoreV1().ServiceAccounts(namespace).Get(nameSa, metav1.GetOptions{})
	if err != nil {
		t.Errorf("Couldn't read service account: %+v\n", err)
		return false
	}
	for _, secret := range sa.Secrets {
		if secret.Name == nameSecret {
			return true
		}
	}
	return false
}

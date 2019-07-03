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
package endpoints_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	. "github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/testutils"
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

// GET credentials + credentials/{name}
func TestGETCredentials(t *testing.T) {
	server, r, _ := testutils.DummyServer()
	defer server.Close()
	namespaces := []string{
		"ns1",
		"ns2",
	}
	for _, namespace := range namespaces {
		_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
		if err != nil {
			t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
		}
	}

	namespaceSecretMap := map[string][]corev1.Secret{
		namespaces[0]: []corev1.Secret{
			corev1.Secret{
				ObjectMeta: metav1.ObjectMeta{
					Name: "userPassSecret",
					Annotations: map[string]string{
						"tekton.dev/docker-0": "https://gcr.io",
					},
					Namespace: namespaces[0],
				},
				Data: map[string][]byte{
					"username":    []byte("fakeUsername"),
					"password":    []byte("fakePassword"),
					"description": []byte("userPass credential"),
				},
				Type: corev1.SecretTypeBasicAuth,
			},
			corev1.Secret{
				ObjectMeta: metav1.ObjectMeta{
					Name: "gitSecret",
					Annotations: map[string]string{
						"tekton.dev/git-0": "https://my.git.org",
					},
					Namespace: namespaces[0],
				},
				Data: map[string][]byte{
					"username":    []byte("fakeUsername"),
					"password":    []byte("fakePassword"),
					"description": []byte("userPass credential"),
				},
				Type: corev1.SecretTypeBasicAuth,
			},
		},
		namespaces[1]: []corev1.Secret{
			corev1.Secret{
				ObjectMeta: metav1.ObjectMeta{
					Name: "userPassSecret2",
					Annotations: map[string]string{
						"tekton.dev/docker-0": "https://gcr.io",
					},
					Namespace: namespaces[1],
				},
				Data: map[string][]byte{
					"username":    []byte("fakeUsername"),
					"password":    []byte("fakePassword"),
					"description": []byte("userPass credential"),
				},
				Type: corev1.SecretTypeBasicAuth,
			},
		},
	}
	allCredentials := []Credential{}
	for _, secretList := range namespaceSecretMap {
		for _, secret := range secretList {
			cred := SecretToCredential(&secret, true)
			allCredentials = append(allCredentials, cred)
		}
	}

	// Test getAllCredentials: no credentials
	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/credentials", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllCredentials response error: %v\n", err)
	}
	responseCredentialsList := []Credential{}
	if err := json.NewDecoder(response.Body).Decode(&responseCredentialsList); err != nil {
		t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
	}
	if len(responseCredentialsList) != 0 {
		t.Fatal("No credentials expected")
	}
	// Create secrets/credentials
	for _, namespacedSecrets := range namespaceSecretMap {
		for _, secret := range namespacedSecrets {
			_, err := r.K8sClient.CoreV1().Secrets(secret.Namespace).Create(&secret)
			if err != nil {
				t.Fatalf("Error creating secret '%s': %v\n", secret.Name, err)
			}
		}
	}
	// Test getAllCredentials: all namespaces
	httpReq = testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/credentials", server.URL), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllCredentials response error: %v\n", err)
	}
	responseCredentialsList = []Credential{}
	if err := json.NewDecoder(response.Body).Decode(&responseCredentialsList); err != nil {
		t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
	}
	if err := testutils.ObjectListDeepEqual(allCredentials, responseCredentialsList); err != nil {
		t.Fatalf(err.Error())
	}

	// Test getAllCredentials: each namespace
	for namespace, namespacedSecrets := range namespaceSecretMap {
		httpReq = testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/credentials", server.URL, namespace), nil)
		response, err = http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("getAllCredentials response error: %v\n", err)
		}
		responseCredentialsList = []Credential{}
		if err := json.NewDecoder(response.Body).Decode(&responseCredentialsList); err != nil {
			t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
		}
		if len(responseCredentialsList) != len(namespacedSecrets) {
			t.Fatalf("All %s namespace credentials were not returned: expected %v, actual %v", namespace, len(namespacedSecrets), len(responseCredentialsList))
		}
	}

	// Test getCredential
	for _, namespacedSecrets := range namespaceSecretMap {
		for _, secret := range namespacedSecrets {
			httpReq = testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/credentials/%s", server.URL, secret.Namespace, secret.Name), nil)
			response, err = http.DefaultClient.Do(httpReq)
			if err != nil {
				t.Fatalf("Error getting credential '%s': %v\n", secret.Name, err)
			}
			responseCredential := Credential{}
			if err := json.NewDecoder(response.Body).Decode(&responseCredential); err != nil {
				t.Fatalf("Error decoding getCredential response: %v\n", err)
			}
			expectedCredential := SecretToCredential(&secret, true)
			if !reflect.DeepEqual(responseCredential, expectedCredential) {
				t.Fatalf("Response object %v did not equal expected %v\n", responseCredential, expectedCredential)
			}
		}
	}

}

// POST credentials
func TestPOSTCredentials(t *testing.T) {
	server, r, _ := testutils.DummyServer()
	defer server.Close()
	namespaces := []string{
		"ns1",
		"ns2",
	}
	for _, namespace := range namespaces {
		_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
		if err != nil {
			t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
		}
	}

	credentials := []Credential{
		Credential{
			Name:        "credentialuserpass",
			Username:    "usernameuserpass",
			Password:    "passworduserpass",
			Description: "user password credential",
			URL: map[string]string{
				"tekton.dev/docker-0": "https://gcr.io",
			},
			ServiceAccount: "default",
			Namespace:      namespaces[0],
		},
		Credential{
			Name:        "gitcreds",
			Username:    "gitusername",
			Password:    "gitpassword",
			Description: "second user password credential",
			URL: map[string]string{
				"tekton.dev/git-0": "https://my.git.org",
			},
			ServiceAccount: "default",
			Namespace:      namespaces[0],
		},
		Credential{
			Name:        "credentialuserpassns2",
			Username:    "usernameuserpass",
			Password:    "passworduserpass",
			Description: "user password credential",
			URL: map[string]string{
				"tekton.dev/docker-0": "https://gcr.io",
			},
			ServiceAccount: "default",
			Namespace:      namespaces[1],
		},
	}

	for _, credential := range credentials {
		postAndCheckCredential(server, credential, r, t)
	}
}

// PUT credentials
func TestPUTCredentials(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	credentials := []Credential{
		Credential{
			Name:        "credentialuserpass",
			Username:    "usernameuserpass",
			Password:    "passworduserpass",
			Description: "user password credential",
			URL: map[string]string{
				"tekton.dev/docker-0": "https://gcr.io",
			},
			ServiceAccount: "default",
			Namespace:      namespace,
		},
	}

	for _, credential := range credentials {
		// Create credential
		postAndCheckCredential(server, credential, r, t)
		// Update credential
		credential.Username = "newUsername"
		credential.Password = "newPassword"
		credential.Description = "newDescription"
		jsonMarshalledBytes, err := json.Marshal(&credential)
		if err != nil {
			t.Fatalf("Error marshalling credential %s: %v\n", credential.Name, err)
		}
		httpRequestBody := bytes.NewReader(jsonMarshalledBytes)
		httpReq := testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/credentials/%s", server.URL, credential.Namespace, credential.Name), httpRequestBody)
		_, err = http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("updateCredential response error: %v\n", err)
		}
		secret, err := r.K8sClient.CoreV1().Secrets(credential.Namespace).Get(credential.Name, metav1.GetOptions{})
		if err != nil {
			t.Fatal(err)
		}
		if !secretCredentialEqual(secret, credential) {
			t.Fatalf("Secret does not match credential %s\n", credential.Name)
		}
	}
}

// DELETE credentials
func TestDELETECredentials(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	credentials := []Credential{
		Credential{
			Name:        "credentialuserpass",
			Username:    "usernameuserpass",
			Password:    "passworduserpass",
			Description: "user password credential",
			URL: map[string]string{
				"tekton.dev/docker-0": "https://gcr.io",
			},
			ServiceAccount: "default",
			Namespace:      namespace,
		},
	}

	for _, credential := range credentials {
		// Create credential
		postAndCheckCredential(server, credential, r, t)
		// Delete credential
		httpReq := testutils.DummyHTTPRequest("DELETE", fmt.Sprintf("%s/v1/namespaces/%s/credentials/%s", server.URL, credential.Namespace, credential.Name), nil)
		_, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatal(err)
		}
		_, err = r.K8sClient.CoreV1().Secrets(credential.Namespace).Get(credential.Name, metav1.GetOptions{})
		if err == nil {
			t.Fatalf("Secret %s should be deleted", credential.Name)
		}
	}
}

func postAndCheckCredential(server *httptest.Server, credential Credential, r *Resource, t *testing.T) {
	jsonMarshalledBytes, err := json.Marshal(&credential)
	if err != nil {
		t.Fatalf("Error marshalling credential %s: %v\n", credential.Name, err)
	}
	httpRequestBody := bytes.NewReader(jsonMarshalledBytes)
	httpReq := testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/credentials", server.URL, credential.Namespace), httpRequestBody)
	_, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("createCredential response error: %v\n", err)
	}
	secret, err := r.K8sClient.CoreV1().Secrets(credential.Namespace).Get(credential.Name, metav1.GetOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if !secretCredentialEqual(secret, credential) {
		t.Fatalf("Secret does not match credential %s\n", credential.Name)
	}
}
func secretCredentialEqual(secret *corev1.Secret, credential Credential) bool {
	newCredential := SecretToCredential(secret, false)
	fmt.Println("secretCred:", newCredential)
	fmt.Println("expected:", credential)
	return reflect.DeepEqual(newCredential, credential)
}

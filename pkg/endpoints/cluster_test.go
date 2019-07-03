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
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/tektoncd/dashboard/pkg/testutils"
	corev1 "k8s.io/api/core/v1"
	extensionsV1beta1 "k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GET namespaces
func TestGETAllNamespaces(t *testing.T) {
	server, _, namespace := testutils.DummyServer()

	namespaces := []corev1.Namespace{
		// This namespace was created in DummyServer
		corev1.Namespace{
			ObjectMeta: metav1.ObjectMeta{
				Name: namespace,
			},
		},
	}

	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces", server.URL), nil)
	response, _ := http.DefaultClient.Do(httpReq)
	responseNamespaceList := corev1.NamespaceList{}
	if err := json.NewDecoder(response.Body).Decode(&responseNamespaceList); err != nil {
		t.Fatalf("Error decoding getAllNamespaces response: %v\n", err)
	} else {
		if err := testutils.ObjectListDeepEqual(namespaces, responseNamespaceList.Items); err != nil {
			t.Fatalf(err.Error())
		}
	}
}

// GET serviceaccounts
func TestGETAllServiceAccounts(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	serviceAccounts := []corev1.ServiceAccount{
		corev1.ServiceAccount{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "test-sa",
				Namespace: namespace,
			},
		},
	}
	for _, serviceAccount := range serviceAccounts {
		_, err := r.K8sClient.CoreV1().ServiceAccounts(namespace).Create(&serviceAccount)
		if err != nil {
			t.Fatalf("Error creating serviceAccount '%s': %v\n", serviceAccount.Name, err)
		}
	}

	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/serviceaccounts", server.URL, namespace), nil)
	response, _ := http.DefaultClient.Do(httpReq)
	responseServiceAccountList := corev1.ServiceAccountList{}
	if err := json.NewDecoder(response.Body).Decode(&responseServiceAccountList); err != nil {
		t.Fatalf("Error decoding getAllServiceAccounts response: %v\n", err)
	} else {
		if err := testutils.ObjectListDeepEqual(serviceAccounts, responseServiceAccountList.Items); err != nil {
			t.Fatalf(err.Error())
		}
	}

}

func TestGetIngress(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	hostName := "dashboard-host"
	ingress := &extensionsV1beta1.Ingress{ObjectMeta: metav1.ObjectMeta{Name: "tekton-dashboard"}}
	myRule := &extensionsV1beta1.IngressRule{}
	myRule.Host = hostName

	myRuleAsArray := make([]extensionsV1beta1.IngressRule, 1)
	myRuleAsArray[0] = *myRule
	ingress.Spec.Rules = myRuleAsArray

	_, err := r.K8sClient.ExtensionsV1beta1().Ingresses(namespace).Create(ingress)
	if err != nil {
		t.Fatalf("Error creating ingress '%s': %v\n", ingress.Name, err)
	}

	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/ingress", server.URL, namespace), nil)
	response, _ := http.DefaultClient.Do(httpReq)
	responseIngressHost := ""
	if err := json.NewDecoder(response.Body).Decode(&responseIngressHost); err != nil {
		t.Fatalf("Error decoding getIngress response: %v\n", err)
	}
	if responseIngressHost != hostName {
		t.Errorf("Response for getting the Ingress host was %s, should have been %s", responseIngressHost, hostName)
	}

}

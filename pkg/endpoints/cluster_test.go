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
	"net/http/httptest"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetAllNamespaces(t *testing.T) {

	r := dummyResource()

	namespace := "test-namespace"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/", nil)
	req := dummyRestfulRequest(httpReq, "", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllNamespaces(req, resp)

	result := corev1.NamespaceList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 1 {
		t.Errorf("Number of namespaces: expected: %d, returned: %d", 1, len(result.Items))
	}
	if result.Items[0].Name != namespace {
		t.Errorf("%s is not returned: %s, %s", namespace, result.Items[0].Name, result.Items[1].Name)
	}
}

func TestGetAllServiceAccounts(t *testing.T) {

	r := dummyResource()

	namespace := "test-namespace"
	r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	serviceAccount := "test-sa"
	r.K8sClient.CoreV1().ServiceAccounts(namespace).Create(&corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: serviceAccount}})

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/test-namespace/serviceaccount", nil)
	req := dummyRestfulRequest(httpReq, "", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllServiceAccounts(req, resp)

	result := corev1.ServiceAccountList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 1 {
		t.Errorf("Number of service accounts: expected: %d, returned: %d", 1, len(result.Items))
	}
	if result.Items[0].Name != serviceAccount {
		t.Errorf("%s is not returned: %s, %s", serviceAccount, result.Items[0].Name, result.Items[1].Name)
	}
}

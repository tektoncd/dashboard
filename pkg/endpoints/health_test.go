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
	"fmt"
	"github.com/tektoncd/dashboard/pkg/testutils"
	"net/http"
	"testing"
)

// GET health + readiness
func TestGETHealthEndpoint(t *testing.T) {
	server, _, _ := testutils.DummyServer()
	defer server.Close()
	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/health", server.URL), nil)
	response, _ := http.DefaultClient.Do(httpReq)
	expectedStatus := http.StatusOK
	if response.StatusCode != expectedStatus {
		t.Fatalf("Health check failed: expected statusCode %d, actual %d", expectedStatus, response.StatusCode)
	}
}

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
	"net/http/httptest"
	"testing"
)

// Check our health endpoint returns 204 when all is well
func TestHealthEndpointPresent(t *testing.T) {
	r := dummyResource()
	httpWriter := httptest.NewRecorder()
	bodyRequest := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/health", nil)
	bodyRestful := dummyRestfulRequest(bodyRequest, "ns1", "")
	resp := dummyRestfulResponse(httpWriter)
	r.checkHealth(bodyRestful, resp)
	if resp.StatusCode() != 204 {
		t.Errorf("FAIL: should have been recognised as a 204 when we're up and running, got %d", resp.StatusCode())
	}
}

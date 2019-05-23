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
	"io"
	"net/http"
	"net/http/httptest"

	restful "github.com/emicklei/go-restful"

	fakeclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned/fake"
	fakek8sclientset "k8s.io/client-go/kubernetes/fake"
)

func dummyK8sClientset() *fakek8sclientset.Clientset {
	result := fakek8sclientset.NewSimpleClientset()
	return result
}

func dummyClientset() *fakeclientset.Clientset {
	result := fakeclientset.NewSimpleClientset()
	return result
}

func dummyResource() *Resource {
	resource := Resource{
		PipelineClient: dummyClientset(),
		K8sClient:      dummyK8sClientset(),
	}
	return &resource
}

func dummyHTTPRequest(method string, url string, body io.Reader) *http.Request {
	httpReq, _ := http.NewRequest(method, url, body)
	httpReq.Header.Set("Content-Type", "application/json")
	return httpReq
}

// This should be used over dummyRestfulRequest/Response
// Use alongside DummyHTTPRequest
func dummyServer() (*httptest.Server, *Resource) {
	wsContainer := restful.NewContainer()
	resource := dummyResource()
	resource.RegisterWeb(wsContainer)
	resource.RegisterEndpoints(wsContainer)
	resource.RegisterWebsocket(wsContainer)
	resource.RegisterHealthProbes(wsContainer)
	resource.RegisterReadinessProbes(wsContainer)
	server := httptest.NewServer(wsContainer)
	return server, resource
}

// Deprecate these
func dummyRestfulResponse(httpWriter http.ResponseWriter) *restful.Response {
	result := restful.NewResponse(httpWriter)
	result.SetRequestAccepts(restful.MIME_JSON)
	return result
}

func dummyRestfulRequest(httpReq *http.Request, namespace string, name string) *restful.Request {
	restfulReq := restful.NewRequest(httpReq)
	params := restfulReq.PathParameters()
	if namespace != "" {
		params["namespace"] = namespace
	}
	if name != "" {
		params["name"] = name
	}
	return restfulReq
}

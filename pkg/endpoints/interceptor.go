package endpoints

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/tektoncd/dashboard/pkg/utils"
	"io"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"net/http"
	"net/url"
	"regexp"
)

var (
	// singleItem regex pattern to match URL apis to query single item
	// single: /api/v1/namespaces/tekton/configmaps/name
	// list: /api/v1/namespaces/tekton/configmaps
	// list: /api/v1/configmaps
	singleItem = regexp.MustCompile("^/.*(?i)secrets/.+|(?i)configmaps/.+|(?i)persistentvolumeclaims/.+$")

	// sensitiveApiPattern sensitive APIs
	// Secrets: https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/secret-v1/
	// ConfigMaps: https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/config-map-v1/
	// PVC: https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/persistent-volume-claim-v1/
	//
	// Each API has 3 patterns, like below:
	// single: /api/v1/namespaces/tekton/secrets/name
	// list: /api/v1/namespaces/tekton/secrets
	// list: /api/v1/secrets
	sensitiveApiPattern = regexp.MustCompile("^/.*(?i)secret|(?i)configmap|(?i)persistentvolumeclaim.*$")
)

// NewK8sInterceptor create new interceptor for k8s responses
func NewK8sInterceptor(rt http.RoundTripper, url *url.URL) K8sInterceptor {
	if rt == nil {
		panic("roundTripper should not be nil")
	}
	if url == nil {
		panic("url should not be nil")
	}
	return K8sInterceptor{roundTripper: rt, proxyUrl: url}
}

// K8sItemsList regular K8s List without sensitive fields
type K8sItemsList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []K8sItem `json:"items"`
}

// K8sItem typical K8s Single Item without sensitive fields
type K8sItem struct {
	metav1.TypeMeta `json:",inline"`
	K8sObjectMeta   `json:"metadata,omitempty"`
}

// K8sObjectMeta is analog of K8s metav1.ObjectMeta containing minimum fields
type K8sObjectMeta struct {
	Name            string            `json:"name,omitempty"`
	Namespace       string            `json:"namespace,omitempty"`
	Labels          map[string]string `json:"labels,omitempty"`
	ResourceVersion string            `json:"resourceVersion,omitempty"`
}

// isSensitive returns true if api is considered sensitive
func isSensitive(url *url.URL) bool {
	return sensitiveApiPattern.MatchString(url.Path)
}

// K8sInterceptor interceptor for K8s responses
type K8sInterceptor struct {
	// roundTripper default roundTripper
	roundTripper http.RoundTripper
	// proxyUrl where the proxy is, e.g. https://localhost:6443/
	proxyUrl *url.URL
}

// RoundTrip on top of regular roundTrip to mutate response
func (k K8sInterceptor) RoundTrip(r *http.Request) (*http.Response, error) {
	originalResp, err := k.roundTripper.RoundTrip(r)
	if err != nil {
		return nil, err
	}

	if isSensitive(r.URL) {
		modifiedResp := k.handleResponse(r, originalResp)
		return modifiedResp, nil
	}

	return originalResp, nil
}

func (k K8sInterceptor) handleResponse(request *http.Request, response *http.Response) *http.Response {
	proxyFullUrl, err := k.proxyUrl.Parse(request.URL.String())
	if err != nil {
		return utils.ResponseError(response, err, http.StatusNotFound)
	}

	return handleResponse(response, proxyFullUrl)
}

func handleResponse(response *http.Response, url *url.URL) *http.Response {
	if response.StatusCode >= 400 {
		return handleErrorResponse(response)
	}

	if singleItem.MatchString(url.Path) {
		return handleItem(response)
	} else {
		return handleItemsList(response)
	}
}

func handleErrorResponse(resp *http.Response) *http.Response {
	status := &metav1.Status{}
	return handle(resp, status)
}

func handleItemsList(resp *http.Response) *http.Response {
	list := &K8sItemsList{}
	return handle(resp, list)
}

func handleItem(resp *http.Response) *http.Response {
	oneItem := &K8sItem{}
	return handle(resp, oneItem)
}

func handle(resp *http.Response, in interface{}) *http.Response {
	err := json.NewDecoder(resp.Body).Decode(in)
	if err != nil {
		return utils.ResponseError(resp, err, 500)
	}

	marshal, err := json.Marshal(in)
	if err != nil {
		return utils.ResponseError(resp, err, 500)
	}
	respBodyLen := len(marshal)
	resp.Body = io.NopCloser(bytes.NewReader(marshal))
	resp.ContentLength = int64(respBodyLen)
	resp.Header.Set("Content-Length", fmt.Sprintf("%d", respBodyLen))
	return resp
}

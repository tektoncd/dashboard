/*
Copyright 2019-2026 The Tekton Authors
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
	"net/http"
	"net/url"
	"os"
	"sync"

	"github.com/tektoncd/dashboard/pkg/utils"
)

// serviceAccountTokenPath is the standard projected path for an in-cluster
// ServiceAccount token. Read fresh on every request so a rotated/refreshed
// token (kubelet refreshes this periodically) is always picked up.
const serviceAccountTokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token"

// bearerTokenTransport injects a freshly-read ServiceAccount bearer token
// into every proxied request. Tekton Results' API server is not reachable
// through the generic Kubernetes API proxy (it isn't registered as an
// aggregated APIService), so it needs its own auth handling here, mirroring
// how AUTH_MODE=token on the Results API expects a bearer token it can run
// through TokenReview/SubjectAccessReview.
type bearerTokenTransport struct {
	base http.RoundTripper
}

func (t *bearerTokenTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	token, err := os.ReadFile(serviceAccountTokenPath)
	if err != nil {
		return nil, err
	}
	req = req.Clone(req.Context())
	req.Header.Set("Authorization", "Bearer "+string(token))
	return t.base.RoundTrip(req)
}

var (
	resultsClientOnce sync.Once
	resultsClient     *http.Client
)

// getResultsClient returns a client that authenticates as the Dashboard's
// own ServiceAccount. Like LogsProxy's use of http.DefaultClient for
// --external-logs, this expects the Results API to present a certificate
// trusted by the system cert pool -- operators wanting --results-api enabled
// are expected to give Results a trusted cert, the same expectation already
// in place for --external-logs.
func getResultsClient() *http.Client {
	resultsClientOnce.Do(func() {
		resultsClient = &http.Client{
			Transport: &bearerTokenTransport{
				base: &http.Transport{},
			},
		}
	})
	return resultsClient
}

// ResultsProxy forwards requests under /apis/results.tekton.dev/ to the
// configured Tekton Results API server, attaching this Dashboard's own
// ServiceAccount token for auth. The incoming request path is forwarded
// as-is, since it already matches the Results REST API's own path shape.
func (r Resource) ResultsProxy(response http.ResponseWriter, request *http.Request) {
	parsedURL, err := url.Parse(request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	target := r.Options.ResultsAPIURL + request.URL.Path
	if parsedURL.RawQuery != "" {
		target += "?" + parsedURL.RawQuery
	}

	if statusCode, err := utils.Proxy(request, response, target, getResultsClient()); err != nil {
		utils.RespondError(response, err, statusCode)
	}
}

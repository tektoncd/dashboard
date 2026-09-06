/*
Copyright 2020-2026 The Tekton Authors
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

package utils

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"

	logging "github.com/tektoncd/dashboard/pkg/logging"
)

// isAllowedProxyTarget rejects URLs that are not plain http(s) URLs or that resolve
// to loopback/link-local addresses (e.g. cloud metadata endpoints such as 169.254.169.254),
// mitigating server-side request forgery via a manipulated proxy target.
func isAllowedProxyTarget(rawURL string) bool {
	parsed, err := url.Parse(rawURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" {
		return false
	}

	ips, err := net.LookupIP(parsed.Hostname())
	if err != nil {
		return false
	}
	for _, ip := range ips {
		if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
			return false
		}
	}
	return true
}

// Proxy forwards requests to an upstream provider and proxies the response content and headers back to the caller
func Proxy(request *http.Request, response http.ResponseWriter, url string, client *http.Client) (int, error) {
	if !isAllowedProxyTarget(url) {
		err := fmt.Errorf("refusing to proxy request to disallowed URL")
		logging.Log.Errorf("%s: %s", err, url)
		return http.StatusBadRequest, err
	}

	req, err := http.NewRequestWithContext(context.TODO(), request.Method, url, request.Body)

	if err != nil {
		logging.Log.Errorf("Failed to create request: %s", err)
		return http.StatusInternalServerError, err
	}

	req = req.WithContext(request.Context())

	if request.Method == http.MethodPost || request.Method == http.MethodPatch || request.Method == http.MethodPut || request.Method == http.MethodDelete {
		req.Header.Set("Content-Type", request.Header.Get("Content-Type"))
	}

	resp, err := client.Do(req)
	defer func() {
		if resp != nil && resp.Body != nil {
			resp.Body.Close()
		}
	}()

	if err != nil {
		logging.Log.Errorf("Failed to execute request: %s", err)
		if resp != nil {
			return resp.StatusCode, err
		}
		// Return a generic status code if resp is nil
		return http.StatusInternalServerError, err
	}

	for name, values := range resp.Header {
		for _, value := range values {
			response.Header().Add(name, value)
		}
	}
	response.WriteHeader(resp.StatusCode)
	contentLength := resp.Header.Get("Content-Length")
	if contentLength == "" {
		if _, err := io.Copy(MakeFlushWriter(response), resp.Body); err != nil {
			logging.Log.Error("Failed copying response")
		}
	} else {
		if _, err := io.Copy(response, resp.Body); err != nil {
			logging.Log.Error("Failed copying response")
		}
	}

	return resp.StatusCode, nil
}

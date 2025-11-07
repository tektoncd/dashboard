/*
Copyright 2019-2024 The Tekton Authors
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

package router

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/tektoncd/dashboard/pkg/csrf"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	utilnet "k8s.io/apimachinery/pkg/util/net"
	"k8s.io/apimachinery/pkg/util/proxy"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/transport"
)

const webResourcesDir = "/var/run/ko"

var webResourcesStaticPattern = regexp.MustCompile(`^/([[:alnum:]]+\.)?[[:alnum:]]+\.(js)|(css)|(png)$`)
var webResourcesStaticExcludePattern = regexp.MustCompile("^/favicon.png$")

func registerWeb(resource endpoints.Resource, mux *http.ServeMux) {
	logging.Log.Info("Adding Web API")

	fs := http.FileServer(http.Dir(webResourcesDir))
	mux.HandleFunc("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if webResourcesStaticPattern.Match([]byte(r.URL.Path)) && !webResourcesStaticExcludePattern.Match([]byte(r.URL.Path)) {
			// Static resources are immutable and have a content hash in their URL
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}

		w.Header().Set("Content-Security-Policy", "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: ws:; font-src 'self' https://1.www.s81c.com;")

		switch resource.Options.XFrameOptions {
		case "": // Do nothing, no X-Frame-Options header
		case "SAMEORIGIN":
			w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		default:
			w.Header().Set("X-Frame-Options", "DENY")
		}
		fs.ServeHTTP(w, r)
	}))
}

// registerHealthProbe registers the /health endpoint
func registerHealthProbe(r endpoints.Resource, mux *http.ServeMux) {
	logging.Log.Info("Adding API for health")
	mux.HandleFunc("/health", r.CheckHealth)
}

// registerReadinessProbe registers the /readiness endpoint
func registerReadinessProbe(r endpoints.Resource, mux *http.ServeMux) {
	logging.Log.Info("Adding API for readiness")
	mux.HandleFunc("/readiness", r.CheckHealth)
}

// registerPropertiesEndpoint adds the endpoint for obtaining any properties we
// want to serve.
func registerPropertiesEndpoint(r endpoints.Resource, mux *http.ServeMux) {
	logging.Log.Info("Adding API for properties")
	mux.HandleFunc("/v1/properties", r.GetProperties)
}

func registerLogsProxy(r endpoints.Resource, mux *http.ServeMux) {
	if r.Options.ExternalLogsURL != "" {
		logging.Log.Info("Adding API for logs proxy")
		mux.HandleFunc("/v1/logs-proxy/", r.LogsProxy)
	}
}

// registerBadgeEndpoint adds the endpoint for generating pipeline status badges
func registerBadgeEndpoint(r endpoints.Resource, mux *http.ServeMux) {
	logging.Log.Info("Adding API for badges")
	mux.HandleFunc("/v1/badges/", r.GetPipelineBadge)
}

// Server is a http.Handler which proxies Kubernetes APIs to the API server.
type Server struct {
	handler http.Handler
}

type responder struct{}

func (r *responder) Error(w http.ResponseWriter, _ *http.Request, err error) {
	logging.Log.Errorf("Error while proxying request: %v", err)
	http.Error(w, err.Error(), http.StatusInternalServerError)
}

func makeUpgradeTransport(config *rest.Config, keepalive time.Duration) (proxy.UpgradeRequestRoundTripper, error) {
	transportConfig, err := config.TransportConfig()
	if err != nil {
		return nil, err
	}
	tlsConfig, err := transport.TLSConfigFor(transportConfig)
	if err != nil {
		return nil, err
	}
	rt := utilnet.SetOldTransportDefaults(&http.Transport{
		TLSClientConfig: tlsConfig,
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: keepalive,
		}).DialContext,
	})

	upgrader, err := transport.HTTPWrappersForConfig(transportConfig, proxy.MirrorRequest)
	if err != nil {
		return nil, err
	}
	return proxy.NewUpgradeRequestRoundTripper(rt, upgrader), nil
}

// Register returns a HTTP handler with the Dashboard and Kubernetes APIs registered
func Register(r endpoints.Resource, cfg *rest.Config) (*Server, error) {
	logging.Log.Info("Adding Kube API")
	apiProxyPrefix := "/api/"
	apisProxyPrefix := "/apis/"
	proxyHandler, err := NewProxyHandler(cfg, 30*time.Second)
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.Handle(apiProxyPrefix, proxyHandler)
	mux.Handle(apisProxyPrefix, proxyHandler)

	logging.Log.Info("Adding Dashboard APIs")
	registerWeb(r, mux)
	registerPropertiesEndpoint(r, mux)
	registerHealthProbe(r, mux)
	registerReadinessProbe(r, mux)
	registerLogsProxy(r, mux)
	registerBadgeEndpoint(r, mux)

	return &Server{handler: mux}, nil
}

// NewProxyHandler creates an API proxy handler for the cluster
func NewProxyHandler(cfg *rest.Config, keepalive time.Duration) (http.Handler, error) {
	host := cfg.Host
	if !strings.HasSuffix(host, "/") {
		host += "/"
	}
	target, err := url.Parse(host)
	if err != nil {
		return nil, err
	}

	responder := &responder{}
	transport, err := rest.TransportFor(cfg)
	if err != nil {
		return nil, err
	}
	upgradeTransport, err := makeUpgradeTransport(cfg, keepalive)
	if err != nil {
		return nil, err
	}
	proxy := proxy.NewUpgradeAwareHandler(target, transport, false, false, responder)
	proxy.UpgradeTransport = upgradeTransport
	proxy.UseRequestLocation = true
	proxy.UseLocationHost = true

	proxyServer := protectWebSocket(proxy)

	return proxyServer, nil
}

// Listen is a simple wrapper around net.Listen.
func (s *Server) Listen(address string, port int) (net.Listener, error) {
	return net.Listen("tcp", fmt.Sprintf("%s:%d", address, port))
}

// ServeOnListener starts the server using given listener, loops forever.
func (s *Server) ServeOnListener(l net.Listener) error {
	CSRF := csrf.Protect()

	server := http.Server{
		Handler:           CSRF(s.handler),
		ReadHeaderTimeout: 30 * time.Second,
	}
	return server.Serve(l)
}

// isUpgradeRequest returns true if the given request is a connection upgrade request
func isUpgradeRequest(req *http.Request) bool {
	connection := req.Header.Get("Connection")
	return strings.ToLower(connection) == "upgrade"
}

func checkUpgradeSameOrigin(req *http.Request) bool {
	host := req.Host
	origin := req.Header.Get("Origin")

	if len(origin) == 0 || !isUpgradeRequest(req) {
		return true
	}

	u, err := url.Parse(origin)
	if err != nil {
		return false
	}

	return u.Host == host
}

// Verify Origin header on Upgrade requests to prevent cross-origin websocket hijacking
func protectWebSocket(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		reqURL := req.URL.RequestURI()
		reqURL = strings.ReplaceAll(reqURL, "\n", "")
		reqURL = strings.ReplaceAll(reqURL, "\r", "")
		logging.Log.Debugf("Proxying request: %s %s %s", req.RemoteAddr, req.Method, reqURL)
		if !checkUpgradeSameOrigin(req) {
			origin := req.Header.Get("Origin")
			origin = strings.ReplaceAll(origin, "\n", "")
			origin = strings.ReplaceAll(origin, "\r", "")
			logging.Log.Warnf("websocket: Connection upgrade blocked, Host: %s, Origin: %s", req.Host, origin)
			http.Error(w, "websocket: request origin not allowed", http.StatusForbidden)
			return
		}

		h.ServeHTTP(w, req)
	})
}

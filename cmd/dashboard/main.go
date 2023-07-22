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

package main

import (
	"flag"
	"os"
	"strings"

	"github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	certutil "k8s.io/client-go/util/cert"
)

var (
	pipelinesNamespace = flag.String("pipelines-namespace", "", "Namespace where Tekton pipelines is installed (assumes same namespace as dashboard if not specified)")
	triggersNamespace  = flag.String("triggers-namespace", "", "Namespace where Tekton triggers is installed (assumes same namespace as dashboard if not specified)")
	portNumber         = flag.Int("port", 8080, "Dashboard port number")
	readOnly           = flag.Bool("read-only", true, "Enable or disable read-only mode")
	logoutURL          = flag.String("logout-url", "", "If set, enables logout on the frontend and binds the logout button to this URL")
	defaultNamespace   = flag.String("default-namespace", "", "If set, configures the default selected namespace to the provided namespace instead of 'All Namespaces'")
	tenantNamespaces   = flag.String("namespaces", "", "If set, limits the scope of resources displayed to this comma-separated list of namespaces only")
	logLevel           = flag.String("log-level", "info", "Minimum log level output by the logger")
	logFormat          = flag.String("log-format", "json", "Format for log output (json or console)")
	streamLogs         = flag.Bool("stream-logs", true, "Enable log streaming instead of polling")
	externalLogs       = flag.String("external-logs", "", "External logs provider URL")
	xFrameOptions      = flag.String("x-frame-options", "DENY", "Value for the X-Frame-Options response header, set '' to omit it")
	resultsApiAddr     = flag.String("results-api-addr", "tekton-results-api-service.tekton-pipelines.svc.cluster.local:8080", "Address of Results API server")
	enableResultsTLS   = flag.Bool("enable-results-tls", false, "Enable TLS verification when connecting to Results API server")
	resultsTLSCertPath = flag.String("results-tls-cert-path", "/etc/tls/tls.crt", "TLS certs to the Results API server.")
)

func main() {
	flag.Parse()
	installNamespace := os.Getenv("INSTALLED_NAMESPACE")
	logging.InitLogger(*logLevel, *logFormat)

	var cfg *rest.Config
	var err error
	if cfg, err = rest.InClusterConfig(); err != nil {
		logging.Log.Errorf("Error building kubeconfig: %s", err.Error())
	}

	k8sClient, err := k8sclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building k8s clientset: %s", err.Error())
	}

	// use FieldsFunc instead of Split as Split returns an array containing an empty string
	// instead of the desired empty array when there is no delimeter (i.e. empty string or single namespace)
	splitByComma := func(c rune) bool {
		return c == ','
	}
	tenants := strings.FieldsFunc(*tenantNamespaces, splitByComma)

	resultsCfg, err := resultsConfig(*enableResultsTLS, *resultsTLSCertPath)
	if err != nil {
		logging.Log.Errorf("Error building results config: %s", err.Error())
	}

	options := endpoints.Options{
		InstallNamespace:   installNamespace,
		PipelinesNamespace: *pipelinesNamespace,
		TriggersNamespace:  *triggersNamespace,
		TenantNamespaces:   tenants,
		DefaultNamespace:   *defaultNamespace,
		ReadOnly:           *readOnly,
		LogoutURL:          *logoutURL,
		StreamLogs:         *streamLogs,
		ExternalLogsURL:    *externalLogs,
		XFrameOptions:      *xFrameOptions,
	}

	resource := endpoints.Resource{
		Config:    cfg,
		K8sClient: k8sClient,
		Options:   options,
		ResultsConfig: resultsCfg,
	}

	server, err := router.Register(resource, cfg, resultsCfg)

	if err != nil {
		logging.Log.Errorf("Error creating proxy: %s", err.Error())
		return
	}

	l, err := server.Listen("", *portNumber)
	if err != nil {
		logging.Log.Errorf("Error listening: %s", err.Error())
		return
	}

	logging.Log.Infof("Tekton Dashboard version %s", resource.GetDashboardVersion())
	logging.Log.Infof("Starting to serve on %s", l.Addr().String())
	logging.Log.Fatal(server.ServeOnListener(l))
}

func resultsConfig(enableResultsTLS bool, resultsTLSCertPath string) (*rest.Config, error) {
	var cfg *rest.Config
	var err error

	if cfg, err = rest.InClusterConfig(); err != nil {
		logging.Log.Errorf("Error building kubeconfig: %s", err.Error())
		return nil, err
	}
	if enableResultsTLS {
		if _, err := certutil.NewPool(resultsTLSCertPath); err != nil {
			logging.Log.Errorf("Expected to load root CA config from %s, but got err: %v", resultsTLSCertPath, err)
		} else {
			cfg.TLSClientConfig.CAFile = resultsTLSCertPath
		}
	} else {
		cfg.TLSClientConfig.Insecure = true
		cfg.TLSClientConfig.CAFile = ""
	}
	cfg.Host = "https://" + *resultsApiAddr
	return cfg, nil
}

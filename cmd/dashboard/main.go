/*
Copyright 2019-2021 The Tekton Authors
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
	"fmt"
	"net/http"
	"os"
	"time"

	dashboardclientset "github.com/tektoncd/dashboard/pkg/client/clientset/versioned"
	"github.com/tektoncd/dashboard/pkg/controllers"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	"k8s.io/client-go/dynamic"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"knative.dev/pkg/signals"
)

var (
	help               = flag.Bool("help", false, "Prints defaults")
	pipelinesNamespace = flag.String("pipelines-namespace", "", "Namespace where Tekton pipelines is installed (assumes same namespace as dashboard if not specified)")
	triggersNamespace  = flag.String("triggers-namespace", "", "Namespace where Tekton triggers is installed (assumes same namespace as dashboard if not specified)")
	kubeConfigPath     = flag.String("kube-config", "", "Path to kube config file")
	portNumber         = flag.Int("port", 8080, "Dashboard port number")
	readOnly           = flag.Bool("read-only", false, "Enable or disable read only mode")
	logoutURL          = flag.String("logout-url", "", "If set, enables logout on the frontend and binds the logout button to this url")
	tenantNamespace    = flag.String("namespace", "", "If set, limits the scope of resources watched to this namespace only")
	logLevel           = flag.String("log-level", "info", "Minimum log level output by the logger")
	logFormat          = flag.String("log-format", "json", "Format for log output (json or console)")
	streamLogs         = flag.Bool("stream-logs", false, "Enable log streaming instead of polling")
	externalLogs       = flag.String("external-logs", "", "External logs provider url")
	xFrameOptions      = flag.String("x-frame-options", "DENY", "Value for the X-Frame-Options response header, set '' to omit it")
)

func main() {
	flag.Parse()

	installNamespace := os.Getenv("INSTALLED_NAMESPACE")

	if *help {
		fmt.Println("dashboard starts Tekton dashboard backend.")
		fmt.Println()
		fmt.Println("find more information at: https://github.com/tektoncd/dashboard")
		fmt.Println()
		fmt.Println("options:")
		fmt.Println()
		flag.PrintDefaults()
		return
	}

	logging.InitLogger(*logLevel, *logFormat)

	var cfg *rest.Config
	var err error
	if *kubeConfigPath != "" {
		cfg, err = clientcmd.BuildConfigFromFlags("", *kubeConfigPath)
		if err != nil {
			logging.Log.Errorf("Error building kubeconfig from %s: %s", *kubeConfigPath, err.Error())
		}
	} else {
		if cfg, err = rest.InClusterConfig(); err != nil {
			logging.Log.Errorf("Error building kubeconfig: %s", err.Error())
		}
	}

	dashboardClient, err := dashboardclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building dashboard clientset: %s", err.Error())
	}

	k8sClient, err := k8sclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building k8s clientset: %s", err.Error())
	}

	dynamicClient, err := dynamic.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building dynamic clientset: %s", err.Error())
	}

	transport, err := rest.TransportFor(cfg)
	if err != nil {
		logging.Log.Errorf("Error building rest transport: %s", err.Error())
	}

	options := endpoints.Options{
		InstallNamespace:   installNamespace,
		PipelinesNamespace: *pipelinesNamespace,
		TriggersNamespace:  *triggersNamespace,
		TenantNamespace:    *tenantNamespace,
		ReadOnly:           *readOnly,
		LogoutURL:          *logoutURL,
		StreamLogs:         *streamLogs,
		ExternalLogsURL:    *externalLogs,
		XFrameOptions:      *xFrameOptions,
	}

	resource := endpoints.Resource{
		Config:          cfg,
		HttpClient:      &http.Client{Transport: transport},
		DashboardClient: dashboardClient,
		DynamicClient:   dynamicClient,
		K8sClient:       k8sClient,
		Options:         options,
	}

	isTriggersInstalled := endpoints.IsTriggersInstalled(resource, *triggersNamespace)

	ctx := signals.NewContext()

	server, err := router.Register(resource, cfg)

	if err != nil {
		logging.Log.Errorf("Error creating proxy: %s", err.Error())
		return
	}

	logging.Log.Info("Creating controllers")
	resyncDur := time.Second * 30
	controllers.StartTektonControllers(resource.DynamicClient, resyncDur, *tenantNamespace, ctx.Done())
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, *tenantNamespace, *readOnly, ctx.Done())
	controllers.StartDashboardControllers(resource.DashboardClient, resyncDur, *tenantNamespace, ctx.Done())

	if isTriggersInstalled {
		controllers.StartTriggersControllers(resource.DynamicClient, resyncDur, *tenantNamespace, ctx.Done())
	}

	l, err := server.Listen("", *portNumber)
	if err != nil {
		logging.Log.Errorf("Error listening: %s", err.Error())
		return
	}

	logging.Log.Infof("Starting to serve on %s", l.Addr().String())
	server.ServeOnListener(l)
}

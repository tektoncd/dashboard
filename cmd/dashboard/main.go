/*
Copyright 2019-2020 The Tekton Authors
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
	"context"
	"crypto/rand"
	"flag"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/csrf"
	routeclient "github.com/openshift/client-go/route/clientset/versioned"
	"github.com/tektoncd/dashboard/pkg/controllers"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	clientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	resourceclientset "github.com/tektoncd/pipeline/pkg/client/resource/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"knative.dev/pkg/signals"
)

const csrfTokenLength = 32

var (
	help               = flag.Bool("help", false, "Prints defaults")
	pipelinesNamespace = flag.String("pipelines-namespace", "", "Namespace where Tekton pipelines is installed (assumes same namespace as dashboard if not specified)")
	triggersNamespace  = flag.String("triggers-namespace", "", "Namespace where Tekton triggers is installed (assumes same namespace as dashboard if not specified)")
	kubeConfigPath     = flag.String("kube-config", "", "Path to kube config file")
	portNumber         = flag.Int("port", 8080, "Dashboard port number")
	readOnly           = flag.Bool("read-only", false, "Enable or disable read only mode")
	webDir             = flag.String("web-dir", "", "Dashboard web resources dir")
	logoutUrl          = flag.String("logout-url", "", "If set, enables logout on the frontend and binds the logout button to this url")
	csrfSecureCookie   = flag.Bool("csrf-secure-cookie", true, "Enable or disable Secure attribute on the CSRF cookie")
)

func getCSRFAuthKey() []byte {
	logging.Log.Info("Generating CSRF auth key")
	authKey := make([]byte, csrfTokenLength)
	_, err := rand.Read(authKey)
	if err == nil {
		return authKey
	}

	logging.Log.Errorf("Couldn't generate random value for CSRF auth key: %s", err.Error())
	return nil
}

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

	pipelineClient, err := clientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building pipeline clientset: %s", err.Error())
	}
	pipelineResourceClient, err := resourceclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building pipelineresource clientset: %s", err.Error())
	}

	k8sClient, err := k8sclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building k8s clientset: %s", err.Error())
	}

	routeClient, err := routeclient.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building route clientset: %s", err.Error())
	}

	options := endpoints.Options{
		InstallNamespace:   installNamespace,
		PipelinesNamespace: *pipelinesNamespace,
		TriggersNamespace:  *triggersNamespace,
		ReadOnly:           *readOnly,
		WebDir:             *webDir,
		LogoutURL:          *logoutUrl,
	}

	resource := endpoints.Resource{
		PipelineClient:         pipelineClient,
		PipelineResourceClient: pipelineResourceClient,
		K8sClient:              k8sClient,
		RouteClient:            routeClient,
		Options:                options,
	}

	ctx := signals.NewContext()

	routerHandler := router.Register(resource)
	logging.Log.Info("Creating controllers")
	resyncDur := time.Second * 30
	controllers.StartTektonControllers(resource.PipelineClient, resource.PipelineResourceClient, resyncDur, ctx.Done())
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, installNamespace, *readOnly, routerHandler, ctx.Done())

	logging.Log.Infof("Creating server and entering wait loop")
	CSRF := csrf.Protect(
		getCSRFAuthKey(),
		csrf.CookieName("token"),
		csrf.Path("/"),
		csrf.SameSite(csrf.SameSiteLaxMode),
		csrf.Secure(*csrfSecureCookie),
	)
	server := &http.Server{Addr: fmt.Sprintf(":%d", *portNumber), Handler: CSRF(routerHandler)}

	errCh := make(chan error, 1)
	defer close(errCh)
	go func() {
		// Don't forward ErrServerClosed as that indicates we're already shutting down.
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- fmt.Errorf("dashboard server failed: %w", err)
		}
	}()

	select {
	case err := <-errCh:
		logging.Log.Fatal(err)
	case <-ctx.Done():
		if err := server.Shutdown(context.Background()); err != nil {
			logging.Log.Fatal(err)
		}
	}
}

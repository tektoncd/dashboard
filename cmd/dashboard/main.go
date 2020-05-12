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
	"strconv"
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
	tenantNamespace = flag.String("tenant-namespace", "", "Single namespace visibility")
)

// Stores config env
type config struct {
	kubeConfigPath string
	// Should conform with http.Server.Addr field
	port             string
	installNamespace string
}

func isCSRFSecureCookieEnabled() bool {
	asBool, err := strconv.ParseBool(os.Getenv("CSRF_SECURE_COOKIE"))
	if err == nil {
		logging.Log.Infof("Is CSRF_SECURE_COOKIE enabled: %t", asBool)
		return asBool
	}
	logging.Log.Warnf("Couldn't get CSRF_SECURE_COOKIE, defaulting to true: %s", err.Error())
	return true
}

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

	// Initialize config
	dashboardConfig := config{
		kubeConfigPath:   os.Getenv("KUBECONFIG"),
		port:             ":8080",
		installNamespace: os.Getenv("INSTALLED_NAMESPACE"),
	}
	portNumber := os.Getenv("PORT")
	if portNumber != "" {
		dashboardConfig.port = ":" + portNumber
		logging.Log.Infof("Port number from config: %s", portNumber)
	}

	var cfg *rest.Config
	var err error
	if len(dashboardConfig.kubeConfigPath) != 0 {
		cfg, err = clientcmd.BuildConfigFromFlags("", dashboardConfig.kubeConfigPath)
		if err != nil {
			logging.Log.Errorf("Error building kubeconfig from %s: %s", dashboardConfig.kubeConfigPath, err.Error())
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
		TenantNamespace: *tenantNamespace,
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
	controllers.StartTektonControllers(resource.PipelineClient, resource.PipelineResourceClient, resyncDur, *tenantNamespace, ctx.Done())
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, dashboardConfig.installNamespace, *tenantNamespace, routerHandler, ctx.Done())

	logging.Log.Infof("Creating server and entering wait loop")
	CSRF := csrf.Protect(
		getCSRFAuthKey(),
		csrf.CookieName("token"),
		csrf.Path("/"),
		csrf.SameSite(csrf.SameSiteLaxMode),
		csrf.Secure(isCSRFSecureCookieEnabled()),
	)
	server := &http.Server{Addr: dashboardConfig.port, Handler: CSRF(routerHandler)}

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

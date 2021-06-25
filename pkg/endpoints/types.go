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

package endpoints

import (
	"net/http"

	dashboardclientset "github.com/tektoncd/dashboard/pkg/client/clientset/versioned"
	"k8s.io/client-go/dynamic"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// Options for enpoints
type Options struct {
	InstallNamespace   string
	PipelinesNamespace string
	TriggersNamespace  string
	TenantNamespace    string
	ReadOnly           bool
	LogoutURL          string
	StreamLogs         bool
	ExternalLogsURL    string
	XFrameOptions      string
}

// GetPipelinesNamespace returns the PipelinesNamespace property if set
// or the InstallNamespace property otherwise (this assumes Tekton pipelines
// is installed in the same namespace as the dashboard if the property is not set)
func (o Options) GetPipelinesNamespace() string {
	if o.PipelinesNamespace != "" {
		return o.PipelinesNamespace
	}
	return o.InstallNamespace
}

// GetTriggersNamespace returns the TriggersNamespace property if set
// or the InstallNamespace property otherwise (this assumes Tekton triggers
// is installed in the same namespace as the dashboard if the property is not set)
func (o Options) GetTriggersNamespace() string {
	if o.TriggersNamespace != "" {
		return o.TriggersNamespace
	}
	return o.InstallNamespace
}

// Store all types here that are reused throughout files
// Wrapper around all necessary clients used for endpoints
type Resource struct {
	Config          *rest.Config
	HttpClient      *http.Client
	DashboardClient dashboardclientset.Interface
	DynamicClient   dynamic.Interface
	K8sClient       k8sclientset.Interface
	Options         Options
}

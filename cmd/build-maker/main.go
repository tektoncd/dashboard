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
	"os"
	"strings"

	"github.com/spf13/pflag"
	dashboardv1alpha1 "github.com/tektoncd/dashboard/pkg/apis/dashboard/v1alpha1"
	dashboardclientset "github.com/tektoncd/dashboard/pkg/client/clientset/versioned"
	"github.com/tektoncd/dashboard/pkg/logging"
	pipelinev1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	resourcev1alpha1 "github.com/tektoncd/pipeline/pkg/apis/resource/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/yaml"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	kubeConfigPath = pflag.String("kube-config", "", "Path to kube config file")
	file           = pflag.String("file", "", "PipelineRun spec file")
	namespace      = pflag.String("namespace", "", "Target namespace")
	ownerName      = pflag.String("owner-name", "", "Owner project name")
	ownerUid       = pflag.String("owner-uid", "", "Owner project UID")
	url            = pflag.String("url", "", "Repository url")
	revision       = pflag.String("revision", "", "Revision")
	logLevel       = pflag.String("log-level", "info", "Minimum log level output by the logger")
	logFormat      = pflag.String("log-format", "json", "Format for log output (json or console)")
	params         = pflag.StringArray("param", nil, "Param int the form name=value")
)

func main() {
	pflag.Parse()

	logging.InitLogger(*logLevel, *logFormat)

	if *file == "" {
		logging.Log.Panic("file must be provided")
	}

	if *namespace == "" {
		logging.Log.Panic("namespace must be provided")
	}

	if *url == "" {
		logging.Log.Panic("url must be provided")
	}

	if *revision == "" {
		logging.Log.Panic("revision must be provided")
	}

	if f, err := os.Open(*file); err != nil {
		logging.Log.Panicf("Error loading file (%s): %s", *file, err.Error())
	} else {
		decoder := yaml.NewYAMLOrJSONDecoder(f, 4096)

		var pipelineSpec pipelinev1beta1.PipelineSpec

		if err := decoder.Decode(&pipelineSpec); err != nil {
			logging.Log.Panicf("Error decoding file: %s", err.Error())
		}

		var cfg *rest.Config

		if *kubeConfigPath != "" {
			cfg, err = clientcmd.BuildConfigFromFlags("", *kubeConfigPath)
			if err != nil {
				logging.Log.Panicf("Error building kubeconfig from %s: %s", *kubeConfigPath, err.Error())
			}
		} else {
			if cfg, err = rest.InClusterConfig(); err != nil {
				logging.Log.Panicf("Error building kubeconfig: %s", err.Error())
			}
		}

		dashboardClient, err := dashboardclientset.NewForConfig(cfg)
		if err != nil {
			logging.Log.Panicf("Error building dashboard clientset: %s", err.Error())
		}

		build := &dashboardv1alpha1.Build{
			Spec: dashboardv1alpha1.BuildSpec{
				PipelineSpec: pipelineSpec,
				PipelineResourceSpec: resourcev1alpha1.PipelineResourceSpec{
					Type: "git",
					Params: []resourcev1alpha1.ResourceParam{
						{
							Name:  "url",
							Value: *url,
						},
						{
							Name:  "revision",
							Value: *revision,
						},
					},
				},
			},
		}

		if params != nil {
			for _, param := range *params {
				nameValue := strings.Split(param, "=")
				if len(nameValue) == 2 {
					build.Spec.Params = append(build.Spec.Params, pipelinev1beta1.Param{
						Name:  nameValue[0],
						Value: pipelinev1beta1.NewArrayOrString(nameValue[1]),
					})
				}
			}
		}

		build.GenerateName = "build-"

		if *ownerName != "" && *ownerUid != "" {
			trueHelper := true
			build.OwnerReferences = append(build.OwnerReferences, metav1.OwnerReference{
				APIVersion:         "dashboard.tekton.dev/v1alpha1",
				Kind:               "Project",
				Name:               *ownerName,
				UID:                types.UID(*ownerUid),
				Controller:         &trueHelper,
				BlockOwnerDeletion: &trueHelper,
			})
		}

		if build, err := dashboardClient.DashboardV1alpha1().Builds(*namespace).Create(build); err != nil {
			logging.Log.Panicf("Error creating build: %s", err.Error())
		} else {
			logging.Log.Infof("Created build %s in namespace %s", build.Name, build.Namespace)
		}
	}
}

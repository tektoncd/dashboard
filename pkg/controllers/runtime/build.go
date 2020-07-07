/*
Copyright 2020 The Tekton Authors
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

package runtimecontroller

import (
	"context"

	dashboardv1alpha1 "github.com/tektoncd/dashboard/pkg/apis/dashboard/v1alpha1"
	"github.com/tektoncd/dashboard/pkg/logging"
	pipelinev1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

func ForBuilds(mgr manager.Manager) {
	ctrl.NewControllerManagedBy(mgr).
		For(&dashboardv1alpha1.Build{}).
		Owns(&pipelinev1beta1.PipelineRun{}).
		Complete(reconcile.Func(func(request ctrl.Request) (ctrl.Result, error) {
			ctx := context.Background()
			client := mgr.GetClient()
			scheme := mgr.GetScheme()

			logging.Log.Infof("Reconcile Build %+v", request)

			var build dashboardv1alpha1.Build
			if err := client.Get(ctx, request.NamespacedName, &build); err != nil {
				if !apierrors.IsNotFound(err) {
					return ctrl.Result{}, nil
				}
				logging.Log.Errorf("unable to get Build: %s", err)
				return ctrl.Result{}, err
			}

			pipelineRun := &pipelinev1beta1.PipelineRun{ObjectMeta: objectMeta(request)}
			if err := r(ctx, "TriggerTemplate", client, scheme, &build, pipelineRun, func() error {
				pipelineRun.Spec = pipelinev1beta1.PipelineRunSpec{
					PipelineSpec: &build.Spec.PipelineSpec,
					Resources: []pipelinev1beta1.PipelineResourceBinding{
						{
							Name:         "source",
							ResourceSpec: &build.Spec.PipelineResourceSpec,
						},
					},
					Params: build.Spec.Params,
				}
				return nil
			}); err != nil {
				return ctrl.Result{}, err
			}

			build.Status.PipelineRun = &pipelineRun.Status

			if err := client.Status().Update(ctx, &build); err != nil {
				logging.Log.Errorf("failed to update Build status: %s", err)
				return ctrl.Result{}, err
			}

			return ctrl.Result{}, nil
		}))
}

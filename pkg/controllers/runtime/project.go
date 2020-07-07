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
	triggersv1alpha1 "github.com/tektoncd/triggers/pkg/apis/triggers/v1alpha1"
	extensionsv1beta1 "k8s.io/api/extensions/v1beta1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

const projectOwnerKey = ".metadata.controller"

var apiGVStr = dashboardv1alpha1.SchemeGroupVersion.String()

func ForProjects(mgr manager.Manager) {
	if err := mgr.GetFieldIndexer().IndexField(&pipelinev1beta1.TaskRun{}, projectOwnerKey, func(rawObj runtime.Object) []string {
		obj := rawObj.(*pipelinev1beta1.TaskRun)
		owner := metav1.GetControllerOf(obj)
		if owner == nil {
			return nil
		}
		if owner.APIVersion != apiGVStr || owner.Kind != "Project" {
			return nil
		}
		return []string{owner.Name}
	}); err != nil {
		logging.Log.Errorf("failed to register indexer: %s", err)
	}

	if err := mgr.GetFieldIndexer().IndexField(&dashboardv1alpha1.Build{}, projectOwnerKey, func(rawObj runtime.Object) []string {
		obj := rawObj.(*dashboardv1alpha1.Build)
		owner := metav1.GetControllerOf(obj)
		if owner == nil {
			return nil
		}
		if owner.APIVersion != apiGVStr || owner.Kind != "Project" {
			return nil
		}
		return []string{owner.Name}
	}); err != nil {
		logging.Log.Errorf("failed to register indexer: %s", err)
	}

	ctrl.NewControllerManagedBy(mgr).
		For(&dashboardv1alpha1.Project{}).
		Owns(&triggersv1alpha1.TriggerBinding{}).
		Owns(&triggersv1alpha1.TriggerTemplate{}).
		Owns(&triggersv1alpha1.EventListener{}).
		Owns(&extensionsv1beta1.Ingress{}).
		Owns(&dashboardv1alpha1.Build{}).
		Owns(&pipelinev1beta1.TaskRun{}).
		Complete(reconcile.Func(func(request ctrl.Request) (ctrl.Result, error) {
			ctx := context.Background()
			c := mgr.GetClient()
			scheme := mgr.GetScheme()

			logging.Log.Infof("Reconcile Project %+v", request)

			var project dashboardv1alpha1.Project
			if err := c.Get(ctx, request.NamespacedName, &project); err != nil {
				if !apierrors.IsNotFound(err) {
					return ctrl.Result{}, nil
				}
				logging.Log.Errorf("unable to get Project: %s", err)
				return ctrl.Result{}, err
			}

			triggerTemplate := &triggersv1alpha1.TriggerTemplate{ObjectMeta: objectMeta(request)}
			if err := r(ctx, "TriggerTemplate", c, scheme, &project, triggerTemplate, func() error {
				triggerTemplate.Spec = project.Spec.TriggerTemplate
				return nil
			}); err != nil {
				return ctrl.Result{}, err
			}

			triggerBinding := &triggersv1alpha1.TriggerBinding{ObjectMeta: objectMeta(request)}
			if err := r(ctx, "TriggerBinding", c, scheme, &project, triggerBinding, func() error {
				project.Spec.TriggerBinding.DeepCopyInto(&triggerBinding.Spec)
				triggerBinding.Spec.Params = append(
					triggerBinding.Spec.Params,
					triggersv1alpha1.Param{
						Name:  "ownername",
						Value: project.Name,
					},
					triggersv1alpha1.Param{
						Name:  "owneruid",
						Value: string(project.UID),
					},
				)
				return nil
			}); err != nil {
				return ctrl.Result{}, err
			}

			eventListener := &triggersv1alpha1.EventListener{ObjectMeta: objectMeta(request)}
			if err := r(ctx, "EventListener", c, scheme, &project, eventListener, func() error {
				eventListener.Spec = triggersv1alpha1.EventListenerSpec{
					ServiceAccountName: project.Spec.ServiceAccountName,
					Triggers: []triggersv1alpha1.EventListenerTrigger{
						{
							Interceptors: project.Spec.Interceptors,
							Bindings: []*triggersv1alpha1.EventListenerBinding{
								{
									Ref: project.GetName(),
								},
							},
							Template: triggersv1alpha1.EventListenerTemplate{
								Name: triggerTemplate.Name,
							},
						},
					},
				}
				return nil
			}); err != nil {
				return ctrl.Result{}, err
			}

			if project.Spec.Ingress != nil {
				ingress := &extensionsv1beta1.Ingress{ObjectMeta: objectMeta(request)}
				if err := r(ctx, "Ingress", c, scheme, &project, ingress, func() error {
					ingress.Annotations = project.Spec.Ingress.Annotations
					ingress.Labels = project.Spec.Ingress.Labels
					ingress.Spec = extensionsv1beta1.IngressSpec{
						Rules: []extensionsv1beta1.IngressRule{
							{
								Host: project.Spec.Ingress.Host,
								IngressRuleValue: extensionsv1beta1.IngressRuleValue{
									HTTP: &extensionsv1beta1.HTTPIngressRuleValue{
										Paths: []extensionsv1beta1.HTTPIngressPath{
											{
												Backend: extensionsv1beta1.IngressBackend{
													ServiceName: "el-" + eventListener.GetName(),
													ServicePort: intstr.FromInt(8080),
												},
											},
										},
									},
								},
							},
						},
					}
					return nil
				}); err != nil {
					return ctrl.Result{}, err
				}

				project.Status.Ingress = &ingress.Status
			}

			project.Status.EventListener = &eventListener.Status
			project.Status.TriggerBinding = &triggerBinding.Status
			project.Status.TriggerTemplate = &triggerTemplate.Status

			var taskRunList pipelinev1beta1.TaskRunList
			if err := c.List(ctx, &taskRunList, client.InNamespace(request.Namespace), client.MatchingFields{projectOwnerKey: request.Name}); err != nil {
				logging.Log.Errorf("failed to reconcile TaskRuns status: %s", err)
			}

			taskRuns := make(map[string]*pipelinev1beta1.TaskRunStatus)
			for _, taskRun := range taskRunList.Items {
				ref := taskRun
				taskRuns[taskRun.Name] = &ref.Status
			}
			project.Status.TaskRuns = taskRuns

			var buildList dashboardv1alpha1.BuildList
			if err := c.List(ctx, &buildList, client.InNamespace(request.Namespace), client.MatchingFields{projectOwnerKey: request.Name}); err != nil {
				logging.Log.Errorf("failed to reconcile Builds status: %s", err)
			}

			builds := make(map[string]*dashboardv1alpha1.BuildStatus)
			for _, build := range buildList.Items {
				ref := build
				builds[build.Name] = &ref.Status
			}
			project.Status.Builds = builds

			if err := c.Status().Update(ctx, &project); err != nil {
				logging.Log.Errorf("failed to update Project status: %s", err)
				return ctrl.Result{}, err
			}

			return ctrl.Result{}, nil
		}))
}

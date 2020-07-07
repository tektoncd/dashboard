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

	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
)

func r(ctx context.Context, kind string, c client.Client, scheme *runtime.Scheme, owner metav1.Object, obj runtime.Object, f controllerutil.MutateFn) error {
	op, err := ctrl.CreateOrUpdate(ctx, c, obj, func() error {
		if err := ctrl.SetControllerReference(owner, obj.(metav1.Object), scheme); err != nil {
			logging.Log.Errorf("failed to set %s's owner reference: %s", kind, err)
			return err
		}
		return f()
	})
	if err != nil {
		logging.Log.Errorf("failed to reconcile %s: %s", kind, err)
	} else {
		logging.Log.Infof("successfully reconciled %s: %s", kind, op)
	}
	return err
}

func objectMeta(request ctrl.Request) metav1.ObjectMeta {
	return metav1.ObjectMeta{
		Name:      request.Name,
		Namespace: request.Namespace,
	}
}

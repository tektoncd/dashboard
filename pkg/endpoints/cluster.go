/*
Copyright 2019 The Tekton Authors
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

	"github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (r Resource) getAllNamespaces(request *restful.Request, response *restful.Response) {
	namespaces, err := r.K8sClient.CoreV1().Namespaces().List(metav1.ListOptions{})
	logging.Log.Debugf("In getAllNamespaces")

	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	logging.Log.Debugf("Found namespaces: %s", namespaces)
	response.WriteEntity(namespaces)
}

func (r Resource) getAllServiceAccounts(request *restful.Request, response *restful.Response) {
	requestNamespace := request.PathParameter("namespace")

	serviceAccounts, err := r.K8sClient.CoreV1().ServiceAccounts(requestNamespace).List(metav1.ListOptions{})
	logging.Log.Debugf("In getAllServiceAccounts")

	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	logging.Log.Debugf("Found service accounts: %s", serviceAccounts)
	response.WriteEntity(serviceAccounts)
}

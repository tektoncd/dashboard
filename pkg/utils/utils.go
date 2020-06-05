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

package utils

import (
	"encoding/json"
	"net/http"
	"strings"

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

// RespondError - logs and writes an error response with a desired status code
func RespondError(response *restful.Response, err error, statusCode int) {
	logging.Log.Error("Error: ", strings.Replace(err.Error(), "/", "", -1))
	response.AddHeader("Content-Type", "text/plain")
	response.WriteError(statusCode, err)
}

// RespondErrorMessage - logs and writes an error message with a desired status code
func RespondErrorMessage(response *restful.Response, message string, statusCode int) {
	logging.Log.Debugf("Error message: %s", message)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, message)
}

// RespondMessageAndLogError - logs and writes an error message with a desired status code and logs the error
func RespondMessageAndLogError(response *restful.Response, err error, message string, statusCode int) {
	logging.Log.Error("Error: ", strings.Replace(err.Error(), "/", "", -1))
	logging.Log.Debugf("Message: %s", message)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, message)
}

// Write Content-Location header within POST methods and set StatusCode to 201
// Headers MUST be set before writing to body (if any) to succeed
func WriteResponseLocation(request *restful.Request, response *restful.Response, identifier string) {
	location := request.Request.URL.Path
	if request.Request.Method == http.MethodPost {
		location = location + "/" + identifier
	}
	response.AddHeader("Content-Location", location)
	response.WriteHeader(201)
}

func GetNamespace(request *restful.Request) string {
	namespace := request.PathParameter("namespace")
	if namespace == "*" {
		namespace = ""
	}
	return namespace
}

func GetContentType(content []byte) string {
	if json.Valid(content) {
		return "application/json"
	}
	return "text/plain"
}

// Adapted from https://github.com/kubernetes-sigs/controller-runtime/blob/v0.5.2/pkg/source/internal/eventsource.go#L131-L149
func GetDeletedObjectMeta(obj interface{}) metav1.Object {
	// Deal with tombstone events by pulling the object out.  Tombstone events wrap the object in a
	// DeleteFinalStateUnknown struct, so the object needs to be pulled out.
	// Copied from sample-controller
	// This should only happen when we're missing events.
	if _, ok := obj.(metav1.Object); !ok {
		// If the object doesn't have Metadata, assume it is a tombstone object of type DeletedFinalStateUnknown
		if tombstone, ok := obj.(cache.DeletedFinalStateUnknown); !ok {
			logging.Log.Errorf("Error decoding object: Expected cache.DeletedFinalStateUnknown, got %T", obj)
			return &metav1.ObjectMeta{}
		} else {
			// Set obj to the tombstone obj
			obj = tombstone.Obj
		}
	}

	// Pull metav1.Object out of the object
	if o, err := meta.Accessor(obj); err != nil {
		logging.Log.Errorf("Missing meta for object %T: %v", obj, err)
		return &metav1.ObjectMeta{}
	} else {
		return o
	}
}

func SanitizeSecret(obj interface{}, skipDeletedCheck bool) interface{} {
	if !skipDeletedCheck {
		obj = GetDeletedObjectMeta(obj)
	}

	secret, ok := obj.(*corev1.Secret)
	if !ok {
		return obj
	}

	originalMeta := secret.ObjectMeta
	originalAnnotations := originalMeta.Annotations
	annotations := make(map[string]string)

	for key, value := range originalAnnotations {
		if strings.HasPrefix(key, "tekton.dev/") {
			annotations[key] = value
		}
	}

	meta := metav1.ObjectMeta{
		Name:              originalMeta.Name,
		Namespace:         originalMeta.Namespace,
		UID:               originalMeta.UID,
		ResourceVersion:   originalMeta.ResourceVersion,
		CreationTimestamp: originalMeta.CreationTimestamp,
		Annotations:       annotations,
	}

	data := make(map[string][]byte)
	if secret.Data["username"] != nil {
		data["username"] = secret.Data["username"]
	}
	if secret.Data["accessToken"] != nil {
		data["accessToken"] = []byte("--- REDACTED ---")
	}
	return corev1.Secret{
		TypeMeta:   secret.TypeMeta, // Kind, APIVersion
		ObjectMeta: meta,
		Data:       data,
		StringData: nil, // never returned over API
		Type:       secret.Type,
	}
}

/*
Copyright 2019-2022 The Tekton Authors
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
	"net/http"
	"strings"

	logging "github.com/tektoncd/dashboard/pkg/logging"
)

// RespondError - logs and writes an error response with a desired status code
func RespondError(response http.ResponseWriter, err error, statusCode int) {
	logging.Log.Error("Error: ", strings.ReplaceAll(err.Error(), "/", ""))
	response.Header().Set("Content-Type", "text/plain")
	response.WriteHeader(statusCode)
	_, err = response.Write([]byte(err.Error()))
	if err != nil {
		logging.Log.Error("Write failed: %v", err)
	}
}

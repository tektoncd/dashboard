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
	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
)

// RespondError ...
func RespondError(response *restful.Response, err error, statusCode int) {
	logging.Log.Error("[RespondError] Error:", err.Error())
	logging.Log.Debugf("Response is %x\n", *response)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteError(statusCode, err)
}

// RespondErrorMessage ...
func RespondErrorMessage(response *restful.Response, message string, statusCode int) {
	logging.Log.Debug("[RespondErrorMessage] Message:", message)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, message)
}

// RespondErrorAndMessage ...
func RespondErrorAndMessage(response *restful.Response, err error, message string, statusCode int) {
	logging.Log.Error("[RespondErrorAndMessage] Error:", err.Error())
	logging.Log.Infof("Message is %x\n", message)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, message)
}

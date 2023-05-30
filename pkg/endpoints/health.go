/*
Copyright 2019-2023 The Tekton Authors
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
)

// CheckHealth responds with a status code 200 signalling that the application can receive requests
func (r Resource) CheckHealth(response http.ResponseWriter, _ *http.Request) {
	// A method here so there's scope for doing anything fancy e.g. checking anything else
	response.WriteHeader(http.StatusOK)
}

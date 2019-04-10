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
	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/websocket"
)

// Define all broadcasters/channels
// Keep broadcaster channels open indefinitely
var logChannel = make(chan broadcaster.SocketData)
var pipelineRunsChannel = make(chan broadcaster.SocketData)

var logBroadcaster = broadcaster.NewBroadcaster(logChannel)
var pipelineRunsBroadcaster = broadcaster.NewBroadcaster(pipelineRunsChannel)

// Establish websocket and subscribe to pipeline log events
func (r Resource) establishPipelineLogsWebsocket(request *restful.Request, response *restful.Response) {
	connection, err := websocket.UpgradeToWebsocket(request, response)
	if err != nil {
		logging.Log.Errorf("Could not upgrade to websocket connection: %s", err)
	}
	websocket.WriteOnlyWebsocket(connection, logBroadcaster)
}

// Establish websocket and subscribe to pipelinerun events
func (r Resource) establishPipelineRunsWebsocket(request *restful.Request, response *restful.Response) {
	connection, err := websocket.UpgradeToWebsocket(request, response)
	if err != nil {
		logging.Log.Errorf("Could not upgrade to websocket connection: %s", err)
	}

	websocket.WriteOnlyWebsocket(connection, pipelineRunsBroadcaster)
}

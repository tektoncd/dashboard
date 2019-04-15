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

package websocket

import (
	"encoding/json"
	"net/http"
	"time"

	restful "github.com/emicklei/go-restful"
	"github.com/gorilla/websocket"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	logging "github.com/tektoncd/dashboard/pkg/logging"
)

// UpgradeToWebsocket attempts to upgrade connection from HTTP(S) to WS(S)
func UpgradeToWebsocket(request *restful.Request, response *restful.Response) (*websocket.Conn, error) {
	var writer http.ResponseWriter = response
	logging.Log.Debug("Upgrading connection to websocket...")
	// Handles writing error to response
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 4096,
	}
	connection, err := upgrader.Upgrade(writer, request.Request, nil)
	return connection, err
}

// WriteOnlyWebsocket discards text messages from the peer connection
func WriteOnlyWebsocket(connection *websocket.Conn, b *broadcaster.Broadcaster) {
	// The underlying connection is never closed so this cannot error
	subscriber, _ := b.Subscribe()
	go readControl(connection, b, subscriber)
	go poll(connection)
	write(connection, subscriber)
}

func readControl(connection *websocket.Conn, b *broadcaster.Broadcaster, s *broadcaster.Subscriber) {
	for {
		if _, _, err := connection.ReadMessage(); err != nil {
			logging.Log.Error("websocket connection to client lost: ", err)
			b.Unsubscribe(s)
			return
		}
	}
}

// Connection must be reading first
func poll(connection *websocket.Conn) {
	var pongReceived bool
	connection.SetPongHandler(func(string) error {
		pongReceived = true
		return nil
	})
	time.Sleep(time.Second)
	for {
		// Pong handler
		pongDeadline := time.Now().Add(time.Second)
		pingDeadline := time.Now().Add(time.Second / 2)
		connection.WriteControl(websocket.PingMessage, nil, pingDeadline)
		time.Sleep(time.Until(pongDeadline))
		if !pongReceived {
			ReportClosing(connection)
			return
		}
		// Reset and wait for new pong
		pongReceived = false
	}
}

// ReportClosing sends close to client then closes connection
func ReportClosing(connection *websocket.Conn) {
	connection.WriteControl(websocket.CloseMessage, nil, time.Now().Add(time.Millisecond*100))
	connection.Close()
}

func write(connection *websocket.Conn, subscriber *broadcaster.Subscriber) {
	subChan := subscriber.SubChan()
	unsubChan := subscriber.UnsubChan()
	for {
		select {
		case socketData := <-subChan:
			websocketSend(connection, socketData)
		case <-unsubChan:
			return
		}
	}
}

// Return value indicates if message was created and sent
// Closes connection on failures, which will end PONG responses
func websocketSend(connection *websocket.Conn, data broadcaster.SocketData) {
	payload, err := json.Marshal(data)
	if err != nil {
		logging.Log.Errorf("Failed to Marshal status: %s\n", err)
		ReportClosing(connection)
		return
	}
	if err := connection.WriteMessage(websocket.TextMessage, payload); err != nil {
		logging.Log.Errorf("Could not write textMessage to Websocket client connection, error: %s\n", err)
		ReportClosing(connection)
		return
	}
	return
}

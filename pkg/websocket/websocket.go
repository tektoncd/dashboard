/*
Copyright 2019-2021 The Tekton Authors
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

	"github.com/gorilla/websocket"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	logging "github.com/tektoncd/dashboard/pkg/logging"
)

// UpgradeToWebsocket attempts to upgrade connection from HTTP(S) to WS(S)
func UpgradeToWebsocket(request *http.Request, response http.ResponseWriter) (*websocket.Conn, error) {
	logging.Log.Debug("Upgrading connection to websocket...")
	// Handles writing error to response
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 4096,
	}
	connection, err := upgrader.Upgrade(response, request, nil)
	return connection, err
}

// WriteOnlyWebsocket discards text messages from the peer connection
func WriteOnlyWebsocket(connection *websocket.Conn, b *broadcaster.Broadcaster) {
	// The underlying connection is never closed so this cannot error
	subscriber, _ := b.Subscribe()
	go readControl(connection, b, subscriber)
	write(connection, subscriber)
}

// ping over the socket with a given deadline; if there's an error, close
func writePing(connection *websocket.Conn, deadline time.Time) {
	if err := connection.WriteControl(websocket.PingMessage, nil, deadline); err != nil {
		ReportClosing(connection)
	}
}

// readControl will unsubscribe on connection failures
func readControl(connection *websocket.Conn, b *broadcaster.Broadcaster, s *broadcaster.Subscriber) {
	// Connection lifecycle handler
	connection.SetPongHandler(func(string) error {
		// Extend deadline to prevent expiration
		deadline := time.Now().Add(time.Second * 2)
		connection.SetReadDeadline(deadline)
		// Cut down on ping/pong traffic
		time.Sleep(time.Second)
		// Ellicit another ping
		writePing(connection, deadline)
		return nil
	})
	initialDeadline := time.Now().Add(time.Second)
	connection.SetReadDeadline(initialDeadline)
	// Kick off cycle
	writePing(connection, initialDeadline)
	for {
		// Connection has either decayed or close has been requested from server side
		if _, _, err := connection.ReadMessage(); err != nil {
			logging.Log.Error("websocket connection to client lost: ", err)
			b.Unsubscribe(s)
			return
		}
	}
}

// ReportClosing sends close to client then closes connection
func ReportClosing(connection *websocket.Conn) {
	connection.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	connection.Close()
}

// Send data over the connection using the subscriber channel, if there's a failure we return
func write(connection *websocket.Conn, subscriber *broadcaster.Subscriber) {
	subChan := subscriber.SubChan()
	unsubChan := subscriber.UnsubChan()
	for {
		select {
		case socketData := <-subChan:
			if !websocketSend(connection, socketData) {
				return
			}
		case <-unsubChan:
			return
		}
	}
}

// Returns whether successful or not, closes connection on failures
func websocketSend(connection *websocket.Conn, data broadcaster.SocketData) bool {
	payload, err := json.Marshal(data)
	if err != nil {
		logging.Log.Errorf("failed to marshal status: %s", err)
		ReportClosing(connection)
		return false
	}
	if err := connection.WriteMessage(websocket.TextMessage, payload); err != nil {
		logging.Log.Errorf("could not write the message to the websocket client connection, error: %s", err)
		ReportClosing(connection)
		return false
	}
	return true
}

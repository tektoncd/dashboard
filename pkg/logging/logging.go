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

package logging

import (
	"fmt"
	"go.uber.org/zap"
)

// Log is our logger for use elsewhere
var Log = loggerInit()

func loggerInit() *zap.SugaredLogger {
	Logger := zap.NewExample().Sugar()
	defer Logger.Sync()
	if Logger == nil {
		fmt.Print("expected a non-nil logger")
	}
	Logger.Info("constructed a logger")
	return Logger
}

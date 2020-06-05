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
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Log is our logger for use elsewhere
var Log = zap.NewNop().Sugar()

func InitLogger(level, format string) {
	logger := createLogger(level, format)
	defer logger.Sync()
	Log = logger
}

func createLogger(level, format string) *zap.SugaredLogger {
	var config zap.Config

	if format == "json" {
		config = zap.NewProductionConfig()
	} else {
		config = zap.NewDevelopmentConfig()
	}

	coreLevel := zapcore.InfoLevel
	coreLevel.Set(level)

	config.Level.SetLevel(coreLevel)

	if logger, err := config.Build(); err == nil {
		return logger.Sugar()
	}

	return zap.NewExample().Sugar()
}

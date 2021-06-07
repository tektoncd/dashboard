/*
Copyright 2021 The Tekton Authors
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

package csrf

import (
	"errors"
	"fmt"
	"net/http"
)

var (
	errorNoHeader = errors.New("CSRF header not found in request")
	headerName    = "Tekton-Client"
	// Idempotent (safe) methods as defined by RFC7231 section 4.2.2.
	safeMethods = map[string]bool{
		"GET":     true,
		"HEAD":    true,
		"OPTIONS": true,
		"TRACE":   true,
	}
)

type csrf struct {
	h    http.Handler
	opts options
}

type options struct {
	ErrorHandler http.Handler
	HeaderName   string
}

type Option func(*csrf)

func Protect(opts ...Option) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		cs := parseOptions(h, opts...)

		if cs.opts.ErrorHandler == nil {
			cs.opts.ErrorHandler = http.HandlerFunc(unauthorizedHandler)
		}

		if cs.opts.HeaderName == "" {
			cs.opts.HeaderName = headerName
		}

		return cs
	}
}

// Implements http.Handler for the csrf type.
func (cs *csrf) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, ok := safeMethods[r.Method]; !ok {
		csrfHeader := r.Header.Get(cs.opts.HeaderName)
		if csrfHeader == "" {
			cs.opts.ErrorHandler.ServeHTTP(w, r)
			return
		}
	}

	cs.h.ServeHTTP(w, r)
}

func unauthorizedHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, fmt.Sprintf("%s - %s",
		http.StatusText(http.StatusForbidden), errorNoHeader),
		http.StatusForbidden)
}

func parseOptions(h http.Handler, opts ...Option) *csrf {
	cs := &csrf{
		h: h,
	}

	for _, option := range opts {
		option(cs)
	}

	return cs
}

func ErrorHandler(h http.Handler) Option {
	return func(cs *csrf) {
		cs.opts.ErrorHandler = h
	}
}

func HeaderName(header string) Option {
	return func(cs *csrf) {
		cs.opts.HeaderName = header
	}
}

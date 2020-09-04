module github.com/tektoncd/dashboard

go 1.13

// Pin k8s deps to 1.16.5
replace (
	k8s.io/api => k8s.io/api v0.16.5
	k8s.io/apimachinery => k8s.io/apimachinery v0.16.5
	k8s.io/client-go => k8s.io/client-go v0.16.5
	k8s.io/code-generator => k8s.io/code-generator v0.16.5
	k8s.io/gengo => k8s.io/gengo v0.0.0-20190327210449-e17681d19d3a
)

require (
	github.com/emicklei/go-restful v2.12.0+incompatible
	github.com/google/go-cmp v0.5.0
	github.com/gorilla/csrf v1.7.0
	github.com/gorilla/websocket v1.4.2
	github.com/tektoncd/pipeline v0.15.2
	github.com/tektoncd/plumbing v0.0.0-20200430135134-e53521e1d887
	github.com/tektoncd/triggers v0.6.1
	go.uber.org/zap v1.15.0
	k8s.io/api v0.18.2
	k8s.io/apimachinery v0.18.2
	k8s.io/client-go v11.0.1-0.20190805182717-6502b5e7b1b5+incompatible
	k8s.io/code-generator v0.18.0
	knative.dev/pkg v0.0.0-20200702222342-ea4d6e985ba0
)

module github.com/tektoncd/dashboard

go 1.15

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
	github.com/gorilla/websocket v1.4.2
	github.com/imdario/mergo v0.3.9 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/niemeyer/pretty v0.0.0-20200227124842-a10e7caefd8e // indirect
	github.com/onsi/ginkgo v1.12.0 // indirect
	github.com/onsi/gomega v1.9.0 // indirect
	github.com/tektoncd/plumbing v0.0.0-20200430135134-e53521e1d887
	go.uber.org/zap v1.15.0
	golang.org/x/crypto v0.0.0-20200510223506-06a226fb4e37 // indirect
	golang.org/x/mod v0.3.0 // indirect
	golang.org/x/net v0.0.0-20200520182314-0ba52f642ac2 // indirect
	golang.org/x/sys v0.0.0-20200523222454-059865788121 // indirect
	golang.org/x/text v0.3.3 // indirect
	golang.org/x/time v0.0.0-20200416051211-89c76fbcd5d1 // indirect
	golang.org/x/tools v0.0.0-20200527183253-8e7acdbce89d // indirect
	google.golang.org/appengine v1.6.6 // indirect
	google.golang.org/protobuf v1.25.0 // indirect
	gopkg.in/check.v1 v1.0.0-20200227125254-8fa46927fb4f // indirect
	gopkg.in/yaml.v2 v2.3.0 // indirect
	honnef.co/go/tools v0.0.1-2020.1.4 // indirect
	k8s.io/api v0.18.2
	k8s.io/apimachinery v0.18.2
	k8s.io/client-go v11.0.1-0.20190805182717-6502b5e7b1b5+incompatible
	k8s.io/code-generator v0.18.0
	k8s.io/utils v0.0.0-20200324210504-a9aa75ae1b89 // indirect
	knative.dev/pkg v0.0.0-20200702222342-ea4d6e985ba0
)

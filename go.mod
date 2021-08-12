module github.com/tektoncd/dashboard

go 1.15

// Pin k8s deps to v0.22.0
replace (
	k8s.io/api => k8s.io/api v0.22.0
	k8s.io/apimachinery => k8s.io/apimachinery v0.22.0
	k8s.io/client-go => k8s.io/client-go v0.22.0
)

require (
	github.com/imdario/mergo v0.3.9 // indirect
	github.com/tektoncd/plumbing v0.0.0-20210514044347-f8a9689d5bd5
	go.uber.org/zap v1.15.0
	google.golang.org/appengine v1.6.6 // indirect
	honnef.co/go/tools v0.0.1-2020.1.4 // indirect
	k8s.io/apimachinery v0.22.0
	k8s.io/client-go v11.0.1-0.20190805182717-6502b5e7b1b5+incompatible
)

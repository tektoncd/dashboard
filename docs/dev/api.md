# Tekton Dashboard - Backend API

> [!WARNING]
> The Dashboard's HTTP API is considered an implementation detail and is not intended for consumption by third parties. It may change in unexpected ways without notice between releases.

The Dashboard provides the following endpoint:

__Dashboard Properties__
```
GET /v1/properties
```

Get the install properties of the Tekton Dashboard back end which includes the 
namespace and version of each of Tekton Dashboard, Pipelines, and Triggers if installed.

The response is provided as a JSON object, for example:

```
{
 "dashboardNamespace": "tekton-pipelines",
 "dashboardVersion": "devel",
 "isReadOnly": true,
 "pipelinesNamespace": "tekton-pipelines",
 "pipelinesVersion": "v0.10.0",
 "triggersNamespace": "tekton-pipelines",
 "triggersVersion": "v0.3.1"
}
```

Full details in [pkg/endpoints/cluster.go](/pkg/endpoints/cluster.go).

---

> [!NOTE]
> All other APIs consumed by the Dashboard client are provided by the Kubernetes API server, Dashboard extensions, or external log providers. See their respective documentation for details.

# Tekton Dashboard - Backend API


The backend API provides the following endpoints at `/v1/namespaces/<namespace>`:

__GET endpoints__

__Dashboard Endpoints__
```
GET /v1/namespaces/<namespace>/endpoints
Get the registered `tekton-dashboard` entry points (route and ingress) host values
Returns HTTP code 200 and the registered dashboard ingress host value 
Returns HTTP code 404 if an error occurred getting the ingress

Example payload response is formatted as so:

[
 {
  "type": "Route",
  "url": "tekton-dashboard-tekton-pipelines.apps.192.168.222.145.nip.io"
 },
 {
  "type": "Ingress",
  "url": "tekton-dashboard.192.168.222.145.nip.io"
 }
]
```

__Dashboard Ingress__
```
GET /v1/namespaces/<namespace>/ingress
Get the registered `tekton-dashboard` ingress host value
Returns HTTP code 200 and the registered dashboard ingress host value 
Returns HTTP code 404 if an error occurred getting the ingress
```

__Extensions__
```
GET /v1/extensions
Get all extensions in the given namespace
Returns HTTP code 500 if an error occurred getting the extensions
Returns HTTP code 200 and the given extensions in the given namespace if found, otherwise an empty list is returned
```

__Dashboard Properties__
```
GET /v1/properties
Get the properties of the tekton-dashboard which includes the:
- Tekton Dashboard namespace
- Tekton Dashboard version
- Tekton Pipelines namespace
- Tekton Pipelines version
- Tekton Triggers namespace
- Tekton Triggers version

Example payload response is formatted as so:

{
 "DashboardNamespace": "tekton-pipelines",
 "DashboardVersion": "devel",
 "PipelineNamespace": "tekton-pipelines",
 "PipelineVersion": "v0.10.0",
 "TriggersNamespace": "tekton-pipelines",
 "TriggersVersion": "v0.3.1",
 "IsOpenShift": false,
 "ReadOnly": true
}
```


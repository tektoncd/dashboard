# Tekton Dashboard - Backend API


The backend API provides the following endpoints:

__GET endpoints__

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

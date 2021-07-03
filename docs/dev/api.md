# Tekton Dashboard - Backend API


The backend API provides the following endpoints:

__GET endpoints__

__Dashboard Properties__
```
GET /v1/properties
```

Get the install properties of the Tekton Dashboard back end which includes the 
namespace and version of each of Tekton Dashboard, Pipelines, and Triggers.

Example payload response is formatted as so:

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

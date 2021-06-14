# Tekton Dashboard - Backend API


The backend API provides the following endpoints:

__GET endpoints__

__Extensions__
```
GET /v1/extensions
```

- Get all extensions in the given namespace
- Returns HTTP code 500 if an error occurred getting the extensions
- Returns HTTP code 200 and the given extensions in the given namespace if found, 
  otherwise an empty list is returned

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

This sample shows how to extend the tekton dashboard using the extension mechanism.  This sample extension is intended just to illustrate the mechanism. See the 'experimental' repository (https://github.com/tektoncd/experimental) for more extensions.

## Build sample extension image 

```
cd docs/samples/extension
docker build -t sampleextension .
```
## Push the sample container image to the registry (like dockerhub)
```
docker login --  if necessary
docker tag sampleextension:latest <image name>:<image tag>  -- docker hub case: <image name>: <your dockerhub id>/sampleextension
docker push <image name>:<image tag>
```

## Deploy the sample extension

Edit config tekton-extension-sample.yaml  -- replace "image name" and "image tag"

```
kubectl apply -f config -n <dashboard installed namespace>
```

## Restart dashboard and port forwarding

### Restart tekton-dashboard pod
```
kubectl delete pod $(kubectl get pod -l app=tekton-dashboard -o name -n <dashboard installed namespace>) -n <dashboard installed namespace>
```
### Restart port forwading
```
kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name -n <dashboard installed namespace>) 9097:9097 -n <dashboard installed namespace>
```

## Access to the dashboard REST API
```
http://localhost:9097/v1/extensions/
```
### Output:
```
[
 {
  "name": "dashboard-extension",
  "url": "sample",
  "port": "3000",
  "displayname": "tekton_dashboard_extension",
  "bundlelocation": "/bundle"
 }
]
```
## Access to the extension
```
http://localhost:9097/extensions/dashboard-extension/sample
```
### Output:
```
Hello tekton dashboard!!  Here is /sample
```

## Kubernetes Resources Extensions

The sample [Here](https://github.com/tektoncd/dashboard/tree/master/docs/samples/extension/config/tekton-kubernetes-resource-extension-sample.yaml) adds kubernetes 
deployments as an extension resource. Once applied the dashboard will include `k8s deployments` as an option on the left nav.

Note: This sample does not include RBAC and Service Service Account bindings. This example reuses access to deployment 
resources which the dashboard service account already has. For different resource types a role binding may need to be applied. 

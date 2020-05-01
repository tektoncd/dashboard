This sample shows how to extend the Tekton Dashboard using the extension mechanism. 

This sample extension is intended just to illustrate the mechanism. See the 'experimental' repository (https://github.com/tektoncd/experimental) for more extensions.

This example assumes you've installed the Tekton Dashboard into the `tekton-pipelines` namespace and you're pushing the sample image to Dockerhub.

## Build sample extension image 

```
cd docs/samples/extension
docker build -t <dockerhubusername>/sample-extension:latest .
docker push <dockerhubusername>/sample-extension:latest
```

## Deploy the sample extension

Edit `config/tekton-extension-sample.yaml` replacing the Dockerhub username value

```
kubectl apply -f config
```

## Port-forward the Tekton Dashboard pod

```
kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097
```

## Access the Tekton Dashboard REST API to view a list of known extensions

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
## Access the extension
```
http://localhost:9097/v1/extensions/dashboard-extension/sample
```

### Output:
```
Hello Tekton Dashboard! Here is the extension sample.
```

## Cleanup

```
kubectl delete -f config
```

## Kubernetes resources extension

The sample [here](https://github.com/tektoncd/dashboard/tree/master/docs/samples/extension/config/tekton-kubernetes-resource-extension-sample.yaml) adds Kubernetes deployments as an extension resource. 

Once applied the Tekton Dashboard will include `k8s deployments` as an option on the left nav.

**RBAC**: Tekton Dashboard cluster role is extended using [ClusterRole aggregation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#aggregated-clusterroles). The extension adds the necessary permissions by creating its own `ClusterRole` and setting the `rbac.dashboard.tekton.dev/aggregate-to-dashboard: "true"` label.

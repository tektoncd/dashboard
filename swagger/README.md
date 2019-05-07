# Tekton dashboard REST API - Open API

The API definitions are in tekton-dashboard-api.yaml file

# build
```
docker build -t tekton-dashboard-swagger .
docker tag tekton-dashboard-swagger:latest <image name>:<image tag>
docker push  <image name>:<image tag>
```
# deploy 
```
edit <image name> and <image tag> in config/tekton-dashboard-swagger.yaml
kubectl apply -f config
```
# access
```
<dashboard URL>/v1/extension/dashboard-swagger
```
# Securing the dashboard

The following page describes some ways to secure the dashboard.

## Basic Authentication on Istio with Envoy Filter
When you are using Istio there is a way of introducing an envoy filter which contains
a way of introducing basic authentication for a certain domain and path.

This assumes you have the dashboard exposed through the istio ingress on "example.com/build".
The following sample was made for and tested on the following bits. This could need some tweaking
in other cases.

- Istio 1.5.2 (default profile).
- Kubernetes 1.18.2 with calico.

You can apply it like any other k8s files like this:

```kubectl apply -f ./envoyfilter.yml```

Deleting it again goes like this:

```kubectl delete -n istio-system envoyfilter basic-auth-tekton-dashboard```

The file contents of "envoyfilter.yml" should be like this:
```
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: basic-auth-tekton-dashboard
  namespace: istio-system
spec:
  workloadLabels:
    app: istio-ingressgateway
  filters:
  - listenerMatch:
      listenerType: GATEWAY
    filterType: HTTP
    filterName: envoy.lua
    filterConfig:
      inlineCode: |
        -- the following domain and path can be adjusted
        -- to be where the tekton dashboard resides
        local domain = "example.com"
        local path = "/build/"

        -- base64 encoded: <username>:<password>
        -- example: ok:test2
        -- Change it to whatever you would like
        local base64UsernamePassword = "Basic b2s6dGVzdDI=" 

        function string.starts(String,Start)
          return string.sub(String,1,string.len(Start))==Start
        end

        function envoy_on_request(request_handle)
          local host = request_handle:headers():get(":authority")
          local path = request_handle:headers():get(":path")
          if ( host ~= nil and host:lower() == domain )
          then
            if ( path ~= nil and string.starts(path:lower(), path) )
            then
              if request_handle:headers():get("authorization") == base64UsernamePassword
              then
                return
              end
              request_handle:respond(
                {[":status"] = "401", ["WWW-Authenticate"] = "Basic realm=\"Unknown\""}, "Unauthorized"
              )
            end
          end
        end
```

### Exposing the dashboard on the istio ingress
Exposing the dashboard on the istio ingress is rather situation specific, but the example below could be used as a starter for the above envoyfilter.

```
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: example-com-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: "cert-credential"
      minProtocolVersion: TLSV1_2
      maxProtocolVersion: TLSV1_3
    hosts:
    - "example.com"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: tekton-dashboard-vs
  namespace: tekton-pipelines
spec:
  hosts:
  - "example.com"
  gateways:
  - istio-system/example-com-gateway
  http:
  - match:
    - uri:
        prefix: /build/
    rewrite:
      uri: /
    route:
    - destination:
        host: tekton-dashboard
        port:
          number: 9097
```


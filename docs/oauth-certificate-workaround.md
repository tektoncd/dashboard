# 500 Internal Error page when accessing the dashboard on OpenShift

If the default ingress certificate in the OpenShift cluster was changed, then the certificate the OpenShift OAuth server uses might no longer be recognized automatically by the `oauth-proxy` container deployed as a sidecar with the dashboard. In this situation, you may see a "500 Internal Error" page when trying to access the dashboard, with an error message containing "certificate signed by unknown authority". The logs of the `oauth-proxy` container might also show errors like this:
```
2020/07/07 11:12:13 oauthproxy.go:645: error redeeming code (client: [ IP address elided ]): Post https://oauth-openshift.apps.[ url elided ]/oauth/token: x509: certificate signed by unknown authority
2020/07/07 11:12:13 oauthproxy.go:438: ErrorPage 500 Internal Error Internal Error
```

## Workaround

OpenShift can populate a ConfigMap containing certificates that should be trusted by applications in the cluster. More information on that proccess can be found here: https://docs.openshift.com/container-platform/4.3/networking/configuring-a-custom-pki.html#certificate-injection-using-operators_configuring-a-custom-pki.

To create that ConfigMap, create a file named "ocp-ca-bundle-configmap.yaml" with these contents:
```
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    config.openshift.io/inject-trusted-cabundle: "true"
  name: ocp-ca-bundle
  namespace: tekton-pipelines
```

And apply it to the cluster via `oc create -f ocp-ca-bundle-configmap.yaml`.

Then, create a file named "dashboard-patch.yaml" with these contents:
```
spec:
  template:
    spec:
      containers:
        - name: oauth-proxy
          args:
            - --https-address=:8443
            - --provider=openshift
            - --skip-provider-button=true
            - --openshift-service-account=tekton-dashboard
            - --upstream=http://localhost:9097
            - --tls-cert=/etc/tls/private/tls.crt
            - --tls-key=/etc/tls/private/tls.key
            - --cookie-secret=SECRET
            - --skip-auth-regex=^/v1/extensions/.*\.js
            - --openshift-ca=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
            - --openshift-ca=/etc/ocp-injected-certs/tls-ca-bundle.pem
          volumeMounts:
            - mountPath: /etc/ocp-injected-certs
              name: ocp-injected-certs
      volumes:
        - name: ocp-injected-certs
          configMap:
            name: ocp-ca-bundle
            defaultMode: 420
            items:
            - key: ca-bundle.crt
              path: tls-ca-bundle.pem
```

And apply it to the dashboard deployment via:
```
oc -n tekton-pipelines patch deployment tekton-dashboard --patch "$(cat dashboard-patch.yaml)" 
```

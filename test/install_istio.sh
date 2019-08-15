#!/bin/bash

# Knative does not bundle Istio as of 0.6
# Installation instructions: https://knative.dev/docs/install/installing-istio/

# Download and unpack Istio
export ISTIO_VERSION=$1
curl -L https://git.io/getLatestIstio | ISTIO_VERSION=$ISTIO_VERSION sh -
cd istio-${ISTIO_VERSION}

for i in install/kubernetes/helm/istio-init/files/crd*yaml; do kubectl apply -f $i; done

sleep 5

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: istio-system
  labels:
    istio-injection: disabled
EOF

# A lighter template, with just pilot/gateway.
# Based on install/kubernetes/helm/istio/values-istio-minimal.yaml
helm template --namespace=istio-system \
--set prometheus.enabled=false \
--set mixer.enabled=false \
--set mixer.policy.enabled=false \
--set mixer.telemetry.enabled=false \
`# Pilot doesn't need a sidecar.` \
--set pilot.sidecar=false \
`# Disable galley (and things requiring galley).` \
--set galley.enabled=false \
--set global.useMCP=false \
`# Disable security / policy.` \
--set security.enabled=false \
--set global.disablePolicyChecks=true \
`# Disable sidecar injection.` \
--set sidecarInjectorWebhook.enabled=false \
--set global.proxy.autoInject=disabled \
--set global.omitSidecarInjectorConfigMap=true \
`# Set gateway pods to 1 to sidestep eventual consistency / readiness problems.` \
--set gateways.istio-ingressgateway.autoscaleMin=1 \
--set gateways.istio-ingressgateway.autoscaleMax=1 \
`# Set pilot trace sampling to 100%` \
--set pilot.traceSampling=100 \
install/kubernetes/helm/istio \
> ./istio-lean.yaml

kubectl apply -f istio-lean.yaml
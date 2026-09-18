#!/usr/bin/env bash
#
# Idempotent bring-up script for the Results-API history hackathon demo.
# Creates a kind cluster and installs Tekton Pipelines, Tekton Results
# (with in-cluster Postgres + self-signed TLS), a fake external-logs
# server, and this repo's Dashboard fork, then seeds a few demo
# PipelineRuns.
#
# Usage:
#   hack/setup-kind.sh create   # default: create/update everything
#   hack/setup-kind.sh delete   # tear down the kind cluster
#
# Safe to re-run: every step is either a `kubectl apply` or explicitly
# checks for existing state before creating it.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER_NAME="tekton-results-demo"
KUBERNETES_NODE_IMAGE="docker.io/kindest/node:v1.35.0@sha256:452d707d4862f52530247495d180205e029056831160e22870e37e3f6c1ac31f"

PIPELINES_VERSION="v1.6.6"
PIPELINES_RELEASE_URL="https://infra.tekton.dev/tekton-releases/pipeline/previous/${PIPELINES_VERSION}/release.yaml"
RESULTS_RELEASE_URL="https://infra.tekton.dev/tekton-releases/results/latest/release.yaml"

RESULTS_NAMESPACE="tekton-pipelines"
DEMO_NAMESPACE="default"
RESULTS_READER_SA="results-demo-reader"

GENERATED_DIR="${REPO_ROOT}/hack/.generated"

header() {
  local msg="==== $1 ===="
  echo -e "\n${msg}\n"
}

wait_for_deployment() {
  local ns="$1" name="$2" timeout="${3:-180s}"
  kubectl -n "$ns" rollout status deployment/"$name" --timeout="$timeout"
}

create_cluster() {
  header "kind cluster: ${CLUSTER_NAME}"
  if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
    echo "cluster ${CLUSTER_NAME} already exists, reusing it"
    kind export kubeconfig --name "${CLUSTER_NAME}"
    return
  fi
  kind create cluster --name "${CLUSTER_NAME}" --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: ${KUBERNETES_NODE_IMAGE}
EOF
}

install_pipelines() {
  header "Tekton Pipelines ${PIPELINES_VERSION}"
  kubectl apply --filename "${PIPELINES_RELEASE_URL}"
  # Use rollout status (targets an already-applied Deployment) rather than
  # `kubectl wait --for=condition=ready pod --selector=...`: right after
  # apply, no pod matching the selector exists yet, and some kubectl
  # versions treat that as an immediate "no matching resources found"
  # error instead of waiting for one to appear.
  wait_for_deployment tekton-pipelines tekton-pipelines-controller
  wait_for_deployment tekton-pipelines tekton-pipelines-webhook

  # The Pipelines release manifest creates tekton-pipelines with
  # pod-security.kubernetes.io/enforce=restricted. Results' own manifests
  # are restricted-compliant, but the unmodified Dashboard Deployment
  # (config/300-deployment.yaml) ships with no securityContext at all, so
  # it (and our fake-logs-server) would be rejected by admission. Relaxing
  # enforcement on this one namespace in our own throwaway kind cluster is
  # simpler than patching manifests in two repos for a 3-day demo.
  kubectl label namespace tekton-pipelines pod-security.kubernetes.io/enforce=privileged --overwrite
}

ensure_results_secrets() {
  header "Tekton Results secrets (postgres credentials + self-signed TLS)"
  mkdir -p "${GENERATED_DIR}"

  if ! kubectl -n "${RESULTS_NAMESPACE}" get secret tekton-results-postgres >/dev/null 2>&1; then
    local pw_file="${GENERATED_DIR}/postgres-password"
    if [ ! -f "${pw_file}" ]; then
      openssl rand -base64 20 > "${pw_file}"
    fi
    kubectl create secret generic tekton-results-postgres \
      --namespace="${RESULTS_NAMESPACE}" \
      --from-literal=POSTGRES_USER=postgres \
      --from-literal=POSTGRES_PASSWORD="$(cat "${pw_file}")"
  else
    echo "secret tekton-results-postgres already exists, leaving it alone"
  fi

  if ! kubectl -n "${RESULTS_NAMESPACE}" get secret tekton-results-tls >/dev/null 2>&1; then
    local cert_dir="${GENERATED_DIR}/tls"
    mkdir -p "${cert_dir}"
    openssl req -x509 \
      -newkey rsa:4096 \
      -keyout "${cert_dir}/key.pem" \
      -out "${cert_dir}/cert.pem" \
      -days 365 \
      -nodes \
      -subj "/CN=tekton-results-api-service.${RESULTS_NAMESPACE}.svc.cluster.local" \
      -addext "subjectAltName=DNS:tekton-results-api-service.${RESULTS_NAMESPACE}.svc.cluster.local"
    kubectl create secret tls -n "${RESULTS_NAMESPACE}" tekton-results-tls \
      --cert="${cert_dir}/cert.pem" \
      --key="${cert_dir}/key.pem"
  else
    echo "secret tekton-results-tls already exists, leaving it alone"
  fi
}

install_results() {
  header "Tekton Results"
  # Namespace tekton-pipelines must already exist (created by the Pipelines
  # install above) and LOGS_API=false is already the release manifest's
  # default -- we serve logs from the external-logs endpoint, not Results.
  kubectl apply --filename "${RESULTS_RELEASE_URL}"
  kubectl -n "${RESULTS_NAMESPACE}" rollout status statefulset/tekton-results-postgres --timeout=180s
  wait_for_deployment "${RESULTS_NAMESPACE}" tekton-results-api
  wait_for_deployment "${RESULTS_NAMESPACE}" tekton-results-watcher
}

setup_results_reader_token() {
  header "Results API reader ServiceAccount"
  kubectl create serviceaccount "${RESULTS_READER_SA}" -n "${DEMO_NAMESPACE}" \
    --dry-run=client -o yaml | kubectl apply -f -
  kubectl create clusterrolebinding "${RESULTS_READER_SA}-binding" \
    --clusterrole=tekton-results-readonly \
    --serviceaccount="${DEMO_NAMESPACE}:${RESULTS_READER_SA}" \
    --dry-run=client -o yaml | kubectl apply -f -
}

deploy_fake_logs_server() {
  header "fake external-logs server"
  kubectl create configmap fake-logs-server-script -n "${RESULTS_NAMESPACE}" \
    --from-file=server.py="${REPO_ROOT}/hack/fake-logs-server.py" \
    --dry-run=client -o yaml | kubectl apply -f -

  cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fake-logs-server
  namespace: ${RESULTS_NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fake-logs-server
  template:
    metadata:
      labels:
        app: fake-logs-server
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: server
          image: python:3.12-alpine
          command: ["python3", "/srv/server.py"]
          ports:
            - containerPort: 8080
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
          volumeMounts:
            - name: script
              mountPath: /srv
      volumes:
        - name: script
          configMap:
            name: fake-logs-server-script
---
apiVersion: v1
kind: Service
metadata:
  name: fake-logs-server
  namespace: ${RESULTS_NAMESPACE}
spec:
  selector:
    app: fake-logs-server
  ports:
    - port: 8080
      targetPort: 8080
EOF
  wait_for_deployment "${RESULTS_NAMESPACE}" fake-logs-server
}

install_dashboard() {
  header "Tekton Dashboard (this fork)"
  local external_logs_url="http://fake-logs-server.${RESULTS_NAMESPACE}.svc.cluster.local:8080/logs"
  local results_api_url="https://tekton-results-api-service.${RESULTS_NAMESPACE}.svc.cluster.local:8080"
  ( cd "${REPO_ROOT}" && \
    KO_DOCKER_REPO=kind.local KIND_CLUSTER_NAME="${CLUSTER_NAME}" \
    ./scripts/installer install --log-format console \
      --external-logs "${external_logs_url}" \
      --results-api "${results_api_url}" )
  # Dashboard installs into tekton-pipelines by default (installer's
  # INSTALL_NAMESPACE), not the "tekton-dashboard" namespace named in the
  # template manifest -- that name gets sed-replaced at install time.
  wait_for_deployment "${RESULTS_NAMESPACE}" tekton-dashboard
}

seed_pipelineruns() {
  header "seeding demo PipelineRuns"
  kubectl apply -n "${DEMO_NAMESPACE}" -f "${REPO_ROOT}/hack/seed-pipelineruns.yaml"

  for run in demo-run-1 demo-run-2 demo-run-3 demo-run-4; do
    echo "waiting for ${run} to finish..."
    local elapsed=0
    while true; do
      status="$(kubectl -n "${DEMO_NAMESPACE}" get pipelinerun "${run}" \
        -o jsonpath='{.status.conditions[0].status}' 2>/dev/null || true)"
      if [ "${status}" = "True" ] || [ "${status}" = "False" ]; then
        reason="$(kubectl -n "${DEMO_NAMESPACE}" get pipelinerun "${run}" \
          -o jsonpath='{.status.conditions[0].reason}')"
        echo "  ${run}: status=${status} reason=${reason}"
        break
      fi
      sleep 5
      elapsed=$((elapsed + 5))
      if [ "${elapsed}" -ge 300 ]; then
        echo "  ${run}: timed out waiting for completion" >&2
        break
      fi
    done
  done
}

print_summary() {
  header "done"
  cat <<EOF
kind cluster:         ${CLUSTER_NAME}
Pipelines namespace:  tekton-pipelines
Results namespace:    ${RESULTS_NAMESPACE}
Dashboard namespace:  ${RESULTS_NAMESPACE} (tekton-pipelines, installer's default INSTALL_NAMESPACE)
Demo runs namespace:  ${DEMO_NAMESPACE}

Next steps for manual verification:
  kubectl port-forward -n ${RESULTS_NAMESPACE} svc/tekton-results-api-service 8080:8080
  TOKEN=\$(kubectl create token ${RESULTS_READER_SA} -n ${DEMO_NAMESPACE})
  curl -sk -H "Authorization: Bearer \${TOKEN}" \\
    "https://localhost:8080/apis/results.tekton.dev/v1alpha2/parents/${DEMO_NAMESPACE}/results/-/records?filter=data_type==%22tekton.dev/v1.PipelineRun%22"

  kubectl port-forward -n ${RESULTS_NAMESPACE} svc/tekton-dashboard 8080:9097
  # open http://localhost:8080
EOF
}

delete_cluster() {
  kind delete cluster --name "${CLUSTER_NAME}"
}

case "${1:-create}" in
  create)
    create_cluster
    install_pipelines
    ensure_results_secrets
    install_results
    setup_results_reader_token
    deploy_fake_logs_server
    install_dashboard
    seed_pipelineruns
    print_summary
    ;;
  delete)
    delete_cluster
    ;;
  *)
    echo "usage: $0 [create|delete]" >&2
    exit 1
    ;;
esac

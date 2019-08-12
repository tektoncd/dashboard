#!/bin/bash

# path to dashboard repo
export REPO_TOP_LEVEL=$(git rev-parse --show-toplevel)
# path to cert, keys, script & yaml file
export INGRESS_DIR=${REPO_TOP_LEVEL}"/ingress"

# certificate data
# *Make sure names contain only lowercase alphanumeric characters, . or -. Must start & end with alphanumeric characters*
export CERTIFICATE_KEY=""
export CERTIFICATE_KEY_PASSPHRASE=""
export CERTIFICATE_NAME=""
export CERTIFICATE_SECRET_NAME=""
export IP_ADDRESS=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')
export URL="tekton-dashboard.${IP_ADDRESS}.nip.io"
# optional certificate information
export COUNTRY=""
export STATE=""
export LOCATION=""
export ORGANIZATION=""
export ORGANIZATIONAl_UNIT=""
export COMMON_NAME=$URL

# delete the current route if one is created otherwise comment out this line
oc delete $(oc get route -o name -n tekton-pipelines) -n tekton-pipelines

# create a private key for the CA & add passphrase
openssl genrsa -des3 -out ${INGRESS_DIR}/$CERTIFICATE_KEY.pem -passout pass:${CERTIFICATE_KEY_PASSPHRASE} 2048

# generate the root CA
openssl req -x509 -new -nodes -key ${INGRESS_DIR}/${CERTIFICATE_KEY}.pem -sha256 -days 1825 -out ${INGRESS_DIR}/${CERTIFICATE_NAME}.pem -passin pass:${CERTIFICATE_KEY_PASSPHRASE} -subj /C=${COUNTRY}/ST=${STATE}/L=${LOCATION}/O=${ORGANIZATION}/OU=${ORGANIZATIONAl_UNIT}/CN=${COMMON_NAME}

# for some reason the key wasn't being parsed when trying to create it with oc so this command fixes it
openssl rsa -in ${INGRESS_DIR}/${CERTIFICATE_KEY}.pem -out ${INGRESS_DIR}/${CERTIFICATE_KEY}.pem -passin pass:${CERTIFICATE_KEY_PASSPHRASE}

# create the secret
oc create secret tls ${CERTIFICATE_SECRET_NAME} --cert=${INGRESS_DIR}/${CERTIFICATE_NAME}.pem --key=${INGRESS_DIR}/${CERTIFICATE_KEY}.pem -n tekton-pipelines

# populate variables in https-ingress & apply yaml file:
envsubst < ${INGRESS_DIR}/https-ingress.yaml | kubectl apply -f -

echo "Done. Now access the host with https://"${URL}

<!--
---
title: "Getting started with Tekton Dashboard"
linkTitle: "Tutorial"
weight: 1
description: >
  Set up the Tekton Dashboard and explore some of its features
---
-->

This tutorial shows you how to 

1. Create a Kubernetes cluster with [minikube](https://minikube.sigs.k8s.io/)
1. Install Tekton Pipelines and Tekton Dashboard
1. Import some Tekton resources
1. Create a TaskRun and monitor its logs
1. Create a PipelineRun and monitor its logs

> [!CAUTION]
> This tutorial describes setting dashboard up in READ-WRITE mode.
>
> Anyone who can access the dashboard can use the permissions granted to the service account.
> Make sure to take [additional precautions](/docs/install.md#access-control)
> if your deployment is publicly accessible.
>
> READ-WRITE mode is not a requirement for dashboard to operate, and can be
> [installed in READ-ONLY mode](/docs/install.md#installing-tekton-dashboard-on-kubernetes).

## Prerequisites

1.  [Install minikube](https://minikube.sigs.k8s.io/docs/start/). You only have
    to complete the step 1, "Installation".
1.  [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

## Create your Kubernetes cluster

Create a cluster

```bash
minikube start --profile tekton-dashboard-tutorial
```

The process takes a few seconds, you see an output similar to the following,
depending on the [minikube driver](https://minikube.sigs.k8s.io/docs/drivers/)
that you are using:

<pre>
😄  [tekton-dashboard-tutorial] minikube v1.25.2
✨  Using the docker driver based on existing profile
👍  Starting control plane node tekton-dashboard-tutorial in cluster tekton-dashboard-tutorial
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=3886MB) ...
🐳  Preparing Kubernetes v1.23.3 on Docker 20.10.12 ...
    ▪ kubelet.housekeeping-interval=5m
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "tekton-dashboard-tutorial" cluster and "default" namespace by default
</pre>

You can check that the cluster was successfully created with `kubectl`:

```bash
kubectl cluster-info
```

The output confirms that Kubernetes is running:

<pre>
Kubernetes control plane is running at https://127.0.0.1:39509
CoreDNS is running at
https://127.0.0.1:39509/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
</pre>

## Install Tekton Pipelines

1. To install the latest version of Tekton Pipelines, use `kubectl`:

   ```bash
   kubectl apply --filename \
   https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
   ```

1. Monitor the installation:

   ```bash
   kubectl get pods --namespace tekton-pipelines --watch
   ```

When all components show `Running` under the `STATUS` column the installation
is complete.

Hit *Ctrl + C* to stop monitoring.

## Install Tekton Dashboard

1. To install the latest version of Tekton Dashboard, use `kubectl`:

   ```bash
   kubectl apply --filename \
   https://storage.googleapis.com/tekton-releases/dashboard/latest/release-full.yaml
   ```

   **NOTE**: release-full.yaml [installs dashboard in READ-WRITE mode](/docs/install.md#installing-tekton-dashboard-on-kubernetes).

1. Monitor the installation:

   ```bash
   kubectl get pods --namespace tekton-pipelines --watch
   ```

When all components show `Running` under the `STATUS` column the installation
is complete.

Hit *Ctrl + C* to stop monitoring.

## Access Tekton Dashboard

The Tekton Dashboard is not exposed outside the cluster by default, but we can access it by port-forwarding to the `tekton-dashboard` Service on port 9097.

```bash
kubectl port-forward -n tekton-pipelines service/tekton-dashboard 9097:9097
```

You can now open the Dashboard in your browser at http://localhost:9097

## Grant permissions

The import must be executed using a ServiceAccount with permissions to create the resources being imported.


For this tutorial we will create a ClusterRole granting permission to create a number of Tekton resources, and a RoleBinding configuring this so that the `default` ServiceAccount in the `tekton-dashboard` namespace can create resources in the `default` namespace.

```bash
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tekton-dashboard-tutorial
rules:
  - apiGroups:
      - tekton.dev
    resources:
      - tasks
      - taskruns
      - pipelines
      - pipelineruns
    verbs:
      - get
      - create
      - update
      - patch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tekton-dashboard-tutorial
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: tekton-dashboard-tutorial
subjects:
  - kind: ServiceAccount
    name: default
    namespace: tekton-dashboard
EOF
```

## Import some Tekton resources using the Tekton Dashboard

We will import [two simple Tasks and a Pipeline definition](https://github.com/tektoncd/dashboard/tree/main/docs/tutorial) to demonstrate some of the features of the Dashboard.

1. Navigate to the 'Import resources' page in the Dashboard using the link in the main navigation
1. Fill in the form providing the following information:
   - Repository URL: `https://github.com/tektoncd/dashboard`
   - Repository path: `docs/tutorial`
   - Target namespace: `default`
     - If selecting a different value, ensure the selected ServiceAccount has permission to create resources in this namespace
1. Leave the default values for the rest of the fields
1. Click the `Import and Apply` button

### View the progress of the import

The Dashboard creates a PipelineRun to import the specified Tekton resources.

Click on the `View status of this run` link to track the status of importing the Tekton resources. Alternatively, navigate to the PipelineRuns page and click on the name of the run in the table.

The Tekton resources have been imported when the PipelineRun has completed successfully. You will see the following logs for the 'import' step:

```
pipeline.tekton.dev/hello-goodbye created
task.tekton.dev/hello created
task.tekton.dev/goodbye created

Step completed successfully
```

## Create a TaskRun

1. Navigate to the TaskRuns page using the link in the main navigation
   
   You will see the TaskRun that was created by the import process. Let's create another TaskRun using one of the Task definitions we just imported.
1. Click the Create button and fill in the form as follows:
   - Namespace: `default`
   - Task: `hello`
1. Leave the default values for the rest of the fields
1. Click the Create button to create the TaskRun

Once the TaskRun is created you will be taken to the TaskRuns page. View the logs by clicking the TaskRun name in the table.

Wait until the TaskRun has completed successfully and you will see the following logs:

```
Hello World

Step completed successfully
```

## Create a PipelineRun

Next let's create a PipelineRun using all of the resources we imported.

1. Navigate to the PipelineRuns page by clicking the link in the main navigation
1. Click the Create button

   The form is similar to the one we saw for TaskRuns. Both forms are dynamic and provide Param fields based on the selected Task / Pipeline.
1. Fill in the form with the following information:
   - Namespace: `default`
   - Pipeline: `hello-goodbye`
   - Params > hello-greeting: `Hello from the tutorial 😀`
1. Leave the default values for the rest of the fields
   > Note: If you leave the hello-greeting field empty, the default value `Hello from a Pipeline` defined in the Pipeline will be used.
1. Click the Create button to create the PipelineRun

Once the PipelineRun is created you will be taken to the PipelineRuns page. View the logs by clicking the PipelineRun name in the table. On the PipelineRun details page you will see two TaskRuns, `hello` and `goodbye`, matching the Tasks defined in our Pipeline. Each of these has a step `echo` which displays a message in the logs.

The logs for the `hello` Task display the custom message we entered in the create form earlier.

```
Hello from the tutorial 😀

Step completed successfully
```

## Cleanup

To delete the cluster that you created for this quickstart run:

```bash
minikube delete --profile tekton-dashboard-tutorial
```

The output confirms that your cluster was deleted:

<pre>
🔥  Deleting "tekton-dashboard-tutorial" in docker ...
🔥  Deleting container "tekton-dashboard-tutorial" ...
🔥  Removing /home/user/.minikube/machines/tekton-dashboard-tutorial ...
💀  Removed all traces of the "tekton-dashboard-tutorial" cluster.
</pre>

## Further reading

Try out some of our [walk-throughs](./walkthrough) for more details on deploying and configuring the
Tekton Dashboard for some common scenarios.

See [Accessing the Dashboard](./install.md#accessing-the-dashboard) for details of alternative methods of exposing the Dashboard outside the cluster, including guidance for authentication and authorization.

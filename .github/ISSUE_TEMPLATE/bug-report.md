---
name: "🐞 Bug report"
about: Create a bug report to help us improve
labels: kind/bug
---

# Expected behavior

# Actual behaviour

# Steps to reproduce the bug

1.
2.
3.

# Additional info

- Kubernetes version:

  **Output of `kubectl version`:**
  ```
  (paste your output here)
  ```

- Tekton versions:

  **Output of `tkn version` or**
  ```sh
  kubectl get deploy tekton-pipelines-controller -n tekton-pipelines -o=jsonpath="{\"Pipeline version: \"}{.metadata.labels.version}{\"\n\"}"

  kubectl get deploy tekton-triggers-controller -n tekton-pipelines -o=jsonpath="{\"Triggers version: \"}{.metadata.labels.version}{\"\n\"}"

  kubectl get deploy tekton-dashboard -n tekton-pipelines -o=jsonpath="{\"Dashboard version: \"}{.metadata.labels.version}{\"\n\"}"
  ```

  ```
  (paste your output here)
  ```

<!-- 
Add any other useful context about the problem here:
- logs from the misbehaving component (and any other relevant logs)
- resource definition (preferably in YAML format) that caused the issue, without sensitive data
- etc.
-->

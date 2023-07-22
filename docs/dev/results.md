# Tekton Dashboard - [Tekton Results](https://github.com/tektoncd/results) API support

Tekton Results aims to help users logically group CI/CD workload history and separate out long term result storage away
from the Pipeline controller. For more info information, please
see [Tekton Results](https://github.com/tektoncd/results)

Note: Dashboard for [Tekton Results](https://github.com/tektoncd/results) API support is still at early stage.

## [Tekton Results](https://github.com/tektoncd/results) supporting set-up

1. follow Tekton Results [installation instructions](https://github.com/tektoncd/results/blob/main/docs/install.md)
2. append `--enable-results` arguments to install, note that `--enable-results` override `--read-write`.

```bash
./scripts/installer install --enable-results
```

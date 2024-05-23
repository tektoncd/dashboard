# Tekton Dashboard Releases

## Release Frequency

Tekton Dashboard follows the Tekton community [release policy][release-policy]
as follows:

- Versions are numbered according to semantic versioning: `vX.Y.Z`
- A new release is produced on a monthly basis
- Four releases a year are chosen for [long term support (LTS)](https://github.com/tektoncd/community/blob/main/releases.md#support-policy).
  All remaining releases are supported for approximately 1 month (until the next
  release is produced)
    - LTS releases take place in January, April, July and October every year
    - The first Tekton Dashboard LTS release will be **v0.30.0** in October 2022
    - Releases happen towards the middle of the month, between the 13th and the
      20th, depending on week-ends and readiness

Tekton Dashboard produces nightly builds, publicly available on
`gcr.io/tekton-nightly`. 

## Release Process

Tekton Pipeline releases are made of YAML manifests and container images.
Manifests are published to cloud object-storage as well as
[GitHub][tekton-dashboard-releases]. Container images are signed by
[Sigstore][sigstore] via [Tekton Chains][tekton-chains]; signatures can be
verified through the [public key][chains-public-key] hosted by the Tekton Chains
project.

Further documentation available:

- The Tekton Dashboard [release process][release-docs]
- [Installing Tekton Dashboard][dashboard-installation]
- Standard for [release notes][release-notes-standards]

## Releases

### v0.47

- **Latest Release**: [v0.47.0][v0-47-0] (2024-05-23) ([docs][v0-47-0-docs])
- **Initial Release**: [v0.47.0][v0-47-0] (2024-05-23)
- **End of Life**: 2024-06-22
- **Patch Releases**: [v0.47.0][v0-47-0]
- **Supported Pipelines Releases**: v0.56.x LTS, v0.59.x LTS, v0.60.x
- **Supported Triggers Releases**: v0.26.x LTS, v0.27.x LTS

### v0.46 (LTS)

- **Latest Release**: [v0.46.0][v0-46-0] (2024-04-26) ([docs][v0-46-0-docs])
- **Initial Release**: [v0.46.0][v0-46-0] (2024-04-26)
- **End of Life**: 2025-04-25
- **Patch Releases**: [v0.46.0][v0-46-0]
- **Supported Pipelines Releases**: v0.56.x LTS, v0.59.x LTS
- **Supported Triggers Releases**: v0.24.x LTS, v0.26.x LTS

### v0.43 (LTS)

- **Latest Release**: [v0.43.1][v0-43-1] (2024-02-07) ([docs][v0-43-1-docs])
- **Initial Release**: [v0.43.0][v0-43-0] (2024-01-23)
- **End of Life**: 2025-01-22
- **Patch Releases**: [v0.43.0][v0-43-0], [v0.43.1][v0-43-1]
- **Supported Pipelines Releases**: v0.53.x LTS, v0.56.x LTS
- **Supported Triggers Releases**: v0.24.x LTS, v0.25.x

### v0.41 (LTS)

- **Latest Release**: [v0.41.0][v0-41-0] (2023-11-01) ([docs][v0-41-0-docs])
- **Initial Release**: [v0.41.0][v0-41-0] (2023-11-01)
- **End of Life**: 2024-10-31
- **Patch Releases**: [v0.41.0][v0-41-0]
- **Supported Pipelines Releases**: v0.50.x LTS, v0.53.x LTS
- **Supported Triggers Releases**: v0.24.x LTS, v0.25.x

### v0.38 (LTS)

- **Latest Release**: [v0.38.0][v0-38-0] (2023-07-25) ([docs][v0-38-0-docs])
- **Initial Release**: [v0.38.0][v0-38-0] (2023-07-25)
- **End of Life**: 2024-07-24
- **Patch Releases**: [v0.38.0][v0-38-0]
- **Supported Pipelines Releases**: v0.47.x LTS, v0.50.x LTS
- **Supported Triggers Releases**: v0.24.x LTS

## End of Life Releases

Older releases are EOL and available on [GitHub][tekton-dashboard-releases].


[release-policy]: https://github.com/tektoncd/community/blob/main/releases.md
[sigstore]: https://sigstore.dev
[tekton-chains]: https://github.com/tektoncd/chains
[tekton-dashboard-releases]: https://github.com/tektoncd/dashboard/releases
[chains-public-key]: https://github.com/tektoncd/chains/blob/main/tekton.pub
[release-docs]: tekton
[dashboard-installation]: docs/install.md
[release-notes-standards]:
    https://github.com/tektoncd/community/blob/main/standards.md#release-notes

[v0-47-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.47.0
[v0-46-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.46.0
[v0-43-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.43.1
[v0-43-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.43.0
[v0-41-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.41.0
[v0-38-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.38.0

[v0-47-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.47.0/docs#tekton-dashboard
[v0-46-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.46.0/docs#tekton-dashboard
[v0-43-1-docs]: https://github.com/tektoncd/dashboard/tree/v0.43.1/docs#tekton-dashboard
[v0-43-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.43.0/docs#tekton-dashboard
[v0-41-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.41.0/docs#tekton-dashboard
[v0-38-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.38.0/docs#tekton-dashboard

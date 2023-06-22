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

### v0.37

- **Latest Release**: [v0.37.0][v0-37-0] (2023-06-22) ([docs][v0-37-0-docs])
- **Initial Release**: [v0.37.0][v0-37-0] (2023-06-22)
- **End of Life**: 2023-07-21
- **Patch Releases**: [v0.37.0][v0-37-0]
- **Supported Pipelines Releases**: v0.44.x LTS, v0.47.x LTS, v0.49.x
- **Supported Triggers Releases**: v0.24.x

### v0.36

- **Latest Release**: [v0.36.1][v0-36-1] (2023-05-31) ([docs][v0-36-1-docs])
- **Initial Release**: [v0.36.0][v0-36-0] (2023-05-30)
- **End of Life**: 2023-06-29
- **Patch Releases**: [v0.36.0][v0-36-0], [v0.36.1][v0-36-1]
- **Supported Pipelines Releases**: v0.44.x LTS, v0.47.x LTS, v0.48.x
- **Supported Triggers Releases**: v0.24.x

### v0.35 (LTS)

- **Latest Release**: [v0.35.1][v0-35-1] (2023-05-31) ([docs][v0-35-1-docs])
- **Initial Release**: [v0.35.0][v0-35-0] (2023-04-25)
- **End of Life**: 2024-04-24
- **Patch Releases**: [v0.35.0][v0-35-0], [v0.35.1][v0-35-1]
- **Supported Pipelines Releases**: v0.44.x LTS, v0.47.x LTS
- **Supported Triggers Releases**: v0.23.x

### v0.32 (LTS)

- **Latest Release**: [v0.32.1][v0-32-1] (2023-05-31) ([docs][v0-32-1-docs])
- **Initial Release**: [v0.32.0][v0-32-0] (2022-12-14)
- **End of Life**: 2024-01-24
- **Patch Releases**: [v0.32.0][v0-32-0], [v0.32.1][v0-32-1]
- **Supported Pipelines Releases**: v0.41.x LTS - v0.44.x LTS
- **Supported Triggers Releases**: v0.22.x

### v0.30 (LTS)

- **Latest Release**: [v0.30.1][v0-30-1] (2023-05-31) ([docs][v0-30-1-docs])
- **Initial Release**: [v0.30.0][v0-30-0] (2022-11-01)
- **End of Life**: 2023-10-31
- **Patch Releases**: [v0.30.0][v0-30-0], [v0.30.1][v0-30-1]
- **Supported Pipelines Releases**: v0.38.x - v0.41.x LTS
- **Supported Triggers Releases**: v0.21.x

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

[v0-37-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.37.0
[v0-36-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.36.1
[v0-36-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.36.0
[v0-35-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.35.1
[v0-35-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.35.0
[v0-32-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.32.1
[v0-32-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.32.0
[v0-30-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.30.1
[v0-30-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.30.0

[v0-37-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.37.0/docs#tekton-dashboard
[v0-36-1-docs]: https://github.com/tektoncd/dashboard/tree/v0.36.1/docs#tekton-dashboard
[v0-36-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.36.0/docs#tekton-dashboard
[v0-35-1-docs]: https://github.com/tektoncd/dashboard/tree/v0.35.1/docs#tekton-dashboard
[v0-35-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.35.0/docs#tekton-dashboard
[v0-32-1-docs]: https://github.com/tektoncd/dashboard/tree/v0.32.1/docs#tekton-dashboard
[v0-32-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.32.0/docs#tekton-dashboard
[v0-30-1-docs]: https://github.com/tektoncd/dashboard/tree/v0.30.1/docs#tekton-dashboard
[v0-30-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.30.0/docs#tekton-dashboard

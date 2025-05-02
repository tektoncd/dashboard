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

Tekton Dashboard produces nightly builds, publicly available at:
- [read-only](https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/release.yaml)
- [read/write](https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/release-full.yaml)

The images for Dashboard releases are published to `ghcr.io/tektoncd/dashboard`.

Prior to 26th September 2024, nightly images were published to `gcr.io/tekton-nightly`.
For release v0.50.x and earlier, release images were published to `gcr.io/tekton-releases`.

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

### v0.57 (LTS)

- **Latest Release**: [v0.57.0][v0-57-0] (2025-05-02) ([docs][v0-57-0-docs])
- **Initial Release**: [v0.57.0][v0-57-0] (2025-05-02)
- **End of Life**: 2026-05-01
- **Patch Releases**: [v0.57.0][v0-57-0]
- **Supported Pipelines Releases**: v1.0.x LTS
- **Supported Triggers Releases**: v0.31.x LTS

### v0.54 (LTS)

- **Latest Release**: [v0.54.0][v0-54-0] (2025-01-31) ([docs][v0-54-0-docs])
- **Initial Release**: [v0.54.0][v0-54-0] (2025-01-31)
- **End of Life**: 2026-01-30
- **Patch Releases**: [v0.54.0][v0-54-0]
- **Supported Pipelines Releases**: v0.68.x LTS
- **Supported Triggers Releases**: v0.30.x LTS

### v0.52 (LTS)

- **Latest Release**: [v0.52.0][v0-52-0] (2024-10-29) ([docs][v0-52-0-docs])
- **Initial Release**: [v0.52.0][v0-52-0] (2024-10-29)
- **End of Life**: 2025-10-28
- **Patch Releases**: [v0.52.0][v0-52-0]
- **Supported Pipelines Releases**: v0.65.x LTS
- **Supported Triggers Releases**: v0.29.x LTS

### v0.49 (LTS)

- **Latest Release**: [v0.49.0][v0-49-0] (2024-07-29) ([docs][v0-49-0-docs])
- **Initial Release**: [v0.49.0][v0-49-0] (2024-07-29)
- **End of Life**: 2025-07-28
- **Patch Releases**: [v0.49.0][v0-49-0]
- **Supported Pipelines Releases**: v0.59.x LTS, v0.62.x LTS
- **Supported Triggers Releases**: v0.27.x LTS, v0.28.x

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

[v0-57-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.57.0
[v0-54-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.54.0
[v0-52-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.52.0
[v0-49-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.49.0

[v0-57-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.57.0/docs#tekton-dashboard
[v0-54-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.54.0/docs#tekton-dashboard
[v0-52-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.52.0/docs#tekton-dashboard
[v0-49-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.49.0/docs#tekton-dashboard

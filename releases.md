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

### Transition Process

Before release v0.30 Tekton Dashboard has worked on the basis of an undocumented
support period of four months, which will be maintained for the releases between
v0.27 and v0.29.

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

### v0.32 (LTS)

- **Latest Release**: [v0.32.0][v0-32-0] (2022-12-14) ([docs][v0-32-0-docs])
- **Initial Release**: [v0.32.0][v0-32-0] (2022-12-14)
- **End of Life**: 2024-01-24
- **Patch Releases**: [v0.32.0][v0-32-0]
- **Supported Pipelines Releases**: v0.41.x - v0.44.x
- **Supported Triggers Releases**: v0.22.x

### v0.30 (LTS)

- **Latest Release**: [v0.30.0][v0-30-0] (2022-11-01) ([docs][v0-30-0-docs])
- **Initial Release**: [v0.30.0][v0-30-0] (2022-11-01)
- **End of Life**: 2023-10-31
- **Patch Releases**: [v0.30.0][v0-30-0]
- **Supported Pipelines Releases**: v0.38.x - v0.41.x
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

[v0-32-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.32.0
[v0-30-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.30.0

[v0-32-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.32.0/docs#tekton-dashboard
[v0-30-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.30.0/docs#tekton-dashboard

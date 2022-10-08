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

### v0.29

- **Latest Release**: [v0.29.2][v0-29-2] (2022-09-15) ([docs][v0-29-2-docs])
- **Initial Release**: [v0.29.0][v0-29-0] (2022-09-13)
- **End of Life**: 2023-01-13
- **Patch Releases**: [v0.29.0][v0-29-0], [v0.29.1][v0-29-1], [v0.29.2][v0-29-2]

### v0.28

- **Latest Release**: [v0.28.0][v0-28-0] (2022-07-12) ([docs][v0-28-0-docs])
- **Initial Release**: [v0.28.0][v0-28-0] (2022-07-12)
- **End of Life**: 2022-11-12
- **Patch Releases**: [v0.28.0][v0-28-0]

### v0.27

- **Latest Release**: [v0.27.0][v0-27-0] (2022-06-16) ([docs][v0-27-0-docs])
- **Initial Release**: [v0.27.0][v0-27-0] (2022-06-16)
- **End of Life**: 2022-10-16
- **Patch Releases**: [v0.27.0][v0-27-0]

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

[v0-29-2]: https://github.com/tektoncd/dashboard/releases/tag/v0.29.2
[v0-29-1]: https://github.com/tektoncd/dashboard/releases/tag/v0.29.1
[v0-29-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.29.0
[v0-28-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.28.0
[v0-27-0]: https://github.com/tektoncd/dashboard/releases/tag/v0.27.0

[v0-29-2-docs]: https://github.com/tektoncd/dashboard/tree/v0.29.2/docs#tekton-dashboard
[v0-28-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.28.0/docs#tekton-dashboard
[v0-27-0-docs]: https://github.com/tektoncd/dashboard/tree/v0.27.0/docs#tekton-dashboard

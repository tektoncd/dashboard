# Tekton Dashboard <DASHBOARD_VERSION> [LTS]

This Dashboard release supports Pipelines <PIPELINES_SUPPORTED_VERSIONS>, and Triggers <TRIGGERS_SUPPORTED_VERSIONS>.

<details>
<summary><h3>Attestation</h3></summary>

The Rekor UUID for this release is `<REKOR_UUID>`

Verify that all container images in the release file are in the attestation:

```sh
RELEASE_FILE=https://infra.tekton.dev/tekton-releases/dashboard/previous/<DASHBOARD_VERSION>/release.yaml
REKOR_UUID=<REKOR_UUID>

# Obtains the list of images with sha from the attestation
REKOR_ATTESTATION_IMAGE=$(rekor-cli get --uuid "$REKOR_UUID" --format json | jq -r .Attestation | jq -r '.subject[]|select(.name | startswith("ghcr.io"))|.name + ":<DASHBOARD_VERSION>@sha256:" + .digest.sha256')

# Download the release file
curl -s -L "$RELEASE_FILE" -o release.yaml

# Match the image used in the release file to an image in the attestation
DASHBOARD_IMAGE=$(cat release.yaml | grep image: | awk -F' ' '{print $2}')
echo
printf $DASHBOARD_IMAGE
if [[ "${REKOR_ATTESTATION_IMAGE}" = "${DASHBOARD_IMAGE}" ]]; then
  echo " ===> ok"
else
  echo " ===> no match"
fi
```

</details>

> [!NOTE]
> <NOTABLE_ANNOUNCEMENTS>
> See for example https://github.com/tektoncd/dashboard/releases/tag/v0.58.0

> [!WARNING]
> <NOTABLE_ANNOUNCEMENTS>
> Deprecation announcements etc.
> See for example https://github.com/tektoncd/dashboard/releases/tag/v0.59.0

## Breaking changes / action required

- 🚨 <NOTICE_CONTENT>

## Features

- ✨ <PR_TITLE> <PR_LINK>

  [<PR_RELEASE_NOTE>]

## Fixes

- 🐛 <PR_TITLE> <PR_LINK>

  [<PR_RELEASE_NOTE>]

## Misc

- 🔨 <PR_TITLE> <PR_LINK>

  [<PR_RELEASE_NOTE>]

## Docs

- 📖 <PR_TITLE> <PR_LINK>

  [<PR_RELEASE_NOTE>]

## Thanks

Thanks to these contributors who contributed to <DASHBOARD_VERSION>!

- ❤️ @<CONTRIBUTOR_USERNAME>

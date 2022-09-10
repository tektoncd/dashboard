/*
Copyright 2019-2021 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { injectIntl } from 'react-intl';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import {
  useConfigMaps,
  usePVCs,
  useSecrets,
  useSelectedNamespace
} from '../../api';

function WorkspacesDropdown({
  intl,
  label,
  namespace: namespaceProp,
  ...rest
}) {
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceProp || selectedNamespace;

  const { data: configMaps = [], isFetchingConfigMap } = useConfigMaps({
    namespace
  });

  const { data: secrets = [], isFetchingSecrets } = useSecrets({
    namespace
  });

  const { data: pvcs = [], isFetchingPVC } = usePVCs({
    namespace
  });

  const items = configMaps
    .map(obj => {
      // eslint-disable-next-line no-param-reassign
      obj.kind = 'ConfigMap';
      return obj;
    })
    .concat(
      secrets.map(obj => {
        // eslint-disable-next-line no-param-reassign
        obj.kind = 'Secret';
        return obj;
      })
    )
    .concat(
      pvcs.map(obj => {
        // eslint-disable-next-line no-param-reassign
        obj.kind = 'PersistentVolumeClaim';
        return obj;
      })
    )
    .map(wsOption => {
      return {
        id: wsOption.metadata.name,
        value: wsOption.metadata.name,
        text: wsOption.metadata.name,
        kind: wsOption.kind
      };
    })
    .concat({
      id: 'emptyDir',
      value: 'emptyDir',
      text: 'emptyDir',
      kind: 'emptyDir'
    });

  let emptyText = intl.formatMessage({
    id: 'dashboard.workspacesDropdown.empty.allNamespaces',
    defaultMessage: 'No Workspaces found'
  });
  if (namespace !== ALL_NAMESPACES) {
    emptyText = intl.formatMessage(
      {
        id: 'dashboard.workspacesDropdown.empty.selectedNamespace',
        defaultMessage: "No Workspaces found in the ''{namespace}'' namespace"
      },
      { namespace }
    );
  }

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.workspacesDropdown.label',
      defaultMessage: 'Select Workspace'
    });

  return (
    <TooltipDropdown
      {...rest}
      emptyText={emptyText}
      items={items}
      label={labelString}
      loading={isFetchingConfigMap || isFetchingSecrets || isFetchingPVC}
    />
  );
}

WorkspacesDropdown.defaultProps = {
  titleText: 'Workspace'
};

export default injectIntl(WorkspacesDropdown);

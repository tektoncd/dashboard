/*
Copyright 2019-2022 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { usePipelines, useSelectedNamespace } from '../../api';

function PipelinesDropdown({
  disabled,
  label,
  namespace: namespaceProp,
  ...rest
}) {
  const intl = useIntl();
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceProp || selectedNamespace;

  const { data: pipelines = [], isFetching } = usePipelines(
    {
      namespace
    },
    { enabled: !disabled }
  );

  const items = pipelines.map(pipeline => pipeline.metadata.name);

  const emptyText =
    namespace === ALL_NAMESPACES
      ? intl.formatMessage({
          id: 'dashboard.pipelinesDropdown.empty.allNamespaces',
          defaultMessage: 'No Pipelines found'
        })
      : intl.formatMessage(
          {
            id: 'dashboard.pipelinesDropdown.empty.selectedNamespace',
            defaultMessage:
              "No Pipelines found in the ''{namespace}'' namespace"
          },
          { namespace }
        );

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.pipelinesDropdown.label',
      defaultMessage: 'Select Pipeline'
    });
  return (
    <TooltipDropdown
      {...rest}
      disabled={disabled}
      emptyText={emptyText}
      items={items}
      label={labelString}
      loading={isFetching}
    />
  );
}

PipelinesDropdown.defaultProps = {
  titleText: 'Pipeline'
};

export default PipelinesDropdown;

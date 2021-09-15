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
/* istanbul ignore file */

import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { ResourceDetails } from '@tektoncd/dashboard-components';

import { getViewChangeHandler } from '../../utils';
import {
  useClusterInterceptor,
  useClusterTask,
  useCustomResource,
  usePipeline,
  useTask
} from '../../api';

function useResource({ group, name, namespace, type, version }) {
  switch (type) {
    case 'clusterinterceptors':
      return useClusterInterceptor({ name });
    case 'clustertasks':
      return useClusterTask({ name });
    case 'pipelines':
      return usePipeline({ name, namespace });
    case 'tasks':
      return useTask({ name, namespace });
    default:
      return useCustomResource({ group, name, namespace, type, version });
  }
}

function CustomResourceDefinition() {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const { group, name, namespace, type, version } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const { data, error, isFetching } = useResource({
    group,
    name,
    namespace,
    type,
    version
  });

  useTitleSync({
    page: type,
    resourceName: name
  });

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ history, location })}
      resource={data}
      view={view}
    />
  );
}

export default injectIntl(CustomResourceDefinition);

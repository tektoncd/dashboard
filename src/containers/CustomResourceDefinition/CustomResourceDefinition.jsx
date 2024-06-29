/*
Copyright 2019-2024 The Tekton Authors
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

import {
  useLocation,
  useMatches,
  useNavigate,
  useParams
} from 'react-router-dom';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { ResourceDetails } from '@tektoncd/dashboard-components';

import { getViewChangeHandler } from '../../utils';
import { useResource } from '../../api/utils';

function CustomResourceDefinition() {
  const location = useLocation();
  const navigate = useNavigate();

  const matches = useMatches();
  const params = useParams();

  const { name, namespace } = params;
  const match = matches.at(-1);
  let { group, kind, version } = match.handle || {};

  if (!(group && kind && version)) {
    // we're on a kubernetes resource extension page
    // grab values directly from the URL
    ({ group, kind, version } = params);
  }

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const { data, error, isFetching } = useResource({
    group,
    kind,
    params: {
      name,
      namespace
    },
    version
  });

  useTitleSync({
    page: kind,
    resourceName: name
  });

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ location, navigate })}
      resource={data}
      view={view}
    />
  );
}

export default CustomResourceDefinition;

/*
Copyright 2021-2024 The Tekton Authors
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

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { ResourceDetails, Trigger } from '@tektoncd/dashboard-components';

import { useTrigger } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function TriggerContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { triggerName, namespace } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'Trigger',
    resourceName: triggerName
  });

  const {
    data: trigger,
    error,
    isFetching
  } = useTrigger({
    name: triggerName,
    namespace
  });

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ location, navigate })}
      resource={trigger}
      view={view}
    >
      {trigger?.spec && (
        <div className="tkn--resourcedetails-metadata">
          <Trigger namespace={namespace} trigger={trigger} />
        </div>
      )}
    </ResourceDetails>
  );
}

export default TriggerContainer;

/*
Copyright 2020-2024 The Tekton Authors
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

import { useIntl } from 'react-intl';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { useSelectedNamespace, useTasks } from '../../api';

function TasksDropdown({
  label,
  namespace: namespaceProp,
  titleText = 'Task',
  ...rest
}) {
  const intl = useIntl();
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceProp || selectedNamespace;

  const { data: tasks = [], isFetching } = useTasks({ namespace });

  const items = tasks.map(task => task.metadata.name);

  const emptyText =
    namespace === ALL_NAMESPACES
      ? intl.formatMessage({
          id: 'dashboard.tasksDropdown.empty.allNamespaces',
          defaultMessage: 'No Tasks found'
        })
      : intl.formatMessage(
          {
            id: 'dashboard.tasksDropdown.empty.selectedNamespace',
            defaultMessage: "No Tasks found in the ''{namespace}'' namespace"
          },
          { namespace }
        );

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.tasksDropdown.label',
      defaultMessage: 'Select Task'
    });

  return (
    <TooltipDropdown
      {...rest}
      emptyText={emptyText}
      items={items}
      label={labelString}
      loading={isFetching}
      titleText={titleText}
    />
  );
}

export default TasksDropdown;

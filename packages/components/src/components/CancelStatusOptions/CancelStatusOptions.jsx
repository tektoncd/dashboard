/*
Copyright 2025 The Tekton Authors
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

import { RadioTile, TileGroup } from '@carbon/react';
import { useIntl } from 'react-intl';

export default function CancelStatusOptions({
  cancelStatus,
  onChangeCancelStatus
}) {
  const intl = useIntl();

  return (
    <TileGroup
      legend={intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
      })}
      name="cancelStatus-group"
      valueSelected={cancelStatus}
      onChange={status => onChangeCancelStatus(status)}
    >
      <RadioTile name="cancelStatus" value="Cancelled">
        <span>Cancelled</span>
        <p className="tkn--tile--description">
          {intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.cancelled.description',
            defaultMessage:
              'Interrupt any currently executing tasks and skip finally tasks'
          })}
        </p>
      </RadioTile>
      <RadioTile name="cancelStatus" value="CancelledRunFinally">
        <span>CancelledRunFinally</span>
        <p className="tkn--tile--description">
          {intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.cancelledRunFinally.description',
            defaultMessage:
              'Interrupt any currently executing non-finally tasks, then execute finally tasks'
          })}
        </p>
      </RadioTile>
      <RadioTile name="cancelStatus" value="StoppedRunFinally">
        <span>StoppedRunFinally</span>
        <p className="tkn--tile--description">
          {intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.stoppedRunFinally.description',
            defaultMessage:
              'Allow any currently executing tasks to complete but do not schedule any new non-finally tasks, then execute finally tasks'
          })}
        </p>
      </RadioTile>
    </TileGroup>
  );
}

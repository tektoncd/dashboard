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

import { useIntl } from 'react-intl';
import FormattedDate from '../FormattedDate';
import FormattedDuration from '../FormattedDuration';

export default function RunTimeMetadata({ lastTransitionTime, duration }) {
  const intl = useIntl();
  return (
    <div className="tkn--run-metadata-time">
      <div className="tkn--time">
        {lastTransitionTime
          ? intl.formatMessage(
              {
                id: 'dashboard.lastUpdated',
                defaultMessage: 'Last updated {time}'
              },
              {
                time: <FormattedDate date={lastTransitionTime} relative />
              }
            )
          : null}
      </div>
      <div className="tkn--run-details-time">
        {duration
          ? intl.formatMessage(
              {
                id: 'dashboard.run.duration',
                defaultMessage: 'Duration: {duration}'
              },
              {
                duration: <FormattedDuration milliseconds={duration} />
              }
            )
          : null}
      </div>
    </div>
  );
}

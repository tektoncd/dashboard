/*
Copyright 2019 The Tekton Authors
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
import { FormattedDate, FormattedRelativeTime, injectIntl } from 'react-intl';

const FormattedDateWrapper = ({ date, intl, relative }) => {
  if (!date) {
    return null;
  }

  let content;

  if (relative && Intl.RelativeTimeFormat) {
    content = (
      <FormattedRelativeTime
        numeric="auto"
        updateIntervalInSeconds={10}
        value={(new Date(date).getTime() - Date.now()) / 1000}
      />
    );
  } else {
    content = (
      <FormattedDate
        value={date}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );
  }

  return (
    <span
      title={intl.formatDate(date, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })}
    >
      {content}
    </span>
  );
};

export default injectIntl(FormattedDateWrapper);

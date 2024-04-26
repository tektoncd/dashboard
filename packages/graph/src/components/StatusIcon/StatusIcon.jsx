/*
Copyright 2022-2024 The Tekton Authors
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

import {
  Misuse16 as FailedIcon,
  Branch16 as GitIcon,
  PendingFilled16 as PendingIcon,
  InProgress16 as RunningIcon,
  CheckmarkFilled16 as SuccessIcon,
  CheckmarkFilledWarning16 as SuccessWarningIcon,
  Timer16 as TimerIcon,
  Flash16 as TriggerIcon,
  User16 as UserIcon,
  WarningAltFilled16 as WarningIcon,
  Webhook16 as WebhookIcon
} from '@carbon/icons-react';

// TODO: need 'skipped' status (e.g. when expressions)
const statusIcons = {
  dummy: () => <></>, // eslint-disable-line react/jsx-no-useless-fragment
  failed: FailedIcon,
  git: GitIcon,
  manual: UserIcon,
  pending: PendingIcon,
  running: RunningIcon,
  success: SuccessIcon,
  'success-warning': SuccessWarningIcon,
  timer: TimerIcon,
  trigger: TriggerIcon,
  warning: WarningIcon,
  webhook: WebhookIcon
};

export default function StatusIcon({ status, title }) {
  const Icon = statusIcons[status] || PendingIcon;
  return (
    <Icon className={`status-icon status-icon-${status}`}>
      {title ? <title>{title}</title> : null}
    </Icon>
  );
}

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
  Misuse as FailedIcon,
  Branch as GitIcon,
  PendingFilled as PendingIcon,
  InProgress as RunningIcon,
  CheckmarkFilled as SuccessIcon,
  CheckmarkFilledWarning as SuccessWarningIcon,
  Timer as TimerIcon,
  Flash as TriggerIcon,
  User as UserIcon,
  WarningAltFilled as WarningIcon,
  Webhook as WebhookIcon
} from '@carbon/react/icons';

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

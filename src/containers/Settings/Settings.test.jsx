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

import { fireEvent, within } from '@testing-library/react';

import { render } from '../../utils/test';
import * as Utils from '../../utils';
import * as APIUtils from '../../api/utils';

import Settings from '.';

describe('Settings', () => {
  it('should render theme settings correctly', () => {
    vi.spyOn(Utils, 'getTheme').mockImplementation(() => 'light');
    vi.spyOn(Utils, 'setTheme');

    const { getByText } = render(<Settings />);

    expect(getByText(/settings/i)).toBeTruthy();
    expect(getByText(/theme/i)).toBeTruthy();
    expect(
      getByText(/light/i).parentNode.className.includes('selected')
    ).toBeTruthy();

    fireEvent.click(getByText(/dark/i));
    expect(Utils.setTheme).toHaveBeenCalledWith('dark');
  });

  it('should render the log timestamp settings correctly', () => {
    vi.spyOn(APIUtils, 'isLogTimestampsEnabled').mockImplementation(() => true);
    vi.spyOn(APIUtils, 'setLogTimestampsEnabled');

    const { getByRole } = render(<Settings />);

    const logTimestampToggle = getByRole('switch', {
      name: /show log timestamps/i
    });
    expect(logTimestampToggle).toBeTruthy();
    expect(within(logTimestampToggle.parentNode).getByText('On')).toBeTruthy();
    fireEvent.click(logTimestampToggle);
    expect(APIUtils.setLogTimestampsEnabled).toHaveBeenCalledWith(false);
  });

  it('should render the v1 API settings correctly', () => {
    vi.spyOn(APIUtils, 'isPipelinesV1ResourcesEnabled').mockImplementation(
      () => true
    );
    vi.spyOn(APIUtils, 'setPipelinesV1ResourcesEnabled');

    const { getByRole } = render(<Settings />);

    const apiVersionToggle = getByRole('switch', { name: /api version v1/i });
    expect(apiVersionToggle).toBeTruthy();
    expect(within(apiVersionToggle.parentNode).getByText('On')).toBeTruthy();
    fireEvent.click(apiVersionToggle);
    expect(APIUtils.setPipelinesV1ResourcesEnabled).toHaveBeenCalledWith(false);
  });
});

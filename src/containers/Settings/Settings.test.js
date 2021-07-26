/*
Copyright 2021 The Tekton Authors
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
import { fireEvent } from '@testing-library/react';

import { render } from '../../utils/test';
import * as Utils from '../../utils';
import * as APIUtils from '../../api/utils';

import Settings from '.';

describe('Settings', () => {
  it('should render theme settings correctly', () => {
    jest.spyOn(Utils, 'getTheme').mockImplementation(() => 'light');
    jest.spyOn(Utils, 'setTheme');

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
    jest
      .spyOn(APIUtils, 'isLogTimestampsEnabled')
      .mockImplementation(() => true);
    jest.spyOn(APIUtils, 'setLogTimestampsEnabled');

    const { getByLabelText, getByText } = render(<Settings />);

    expect(getByText(/show log timestamps/i)).toBeTruthy();
    expect(getByText(/on/i)).toBeTruthy();
    fireEvent.click(getByLabelText(/show log timestamps/i));
    expect(APIUtils.setLogTimestampsEnabled).toHaveBeenCalledWith(false);
  });
});

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
import { fireEvent, waitForElement } from 'react-testing-library';
import { renderWithIntl } from '../../utils/test';
import CancelButton from './CancelButton';

const type = 'test';
const name = 'name';

describe('Test Button component submit', () => {
  it('Test click event', async () => {
    const onCancelSpy = jest.fn();

    const { getByText, getByTitle } = renderWithIntl(
      <CancelButton type={type} name={name} onCancel={onCancelSpy} />
    );
    fireEvent.click(getByTitle(`Stop ${type}`));
    await waitForElement(() => getByText(`Stop ${type} ${name}`));
    fireEvent.click(getByText(`Stop ${type}`));
    expect(onCancelSpy).toHaveBeenCalledWith(name);
  });
});

describe('Test Button component', () => {
  it('Test click event', async () => {
    const onCancelSpy = jest.fn();

    const { getByText, getByTitle } = renderWithIntl(
      <CancelButton type={type} name={name} onCancel={onCancelSpy} />
    );
    fireEvent.click(getByTitle(`Stop ${type}`));
    await waitForElement(() => getByText(`Stop ${type} ${name}`));
    fireEvent.click(getByText('Cancel'));
    expect(onCancelSpy).not.toHaveBeenCalled();
  });
});

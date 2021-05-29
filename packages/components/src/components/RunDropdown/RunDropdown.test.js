/*
Copyright 2019-2021 The Tekton Authors
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
import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils/test';
import RunDropdown from './RunDropdown';

const resource = {
  kind: 'test',
  name: 'resourceName'
};

describe('RunDropdown dropdown no modal', () => {
  it('RunDropdown no modal click event', async () => {
    const mockCallBack = jest.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => false,
        action: () => mockCallBack()
      }
    ];
    const { getByText, getAllByTitle } = render(
      <RunDropdown items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

describe('RunDropdown dropdown missing disable default behaviour', () => {
  it('RunDropdown missing disable default behaviour click event', async () => {
    const mockCallBack = jest.fn();
    const items = [
      {
        actionText: 'Action',
        action: () => mockCallBack()
      }
    ];
    const { getByText, getAllByTitle } = render(
      <RunDropdown items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

describe('RunDropdown disabled field', () => {
  it('RunDropdown disabled field click event', async () => {
    const mockCallBack = jest.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => true,
        action: () => mockCallBack()
      }
    ];
    const { getByText, getAllByTitle } = render(
      <RunDropdown items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).not.toHaveBeenCalled();
  });
});

describe('RunDropdown with modal', () => {
  it('RunDropdown with modal click through', async () => {
    const mockCallBack = jest.fn();
    const items = [
      {
        actionText: 'Action',
        action: () => mockCallBack(),
        disable: () => false,
        modalProperties: {
          heading: 'Modal Heading',
          primaryButtonText: 'primary',
          secondaryButtonText: 'secondary',
          body: () => 'modal body'
        }
      }
    ];
    const { getByText, getAllByTitle } = render(
      <RunDropdown items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    await waitFor(() => getByText('primary'));
    fireEvent.click(getByText(`primary`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

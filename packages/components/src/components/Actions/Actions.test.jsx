/*
Copyright 2019-2024 The Tekton Authors
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

import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils/test';
import Actions from './Actions';

const resource = {
  kind: 'test',
  name: 'resourceName'
};

describe('Actions with single action', () => {
  it('renders a Button when kind is button', () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => false,
        action: () => mockCallBack()
      }
    ];
    const { getByText } = render(
      <Actions items={items} kind="button" resource={resource} />
    );
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });

  it('renders an OverflowMenu when kind is not button', async () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => false,
        action: () => mockCallBack()
      }
    ];
    const { getByText, getAllByTitle } = render(
      <Actions items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

describe('Actions dropdown no modal', () => {
  it('Actions no modal click event', async () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => false,
        action: () => mockCallBack()
      },
      {
        actionText: 'Other',
        action: () => {}
      }
    ];
    const { getByText, getAllByTitle } = render(
      <Actions items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

describe('Actions dropdown missing disable default behaviour', () => {
  it('Actions missing disable default behaviour click event', async () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        action: () => mockCallBack()
      },
      {
        actionText: 'Other',
        action: () => {}
      }
    ];
    const { getByRole, getByText } = render(
      <Actions items={items} kind="button" resource={resource} />
    );
    fireEvent.click(getByRole('button', { name: 'Actions' }));
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

describe('Actions disabled field', () => {
  it('Actions disabled field click event', async () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        disable: () => true,
        action: () => mockCallBack()
      },
      {
        actionText: 'Other',
        action: () => {}
      }
    ];
    const { getByText, getAllByTitle } = render(
      <Actions items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    expect(mockCallBack).not.toHaveBeenCalled();
  });
});

describe('Actions with modal', () => {
  it('Actions with modal click through', async () => {
    const mockCallBack = vi.fn();
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
      },
      {
        actionText: 'Other',
        action: () => {}
      }
    ];
    const { getByText, getAllByTitle } = render(
      <Actions items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    await waitFor(() => getByText('primary'));
    getByText('secondary');
    fireEvent.click(getByText(`primary`));
    expect(mockCallBack).toHaveBeenCalled();
  });

  it('Actions with modal default button text', async () => {
    const mockCallBack = vi.fn();
    const items = [
      {
        actionText: 'Action',
        action: () => mockCallBack(),
        disable: () => false,
        modalProperties: {
          heading: 'Modal Heading',
          primaryButtonText: 'primary',
          body: () => 'modal body'
        }
      },
      {
        actionText: 'Other',
        action: () => {}
      }
    ];
    const { getByText, getAllByTitle } = render(
      <Actions items={items} resource={resource} />
    );
    fireEvent.click(getAllByTitle('Actions')[0]);
    await waitFor(() => getByText('Action'));
    fireEvent.click(getByText(`Action`));
    await waitFor(() => getByText('primary'));
    getByText('Cancel');
    fireEvent.click(getByText(`primary`));
    expect(mockCallBack).toHaveBeenCalled();
  });
});

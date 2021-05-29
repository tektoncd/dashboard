/*
Copyright 2020-2021 The Tekton Authors
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
import ResourceDetails from './ResourceDetails';

describe('ResourceDetails', () => {
  it('renders the loading state', () => {
    const { queryByText } = render(<ResourceDetails loading />);
    expect(queryByText(/overview/i)).toBeFalsy();
  });

  it('renders the error state', () => {
    const errorMessage = 'an error message';
    const { queryByText } = render(<ResourceDetails error={errorMessage} />);
    expect(queryByText(/labels/i)).toBeFalsy();
    expect(queryByText(errorMessage)).toBeTruthy();
  });

  it('renders the default content', () => {
    const name = 'fake_name';
    const namespace = 'fake_namespace';
    const resource = {
      metadata: {
        name,
        namespace
      },
      spec: {
        description: 'fake_content'
      }
    };

    const { queryByText } = render(<ResourceDetails resource={resource} />);
    expect(queryByText(/labels/i)).toBeTruthy();
    expect(queryByText(/description/i)).toBeTruthy();
    expect(queryByText(name)).toBeTruthy();
    expect(queryByText(namespace)).toBeTruthy();
  });

  it('renders custom content', () => {
    const labelKey = 'fake_label-key';
    const labelValue = 'fake_label-value';
    const name = 'fake_name';
    const namespace = 'fake_namespace';
    const resource = {
      metadata: {
        labels: {
          [labelKey]: labelValue
        },
        name,
        namespace
      }
    };

    const additionalMetadata = 'fake_additionalMetadata';
    const children = 'fake_children';

    const { queryByText } = render(
      <ResourceDetails
        resource={resource}
        additionalMetadata={additionalMetadata}
      >
        {children}
      </ResourceDetails>
    );
    expect(queryByText(/labels/i)).toBeTruthy();
    expect(queryByText(name)).toBeTruthy();
    expect(queryByText(namespace)).toBeTruthy();
    expect(queryByText(`${labelKey}: ${labelValue}`)).toBeTruthy();
    expect(queryByText(additionalMetadata)).toBeTruthy();
    expect(queryByText(children)).toBeTruthy();
  });

  it('renders the selected tab', () => {
    const name = 'fake_name';
    const namespace = 'fake_namespace';
    const resource = {
      metadata: {
        name,
        namespace
      },
      spec: {
        description: 'fake_description',
        otherContent: 'some_other_content'
      }
    };

    const onViewChange = jest.fn();

    const { queryByText } = render(
      <ResourceDetails
        onViewChange={onViewChange}
        resource={resource}
        view="yaml"
      />
    );
    waitFor(() => queryByText('otherContent'));
    fireEvent.click(queryByText(/overview/i));
    expect(onViewChange).toHaveBeenCalledWith('overview');
  });
});

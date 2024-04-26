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

import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import TriggerTemplates from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as TriggerTemplatesAPI from '../../api/triggerTemplates';

const triggerTemplate = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    creationTimestamp: '2019-11-12T19:29:46Z',
    name: 'trigger-template',
    namespace: 'default',
    uid: 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

it('TriggerTemplates renders with no templates', () => {
  vi.spyOn(TriggerTemplatesAPI, 'useTriggerTemplates').mockImplementation(
    () => ({ data: [] })
  );

  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
    data: [{ metadata: { name: 'default' } }]
  }));
  vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
    selectedNamespace: ALL_NAMESPACES
  }));

  const { queryByText } = renderWithRouter(<TriggerTemplates />, {
    path: '/triggertemplates',
    route: '/triggertemplates'
  });

  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeTruthy();
});

it('TriggerTemplates renders with one template', () => {
  vi.spyOn(TriggerTemplatesAPI, 'useTriggerTemplates').mockImplementation(
    () => ({ data: [triggerTemplate] })
  );

  const { queryByText } = renderWithRouter(<TriggerTemplates />, {
    path: '/triggertemplates',
    route: '/triggertemplates'
  });

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeFalsy();
  expect(queryByText('trigger-template')).toBeTruthy();
});

it('TriggerTemplates can be filtered on a single label filter', async () => {
  vi.spyOn(TriggerTemplatesAPI, 'useTriggerTemplates').mockImplementation(
    ({ filters }) => ({
      data: filters.length ? [] : [triggerTemplate]
    })
  );

  const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
    <TriggerTemplates />,
    { path: '/triggertemplates', route: '/triggertemplates' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByPlaceholderText(/Input a label filter/);
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('trigger-template')).toBeFalsy();
});

it('TriggerTemplates renders in loading state', () => {
  vi.spyOn(TriggerTemplatesAPI, 'useTriggerTemplates').mockImplementation(
    () => ({ isLoading: true })
  );

  const { queryByText } = renderWithRouter(<TriggerTemplates />, {
    path: '/triggertemplates',
    route: '/triggertemplates'
  });

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeFalsy();
});

it('TriggerTemplates renders in error state', () => {
  const error = 'fake_error_message';
  vi.spyOn(TriggerTemplatesAPI, 'useTriggerTemplates').mockImplementation(
    () => ({ error })
  );

  const { queryByText } = renderWithRouter(<TriggerTemplates />, {
    path: '/triggertemplates',
    route: '/triggertemplates'
  });

  expect(queryByText(error)).toBeTruthy();
});

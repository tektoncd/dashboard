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
import { Route } from 'react-router-dom';
import { fireEvent, waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { paths, urls } from '@tektoncd/dashboard-utils';

import * as API from '../../api/triggerBindings';
import { renderWithRouter } from '../../utils/test';
import { TriggerBindingContainer } from './TriggerBinding';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const namespace = 'tekton-pipelines';

const triggerBindingSimple = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerBinding',
  metadata: {
    creationTimestamp: '2019-11-19T19:44:43Z',
    name: 'trigger-binding-simple',
    namespace,
    uid: '49243595-0c72-11ea-ae12-025000000001'
  },
  spec: {
    params: [
      { name: 'param1', value: '$(body.head_commit.id)' },
      { name: 'param2', value: '$(body.repository.clone_url)' }
    ]
  }
};

const triggerBindingWithLabels = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerBinding',
  metadata: {
    labels: {
      mylabel: 'foo',
      myotherlabel: 'bar'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: 'trigger-binding-labels',
    namespace,
    uid: '49243595-0c72-11ea-ae12-025000002221'
  },
  spec: {
    params: [
      { name: 'paramLabels1', value: '$(body.head_commit.id)' },
      { name: 'paramLabels2', value: '$(body.repository.clone_url)' }
    ]
  }
};

it('TriggerBindingContainer handles error state', async () => {
  const error = 'fake_error_message';
  jest.spyOn(API, 'useTriggerBinding').mockImplementation(() => ({ error }));
  const match = {
    params: {
      triggerBindingName: 'foo'
    }
  };

  const { getByText } = renderWithRouter(
    <TriggerBindingContainer intl={intl} match={match} />
  );
  await waitFor(() => getByText('Error loading resource'));
});

it('TriggerBindingContainer renders details', async () => {
  jest
    .spyOn(API, 'useTriggerBinding')
    .mockImplementation(() => ({ data: triggerBindingSimple }));
  const match = {
    params: {
      triggerBindingName: 'trigger-binding-simple'
    }
  };

  const { getByText } = renderWithRouter(
    <TriggerBindingContainer intl={intl} match={match} />
  );

  await waitFor(() => getByText('trigger-binding-simple'));
  await waitFor(() => getByText(/param1/i));
  await waitFor(() => getByText(/param2/i));
  await waitFor(() => getByText('$(body.head_commit.id)'));
  await waitFor(() => getByText('$(body.repository.clone_url)'));
  await waitFor(() => getByText(namespace));
  await waitFor(() => getByText('None'));
});

it('TriggerBindingContainer renders YAML', async () => {
  jest
    .spyOn(API, 'useTriggerBinding')
    .mockImplementation(() => ({ data: triggerBindingSimple }));
  const triggerBindingName = 'trigger-binding-simple';

  const { getByText } = renderWithRouter(
    <Route
      path={paths.triggerBindings.byName()}
      render={props => <TriggerBindingContainer {...props} intl={intl} />}
    />,
    {
      route: urls.triggerBindings.byName({
        namespace,
        triggerBindingName
      })
    }
  );

  await waitFor(() => getByText(triggerBindingName));
  const yamlTab = getByText('YAML');
  fireEvent.click(yamlTab);
  await waitFor(() => getByText(/creationTimestamp/i));
  await waitFor(() => getByText(/spec/i));
  await waitFor(() => getByText(/params/i));
  await waitFor(() => getByText(/metadata/i));
  await waitFor(() => getByText(/TriggerBinding/i));
  await waitFor(() => getByText(/namespace/i));
});

it('TriggerBindingContainer does not render label section if they are not present', async () => {
  jest
    .spyOn(API, 'useTriggerBinding')
    .mockImplementation(() => ({ data: triggerBindingSimple }));
  const match = {
    params: {
      triggerBindingName: 'trigger-binding-simple'
    }
  };

  const { getByText } = renderWithRouter(
    <TriggerBindingContainer intl={intl} match={match} />
  );

  await waitFor(() => getByText('trigger-binding-simple'));
  await waitFor(() => getByText('None'));
});

it('TriggerBindingContainer renders labels section if they are present', async () => {
  jest
    .spyOn(API, 'useTriggerBinding')
    .mockImplementation(() => ({ data: triggerBindingWithLabels }));
  const match = {
    params: {
      triggerBindingName: 'trigger-binding-labels'
    }
  };

  const { getByText } = renderWithRouter(
    <TriggerBindingContainer intl={intl} match={match} />
  );

  await waitFor(() => getByText('trigger-binding-labels'));
  await waitFor(() => getByText('Labels:'));
  await waitFor(() => getByText(/mylabel: foo/i));
  await waitFor(() => getByText(/myotherlabel: bar/i));
});

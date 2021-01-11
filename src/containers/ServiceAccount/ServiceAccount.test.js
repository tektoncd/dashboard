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
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import { ServiceAccountContainer } from './ServiceAccount';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const namespace = 'tekton-pipelines';

const secrets = [
  {
    name: 'secret1',
    namespace
  },
  {
    name: 'imagePull1',
    namespace
  }
];

const serviceAccountName = 'service-account-simple';
const serviceAccountSimple = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-11-19T19:44:43Z',
    name: serviceAccountName,
    namespace,
    uid: '49243595-0c72-11ea-ae12-025000000001'
  }
};

const serviceAccountWithLabels = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'ServiceAccount',
  metadata: {
    labels: {
      mylabel: 'foo',
      myotherlabel: 'bar'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: 'service-account-labels',
    namespace,
    uid: '49243595-0c72-11ea-ae12-025000002221'
  }
};

it('ServiceAccountContainer renders', async () => {
  const match = {
    params: {
      serviceAccountName: 'bar'
    }
  };

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      fetchServiceAccount={() => Promise.resolve()}
      fetchSecrets={() => Promise.resolve()}
      error={null}
      loading={false}
    />
  );
  await waitFor(() => getByText('Error loading resource'));
});

it('ServiceAccountContainer handles error state', async () => {
  const match = {
    params: {
      serviceAccountName: 'foo'
    }
  };

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error="Error"
      fetchServiceAccount={() => Promise.resolve()}
      fetchSecrets={() => Promise.resolve()}
    />
  );
  await waitFor(() => getByText('Error loading resource'));
});

it('ServiceAccountContainer renders YAML', async () => {
  const { getByText } = renderWithRouter(
    <Route
      path={paths.serviceAccounts.byName()}
      render={props => (
        <ServiceAccountContainer
          {...props}
          intl={intl}
          error={null}
          fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
          fetchSecrets={() => Promise.resolve()}
          serviceAccount={serviceAccountSimple}
        />
      )}
    />,
    {
      route: urls.serviceAccounts.byName({
        namespace,
        serviceAccountName
      })
    }
  );

  await waitFor(() => getByText(serviceAccountName));
  const yamlTab = getByText(/yaml/i);
  fireEvent.click(yamlTab);
  await waitFor(() => getByText(/creationTimestamp/i));
  await waitFor(() => getByText(/metadata/i));
  await waitFor(() => getByText(/ServiceAccount/i));
  await waitFor(() => getByText(/namespace/i));
});

it('ServiceAccountContainer does not render label section if they are not present', async () => {
  const match = {
    params: {
      serviceAccountName
    }
  };

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error={null}
      fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
      fetchSecrets={() => Promise.resolve()}
      serviceAccount={serviceAccountSimple}
    />
  );

  await waitFor(() => getByText(serviceAccountName));
  await waitFor(() => getByText('None'));
});

it('ServiceAccountContainer renders labels section if they are present', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-labels'
    }
  };

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error={null}
      fetchServiceAccount={() => Promise.resolve(serviceAccountWithLabels)}
      fetchSecrets={() => Promise.resolve()}
      serviceAccount={serviceAccountWithLabels}
    />
  );

  await waitFor(() => getByText('service-account-labels'));
  await waitFor(() => getByText('Labels:'));
  await waitFor(() => getByText(/mylabel: foo/i));
  await waitFor(() => getByText(/myotherlabel: bar/i));
});

it('ServiceAccountContainer renders overview with no secret nor imagePullSecrets ', async () => {
  const match = {
    params: {
      serviceAccountName
    }
  };

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error={null}
      fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
      fetchSecrets={() => Promise.resolve()}
      serviceAccount={serviceAccountSimple}
    />
  );

  await waitFor(() => getByText(serviceAccountName));
  await waitFor(() => getByText(namespace));
  await waitFor(() => getByText('None')); // Label
  await waitFor(() => getByText('No Secrets found for this ServiceAccount.'));
  await waitFor(() =>
    getByText('No imagePullSecrets found for this ServiceAccount.')
  );
});

it('ServiceAccountContainer renders secrets', async () => {
  const match = {
    params: {
      serviceAccountName,
      namespace
    }
  };

  serviceAccountSimple.secrets = [secrets[0]];

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error={null}
      fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
      fetchSecrets={() => Promise.resolve()}
      secrets={secrets}
      serviceAccount={serviceAccountSimple}
    />
  );

  await waitFor(() => getByText(serviceAccountName));
  await waitFor(() => getByText(namespace));
  await waitFor(() => getByText('None'));
  await waitFor(() => getByText('secret1'));
  await waitFor(() =>
    getByText('No imagePullSecrets found for this ServiceAccount.')
  );
});

it('ServiceAccountContainer renders imagePullSecrets', async () => {
  const match = {
    params: {
      serviceAccountName
    }
  };

  serviceAccountWithLabels.imagePullSecrets = [secrets[1]];

  const { getByText } = renderWithRouter(
    <ServiceAccountContainer
      intl={intl}
      match={match}
      error={null}
      fetchServiceAccount={() => Promise.resolve(serviceAccountWithLabels)}
      fetchSecrets={() => Promise.resolve()}
      secrets={secrets}
      serviceAccount={serviceAccountWithLabels}
    />
  );

  await waitFor(() => getByText('service-account-labels'));
  await waitFor(() => getByText(namespace));
  await waitFor(() => getByText('imagePull1'));
  await waitFor(() => getByText('No Secrets found for this ServiceAccount.'));
});

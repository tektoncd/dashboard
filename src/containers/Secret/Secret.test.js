/*
Copyright 2020 The Tekton Authors
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
import { waitForElement } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import { SecretContainer } from './Secret';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const serviceAccounts = [
  {
    metadata: {
      name: 'serviceAccount1'
    },
    secrets: [
      {
        name: 'secret-simple'
      }
    ]
  }
];

const secret = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'Secret',
  metadata: {
    creationTimestamp: '2019-11-19T19:44:43Z',
    name: 'secret-simple',
    namespace: 'tekton-pipelines',
    uid: '49243595-0c72-11ea-ae12-025000000001'
  }
};

it('SecretContainer renders', async () => {
  const secretName = 'bar';
  const match = {
    params: {
      secretName
    }
  };

  const { getByText } = renderWithRouter(
    <SecretContainer
      intl={intl}
      match={match}
      fetchSecret={() => Promise.resolve()}
      fetchServiceAccounts={() => Promise.resolve()}
      error={null}
      loading={false}
    />
  );
  await waitForElement(() => getByText(`Secret bar not found`));
});

it('SecretContainer renders service accounts', async () => {
  const match = {
    params: {
      secretName: 'secret-simple',
      namespace: 'tekton-pipelines'
    }
  };

  const { getByText } = renderWithRouter(
    <SecretContainer
      intl={intl}
      match={match}
      error={null}
      fetchSecret={() => Promise.resolve(secret)}
      fetchServiceAccounts={() => Promise.resolve(serviceAccounts)}
      serviceAccounts={serviceAccounts}
      secret={secret}
    />
  );

  await waitForElement(() => getByText('secret-simple'));
  await waitForElement(() => getByText('tekton-pipelines'));
  await waitForElement(() => getByText('None'));
  await waitForElement(() => getByText('serviceAccount1'));
});

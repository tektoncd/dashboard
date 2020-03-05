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
import 'jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createIntl } from 'react-intl';
import { ServiceAccountContainer } from './ServiceAccount';
import { renderWithRouter } from '../../utils/test';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const secrets = [
  {
    name: 'secret1'
  },
  {
    name: 'imagePull1'
  }
];

const serviceAccountSimple = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-11-19T19:44:43Z',
    name: 'service-account-simple',
    namespace: 'tekton-pipelines',
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
    namespace: 'tekton-pipelines',
    uid: '49243595-0c72-11ea-ae12-025000002221'
  }
};

it('ServiceAccountContainer renders', async () => {
  const serviceAccountName = 'bar';
  const match = {
    params: {
      serviceAccountName
    }
  };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    namespaces: {
      selected: 'default'
    },
    ServiceAccounts: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        fetchServiceAccount={() => Promise.resolve()}
        fetchSecrets={() => Promise.resolve()}
        error={null}
        loading={false}
      />
    </Provider>
  );
  await waitForElement(() => getByText(`ServiceAccount not available`));
});

it('ServiceAccountContainer toggles between tabs correctly', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
        fetchSecrets={() => Promise.resolve()}
        serviceAccount={serviceAccountSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));

  await waitForElement(() => getByText('Date Created:'));
  let yamlTab = getByText(/Yaml/i);
  expect(yamlTab.parentNode.getAttribute('aria-selected')).toBe('false');

  fireEvent.click(yamlTab);
  await waitForElement(() => getByText(/creationTimestamp/i));
  const detailsTab = getByText(/Details/i);
  expect(detailsTab.parentNode.getAttribute('aria-selected')).toBe('false');

  fireEvent.click(detailsTab);
  yamlTab = getByText(/Yaml/i);
  expect(yamlTab.parentNode.getAttribute('aria-selected')).toBe('false');
});

it('ServiceAccountContainer handles error state', async () => {
  const match = {
    params: {
      serviceAccountName: 'foo'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'default'
    },
    ServiceAccounts: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: 'Error',
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error="Error"
        fetchServiceAccount={() => Promise.resolve()}
        fetchSecrets={() => Promise.resolve()}
      />
    </Provider>
  );
  await waitForElement(() => getByText('Error loading ServiceAccount'));
});

it('ServiceAccountContainer renders YAML', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
        fetchSecrets={() => Promise.resolve()}
        serviceAccount={serviceAccountSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));
  const yamlTab = getByText(/yaml/i);
  fireEvent.click(yamlTab);
  await waitForElement(() => getByText(/creationTimestamp/i));
  await waitForElement(() => getByText(/metadata/i));
  await waitForElement(() => getByText(/ServiceAccount/i));
  await waitForElement(() => getByText(/namespace/i));
});

it('ServiceAccountContainer does not render label section if they are not present', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
        fetchSecrets={() => Promise.resolve()}
        serviceAccount={serviceAccountSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));
  await waitForElement(() => getByText('None'));
});

it('ServiceAccountContainer renders labels section if they are present', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-labels'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-labels',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountWithLabels)}
        fetchSecrets={() => Promise.resolve()}
        serviceAccount={serviceAccountWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-labels'));
  await waitForElement(() => getByText(/Labels/i));
  await waitForElement(() => getByText(/mylabel: foo/i));
  await waitForElement(() => getByText(/myotherlabel: bar/i));
});

it('ServiceAccountContainer renders details with no secret nor imagePullSecrets ', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
        fetchSecrets={() => Promise.resolve()}
        serviceAccount={serviceAccountSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));
  await waitForElement(() => getByText('tekton-pipelines')); // Namespace
  await waitForElement(() => getByText('None')); // Label
  await waitForElement(() =>
    getByText('No Secrets found for this ServiceAccount.')
  );
  await waitForElement(() =>
    getByText('No imagePullSecrets found for this ServiceAccount.')
  );
});

it('ServiceAccountContainer renders secrets', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  serviceAccountSimple.secrets = [secrets[0]];

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountSimple)}
        fetchSecrets={() => Promise.resolve()}
        secrets={secrets}
        serviceAccount={serviceAccountSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));
  await waitForElement(() => getByText('tekton-pipelines'));
  await waitForElement(() => getByText('None'));
  await waitForElement(() => getByText('secret1'));
  await waitForElement(() =>
    getByText('No imagePullSecrets found for this ServiceAccount.')
  );
});

it('ServiceAccountContainer renders imagePullSecrets', async () => {
  const match = {
    params: {
      serviceAccountName: 'service-account-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    ServiceAccounts: {
      byId: 'service-account-simple',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  serviceAccountWithLabels.imagePullSecrets = [secrets[1]];

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ServiceAccountContainer
        intl={intl}
        match={match}
        error={null}
        fetchServiceAccount={() => Promise.resolve(serviceAccountWithLabels)}
        fetchSecrets={() => Promise.resolve()}
        secrets={secrets}
        serviceAccount={serviceAccountWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('service-account-simple'));
  await waitForElement(() => getByText('tekton-pipelines'));
  await waitForElement(() => getByText('imagePull1'));
  await waitForElement(() =>
    getByText('No Secrets found for this ServiceAccount.')
  );
});

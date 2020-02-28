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
import { fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createIntl } from 'react-intl';
import { ClusterTriggerBindingContainer } from './ClusterTriggerBinding';
import { renderWithRouter } from '../../utils/test';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const clusterTriggerBindingSimple = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'ClusterTriggerBinding',
  metadata: {
    creationTimestamp: '2019-11-19T19:44:43Z',
    name: 'cluster-trigger-binding-simple',
    uid: '49243595-0c72-11ea-ae12-025000000001'
  },
  spec: {
    params: [
      { name: 'param1', value: '$(body.head_commit.id)' },
      { name: 'param2', value: '$(body.repository.clone_url)' }
    ]
  }
};

const clusterTriggerBindingWithLabels = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'ClusterTriggerBinding',
  metadata: {
    labels: {
      mylabel: 'foo',
      myotherlabel: 'bar'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: 'cluster-trigger-binding-labels',
    uid: '49243595-0c72-11ea-ae12-025000002221'
  },
  spec: {
    params: [
      { name: 'paramLabels1', value: '$(body.head_commit.id)' },
      { name: 'paramLabels2', value: '$(body.repository.clone_url)' }
    ]
  }
};

it('ClusterTriggerBindingContainer renders', async () => {
  const clusterTriggerBindingName = 'bar';
  const match = {
    params: {
      clusterTriggerBindingName
    }
  };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    clusterTriggerBindings: {
      byId: {},
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        fetchClusterTriggerBinding={() => Promise.resolve()}
        error={null}
        loading={false}
      />
    </Provider>
  );
  await waitForElement(() => getByText(`ClusterTriggerBinding not available`));
});

it('ClusterTriggerBindingContainer toggles between tabs correctly', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'cluster-trigger-binding-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    clusterTriggerBindings: {
      byId: 'cluster-trigger-binding-simple',
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error={null}
        fetchClusterTriggerBinding={() =>
          Promise.resolve(clusterTriggerBindingSimple)
        }
        clusterTriggerBinding={clusterTriggerBindingSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('cluster-trigger-binding-simple'));

  await waitForElement(() => getByText('Date Created:'));
  let yamlTab = getByText('YAML');
  expect(yamlTab.getAttribute('aria-selected')).toBe('false');

  fireEvent.click(yamlTab);
  await waitForElement(() => getByText(/creationTimestamp/i));
  const detailsTab = getByText(/Details/i);
  expect(detailsTab.getAttribute('aria-selected')).toBe('false');

  fireEvent.click(detailsTab);
  yamlTab = getByText('YAML');
  expect(yamlTab.getAttribute('aria-selected')).toBe('false');
});

it('ClusterTriggerBindingContainer handles error state', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'foo'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'default'
    },
    clusterTriggerBindings: {
      byId: {},
      errorMessage: 'Error',
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error="Error"
        fetchClusterTriggerBinding={() => Promise.resolve()}
      />
    </Provider>
  );
  await waitForElement(() => getByText('Error loading ClusterTriggerBinding'));
});

it('ClusterTriggerBindingContainer renders details', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'cluster-trigger-binding-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    triggerBindings: {
      byId: 'cluster-trigger-binding-simple',
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error={null}
        fetchClusterTriggerBinding={() =>
          Promise.resolve(clusterTriggerBindingSimple)
        }
        clusterTriggerBinding={clusterTriggerBindingSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('cluster-trigger-binding-simple'));
  await waitForElement(() => getByText(/param1/i));
  await waitForElement(() => getByText(/param2/i));
  await waitForElement(() => getByText('$(body.head_commit.id)'));
  await waitForElement(() => getByText('$(body.repository.clone_url)'));
  await waitForElement(() => getByText('None'));
});

it('ClusterTriggerBindingContainer renders YAML', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'cluster-trigger-binding-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    clusterTriggerBindings: {
      byId: 'cluster-trigger-binding-simple',
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error={null}
        fetchClusterTriggerBinding={() =>
          Promise.resolve(clusterTriggerBindingSimple)
        }
        clusterTriggerBinding={clusterTriggerBindingSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('cluster-trigger-binding-simple'));
  const yamlTab = getByText('YAML');
  fireEvent.click(yamlTab);
  await waitForElement(() => getByText(/creationTimestamp/i));
  await waitForElement(() => getByText(/spec/i));
  await waitForElement(() => getByText(/params/i));
  await waitForElement(() => getByText(/metadata/i));
  await waitForElement(() => getByText(/ClusterTriggerBinding/i));
});

it('ClusterTriggerBindingContainer does not render label section if they are not present', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'cluster-trigger-binding-simple'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    clusterTriggerBindings: {
      byId: 'cluster-trigger-binding-simple',
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error={null}
        fetchClusterTriggerBinding={() =>
          Promise.resolve(clusterTriggerBindingSimple)
        }
        clusterTriggerBinding={clusterTriggerBindingSimple}
      />
    </Provider>
  );

  await waitForElement(() => getByText('cluster-trigger-binding-simple'));
  await waitForElement(() => getByText('None'));
});

it('ClusterTriggerBindingContainer renders labels section if they are present', async () => {
  const match = {
    params: {
      clusterTriggerBindingName: 'cluster-trigger-binding-labels'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    clusterTriggerBindings: {
      byId: 'cluster-trigger-binding-labels',
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <ClusterTriggerBindingContainer
        intl={intl}
        match={match}
        error={null}
        fetchClusterTriggerBinding={() =>
          Promise.resolve(clusterTriggerBindingWithLabels)
        }
        clusterTriggerBinding={clusterTriggerBindingWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('cluster-trigger-binding-labels'));
  await waitForElement(() => getByText(/Labels/i));
  await waitForElement(() => getByText(/mylabel: foo/i));
  await waitForElement(() => getByText(/myotherlabel: bar/i));
});

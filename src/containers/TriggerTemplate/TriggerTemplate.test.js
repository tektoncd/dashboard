/*
Copyright 2019-2020 The Tekton Authors
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
import { TriggerTemplateContainer } from './TriggerTemplate';
import { renderWithRouter } from '../../utils/test';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const resourceTemplate1NameInfo = 'git-source';
const resourceTemplate2NameInfo = 'simple-pipeline-run';

const resourceTemplate1Details = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'PipelineResource',
  metadata: {
    name: 'git-source'
  },
  spec: {
    params: [
      {
        name: 'revision',
        value: '$(params.gitrevision)'
      },
      {
        name: 'url',
        value: '$(params.gitrepositoryurl)'
      }
    ],
    type: 'git'
  }
};
const fakeTriggerTemplate = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"tekton.dev/v1alpha1","kind":"TriggerTemplate","metadata":{"annotations":{},"name":"pipeline-template","namespace":"tekton-pipelines"},"spec":{"params":[{"default":"master","description":"The git revision","name":"gitrevision"},{"description":"The git repository url","name":"gitrepositoryurl"},{"default":"This is the default message","description":"The message to print","name":"message"},{"description":"The Content-Type of the event","name":"contenttype"}],"resourcetemplates":[{"apiVersion":"tekton.dev/v1alpha1","kind":"PipelineResource","metadata":{"name":"git-source"},"spec":{"params":[{"name":"revision","value":"$(params.gitrevision)"},{"name":"url","value":"$(params.gitrepositoryurl)"}],"type":"git"}},{"apiVersion":"tekton.dev/v1alpha1","kind":"PipelineRun","metadata":{"generateName":"simple-pipeline-run"},"spec":{"params":[{"name":"message","value":"$(params.message)"},{"name":"contenttype","value":"$(params.contenttype)"}],"pipelineRef":{"name":"simple-pipeline"},"resources":[{"name":"git-source","resourceRef":{"name":"git-source"}}]}}]}}\n'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: 'pipeline-template',
    namespace: 'tekton-pipelines',
    resourceVersion: '598668',
    selfLink:
      '/apis/tekton.dev/v1alpha1/namespaces/tekton-pipelines/triggertemplates/pipeline-template',
    uid: '49243595-0c72-11ea-ae12-025000000001'
  },
  spec: {
    params: [
      {
        default: 'master',
        description: 'The git revision',
        name: 'gitrevision'
      },
      { description: 'The git repository url', name: 'gitrepositoryurl' },
      {
        default: 'This is the default message',
        description: 'The message to print',
        name: 'message'
      },
      { description: 'The Content-Type of the event', name: 'contenttype' }
    ],
    resourcetemplates: [
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineResource',
        metadata: { name: 'git-source' },
        spec: {
          params: [
            { name: 'revision', value: '$(params.gitrevision)' },
            { name: 'url', value: '$(params.gitrepositoryurl)' }
          ],
          type: 'git'
        }
      },
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: { generateName: 'simple-pipeline-run' },
        spec: {
          params: [
            { name: 'message', value: '$(params.message)' },
            { name: 'contenttype', value: '$(params.contenttype)' }
          ],
          pipelineRef: { name: 'simple-pipeline' },
          resources: [
            { name: 'git-source', resourceRef: { name: 'git-source' } }
          ]
        }
      }
    ]
  }
};

const fakeTriggerTemplateWithLabels = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"tekton.dev/v1alpha1","kind":"TriggerTemplate","metadata":{"annotations":{},"name":"pipeline-template","namespace":"tekton-pipelines"},"spec":{"params":[{"default":"master","description":"The git revision","name":"gitrevision"},{"description":"The git repository url","name":"gitrepositoryurl"},{"default":"This is the default message","description":"The message to print","name":"message"},{"description":"The Content-Type of the event","name":"contenttype"}],"resourcetemplates":[{"apiVersion":"tekton.dev/v1alpha1","kind":"PipelineResource","metadata":{"name":"git-source"},"spec":{"params":[{"name":"revision","value":"$(params.gitrevision)"},{"name":"url","value":"$(params.gitrepositoryurl)"}],"type":"git"}},{"apiVersion":"tekton.dev/v1alpha1","kind":"PipelineRun","metadata":{"generateName":"simple-pipeline-run"},"spec":{"params":[{"name":"message","value":"$(params.message)"},{"name":"contenttype","value":"$(params.contenttype)"}],"pipelineRef":{"name":"simple-pipeline"},"resources":[{"name":"git-source","resourceRef":{"name":"git-source"}}]}}]}}\n'
    },
    labels: {
      mylabel: 'foo',
      myotherlabel: 'bar'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: 'pipeline-template',
    namespace: 'tekton-pipelines',
    resourceVersion: '598668',
    selfLink:
      '/apis/tekton.dev/v1alpha1/namespaces/tekton-pipelines/triggertemplates/pipeline-template',
    uid: '49243595-0c72-11ea-ae12-025000000001'
  },
  spec: {
    params: [
      {
        default: 'master',
        description: 'The git revision',
        name: 'gitrevision'
      },
      { description: 'The git repository url', name: 'gitrepositoryurl' },
      {
        default: 'This is the default message',
        description: 'The message to print',
        name: 'message'
      },
      { description: 'The Content-Type of the event', name: 'contenttype' }
    ],
    resourcetemplates: [
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineResource',
        metadata: { name: 'git-source' },
        spec: {
          params: [
            { name: 'revision', value: '$(params.gitrevision)' },
            { name: 'url', value: '$(params.gitrepositoryurl)' }
          ],
          type: 'git'
        }
      },
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: { generateName: 'simple-pipeline-run' },
        spec: {
          params: [
            { name: 'message', value: '$(params.message)' },
            { name: 'contenttype', value: '$(params.contenttype)' }
          ],
          pipelineRef: { name: 'simple-pipeline' },
          resources: [
            { name: 'git-source', resourceRef: { name: 'git-source' } }
          ]
        }
      }
    ]
  }
};

it('TriggerTemplateContainer renders', async () => {
  const triggerTemplateName = 'bar';
  const match = {
    params: {
      triggerTemplateName
    }
  };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    namespaces: {
      selected: 'default'
    },
    triggerTemplates: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        fetchTriggerTemplate={() => Promise.resolve()}
        error={null}
        loading={false}
      />
    </Provider>
  );
  await waitForElement(() => getByText(`TriggerTemplate not available`));
});

it('TriggerTemplateContainer handles error state', async () => {
  const match = {
    params: {
      triggerTemplateName: 'foo'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'default'
    },
    triggerTemplates: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: 'Error',
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error="Error"
        fetchTriggerTemplate={() => Promise.resolve()}
      />
    </Provider>
  );
  await waitForElement(() => getByText('Error loading TriggerTemplate'));
});

it('TriggerTemplateContainer renders basic information', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );
  await waitForElement(() => getByText('pipeline-template'));
});

it('TriggerTemplateContainer renders parameters', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );

  await waitForElement(() => getByText(/pipeline-template/i));
  await waitForElement(() => getByText(/default/i));
  await waitForElement(() => getByText(/description/i));
  await waitForElement(() => getByText(/gitrevision/i));
  await waitForElement(() => getByText(/gitrepositoryurl/i));
  await waitForElement(() => getByText(/message/i));
  await waitForElement(() => getByText(/contenttype/i));
  await waitForElement(() => getByText(/the git revision/i));
  await waitForElement(() => getByText(/the git repository url/i));
  await waitForElement(() => getByText(/the message to print/i));
  await waitForElement(() => getByText(/the Content-Type of the event/i));
});

it('TriggerTemplateContainer renders resource templates', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText, getByTestId } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );

  await waitForElement(() => getByText('pipeline-template'));

  await waitForElement(() => getByText(resourceTemplate1NameInfo));
  await waitForElement(() => getByText(resourceTemplate2NameInfo));

  const resourceTemplatesTable = getByTestId('resourcetemplatestable');
  expect(resourceTemplatesTable).toHaveTextContent(resourceTemplate1NameInfo);
  expect(resourceTemplatesTable).toHaveTextContent(resourceTemplate2NameInfo);
});

it('TriggerTemplateContainer renders full resource template information', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );

  const compareToName = resourceTemplate1Details.metadata.name;
  await waitForElement(() => getByText(compareToName));
  await waitForElement(() => getByText(/revision/i));
  await waitForElement(() => getByText(/url/i));
  await waitForElement(() => getByText(/gitrevision/i));
  await waitForElement(() => getByText(/gitrepositoryurl/i));
  await waitForElement(() => getByText(/simple-pipeline-run/i));
  await waitForElement(() => getByText(/message/i));
  await waitForElement(() => getByText(/contenttype/i));
});

it('TriggerTemplateContainer contains overview tab with accurate information', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );
  await waitForElement(() => getByText('pipeline-template'));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitForElement(() => getByText(/Date created/i));
  await waitForElement(() => getByText(/tekton-pipelines/i));
});

it('TriggerTemplateContainer contains YAML tab with accurate information', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );

  await waitForElement(() => getByText('pipeline-template'));
  const yamlTab = getByText('YAML');
  fireEvent.click(yamlTab);
  await waitForElement(() => getByText(/creationtimestamp/i));
  await waitForElement(() => getByText(/selflink/i));
  await waitForElement(() => getByText(/pipelineref/i));
  await waitForElement(() => getByText(/resourceref/i));
  await waitForElement(() => getByText(/generation/i));
  await waitForElement(() => getByText(/resourceversion/i));
  await waitForElement(() => getByText(/git-source/i));
  await waitForElement(() => getByText(/params.message/i));
  await waitForElement(() => getByText(/type: git/i));
  await waitForElement(() => getByText(/revision/i));
});

it('TriggerTemplateContainer does not render label section if they are not present', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText, queryByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() => Promise.resolve(fakeTriggerTemplate)}
        triggerTemplate={fakeTriggerTemplate}
      />
    </Provider>
  );

  await waitForElement(() => getByText('pipeline-template'));
  expect(queryByText('Labels')).toBeFalsy();
});

it('TriggerTemplateContainer renders labels section if they are present', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template-with-labels'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template-with-labels',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() =>
          Promise.resolve(fakeTriggerTemplateWithLabels)
        }
        triggerTemplate={fakeTriggerTemplateWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('pipeline-template-with-labels'));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitForElement(() => getByText(/labels/i));
  await waitForElement(() => getByText(/mylabel/i));
  await waitForElement(() => getByText(/foo/i));
  await waitForElement(() => getByText(/myotherlabel/i));
  await waitForElement(() => getByText(/bar/i));
});

it('TriggerTemplateContainer contains formatted labels', async () => {
  const match = {
    params: {
      triggerTemplateName: 'pipeline-template-with-labels'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    triggerTemplates: {
      byId: 'pipeline-template-with-labels',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TriggerTemplateContainer
        intl={intl}
        match={match}
        error={null}
        fetchTriggerTemplate={() =>
          Promise.resolve(fakeTriggerTemplateWithLabels)
        }
        triggerTemplate={fakeTriggerTemplateWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('pipeline-template-with-labels'));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitForElement(() => getByText('Labels:'));
  await waitForElement(() => getByText(/mylabel: foo/i));
  await waitForElement(() => getByText(/myotherlabel: bar/i));
});

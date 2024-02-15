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

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { paths, urls } from '@tektoncd/dashboard-utils';

import * as API from '../../api/triggerTemplates';
import { renderWithRouter } from '../../utils/test';
import { TriggerTemplateContainer } from './TriggerTemplate';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const resourceTemplate1NameInfo = 'git-clone';
const resourceTemplate2NameInfo = 'simple-pipeline-run';
const namespace = 'tekton-pipelines';
const triggerTemplateName = 'pipeline-template';
const resourceTemplate1Details = {
  apiVersion: 'tekton.dev/v1',
  kind: 'Task',
  metadata: {
    name: 'git-clone'
  },
  spec: {}
};
const fakeTriggerTemplate = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: triggerTemplateName,
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
      resourceTemplate1Details,
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: { generateName: 'simple-pipeline-run' },
        spec: {
          params: [
            { name: 'message', value: '$(params.message)' },
            { name: 'contenttype', value: '$(params.contenttype)' }
          ],
          pipelineRef: { name: 'simple-pipeline' }
        }
      }
    ]
  }
};

const fakeTriggerTemplateWithLabels = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    labels: {
      mylabel: 'foo',
      myotherlabel: 'bar'
    },
    creationTimestamp: '2019-11-21T15:19:18Z',
    generation: 1,
    name: triggerTemplateName,
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
    resourceTemplates: [
      resourceTemplate1Details,
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: { generateName: 'simple-pipeline-run' },
        spec: {
          params: [
            { name: 'message', value: '$(params.message)' },
            { name: 'contenttype', value: '$(params.contenttype)' }
          ],
          pipelineRef: { name: 'simple-pipeline' }
        }
      }
    ]
  }
};

it('TriggerTemplateContainer handles error state', async () => {
  const error = 'fake_error_message';
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({ error }));

  const { getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );
  await waitFor(() => getByText('Error loading resource'));
});

it('TriggerTemplateContainer renders', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplate
  }));

  const { getAllByText, getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );
  await waitFor(() => getByText(/pipeline-template/i));
  await waitFor(() => getByText('Default'));
  await waitFor(() => getByText(/description/i));
  await waitFor(() => getByText(/gitrevision/i));
  await waitFor(() => getByText(/gitrepositoryurl/i));
  await waitFor(() => getAllByText(/message/i)[0]);
  await waitFor(() => getByText(/contenttype/i));
  await waitFor(() => getByText(/the git revision/i));
  await waitFor(() => getByText(/the git repository url/i));
  await waitFor(() => getByText(/the message to print/i));
  await waitFor(() => getByText(/the Content-Type of the event/i));
  expect(getByText(resourceTemplate1NameInfo)).toBeTruthy();
  expect(getByText(resourceTemplate2NameInfo)).toBeTruthy();
  const compareToName = resourceTemplate1Details.metadata.name;
  await waitFor(() => getByText(compareToName));
  await waitFor(() => getAllByText(/revision/i)[0]);
  await waitFor(() => getAllByText(/url/i)[0]);
  await waitFor(() => getByText(/simple-pipeline-run/i));
});

it('TriggerTemplateContainer contains overview tab with accurate information', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplate
  }));

  const { getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );
  await waitFor(() => getByText('pipeline-template'));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitFor(() => getByText(/Date created/i));
  await waitFor(() => getByText(/tekton-pipelines/i));
});

it('TriggerTemplateContainer contains YAML tab with accurate information', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplate
  }));
  const { getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />,
    {
      path: paths.triggerTemplates.byName(),
      route: urls.triggerTemplates.byName({
        namespace,
        triggerTemplateName: 'pipeline-template'
      })
    }
  );

  await waitFor(() => getByText('pipeline-template'));
  const yamlTab = getByText('YAML');
  fireEvent.click(yamlTab);
  await waitFor(() => getByText('creationTimestamp:'));
  await waitFor(() => getByText('selfLink:'));
  await waitFor(() => getByText('pipelineRef:'));
  await waitFor(() => getByText('generation:'));
  await waitFor(() => getByText('resourceVersion:'));
});

it('TriggerTemplateContainer does not render label section if they are not present', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplate
  }));

  const { getByText, queryByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );

  await waitFor(() => getByText('pipeline-template'));
  expect(queryByText('Labels')).toBeFalsy();
});

it('TriggerTemplateContainer renders labels section if they are present', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplateWithLabels
  }));

  const { getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );

  await waitFor(() => getByText(triggerTemplateName));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitFor(() => getByText(/labels/i));
  await waitFor(() => getByText(/mylabel/i));
  await waitFor(() => getByText(/foo/i));
  await waitFor(() => getByText(/myotherlabel/i));
  await waitFor(() => getByText(/bar/i));
});

it('TriggerTemplateContainer contains formatted labels', async () => {
  vi.spyOn(API, 'useTriggerTemplate').mockImplementation(() => ({
    data: fakeTriggerTemplateWithLabels
  }));

  const { getByText } = renderWithRouter(
    <TriggerTemplateContainer intl={intl} />
  );

  await waitFor(() => getByText(triggerTemplateName));
  const overviewTab = getByText(/overview/i);
  fireEvent.click(overviewTab);
  await waitFor(() => getByText('Labels:'));
  await waitFor(() => getByText(/mylabel: foo/i));
  await waitFor(() => getByText(/myotherlabel: bar/i));
});

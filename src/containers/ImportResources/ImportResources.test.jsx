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
import {
  ALL_NAMESPACES,
  getCarbonPrefix,
  urls
} from '@tektoncd/dashboard-utils';

import { render, renderWithRouter } from '../../utils/test';
import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';

const carbonPrefix = getCarbonPrefix();

describe('ImportResources component', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [
        { metadata: { name: 'default' } },
        { metadata: { name: 'tekton-dashboard' } }
      ]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: ALL_NAMESPACES
    }));
  });

  it('Displays errors when Repository URL and Namespace is empty', async () => {
    const { getByText } = await render(<ImportResourcesContainer />);

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
    await waitFor(() => getByText(/Please select a Namespace/i));
  });

  it('Displays an error when Repository URL is empty', async () => {
    const { getAllByPlaceholderText, getByText } = await render(
      <ImportResourcesContainer />
    );
    const namespace = 'default';

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
  });

  it('Displays an error when Namespace is empty', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ImportResourcesContainer />
    );

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, {
      target: { value: 'https://github.com/test/testing' }
    });

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please select a Namespace/i));
  });

  it('Valid data submit displays success notification', async () => {
    const pipelineRunName = 'fake-tekton-pipeline-run';
    const headers = {
      metadata: { name: pipelineRunName }
    };

    const pathValue = 'some/path';
    const repositoryURLValue = 'https://github.com/test/testing';
    const revisionValue = 'main';

    vi.spyOn(API, 'importResources').mockImplementation(
      ({
        importerNamespace,
        labels,
        namespace,
        path,
        repositoryURL,
        revision,
        serviceAccount
      }) => {
        const labelsShouldEqual = {
          gitOrg: 'test',
          gitRepo: 'testing',
          gitServer: 'github.com'
        };

        expect(repositoryURL).toEqual(repositoryURLValue);
        expect(path).toEqual(pathValue);
        expect(revision).toEqual(revisionValue);
        expect(namespace).toEqual('default');
        expect(labels).toEqual(labelsShouldEqual);
        expect(serviceAccount).toEqual('');
        expect(importerNamespace).toEqual('tekton-dashboard');

        return Promise.resolve(headers);
      }
    );

    const namespace = 'default';

    const { getAllByPlaceholderText, getByPlaceholderText, getByText } =
      await renderWithRouter(<ImportResourcesContainer />);

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, { target: { value: repositoryURLValue } });

    const pathField = getByPlaceholderText(/enter repository path/i);
    fireEvent.change(pathField, { target: { value: pathValue } });

    const revisionField = getByPlaceholderText(/revision/i);
    fireEvent.change(revisionField, { target: { value: revisionValue } });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import'));
    await waitFor(() =>
      getByText(/Triggered PipelineRun to import Tekton resources/i)
    );

    expect(
      document.getElementsByClassName(
        `${carbonPrefix}--toast-notification__caption`
      )[0].innerHTML
    ).toContain(
      urls.pipelineRuns.byName({
        namespace: 'tekton-dashboard',
        pipelineRunName
      })
    );
  });

  it('Invalid data submit displays invalidText', async () => {
    const importResourcesResponseMock = { response: { status: 500 } };

    vi.spyOn(API, 'importResources').mockImplementation(() =>
      Promise.reject(importResourcesResponseMock)
    );

    const { getAllByPlaceholderText, getByPlaceholderText, getByText } =
      await render(<ImportResourcesContainer />);

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, { target: { value: 'URL' } });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('tekton-dashboard'));

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
  });

  it('URL TextInput handles onChange event', async () => {
    const { getByPlaceholderText, queryByDisplayValue } = await render(
      <ImportResourcesContainer />
    );
    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, {
      target: { value: 'Invalid URL here' }
    });

    await waitFor(() => queryByDisplayValue(/Invalid URL here/i));
  });

  it('Can clear the selected namespace', async () => {
    const {
      getAllByPlaceholderText,
      getByText,
      getAllByTitle,
      queryByText,
      queryByDisplayValue
    } = await render(<ImportResourcesContainer />);
    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('default'));
    fireEvent.click(getAllByTitle(/Clear selected item/i)[0]);
    await waitFor(() => queryByText(/please select a Namespace/i));
    expect(queryByDisplayValue('default')).toBeFalsy();
  });
});

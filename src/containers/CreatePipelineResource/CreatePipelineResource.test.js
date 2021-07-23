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
import { fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ALL_NAMESPACES, paths, urls } from '@tektoncd/dashboard-utils';

import { render, renderWithRouter } from '../../utils/test';
import CreatePipelineResource from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const store = mockStore({
  notifications: {}
});

describe('CreatePipelineResource', () => {
  beforeEach(() => {
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['default'] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
  });

  it('renders blank', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    expect(queryByText('Create PipelineResource')).toBeTruthy();
    expect(queryByText('Cancel')).toBeTruthy();
    expect(queryByText('Create')).toBeTruthy();
  });

  it('redirects to PipelineResources on cancel', () => {
    jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
    const history = { push: jest.fn() };

    const { queryByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={paths.pipelineResources.create()}
          render={props => (
            <CreatePipelineResource {...props} history={history} />
          )}
        />
      </Provider>,
      {
        route: urls.pipelineResources.create()
      }
    );
    fireEvent.click(queryByText(/cancel/i));
    expect(history.push).toHaveBeenCalledWith(urls.pipelineResources.all());
  });

  const nameValidationErrorMsgRegExp = /Must be less than 64 characters and contain only lowercase alphanumeric characters or -/i;
  const namespaceValidationErrorRegExp = /Namespace required/i;
  const urlValidationErrorRegExp = /URL required/i;
  const revisionValidationErrorRegExp = /Revision required/i;

  it('validates all empty inputs', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name starts with a "-"', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: '-meow' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name ends with a "-"', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'meow-' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name contains "."', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'meow.meow' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name contains spaces', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the cat goes meow' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name contains capital letters', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'MEOW' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('doesn\'t error when contains "-" in the middle of the name', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-goes-meow' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when name contains number", () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-likes-0' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name contains 64 characters', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: {
        value:
          '1111111111111111111111111111111111111111111111111111111111111111'
      }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when name contains 63 characters", () => {
    const { queryByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: {
        value: '111111111111111111111111111111111111111111111111111111111111111'
      }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when contains a valid namespace", () => {
    const { queryByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-goes-meow' }
    });
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(/default/i));
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when a url is entered", () => {
    const { queryByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-goes-meow' }
    });
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(/default/i));

    fireEvent.change(getByPlaceholderText(/pipeline-resource-url/i), {
      target: { value: 'the-cat-goes-meow' }
    });

    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(urlValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when a revision is entered", () => {
    const { queryByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-goes-meow' }
    });
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(/default/i));

    fireEvent.change(getByPlaceholderText(/pipeline-resource-revision/i), {
      target: { value: 'the-cat-goes-meow' }
    });

    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeFalsy();
  });

  it('handles type change', () => {
    const { queryByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CreatePipelineResource />
      </Provider>
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat-goes-meow' }
    });
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(/default/i));

    fireEvent.change(getByPlaceholderText(/pipeline-resource-revision/i), {
      target: { value: 'the-cat-goes-meow' }
    });

    fireEvent.click(getByText(/git/i));
    fireEvent.click(getByText(/image/i));

    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeFalsy();
  });
});

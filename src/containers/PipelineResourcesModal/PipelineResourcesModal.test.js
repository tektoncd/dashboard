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
import { fireEvent } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl, rerenderWithIntl } from '../../utils/test';
import PipelineResourcesModal from '.';
import * as API from '../../api';
import * as selectors from '../../reducers';

beforeEach(() => {
  jest
    .spyOn(selectors, 'getTenantNamespace')
    .mockImplementation(() => undefined);
});

const middleware = [thunk];
const mockStore = configureStore(middleware);

const pipelineResources = {
  byNamespace: {},
  errorMessage: null,
  isFetching: false
};

const namespaces = {
  byName: {
    default: {
      metadata: {
        name: 'default',
        selfLink: '/api/v1/namespaces/default',
        uid: '32b35d3b-6ce1-11e9-af21-025000000001',
        resourceVersion: '4',
        creationTimestamp: '2019-05-02T13:50:08Z'
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: 'default'
};

const store = mockStore({
  pipelineResources,
  namespaces,
  notifications: {}
});

it('PipelineResourcesModal renders blank', () => {
  const props = {
    open: true
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);

  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
    </Provider>
  );
  expect(queryByText('Create PipelineResource')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Create')).toBeTruthy();
});

it('Test PipelineResourcesModal click events', () => {
  const onClose = jest.fn();
  const onSubmit = jest.fn();
  const props = {
    open: true,
    onClose,
    onSubmit
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);

  const { queryByText, rerender } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Cancel'));
  expect(onClose).toHaveBeenCalledTimes(1);

  rerenderWithIntl(
    rerender,
    <Provider store={store}>
      <PipelineResourcesModal open={false} />
    </Provider>
  );

  expect(onSubmit).toHaveBeenCalledTimes(0);
});

const nameValidationErrorMsgRegExp = /Must be less than 64 characters and contain only lowercase alphanumeric characters or -/i;
const namespaceValidationErrorRegExp = /Namespace required/i;
const urlValidationErrorRegExp = /URL required/i;
const revisionValidationErrorRegExp = /Revision required/i;

const props = {
  open: true
};

it('Create PipelineResource validates all empty inputs', () => {
  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
});

it('Create PipelineResource errors when starting with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it('Create PipelineResource errors when ends with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it('Create PipelineResource errors when contains "."', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it('Create PipelineResource errors when contains spaces', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it('Create PipelineResource errors when contains capital letters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it('Create PipelineResource doesn\'t error when contains "-" in the middle of the name', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it("Create PipelineResource doesn't error when contains 0", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it("Create PipelineResource doesn't error when contains 9", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
    target: { value: 'the-cat-likes-9' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
});

it('Create PipelineResource errors when contains 64 characters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
    target: {
      value: '1111111111111111111111111111111111111111111111111111111111111111'
    }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
});

it("Create PipelineResource doesn't error when contains 63 characters", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it("Create PipelineResource doesn't error when contains a valid namespace", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it("Create PipelineResource doesn't error when a url is entered", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

it("Create PipelineResource doesn't error when a revision is entered", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <PipelineResourcesModal {...props} />
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

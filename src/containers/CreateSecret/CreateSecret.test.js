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
import { fireEvent, waitForElement } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import CreateSecret from '.';
import * as API from '../../api';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const secrets = {
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
  selected: ALL_NAMESPACES
};

const serviceAccountsByNamespace = {
  default: {
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2'
  },
  green: {
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-service-account-1': {
    metadata: {
      name: 'service-account-1',
      namespace: 'default',
      uid: 'id-service-account-1'
    }
  },
  'id-service-account-2': {
    metadata: {
      name: 'service-account-2',
      namespace: 'default',
      uid: 'id-service-account-2'
    }
  },
  'id-service-account-3': {
    metadata: {
      name: 'service-account-3',
      namespace: 'green',
      uid: 'id-service-account-3'
    }
  }
};

const store = mockStore({
  secrets,
  namespaces,
  notifications: {},
  properties: {},
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
});

const nameValidationErrorMsgRegExp = /Must not start or end with - and be less than 253 characters, contain only lowercase alphanumeric characters or -/i;
const namespaceValidationErrorRegExp = /Namespace required./i;
const usernameValidationErrorRegExp = /Username required./i;
const passwordValidationErrorRegExp = /Password required./i;
const accessTokenValidationErrorRegExp = /Access Token required./i;
const serverurlValidationErrorRegExp = /Server URL required./i;

it('SecretsCreate renders blank', () => {
  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest
    .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
    .mockImplementation(() => []);

  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret location={{ search: '' }} />
    </Provider>
  );
  expect(queryByText('Create new Secret')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Create')).toBeTruthy();
});

it('Test CreateSecret click events', () => {
  const history = {
    push: jest.fn()
  };
  const props = {
    history,
    location: { search: '' },
    secrets
  };
  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest
    .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
    .mockImplementation(() => []);

  const { queryByText, rerender } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Cancel'));
  expect(history.push).toHaveBeenCalled();

  renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>,
    { rerender }
  );
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

const props = {
  location: { search: '' }
};

it('Create Secret validates universal inputs', () => {
  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
});

it('Create Secret validates access token inputs', () => {
  const { queryByText, queryAllByLabelText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret location={{ search: '?secretType=accessToken' }} />
    </Provider>
  );
  fireEvent.click(queryAllByLabelText('Access Token')[0]);
  fireEvent.click(queryByText('Create'));
  expect(queryByText(accessTokenValidationErrorRegExp)).toBeTruthy();
});

it('Create Secret validates password inputs', () => {
  const { queryByText, queryAllByLabelText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.click(queryAllByLabelText('Password')[0]);
  fireEvent.click(queryByText('Create'));
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when starting with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: '-meow' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it('Create Secret errors when ends with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'meow-' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it('Create Secret errors when contains "."', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'meow.meow' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it('Create Secret errors when contains spaces', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the cat goes meow' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it('Create Secret errors when contains capital letters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'MEOW' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it('Create Secret doesn\'t error when contains "-" in the middle of the secret', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains 0", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-likes-0' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains 9", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-likes-9' }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
});

it('Create Secret errors when contains 253 characters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: {
      value:
        '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111121212121212121212121212121212121212111111113333333333'
    }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
});

it("Create Secret doesn't error when contains 252 characters", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: {
      value:
        '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111121212121212121212121212121212121212111111113333333333'
    }
  });
  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains a valid namespace", () => {
  const { queryByText, getByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
  fireEvent.click(queryByText('Create'));
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when Docker Registry is selected", () => {
  const {
    queryByText,
    getByPlaceholderText,
    getByText,
    queryAllByLabelText
  } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.click(queryAllByLabelText('Password')[0]);

  fireEvent.click(getByText(/git server/i));
  fireEvent.click(getByText(/docker registry/i));

  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when a username is entered", () => {
  const {
    queryByText,
    getByPlaceholderText,
    getByText,
    queryAllByLabelText
  } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
  fireEvent.click(queryAllByLabelText('Password')[0]);

  fireEvent.change(getByPlaceholderText(/username/i), {
    target: { value: 'the-cat-goes-meow' }
  });

  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when a password is entered", () => {
  const {
    queryByText,
    getByPlaceholderText,
    getByText,
    queryAllByLabelText
  } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
  fireEvent.click(queryAllByLabelText('Password')[0]);

  fireEvent.change(getByPlaceholderText(/username/i), {
    target: { value: 'the-cat-goes-meow' }
  });

  fireEvent.change(getByPlaceholderText('********'), {
    target: { value: 'password' }
  });

  fireEvent.click(queryByText('Create'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Can clear the selected namespace', async () => {
  const {
    getByPlaceholderText,
    getByText,
    getByTitle,
    queryByText,
    queryByDisplayValue
  } = renderWithIntl(
    <Provider store={store}>
      <CreateSecret {...props} />
    </Provider>
  );
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  fireEvent.click(getByText('default'));
  fireEvent.click(getByTitle(/Clear selected item/i));
  await waitForElement(() => queryByText(/namespace required/i));
  expect(queryByDisplayValue('default')).toBeFalsy();
});

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
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import Annotations from './Annotations';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const store = mockStore({});

const gitServerPlaceholder = new RegExp('https://github.com', 'i');

it('Annotations respond correctly to add/remove actions', async () => {
  const handleAdd = jest.fn();
  const handleRemove = jest.fn();

  const annotations = [
    {
      access: 'git',
      value: 'https://github.com',
      id: `annotation0-fdsh`
    }
  ];

  const props = {
    annotations,
    handleAdd,
    handleAnnotationChange() {},
    handleRemove,
    invalidFields: {},
    loading: false
  };

  const {
    queryByDisplayValue,
    queryByPlaceholderText,
    queryAllByDisplayValue,
    queryAllByPlaceholderText,
    getByText,
    getAllByTestId,
    rerender
  } = renderWithIntl(
    <Provider store={store}>
      <Annotations {...props} />
    </Provider>
  );

  // Default value and placeholder should be for github
  expect(queryByDisplayValue(gitServerPlaceholder)).toBeTruthy();
  expect(queryByPlaceholderText(gitServerPlaceholder)).toBeTruthy();

  // Change value and placeholder to dockerhub
  fireEvent.click(await waitForElement(() => getByText(/Git Server/i)));
  fireEvent.click(await waitForElement(() => getByText(/Docker Registry/i)));

  // Add a second annotation to the list
  fireEvent.click(await waitForElement(() => getByText(/add/i)));

  props.annotations.push({
    access: 'git',
    value: 'https://github.com',
    id: `annotation1-poid`
  });

  renderWithIntl(
    <Provider store={store}>
      <Annotations {...props} />
    </Provider>,
    { rerender }
  );

  expect(handleAdd).toHaveBeenCalledTimes(1);
  expect(queryAllByDisplayValue(gitServerPlaceholder).length).toEqual(2);
  expect(queryAllByPlaceholderText(gitServerPlaceholder).length).toEqual(2);

  fireEvent.click(await waitForElement(() => getAllByTestId(/removeIcon/i)[0]));
  expect(handleRemove).toHaveBeenCalledTimes(1);

  props.annotations.pop();

  renderWithIntl(
    <Provider store={store}>
      <Annotations {...props} />
    </Provider>,
    { rerender }
  );

  // Change value and placeholder back to github (both annotations should update)
  fireEvent.click(await waitForElement(() => getByText(/Docker Registry/i)));
  fireEvent.click(await waitForElement(() => getByText(/Git Server/i)));
  expect(queryAllByDisplayValue(gitServerPlaceholder).length).toEqual(1);
  expect(queryAllByPlaceholderText(gitServerPlaceholder).length).toEqual(1);
});

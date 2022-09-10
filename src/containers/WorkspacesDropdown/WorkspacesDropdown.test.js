/*
Copyright 2019-2022 The Tekton Authors
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
import { fireEvent, getNodeText } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { render } from '../../utils/test';
import * as APIUtils from '../../api/utils';

import WorkspaceDropdown from './WorkspacesDropdown';
import * as API from '../../api/configmaps';
import * as SecretsAPI from '../../api/secrets';

const props = {
  id: 'workspaces-dropdown',
  onChange: () => {}
};

const configMaps = [
  {
    kind: 'ConfigMap',
    metadata: {
      name: 'config-map-1',
      namespace: 'blue',
      uid: 'id-config-map-1'
    }
  },
  {
    kind: 'ConfigMap',
    metadata: {
      name: 'config-map-2',
      namespace: 'blue',
      uid: 'id-config-map-2'
    }
  },
  {
    kind: 'ConfigMap',
    metadata: {
      name: 'config-map-3',
      namespace: 'green',
      uid: 'id-config-map-3'
    }
  }
];

const secrets = [
  {
    kind: 'Secret',
    metadata: {
      name: 'secret-1',
      namespace: 'blue',
      uid: 'id-secret-1'
    }
  },
  {
    kind: 'Secret',
    metadata: {
      name: 'secret-2',
      namespace: 'blue',
      uid: 'id-secret-2'
    }
  },
  {
    kind: 'Secret',
    metadata: {
      name: 'secret-3',
      namespace: 'green',
      uid: 'id-secret-3'
    }
  }
];

const initialTextRegExp = /select workspace/i;
const configMapRegExp = /config-map-/i;
const secretRegExp = /secret-/i;
const emptyDir = /emptyDir-/i;

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = /config-map-/i
}) => {
  testDict.forEach(item => {
    expect(queryByText(new RegExp(item.metadata.name, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(
      testDict.some(item => getNodeText(node) === item.metadata.name)
    ).toBeTruthy();
  });
};

describe('WorkspaceDropdown', () => {
  it('renders items contains configMaps and emptyDir', () => {
    jest
      .spyOn(API, 'useConfigMaps')
      .mockImplementation(() => ({ data: configMaps }));
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <WorkspaceDropdown {...props} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    const testDict = configMaps.concat([
      {
        metadata: {
          name: 'emptyDir'
        }
      }
    ]);
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict,
      configMapRegExp
    });
  });

  it('renders items contains configMaps, secrets and emptyDir', () => {
    jest
      .spyOn(API, 'useConfigMaps')
      .mockImplementation(() => ({ data: configMaps }));
    jest
      .spyOn(SecretsAPI, 'useSecrets')
      .mockImplementation(() => ({ data: secrets }));
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <WorkspaceDropdown {...props} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    const testDict = configMaps;
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict,
      configMapRegExp
    });
  });

  it('renders controlled selection configMaps', () => {
    jest
      .spyOn(API, 'useConfigMaps')
      .mockImplementation(() => ({ data: configMaps }));
    // Select item 'config-map-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <WorkspaceDropdown {...props} selectedItem={{ text: 'config-map-1' }} />
    );
    expect(queryByDisplayValue(/config-map-1/i)).toBeTruthy();
    // Select item 'config-map-1'
    render(
      <WorkspaceDropdown {...props} selectedItem={{ text: 'config-map-2' }} />,
      { rerender }
    );
    expect(queryByDisplayValue(/config-map-2/i)).toBeTruthy();
    // Select emptyDir
    render(
      <WorkspaceDropdown {...props} selectedItem={{ text: 'emptyDir' }} />,
      { rerender }
    );
    expect(queryByDisplayValue(/emptyDir/i)).toBeTruthy();
    // No selected item (select item '')
    render(<WorkspaceDropdown {...props} selectedItem="" />, { rerender });
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders emptyDir when no data', () => {
    jest.spyOn(API, 'useConfigMaps').mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const { getByText, getByPlaceholderText } = render(
      <WorkspaceDropdown {...props} />
    );

    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    expect(getByText(/emptyDir/i)).toBeTruthy();
  });

  it('for all namespaces renders emptyDir', () => {
    jest.spyOn(API, 'useConfigMaps').mockImplementation(() => ({ data: [] }));
    const { queryByPlaceholderText } = render(
      <WorkspaceDropdown {...props} namespace={ALL_NAMESPACES} />
    );
    expect(queryByPlaceholderText(/no workspaces found/i)).toBeNull();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders loading state', () => {
    jest
      .spyOn(API, 'useConfigMaps')
      .mockImplementation(() => ({ isFetching: true }));
    const { queryByPlaceholderText } = render(<WorkspaceDropdown {...props} />);
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(API, 'useConfigMaps')
      .mockImplementation(() => ({ data: configMaps }));
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <WorkspaceDropdown {...props} onChange={onChange} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/config-map-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

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
import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES, paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import CreatePipelineResource from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';

describe('CreatePipelineResource', () => {
  beforeEach(() => {
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: 'default' } }]
    }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
  });

  it('renders blank', () => {
    const { queryByText } = renderWithRouter(<CreatePipelineResource />);
    expect(queryByText('Create PipelineResource')).toBeTruthy();
    expect(queryByText('Cancel')).toBeTruthy();
    expect(queryByText('Create')).toBeTruthy();
  });

  it('redirects to PipelineResources on cancel', () => {
    jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
    jest.spyOn(window.history, 'pushState');

    const { queryByText } = renderWithRouter(<CreatePipelineResource />, {
      path: paths.pipelineResources.create(),
      route: urls.pipelineResources.create()
    });
    fireEvent.click(queryByText(/cancel/i));
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.anything(),
      null,
      urls.pipelineResources.all()
    );
  });

  const nameValidationErrorMsgRegExp =
    /Must consist of lower case alphanumeric characters, '-' or '.', start and end with an alphanumeric character, and be at most 63 characters/i;
  const namespaceValidationErrorRegExp = /Namespace required/i;
  const urlValidationErrorRegExp = /URL required/i;
  const revisionValidationErrorRegExp = /Revision required/i;

  it('validates all empty inputs', () => {
    const { queryByText } = renderWithRouter(<CreatePipelineResource />);
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name starts with a "-"', () => {
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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

  it('errors when name ends with a "."', () => {
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'meow.' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it('errors when name contains spaces', () => {
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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

  it('doesn\'t error when contains "-" or "." in the middle of the name', () => {
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
    );
    fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
      target: { value: 'the-cat.goes-meow' }
    });
    fireEvent.click(queryByText('Create'));
    expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(urlValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(revisionValidationErrorRegExp)).toBeTruthy();
  });

  it("doesn't error when name contains number", () => {
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <CreatePipelineResource />
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
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <CreatePipelineResource />
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

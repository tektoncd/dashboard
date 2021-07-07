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
import { fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test';
import RunAction from './RunAction';

/* RunAction should sit on the PipelineRun page and display notifications there
It would be useful to have tests at the container level too, but for now just do it at the component level */

const logsURL = '/fake/url';
const fakeRunName = 'fake_runName';
const fakeNamespace = 'fake_namespace';
const props = {
  getURL() {
    return logsURL;
  },
  run: {
    metadata: {
      namespace: fakeNamespace,
      name: fakeRunName
    },
    spec: {
      pipelineRef: {
        name: 'thepipeline'
      }
    }
  },
  showNotification() {}
};

it('Rerun button creates API call with correct parameters', done => {
  const response = Promise.resolve({ metadata: { name: fakeRunName } });
  const rerunMock = jest.fn().mockImplementation(() => response);
  jest.spyOn(props, 'getURL');
  jest.spyOn(props, 'showNotification');
  const { getByText } = renderWithRouter(
    <RunAction {...props} action="rerun" runaction={rerunMock} />
  );
  fireEvent.click(getByText('Rerun'));
  setImmediate(() => {
    expect(rerunMock).toHaveBeenCalledWith(props.run);
    expect(props.getURL).toHaveBeenCalledWith({
      name: fakeRunName,
      namespace: fakeNamespace
    });
    expect(props.showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'success', logsURL })
    );
    done();
  });
});

it('Rerun button handles API error', done => {
  const error = { response: { status: 500 } };
  const response = Promise.reject(error);
  const rerunMock = jest.fn().mockImplementation(() => response);
  jest.spyOn(props, 'getURL');
  jest.spyOn(props, 'showNotification');
  const { getByText } = renderWithRouter(
    <RunAction {...props} action="rerun" runaction={rerunMock} />
  );
  fireEvent.click(getByText('Rerun'));
  setImmediate(() => {
    expect(rerunMock).toHaveBeenCalledWith(props.run);
    expect(props.getURL).not.toHaveBeenCalled();
    expect(props.showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'error' })
    );
    done();
  });
});

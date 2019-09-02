/*
Copyright 2019 The Tekton Authors
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
import { renderWithRouter } from '../../utils/test';
import { Rebuild } from './Rebuild';

/* Rebuild should sit on the PipelineRun page and display notifications there
It would be useful to have tests at the container level too, but for now just do it at the component level */

const props = {
  pipelineRun: {
    metadata: {
      namespace: 'default'
    },
    spec: {
      pipelineRef: {
        name: 'thepipeline'
      }
    }
  }
};

const headers = {
  get() {
    return 'fake-pipeline-run';
  }
};

it('rebuild button creates API call with correct parameters', () => {
  const rebuildMock = jest
    .fn()
    .mockImplementation(() => Promise.resolve(headers));
  const { getByText } = renderWithRouter(
    <Rebuild
      {...props}
      rebuildPipelineRun={rebuildMock}
      runName="thepipelinerun"
    />
  );
  const theButton = getByText('Rebuild');
  fireEvent.click(theButton);
  const expected = { pipelinerunname: 'thepipelinerun' };
  // No namespace provided here, payload as above
  expect(rebuildMock).toHaveBeenCalledWith('default', expected);
});

it('rebuild button is ghost styled', async () => {
  const rebuildMock = jest
    .fn()
    .mockImplementation(() => Promise.resolve(headers));
  const { getByTestId } = renderWithRouter(
    <Rebuild
      {...props}
      rebuildPipelineRun={rebuildMock}
      runName="fake-pipeline-run"
    />
  );
  const rebuildButton = getByTestId('rebuild-btn');
  const rebuildButtonIsGhost = rebuildButton.getElementsByClassName(
    'rebuild-btn bx--btn bx--btn--ghost'
  );
  await waitForElement(() => rebuildButtonIsGhost);
});

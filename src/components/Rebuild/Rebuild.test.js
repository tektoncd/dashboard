import React from 'react';
import { fireEvent, waitForElement } from 'react-testing-library';
import { renderWithRouter } from '../../utils/test';
import { Rebuild } from './Rebuild';
import * as API from '../../api';

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
    .spyOn(API, 'rebuildPipelineRun')
    .mockImplementation(() => Promise.resolve(headers));
  const { getByText } = renderWithRouter(
    <Rebuild {...props} runName="thepipelinerun" />
  );
  const theButton = getByText('Rebuild');
  fireEvent.click(theButton);
  const expected = { pipelinerunname: 'thepipelinerun' };
  // No namespace provided here, payload as above
  expect(rebuildMock).toHaveBeenCalledWith('default', expected);
});

it('rebuild button is ghost styled', async () => {
  jest
    .spyOn(API, 'rebuildPipelineRun')
    .mockImplementation(() => Promise.resolve(headers));
  const { getByTestId } = renderWithRouter(
    <Rebuild {...props} runName="fake-pipeline-run" />
  );
  const rebuildButton = getByTestId('rebuild-btn');
  const rebuildButtonIsGhost = rebuildButton.getElementsByClassName(
    'rebuild-btn bx--btn bx--btn--ghost'
  );
  await waitForElement(() => rebuildButtonIsGhost);
});

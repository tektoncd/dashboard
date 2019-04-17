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
import { render } from 'react-testing-library';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CancelButton from './CancelButton';
import { renderWithRouter } from '../../utils/test';

configure({adapter: new Adapter()});

describe('Test Button component', () => {
  it('Test click event', () => {
    const mockCallBack = jest.fn();
    const type = "pipeline";
    const name = "pipelineRun1";

    const cancelButton = shallow((<CancelButton type={type} name={name} onSubmit={mockCallBack}>Ok!</CancelButton>));
    cancelButton.find('button').simulate('click');
    expect(queryByText(/pipelineRun1/i)).toBeTruthy();
  });
});

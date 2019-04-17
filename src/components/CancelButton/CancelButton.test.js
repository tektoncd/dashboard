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
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CancelButton from './CancelButton';

configure({ adapter: new Adapter() });

describe('Test Button component submit', () => {
  it('Test click event', () => {
    const mockCallBack = jest.fn();

    const button = mount(
      <CancelButton onCancel={mockCallBack}>Ok!</CancelButton>
    );
    button.find('.cancel-button').simulate('click');
    button.find('.bx--btn--primary').simulate('click');
    expect(mockCallBack.mock.calls.length).toEqual(1);
  });
});

describe('Test Button component', () => {
  it('Test click event', () => {
    const mockCallBack = jest.fn();

    const button = mount(
      <CancelButton onCancel={mockCallBack}>Ok!</CancelButton>
    );
    button.find('.cancel-button').simulate('click');
    button.find('.bx--btn--secondary').simulate('click');
    expect(mockCallBack.mock.calls.length).toEqual(0);
  });
});

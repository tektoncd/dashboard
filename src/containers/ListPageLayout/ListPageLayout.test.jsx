/*
Copyright 2020-2024 The Tekton Authors
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

import { renderWithRouter } from '../../utils/test';
import { ListPageLayout } from './ListPageLayout';

describe('ListPageLayout', () => {
  it('does not render LabelFilter input by default', () => {
    const { queryByLabelText } = renderWithRouter(
      <ListPageLayout>{() => {}}</ListPageLayout>
    );
    expect(queryByLabelText(/Input a label filter/i)).toBeFalsy();
  });

  it('renders LabelFilter input when filters prop is provided', () => {
    const { getAllByLabelText } = renderWithRouter(
      <ListPageLayout filters={[]}>{() => {}}</ListPageLayout>
    );
    expect(getAllByLabelText(/Input a label filter/i)[0]).toBeTruthy();
  });
});

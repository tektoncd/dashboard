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

import { render } from '../../utils/test';
import FormattedDuration from './FormattedDuration';

describe('FormattedDuration', () => {
  it('renders the duration and handles updates', () => {
    const { getByText, getByTitle, rerender } = render(
      <FormattedDuration milliseconds={1000} />
    );
    expect(getByText(/1s/i)).toBeTruthy();
    expect(getByTitle(/1s/i)).toBeTruthy();

    render(<FormattedDuration milliseconds={2000} />, { rerender });
    expect(getByText(/2s/i)).toBeTruthy();
    expect(getByTitle(/2s/i)).toBeTruthy();
  });
});

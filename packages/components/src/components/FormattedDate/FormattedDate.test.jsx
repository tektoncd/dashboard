/*
Copyright 2019-2024 The Tekton Authors
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
import FormattedDate from './FormattedDate';

describe('FormattedDate', () => {
  it('handles missing props', () => {
    const { container } = render(<FormattedDate />);
    expect(container.firstChild).toBeNull();
  });

  it('handles absolute date formatting', () => {
    const { queryByText } = render(
      <FormattedDate date="2019/12/01 12:13:14" />
    );
    expect(queryByText(/Dec 1, 2019, 12:13/i)).toBeTruthy();
    expect(queryByText(/:14/i)).toBeFalsy();
  });

  it('handles absolute date formatting with seconds', () => {
    const { queryByText } = render(
      <FormattedDate date="2019/12/01 12:13:14" includeSeconds />
    );
    expect(queryByText(/Dec 1, 2019, 12:13:14/i)).toBeTruthy();
  });

  it('handles absolute date formatting for current year', () => {
    const currentYear = new Date().getFullYear();
    const { queryByText } = render(
      <FormattedDate date={`${currentYear}/12/01`} />
    );
    expect(queryByText(currentYear)).toBeFalsy();
    expect(queryByText(/Dec 1/i)).toBeTruthy();
  });

  it('handles relative date formatting', () => {
    if (!Intl.RelativeTimeFormat) {
      Intl.RelativeTimeFormat = {};
    }
    const { container, queryByText } = render(
      <FormattedDate date="2019/12/01" relative />
    );
    expect(container.firstChild).not.toBeNull();
    expect(queryByText(/Dec 1, 2019/i)).toBeFalsy();
  });
});

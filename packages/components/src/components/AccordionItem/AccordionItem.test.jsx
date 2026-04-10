/*
Copyright 2026 The Tekton Authors
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

import AccordionItem from './AccordionItem';

describe('AccordionItem', () => {
  it('should render children when open is true', () => {
    const { queryByText } = render(
      <AccordionItem open title="Test Title">
        <div>Test Content</div>
      </AccordionItem>
    );
    expect(queryByText('Test Content')).toBeTruthy();
  });

  it('should not render children when open is false', () => {
    const { queryByText } = render(
      <AccordionItem open={false} title="Test Title">
        <div>Test Content</div>
      </AccordionItem>
    );
    expect(queryByText('Test Content')).toBeFalsy();
  });

  it('should pass through other props to CarbonAccordionItem', () => {
    const { container } = render(
      <AccordionItem
        open
        title="Test Title"
        className="custom-class"
        data-testid="test-accordion"
      >
        <div>Test Content</div>
      </AccordionItem>
    );
    const accordionItem = container.querySelector('.custom-class');
    expect(accordionItem).toBeTruthy();
  });
});

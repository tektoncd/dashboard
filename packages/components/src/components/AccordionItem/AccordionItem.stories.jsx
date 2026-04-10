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

import { Accordion } from '@carbon/react';

import AccordionItem from './AccordionItem';

export default {
  component: AccordionItem,
  title: 'AccordionItem'
};

export const Closed = {
  args: {
    open: false,
    title: 'Closed Accordion Item',
    children: <div>This content is not rendered when closed</div>
  },
  decorators: [
    Story => (
      <Accordion>
        <Story />
      </Accordion>
    )
  ]
};

export const Open = {
  args: {
    open: true,
    title: 'Open Accordion Item',
    children: (
      <div>
        <p>This content is rendered when open</p>
        <p>
          The AccordionItem optimizes rendering by only rendering children when
          open
        </p>
      </div>
    )
  },
  decorators: [
    Story => (
      <Accordion>
        <Story />
      </Accordion>
    )
  ]
};

export const MultipleItems = {
  render: () => (
    <Accordion>
      <AccordionItem open title="First Item">
        <p>Content of first item</p>
      </AccordionItem>
      <AccordionItem open={false} title="Second Item">
        <p>Content of second item (not rendered)</p>
      </AccordionItem>
      <AccordionItem open title="Third Item">
        <p>Content of third item</p>
      </AccordionItem>
    </Accordion>
  )
};

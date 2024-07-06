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
/* eslint-disable formatjs/no-literal-string-in-jsx */

import { TabList, TabPanel, TabPanels } from '@carbon/react';
import Tabs from '.';
import Tab from '../Tab';

export default {
  component: Tabs,
  title: 'Tabs'
};

export const Default = () => (
  <Tabs>
    <TabList>
      <Tab>label for tab1</Tab>
      <Tab>tab 2</Tab>
      <Tab disabled>tab 3 is disabled</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>content of tab 1</TabPanel>
      <TabPanel>content of tab 2</TabPanel>
      <TabPanel>content of tab 3</TabPanel>
    </TabPanels>
  </Tabs>
);

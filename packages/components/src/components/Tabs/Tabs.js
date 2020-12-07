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
/* istanbul ignore file */

import React from 'react';
import {
  TabContent as CarbonTabContent,
  Tabs as CarbonTabs
} from 'carbon-components-react';

const TabContent = ({ selected, ...other }) =>
  selected && <CarbonTabContent selected={selected} {...other} />;

const Tabs = ({ children, ...other }) => (
  <CarbonTabs {...other}>
    {React.Children.map(children, tab => {
      if (!tab) {
        return null;
      }
      return React.cloneElement(tab, {
        renderContent: TabContent
      });
    }).filter(Boolean)}
  </CarbonTabs>
);

export default Tabs;

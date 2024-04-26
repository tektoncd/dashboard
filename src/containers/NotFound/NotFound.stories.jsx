/*
Copyright 2021-2024 The Tekton Authors
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

import { NamespaceContext } from '../../api';
import NotFound from './NotFound';

const namespaceContext = {
  selectedNamespace: 'default'
};

export default {
  component: NotFound,
  decorators: [
    Story => (
      <div style={{ height: '100vh' }}>
        <NamespaceContext.Provider value={namespaceContext}>
          <Story />
        </NamespaceContext.Provider>
      </div>
    )
  ],
  title: 'NotFound'
};

export const Default = {};

export const CustomSuggestions = {
  args: {
    suggestions: [
      { text: 'CustomResources', to: '/customresources' },
      { text: 'Another link', to: '/somewhereelse' }
    ]
  }
};

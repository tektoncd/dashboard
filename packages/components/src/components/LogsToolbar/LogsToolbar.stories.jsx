/*
Copyright 2019-2025 The Tekton Authors
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

import { useArgs } from 'storybook/preview-api';

import LogsToolbar from './LogsToolbar';

export default {
  component: LogsToolbar,
  decorators: [
    Story => (
      <pre className="tkn--log" style={{ width: '300px' }}>
        <Story />
      </pre>
    )
  ],
  title: 'LogsToolbar'
};

export const Default = {
  args: {
    id: 'logs-toolbar',
    showTimestamps: false
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <LogsToolbar
        {...args}
        onToggleShowTimestamps={showTimestamps =>
          updateArgs({ showTimestamps })
        }
      />
    );
  }
};

export const WithLogLevels = {
  args: {
    ...Default.args,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false,
      trace: false
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <LogsToolbar
        {...args}
        onToggleLogLevel={logLevel =>
          updateArgs({ logLevels: { ...args.logLevels, ...logLevel } })
        }
        onToggleShowTimestamps={showTimestamps =>
          updateArgs({ showTimestamps })
        }
      />
    );
  }
};

export const WithMaximize = {
  args: {
    ...WithLogLevels.args,
    isMaximized: false
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <LogsToolbar
        {...args}
        onToggleLogLevel={logLevel =>
          updateArgs({ logLevels: { ...args.logLevels, ...logLevel } })
        }
        onToggleMaximized={() => updateArgs({ isMaximized: !args.isMaximized })}
        onToggleShowTimestamps={showTimestamps =>
          updateArgs({ showTimestamps })
        }
      />
    );
  }
};

export const WithURL = {
  args: {
    ...WithMaximize.args,
    name: 'some_filename.txt',
    url: '/some/logs/url'
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <LogsToolbar
        {...args}
        onToggleLogLevel={logLevel =>
          updateArgs({ logLevels: { ...args.logLevels, ...logLevel } })
        }
        onToggleMaximized={() => updateArgs({ isMaximized: !args.isMaximized })}
        onToggleShowTimestamps={showTimestamps =>
          updateArgs({ showTimestamps })
        }
      />
    );
  }
};

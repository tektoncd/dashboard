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

import { useArgs } from '@storybook/preview-api';

import Log from './Log';
import LogsToolbar from '../LogsToolbar';

const ansiLog =
  '\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-git-source-skaffold-git-ml8j4 ===\n{"level":"info","ts":1553865693.943092,"logger":"fallback-logger","caller":"git-init/main.go:100","msg":"Successfully cloned https://github.com/GoogleContainerTools/skaffold @ \\"master\\" in path \\"/workspace\\""}\n\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-build-and-push ===\n\u001b[36mINFO\u001b[0m[0000] Downloading base image golang:1.10.1-alpine3.7\n2019/03/29 13:21:34 No matching credentials were found, falling back on anonymous\n\u001b[36mINFO\u001b[0m[0001] Executing 0 build triggers\n\u001b[36mINFO\u001b[0m[0001] Unpacking rootfs as cmd RUN go build -o /app . requires it.\n\u001b[36mINFO\u001b[0m[0010] Taking snapshot of full filesystem...\n\u001b[36mINFO\u001b[0m[0015] Using files from context: [/workspace/examples/microservices/leeroy-app/app.go]\n\u001b[36mINFO\u001b[0m[0015] COPY app.go .\n\u001b[36mINFO\u001b[0m[0015] Taking snapshot of files...\n\u001b[36mINFO\u001b[0m[0015] RUN go build -o /app .\n\u001b[36mINFO\u001b[0m[0015] cmd: /bin/sh\n\u001b[36mINFO\u001b[0m[0015] args: [-c go build -o /app .]\n\u001b[36mINFO\u001b[0m[0016] Taking snapshot of full filesystem...\n\u001b[36mINFO\u001b[0m[0036] CMD ["./app"]\n\u001b[36mINFO\u001b[0m[0036] COPY --from=builder /app .\n\u001b[36mINFO\u001b[0m[0036] Taking snapshot of files...\nerror pushing image: failed to push to destination gcr.io/christiewilson-catfactory/leeroy-app:latest: Get https://gcr.io/v2/token?scope=repository%3Achristiewilson-catfactory%2Fleeroy-app%3Apush%2Cpull\u0026scope=repository%3Alibrary%2Falpine%3Apull\u0026service=gcr.io exit status 1\n\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: nop ===\nBuild successful\n\r\r\n';

const long = Array.from({ length: 60000 }, (v, i) => `Line ${i + 1}`).join(
  '\n'
);

const performanceTest = Array.from(
  { length: 700 },
  (v, i) => `Batch ${i + 1}\n${ansiLog}\n`
).join('');

export default {
  component: Log,
  decorators: [
    Story => (
      <div style={{ width: 'auto' }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    themes: {
      themeOverride: 'dark'
    }
  },
  subcomponents: { LogsToolbar },
  title: 'Log'
};

export const Loading = {};

export const Pending = {
  args: {
    fetchLogs: () => 'partial logs',
    forcePolling: true,
    stepStatus: { terminated: { reason: 'Completed' } }
  }
};

export const Completed = {
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: { terminated: { reason: 'Completed', exitCode: 0 } }
  }
};

export const CompletedNonZero = {
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: { terminated: { reason: 'Completed', exitCode: 1 } }
  },
  name: 'Completed: non-zero exit code'
};

export const Failed = {
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: { terminated: { reason: 'Error' } }
  }
};

export const ANSICodes = {
  args: {
    fetchLogs: () => ansiLog,
    stepStatus: { terminated: { reason: 'Completed', exitCode: 0 } }
  }
};

export const Windowed = {
  args: {
    fetchLogs: () => long,
    showLevels: true,
    showTimestamps: true,
    stepStatus: { terminated: { reason: 'Completed', exitCode: 0 } }
  }
};

export const Performance = {
  args: {
    fetchLogs: () => performanceTest,
    showLevels: true,
    showTimestamps: true,
    stepStatus: { terminated: { reason: 'Completed', exitCode: 0 } }
  },
  name: 'performance test (<20,000 lines with ANSI)'
};

export const Skipped = {
  args: {
    fetchLogs: () => 'This step was skipped',
    stepStatus: {
      terminated: { reason: 'Completed', exitCode: 0 },
      terminationReason: 'Skipped'
    }
  }
};

export const Toolbar = {
  args: {
    fetchLogs: async () =>
      (await import('./samples/timestamps_log_levels.txt?raw')).default,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false
    },
    showLevels: true,
    showTimestamps: false,
    stepStatus: { terminated: { reason: 'Completed', exitCode: 0 } }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <Log
        {...args}
        toolbar={
          <LogsToolbar
            id="logs-toolbar"
            logLevels={args.showLevels ? args.logLevels : null}
            name="step_log_filename.txt"
            onToggleLogLevel={logLevel =>
              updateArgs({ logLevels: { ...args.logLevels, ...logLevel } })
            }
            onToggleShowTimestamps={showTimestamps =>
              updateArgs({ showTimestamps })
            }
            showTimestamps={args.showTimestamps}
            url="/step/log/url"
          />
        }
      />
    );
  }
};

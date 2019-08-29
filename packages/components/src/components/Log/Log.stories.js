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

import React from 'react';
import { storiesOf } from '@storybook/react';
import Log from './Log';

const ansiLog =
  '\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-git-source-skaffold-git-ml8j4 ===\n{"level":"info","ts":1553865693.943092,"logger":"fallback-logger","caller":"git-init/main.go:100","msg":"Successfully cloned https://github.com/GoogleContainerTools/skaffold @ \\"master\\" in path \\"/workspace\\""}\n\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-build-and-push ===\n\u001b[36mINFO\u001b[0m[0000] Downloading base image golang:1.10.1-alpine3.7\n2019/03/29 13:21:34 No matching credentials were found, falling back on anonymous\n\u001b[36mINFO\u001b[0m[0001] Executing 0 build triggers\n\u001b[36mINFO\u001b[0m[0001] Unpacking rootfs as cmd RUN go build -o /app . requires it.\n\u001b[36mINFO\u001b[0m[0010] Taking snapshot of full filesystem...\n\u001b[36mINFO\u001b[0m[0015] Using files from context: [/workspace/examples/microservices/leeroy-app/app.go]\n\u001b[36mINFO\u001b[0m[0015] COPY app.go .\n\u001b[36mINFO\u001b[0m[0015] Taking snapshot of files...\n\u001b[36mINFO\u001b[0m[0015] RUN go build -o /app .\n\u001b[36mINFO\u001b[0m[0015] cmd: /bin/sh\n\u001b[36mINFO\u001b[0m[0015] args: [-c go build -o /app .]\n\u001b[36mINFO\u001b[0m[0016] Taking snapshot of full filesystem...\n\u001b[36mINFO\u001b[0m[0036] CMD ["./app"]\n\u001b[36mINFO\u001b[0m[0036] COPY --from=builder /app .\n\u001b[36mINFO\u001b[0m[0036] Taking snapshot of files...\nerror pushing image: failed to push to destination gcr.io/christiewilson-catfactory/leeroy-app:latest: Get https://gcr.io/v2/token?scope=repository%3Achristiewilson-catfactory%2Fleeroy-app%3Apush%2Cpull\u0026scope=repository%3Alibrary%2Falpine%3Apull\u0026service=gcr.io exit status 1\n\n=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: nop ===\nBuild successful\n';

const long = Array.from({ length: 2000 }, (v, i) => `Line ${i + 1}\n`).join('');

storiesOf('Log', module)
  .addDecorator(story => <div style={{ width: '500px' }}>{story()}</div>)
  .add('default', () => <Log />)
  .add('loading', () => <Log loading />)
  .add('completed', () => (
    <Log
      stepStatus={{ terminated: { reason: 'Completed' } }}
      fetchLogs={() => 'A log message'}
      status="Completed"
    />
  ))
  .add('failed', () => (
    <Log
      stepStatus={{ terminated: { reason: 'Error' } }}
      fetchLogs={() => 'A log message'}
      status="Error"
    />
  ))
  .add('ansi codes', () => (
    <Log
      stepStatus={{ terminated: { reason: 'Completed' } }}
      fetchLogs={() => ansiLog}
      status="Completed"
    />
  ))
  .add('windowed', () => (
    <Log
      stepStatus={{ terminated: { reason: 'Completed' } }}
      fetchLogs={() => long}
      status="Completed"
    />
  ));

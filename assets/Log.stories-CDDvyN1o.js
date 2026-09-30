const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./timestamps_log_levels-9xVoDwSy.js","./rolldown-runtime-DkW27tQK.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./preload-helper-VEOc_cSF.js";import{t as r}from"./jsx-runtime-ATHzeHXA.js";import{n as i,t as a}from"./LogsToolbar-BDX0TP9V.js";import{n as o,t as s}from"./Log-DwGKbL0l.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{o(),i(),c=r(),t(),{useArgs:l}=__STORYBOOK_MODULE_PREVIEW_API__,u=`
=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-git-source-skaffold-git-ml8j4 ===
{"level":"info","ts":1553865693.943092,"logger":"fallback-logger","caller":"git-init/main.go:100","msg":"Successfully cloned https://github.com/GoogleContainerTools/skaffold @ \\"master\\" in path \\"/workspace\\""}

=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: build-step-build-and-push ===
\x1B[36mINFO\x1B[0m[0000] Downloading base image golang:1.10.1-alpine3.7
2019/03/29 13:21:34 No matching credentials were found, falling back on anonymous
\x1B[36mINFO\x1B[0m[0001] Executing 0 build triggers
\x1B[36mINFO\x1B[0m[0001] Unpacking rootfs as cmd RUN go build -o /app . requires it.
\x1B[36mINFO\x1B[0m[0010] Taking snapshot of full filesystem...
\x1B[36mINFO\x1B[0m[0015] Using files from context: [/workspace/examples/microservices/leeroy-app/app.go]
\x1B[36mINFO\x1B[0m[0015] COPY app.go .
\x1B[36mINFO\x1B[0m[0015] Taking snapshot of files...
\x1B[36mINFO\x1B[0m[0015] RUN go build -o /app .
\x1B[36mINFO\x1B[0m[0015] cmd: /bin/sh
\x1B[36mINFO\x1B[0m[0015] args: [-c go build -o /app .]
\x1B[36mINFO\x1B[0m[0016] Taking snapshot of full filesystem...
\x1B[36mINFO\x1B[0m[0036] CMD ["./app"]
\x1B[36mINFO\x1B[0m[0036] COPY --from=builder /app .
\x1B[36mINFO\x1B[0m[0036] Taking snapshot of files...
error pushing image: failed to push to destination gcr.io/christiewilson-catfactory/leeroy-app:latest: Get https://gcr.io/v2/token?scope=repository%3Achristiewilson-catfactory%2Fleeroy-app%3Apush%2Cpull&scope=repository%3Alibrary%2Falpine%3Apull&service=gcr.io exit status 1

=== demo-pipeline-run-1-build-skaffold-app-2mrdg-pod-59e217: nop ===
Build successful
\r\r
`,d=Array.from({length:6e4},(e,t)=>`Line ${t+1}`).join(`
`),f=Array.from({length:700},(e,t)=>`Batch ${t+1}\n${u}\n`).join(``),p={component:s,decorators:[e=>(0,c.jsx)(`div`,{style:{width:`auto`},children:(0,c.jsx)(e,{})})],parameters:{themes:{themeOverride:`dark`}},subcomponents:{LogsToolbar:a},title:`Log`},m={},h={args:{fetchLogs:()=>`partial logs`,forcePolling:!0,stepStatus:{terminated:{reason:`Completed`}}}},g={args:{fetchLogs:()=>`A log message`,stepStatus:{terminated:{reason:`Completed`,exitCode:0}}}},_={args:{fetchLogs:()=>`A log message`,stepStatus:{terminated:{reason:`Completed`,exitCode:1}}},name:`Completed: non-zero exit code`},v={args:{fetchLogs:()=>`A log message`,stepStatus:{terminated:{reason:`Error`}}}},y={args:{fetchLogs:()=>u,stepStatus:{terminated:{reason:`Completed`,exitCode:0}}}},b={args:{fetchLogs:()=>d,showLevels:!0,showTimestamps:!0,stepStatus:{terminated:{reason:`Completed`,exitCode:0}}}},x={args:{fetchLogs:()=>f,showLevels:!0,showTimestamps:!0,stepStatus:{terminated:{reason:`Completed`,exitCode:0}}},name:`performance test (<20,000 lines with ANSI)`},S={args:{fetchLogs:()=>`This step was skipped`,stepStatus:{terminated:{reason:`Completed`,exitCode:0},terminationReason:`Skipped`}}},C={args:{fetchLogs:async()=>(await n(async()=>{let{default:e}=await import(`./timestamps_log_levels-9xVoDwSy.js`);return{default:e}},__vite__mapDeps([0,1]),import.meta.url)).default,logLevels:{error:!0,warning:!0,info:!0,notice:!0,debug:!1,trace:!1},maxLineLength:250,showLevels:!0,showTimestamps:!1,stepStatus:{terminated:{reason:`Completed`,exitCode:0}}},render:e=>{let[,t]=l();return(0,c.jsx)(s,{...e,toolbar:(0,c.jsx)(a,{id:`logs-toolbar`,logLevels:e.showLevels?e.logLevels:null,name:`step_log_filename.txt`,onToggleLogLevel:n=>t({logLevels:{...e.logLevels,...n}}),onToggleShowTimestamps:e=>t({showTimestamps:e}),showTimestamps:e.showTimestamps,url:`/step/log/url`})})}},w=[`Loading`,`Pending`,`Completed`,`CompletedNonZero`,`Failed`,`ANSICodes`,`Windowed`,`Performance`,`Skipped`,`Toolbar`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'partial logs',
    forcePolling: true,
    stepStatus: {
      terminated: {
        reason: 'Completed'
      }
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 1
      }
    }
  },
  name: 'Completed: non-zero exit code'
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: {
      terminated: {
        reason: 'Error'
      }
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => ansiLog,
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => long,
    showLevels: true,
    showTimestamps: true,
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => performanceTest,
    showLevels: true,
    showTimestamps: true,
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  },
  name: 'performance test (<20,000 lines with ANSI)'
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'This step was skipped',
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      },
      terminationReason: 'Skipped'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: async () => (await import('./examples/timestamps_log_levels.txt?raw')).default,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false,
      trace: false
    },
    maxLineLength: 250,
    showLevels: true,
    showTimestamps: false,
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <Log {...args} toolbar={<LogsToolbar id="logs-toolbar" logLevels={args.showLevels ? args.logLevels : null} name="step_log_filename.txt" onToggleLogLevel={logLevel => updateArgs({
      logLevels: {
        ...args.logLevels,
        ...logLevel
      }
    })} onToggleShowTimestamps={showTimestamps => updateArgs({
      showTimestamps
    })} showTimestamps={args.showTimestamps} url="/step/log/url" />} />;
  }
}`,...C.parameters?.docs?.source}}}})))()}T();export{y as ANSICodes,g as Completed,_ as CompletedNonZero,v as Failed,m as Loading,h as Pending,x as Performance,S as Skipped,C as Toolbar,b as Windowed,w as __namedExportsOrder,p as default};
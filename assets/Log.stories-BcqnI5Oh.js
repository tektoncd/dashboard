import{_ as h}from"./iframe-0KkBUDFS.js";import{j as g}from"./jsx-runtime-B0wN4eWF.js";import{L as u}from"./Log-CuX5kE6N.js";import{L as x}from"./LogsToolbar-B2O21g5A.js";import"./vendor-BSSDxmaA.js";import"./index-DS1rTf2F.js";import"./index-BLsgEXh-.js";import"./usePrefix-DVhi0s40.js";import"./Button-DXQXyzWq.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-CvulwabO.js";import"./index-mhCn_TNf.js";import"./index-7UTgOZSF.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./SkeletonText-BsZPl02y.js";import"./extends-CF3RwP-h.js";import"./index-CbuwW4_d.js";import"./index-CfoIBI3E.js";import"./bucket-17-Dfp7XseK.js";import"./Icon-Dlg6_ItC.js";import"./bucket-5-B__QRtnz.js";import"./LogFormat-Bv_ssSfo.js";import"./FormattedDate-BAqjGlH3.js";import"./DotSpinner-D8BlggaK.js";import"./bucket-9-CFGufIsT.js";import"./noopFn-g4z370MD.js";import"./Text-9nRGETFr.js";import"./bucket-18-D1v83Eua.js";import"./bucket-11-CJvd3vIe.js";import"./bucket-10-C-nanEs4.js";import"./bucket-15-DETD0dec.js";const{useArgs:L}=__STORYBOOK_MODULE_PREVIEW_API__,f=`
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
`,C=Array.from({length:6e4},(e,o)=>`Line ${o+1}`).join(`
`),w=Array.from({length:700},(e,o)=>`Batch ${o+1}
${f}
`).join(""),te={component:u,decorators:[e=>g.jsx("div",{style:{width:"auto"},children:g.jsx(e,{})})],parameters:{themes:{themeOverride:"dark"}},title:"Log"},s={},t={args:{fetchLogs:()=>"partial logs",forcePolling:!0,stepStatus:{terminated:{reason:"Completed"}}}},r={args:{fetchLogs:()=>"A log message",stepStatus:{terminated:{reason:"Completed",exitCode:0}}}},a={args:{fetchLogs:()=>"A log message",stepStatus:{terminated:{reason:"Completed",exitCode:1}}},name:"Completed: non-zero exit code"},n={args:{fetchLogs:()=>"A log message",stepStatus:{terminated:{reason:"Error"}}}},i={args:{fetchLogs:()=>f,stepStatus:{terminated:{reason:"Completed",exitCode:0}}}},m={args:{fetchLogs:()=>C,showLevels:!0,showTimestamps:!0,stepStatus:{terminated:{reason:"Completed",exitCode:0}}}},p={args:{fetchLogs:()=>w,showLevels:!0,showTimestamps:!0,stepStatus:{terminated:{reason:"Completed",exitCode:0}}},name:"performance test (<20,000 lines with ANSI)"},l={args:{fetchLogs:()=>"This step was skipped",stepStatus:{terminated:{reason:"Completed",exitCode:0},terminationReason:"Skipped"}}},d={args:{fetchLogs:async()=>(await h(async()=>{const{default:e}=await import("./timestamps_log_levels-nADEx-xN.js");return{default:e}},[],import.meta.url)).default,logLevels:{error:!0,warning:!0,info:!0,notice:!0,debug:!1},showLevels:!0,showTimestamps:!1,stepStatus:{terminated:{reason:"Completed",exitCode:0}}},render:e=>{const[,o]=L();return g.jsx(u,{...e,toolbar:g.jsx(x,{id:"logs-toolbar",logLevels:e.showLevels?e.logLevels:null,name:"step_log_filename.txt",onToggleLogLevel:c=>o({logLevels:{...e.logLevels,...c}}),onToggleShowTimestamps:c=>o({showTimestamps:c}),showTimestamps:e.showTimestamps,url:"/step/log/url"})})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'partial logs',
    forcePolling: true,
    stepStatus: {
      terminated: {
        reason: 'Completed'
      }
    }
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => 'A log message',
    stepStatus: {
      terminated: {
        reason: 'Error'
      }
    }
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => ansiLog,
    stepStatus: {
      terminated: {
        reason: 'Completed',
        exitCode: 0
      }
    }
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: async () => (await import('./samples/timestamps_log_levels.txt?raw')).default,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false
    },
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
}`,...d.parameters?.docs?.source}}};const re=["Loading","Pending","Completed","CompletedNonZero","Failed","ANSICodes","Windowed","Performance","Skipped","Toolbar"];export{i as ANSICodes,r as Completed,a as CompletedNonZero,n as Failed,s as Loading,t as Pending,p as Performance,l as Skipped,d as Toolbar,m as Windowed,re as __namedExportsOrder,te as default};

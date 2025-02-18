import{j as r}from"./jsx-runtime-B0wN4eWF.js";import{S as o}from"./StepDetails-DXb_LI18.js";import{L as l}from"./Log-CuX5kE6N.js";import"./index-DS1rTf2F.js";import"./index-CvulwabO.js";import"./index-BLsgEXh-.js";import"./index-CbuwW4_d.js";import"./index-CfoIBI3E.js";import"./usePrefix-DVhi0s40.js";import"./Tabs-4y_hjRYw.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-7UTgOZSF.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./keys-fZP-1wUt.js";import"./useControllableState-BPNuw5M3.js";import"./Text-9nRGETFr.js";import"./bucket-3-igrvqujs.js";import"./Icon-Dlg6_ItC.js";import"./debounce-DBudwqRe.js";import"./DetailsHeader-B1o2hUA4.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-18-D1v83Eua.js";import"./constants-CJ-WDauL.js";import"./bucket-12-DVDhO4p7.js";import"./FormattedDuration-hz7jymot.js";import"./StepDefinition-p1dHpIVX.js";import"./ViewYAML-BQtIWtmr.js";import"./Button-DXQXyzWq.js";import"./index-mhCn_TNf.js";import"./events-OVwOsPzJ.js";import"./SkeletonText-BsZPl02y.js";import"./extends-CF3RwP-h.js";import"./bucket-5-B__QRtnz.js";import"./LogFormat-Bv_ssSfo.js";import"./FormattedDate-BAqjGlH3.js";import"./DotSpinner-D8BlggaK.js";import"./bucket-9-CFGufIsT.js";const{useArgs:m}=__STORYBOOK_MODULE_PREVIEW_API__;function d({exitCode:e=0,terminationReason:t}={}){return{terminated:{exitCode:e,reason:"Completed"},terminationReason:t}}const u=`
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
`;function g({exitCode:e=0,logContent:t=u,terminationReason:n}={}){return r.jsx(l,{fetchLogs:()=>t,stepStatus:d({exitCode:e,terminationReason:n})})}const re={args:{definition:"this will show the Task.spec or TaskRun.spec.taskSpec",stepName:"build",taskRun:{}},component:o,title:"StepDetails"},s={args:{logContainer:g(),stepStatus:d()},render:e=>{const[,t]=m();return r.jsx(o,{...e,onViewChange:n=>t({view:n})})}},i={args:{logContainer:g({exitCode:1}),stepStatus:d({exitCode:1})},render:e=>{const[,t]=m();return r.jsx(o,{...e,onViewChange:n=>t({view:n})})}},a={args:{logContainer:g(),skippedTask:{}},render:e=>{const[,t]=m();return r.jsx(o,{...e,onViewChange:n=>t({view:n})})}},p={args:{logContainer:g({logContent:"Step was skipped due to when expressions were evaluated to false.",terminationReason:"Skipped"}),stepStatus:{terminated:{exitCode:0,reason:"Completed"},terminationReason:"Skipped"}},render:e=>{const[,t]=m();return r.jsx(o,{...e,onViewChange:n=>t({view:n})})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer(),
    stepStatus: getStepStatus()
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <StepDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer({
      exitCode: 1
    }),
    stepStatus: getStepStatus({
      exitCode: 1
    })
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <StepDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer(),
    skippedTask: {}
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <StepDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...a.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer({
      logContent: 'Step was skipped due to when expressions were evaluated to false.',
      terminationReason: 'Skipped'
    }),
    stepStatus: {
      terminated: {
        exitCode: 0,
        reason: 'Completed'
      },
      terminationReason: 'Skipped'
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <StepDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...p.parameters?.docs?.source}}};const oe=["Default","WithWarning","SkippedTask","SkippedStep"];export{s as Default,p as SkippedStep,a as SkippedTask,i as WithWarning,oe as __namedExportsOrder,re as default};

import{j as i}from"./jsx-runtime-QvtbNqby.js";import{S as n}from"./StepDetails-qG1lrq9u.js";import{L as l}from"./Log-D3o9RkYO.js";import"./index-BjzEU6Zr.js";import"./index-kGlasm3i.js";import"./index-R-2E0Llw.js";import"./index-CfoIBI3E.js";import"./usePrefix-C48kcqDW.js";import"./Tabs-DccB0do-.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./index-CjLpwf8N.js";import"./index-Dc4QqC9m.js";import"./Tooltip-CzMs6ESB.js";import"./useControllableState-Co_owzu1.js";import"./deprecate-CHyGWMAj.js";import"./bucket-2-C9DXCKPV.js";import"./Icon-CpyVU44g.js";import"./bucket-3-Dq7FRXBG.js";import"./DetailsHeader-DXO7Mvje.js";import"./StatusIcon-BOJjQf4B.js";import"./bucket-16-CiwkPD5r.js";import"./Spinner-Dbwi84XW.js";import"./bucket-13-CBnqkqgu.js";import"./bucket-18-ByJs4WER.js";import"./bucket-12-CMgbqDR8.js";import"./FormattedDuration-BhxTaD9H.js";import"./StepDefinition-Zm2Nreff.js";import"./ViewYAML-DKM26Bir.js";import"./Button-B7xRuRrN.js";import"./index-CZBwXVK3.js";import"./events-OVwOsPzJ.js";import"./SkeletonText-DN73_2Nu.js";import"./extends-CF3RwP-h.js";import"./inheritsLoose-CMy1E8oj.js";import"./bucket-17-bHtnLuTa.js";import"./bucket-5-BULz4hzg.js";import"./LogFormat-Bpe5Aqro.js";import"./DotSpinner-BSho4s4W.js";const{useArgs:p}=__STORYBOOK_MODULE_PREVIEW_API__;function a({exitCode:e=0}={}){return{terminated:{exitCode:e,reason:"Completed"}}}const g=`
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
`;function m({exitCode:e=0}={}){return i.jsx(l,{fetchLogs:()=>g,stepStatus:a({exitCode:e})})}const X={args:{definition:"this will show the Task.spec or TaskRun.spec.taskSpec",stepName:"build",taskRun:{}},component:n,title:"StepDetails"},t={args:{logContainer:m(),stepStatus:a()},render:e=>{const[,r]=p();return i.jsx(n,{...e,onViewChange:s=>r({view:s})})}},o={args:{logContainer:m({exitCode:1}),stepStatus:a({exitCode:1})},render:e=>{const[,r]=p();return i.jsx(n,{...e,onViewChange:s=>r({view:s})})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const Z=["Default","WithWarning"];export{t as Default,o as WithWarning,Z as __namedExportsOrder,X as default};

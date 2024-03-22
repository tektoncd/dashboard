import{j as p}from"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import{S as s}from"./StepDetails-pRMvPcg2.js";import{L as n}from"./Log--a9RCb7B.js";import"./index-MRYFjIDu.js";import"./index-uZO_dCSX.js";import"./index-WkqOPh6Z.js";import"./settings-zSvLtxj8.js";import"./Tabs-qbQZOPvG.js";import"./index-7Q--xhFC.js";import"./extends-dGVwEr9R.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./setPrototypeOf-ahVgEFUp.js";import"./assertThisInitialized-4q6YPdh3.js";import"./getPrototypeOf-VcprQjSG.js";import"./index-U9QwFHm3.js";import"./deprecate-hcs7xc4A.js";import"./slicedToArray-MNgqcm8y.js";import"./navigation-fv4tXnKy.js";import"./match-bSaK7Hln.js";import"./useIsomorphicEffect-Y2lYA90t.js";import"./index-n80ymgmT.js";import"./useId-J3cPtmMT.js";import"./setupGetInstanceId-vqAyjREf.js";import"./useMergedRefs-0i-7LjaH.js";import"./bucket-5-mAOIXUdD.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./DetailsHeader-mymHQUEI.js";import"./FormattedDuration-IgQos6RL.js";import"./StatusIcon-qrSsKqPY.js";import"./bucket-6-dQ54tAAx.js";import"./bucket-31-qnmMSxzE.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";import"./bucket-34-ngKLiAY2.js";import"./StepDefinition-1kj_B2eA.js";import"./ViewYAML-uiPRJ4iW.js";import"./Button-HUe_pxfK.js";import"./toConsumableArray-ZcblzY6P.js";import"./events-ZBveWIsY.js";import"./index-HaCShj3n.js";import"./SkeletonText-kd7LZ-_w.js";import"./inheritsLoose-fS6oVJzb.js";import"./bucket-32-GkAW8Hfz.js";import"./bucket-10-igEpBC92.js";import"./LogFormat-eqqK4TQi.js";import"./DotSpinner-iWDwO7sl.js";function i({exitCode:e=0}={}){return{terminated:{exitCode:e,reason:"Completed"}}}const a=`
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
`;function r({exitCode:e=0}={}){return p.jsx(n,{fetchLogs:()=>a,stepStatus:i({exitCode:e})})}const rt={args:{definition:"this will show the Task.spec or TaskRun.spec.taskSpec",stepName:"build",taskRun:{}},component:s,title:"StepDetails"},t={args:{logContainer:r(),stepStatus:i()}},o={args:{logContainer:r({exitCode:1}),stepStatus:i({exitCode:1})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer(),
    stepStatus: getStepStatus()
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    logContainer: getLogContainer({
      exitCode: 1
    }),
    stepStatus: getStepStatus({
      exitCode: 1
    })
  }
}`,...o.parameters?.docs?.source}}};const pt=["Default","WithWarning"];export{t as Default,o as WithWarning,pt as __namedExportsOrder,rt as default};

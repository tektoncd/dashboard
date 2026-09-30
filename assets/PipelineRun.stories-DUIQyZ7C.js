import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-B6tGW3fj.js";import{n,t as r}from"./FormattedDuration-zgKifZEI.js";import{n as i}from"./useIntl-lGVSqoC-.js";import{r as a}from"./lib-BZfqaDTj.js";import{t as o}from"./jsx-runtime-ATHzeHXA.js";import{r as s,t as ee}from"./constants-CMP9haFk.js";import{c,d as l,f as u,o as d,r as f}from"./utils-jtJj5xm0.js";import{i as p,r as m}from"./Link-DxoCdxb2.js";import{n as h,t as g}from"./LogsToolbar-BDX0TP9V.js";import{i as _,r as v}from"./bucket-14-BZ2wPrQ2.js";import{n as y,t as b}from"./StatusIcon-CqVkcvSs.js";import{i as x,t as S}from"./es-BERic32k.js";import{t as te}from"./SkeletonText-CWhiJ563.js";import{n as ne,t as C}from"./TaskRunDetails-DVFcVDpT.js";import{n as w,t as re}from"./Log-DwGKbL0l.js";import{a as T,i as ie,r as ae,s as oe,t as E}from"./Tabs-SKfR6PHq.js";import{n as se}from"./Notification-wwp6wvbH.js";import{n as ce,t as le}from"./RunHeader-B0plfM_5.js";import{n as ue,t as de}from"./TaskRunLogs-C3bEEtNC.js";var D,fe;function O(){return(O=e((()=>{S(),ne(),ue(),D=o(),fe=({expandedSteps:e,getLogContainer:t,getLogsToolbar:n,ignoredSidecars:r={},isMaximized:i,onRetryChange:a,onStepSelected:o,onToggleMaximized:s,onViewChange:ee,pod:c,preTaskRun:l,selectedIndex:u,selectedRetry:d,selectedStepId:f,selectedTaskId:p,skippedTask:m,TabPanel:h=ie,TabPanels:g=T,task:_,taskRun:v,taskRuns:y,view:b})=>{let x=(0,D.jsx)(de,{expandedSteps:e,getLogContainer:t,ignoredSidecars:r,onStepSelected:o,selectedRetry:d,selectedTaskId:p,skippedTask:m,task:_,taskRun:v});return(0,D.jsxs)(g,{children:[l?(0,D.jsx)(h,{children:u===0?l.content:null}):null,y.map((e,t)=>(0,D.jsx)(h,{children:u===t+1?(0,D.jsx)(C,{fullTaskRun:e,getLogsToolbar:n,isMaximized:i,logs:x,onRetryChange:a,onToggleMaximized:s,onViewChange:ee,pod:c,selectedRetry:d,selectedStepId:f,skippedTask:m,task:_,taskRun:v,view:b}):null},e.metadata?.uid||t))]})},fe.__docgenInfo={description:``,methods:[],displayName:`TaskRunTabPanels`,props:{ignoredSidecars:{defaultValue:{value:`{}`,computed:!1},required:!1},TabPanel:{defaultValue:{value:`CarbonTabPanel`,computed:!0},required:!1},TabPanels:{defaultValue:{value:`CarbonTabPanels`,computed:!0},required:!1}}}})))()}function pe({preTaskRun:e,skippedTasks:t=A.skippedTasks,taskRuns:n=A.taskRuns}){let i=x();return(0,k.jsxs)(ae,{activation:`manual`,className:`tkn--task-list`,size:`xl`,children:[e?(0,k.jsxs)(E,{id:e.id,children:[(0,k.jsxs)(`div`,{className:`tkn--task-title`,title:e.title,children:[e.icon,(0,k.jsx)(`span`,{className:`tkn--task-title--name`,children:e.title})]}),(0,k.jsx)(`div`,{className:`${i}--tabs__nav-item-secondary-label tkn--task-duration`,children:e.duration?(0,k.jsx)(r,{milliseconds:e.duration}):`-`})]}):null,n.map(e=>{let{uid:n,labels:a,name:o}=e.metadata,{[s.DASHBOARD_DISPLAY_NAME]:c,[s.PIPELINE_TASK]:f}=a,p=c||f||o,m;if(e.status){let t=new Date(e.metadata.creationTimestamp).getTime();m=(e.status.completionTime?new Date(e.status.completionTime).getTime():Date.now())-t}let h=u(e),{reason:g}=h,{status:_}=h,{steps:y}=e.status||{};!g&&t.find(e=>e.name===f)&&(g=ee);let x=l(y)?.some(e=>{let{exitCode:t,reason:n}=d(e);return n===`Completed`&&t!==0});return(0,k.jsxs)(E,{className:`tkn--task`,"data-has-warning":x,"data-reason":g,"data-succeeded":_,id:f,title:p,children:[(0,k.jsxs)(`div`,{className:`tkn--task-title`,title:p,children:[(0,k.jsx)(b,{DefaultIcon:e=>(0,k.jsx)(v,{...e}),hasWarning:x,reason:g,size:17,status:_}),(0,k.jsx)(`span`,{className:`tkn--task-title--name`,children:p})]}),(0,k.jsx)(`div`,{className:`${i}--tabs__nav-item-secondary-label tkn--task-duration`,children:m?(0,k.jsx)(r,{milliseconds:m}):`-`})]},n)})]})}var k,A;function j(){return(j=e((()=>{S(),_(),c(),y(),n(),k=o(),A={skippedTasks:[],taskRuns:[]},pe.__docgenInfo={description:``,methods:[],displayName:`TaskRunTabs`,props:{skippedTasks:{defaultValue:{value:`[]`,computed:!1},required:!1},taskRuns:{defaultValue:{value:`[]`,computed:!1},required:!1}}}})))()}function me({pipeline:e,pipelineRun:t,selectedTaskId:n,taskRun:r}){let i=r?.metadata?.labels?.[s.MEMBER_OF];return(t.spec?.pipelineSpec?.[i]||t.status?.pipelineSpec?.[i]||e?.spec?.[i])?.find(e=>e.name===n)}function M({description:e,displayRunHeader:t,duration:n,error:r,fetchLogs:a,forceLogPolling:o,getLogsToolbar:ee,getStepLogToolbar:c,handlePipelineRunInfo:l=()=>{},handleTaskSelected:d=()=>{},ignoredSidecars:p={},loading:m,logLevels:h,onRetryChange:g,onViewChange:_=()=>{},pipeline:v,pipelineRun:y,pod:b,pollingInterval:x,preTaskRun:S,runActions:ne,selectedRetry:C,selectedStepId:w=null,selectedTaskId:T=null,selectedTaskRunName:ie,showLogLevels:ae,showLogTimestamps:E,taskRuns:ce,tasks:ue,triggerHeader:de,view:D=null}){let O=i(),[k,A]=(0,he.useState)(!1),[j,M]=(0,he.useState)(()=>w?{[w]:!0}:{}),ge=y?.metadata?.namespace,P=y?.spec?.pipelineRef&&y?.spec?.pipelineRef?.name;function F(){if(!y.status?.taskRuns&&!y.status?.childReferences)return null;let{status:{childReferences:e,taskRuns:t}}=y,{status:n}=u(y);return n===`False`&&!t&&!e}function I(){let{status:e,reason:t}=u(y);return e===`False`&&t!==`Cancelled`}function L(){A(e=>!e)}function R({isSidecar:e,stepName:t,stepStatus:n,taskRun:r}){return!w&&!t||!n?null:(0,N.jsx)(re,{fetchLogs:()=>a({stepName:t,stepStatus:n,taskRun:r}),forcePolling:o,isSidecar:e,logLevels:h,pollingInterval:x,showLevels:ae,showTimestamps:E,stepStatus:n,toolbar:c&&n&&c({stepStatus:n,taskRun:r})},`${T}:${t}:${C}`)}function z(){return!y?.status?.taskRuns&&!y?.status?.childReferences?[]:ce||[]}function B({selectedRetry:e,selectedStepId:t,selectedTaskId:n,taskRunName:r}){d({selectedRetry:e,selectedStepId:t,selectedTaskId:n,taskRunName:me({pipeline:v,pipelineRun:y,selectedTaskId:n,taskRun:z().find(({metadata:e})=>e.labels?.[s.PIPELINE_TASK]===n)||{}})?.matrix?r:void 0})}function V({isOpen:e,selectedRetry:t,selectedStepId:n,selectedTaskId:r,taskRunName:i}){M(t=>({...t,[n]:e})),e&&B({selectedRetry:t,selectedStepId:n,selectedTaskId:r,taskRunName:i})}if(m)return(0,N.jsx)(te,{heading:!0,width:`60%`});if(r)return(0,N.jsx)(se,{kind:`error`,hideCloseButton:!0,lowContrast:!0,title:O.formatMessage({id:`dashboard.pipelineRun.error`,defaultMessage:`Error loading PipelineRun`}),subtitle:f(r)});if(!y)return(0,N.jsx)(se,{kind:`info`,hideCloseButton:!0,lowContrast:!0,title:O.formatMessage({id:`dashboard.pipelineRun.failed`,defaultMessage:`Cannot load PipelineRun`}),subtitle:O.formatMessage({id:`dashboard.pipelineRun.notFound`,defaultMessage:`PipelineRun not found`})});let H=y.metadata.name||y.metadata.generateName,U=F(),W=I(),{lastTransitionTime:_e,message:G,reason:K,status:q}=u(y);y&&l({message:G,name:H,reason:K,status:q});let J=null;if(y?.metadata?.labels){let e=y.metadata.labels[s.EVENT_LISTENER],t=y.metadata.labels[s.TRIGGER];(e||t)&&(J=(0,N.jsxs)(`span`,{className:`tkn--triggerInfo`,title:`EventListener: ${e||`-`}\nTrigger: ${t||`-`}`,children:[e&&(0,N.jsx)(`div`,{children:e}),t&&(0,N.jsx)(`div`,{children:t})]}))}let Y=z(),X=Y.findIndex(({metadata:e})=>e.labels?.[s.PIPELINE_TASK]===T),Z=Y[X]||{};me({pipeline:v,pipelineRun:y,selectedTaskId:T,taskRun:Z})?.matrix&&ie&&(X=Y.findIndex(({metadata:e})=>e.name===ie),Z=Y[X]||{});let Q=+!S,$=X===-1?Q:X+Q;Z.status?.retriesStatus&&C&&(Z={...Z,status:Z.status.retriesStatus[C]});let ve=Z.spec?.taskRef?.name&&ue?.find(e=>e.metadata.name===Z.spec.taskRef.name)||{},ye=y.status?.skippedTasks||[],be=ye.find(e=>e.name===T);if(!T){let e=Y[0],{labels:t={}}=e?.metadata||{},{[s.PIPELINE_TASK]:n}=t;B({selectedTaskId:n,taskRunName:e?.metadata?.name})}return(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)(le,{description:e,pipelineRefName:P,pipelineRunError:U,showFailureMessage:W,displayRunHeader:t,duration:n,lastTransitionTime:_e,triggerInfo:J,resource:y,namespace:ge,loading:m,message:G,runName:H,reason:K,status:q,triggerHeader:de,children:ne}),(Y.length>0||S)&&(0,N.jsx)(`div`,{className:`tkn--tasks`,children:(0,N.jsxs)(oe,{onChange:({selectedIndex:e})=>{if(S&&e===0){B({});return}let t=Y[e-Q],{labels:n}=t.metadata,{[s.PIPELINE_TASK]:r}=n;M({}),B({selectedTaskId:r,taskRunName:t.metadata?.name})},selectedIndex:$,children:[(0,N.jsx)(pe,{preTaskRun:S,skippedTasks:ye,taskRuns:Y}),(0,N.jsx)(fe,{expandedSteps:j,getLogContainer:R,getLogsToolbar:ee,ignoredSidecars:p,isMaximized:k,onRetryChange:g,onStepSelected:V,onToggleMaximized:L,onViewChange:_,pod:b,preTaskRun:S,selectedIndex:$,selectedRetry:C,selectedTaskId:T,selectedStepId:w,skippedTask:be,task:ve,taskRun:Z,taskRuns:Y,view:D})]})})]})}var he,N;function ge(){return(ge=e((()=>{he=t(),S(),a(),c(),w(),ce(),O(),j(),N=o(),M.__docgenInfo={description:``,methods:[],displayName:`PipelineRun`,props:{handlePipelineRunInfo:{defaultValue:{value:`() => {}`,computed:!1},required:!1},handleTaskSelected:{defaultValue:{value:`() => {}`,computed:!1},required:!1},ignoredSidecars:{defaultValue:{value:`{}`,computed:!1},required:!1},onViewChange:{defaultValue:{value:`() => {}`,computed:!1},required:!1},selectedStepId:{defaultValue:{value:`null`,computed:!1},required:!1},selectedTaskId:{defaultValue:{value:`null`,computed:!1},required:!1},view:{defaultValue:{value:`null`,computed:!1},required:!1}}}})))()}function P({exitCode:e=0,name:t,pipelineTaskName:n}){return{metadata:{labels:{[s.PIPELINE_TASK]:n},name:t,namespace:`default`,uid:t},spec:{params:{},serviceAccountName:`default`,taskRef:{kind:`Task`,name:`task1`},timeout:`24h0m0s`},status:{completionTime:`2019-08-21T17:15:31Z`,conditions:[{lastTransitionTime:`2019-08-21T17:15:31Z`,message:`All Steps have completed executing`,reason:`Succeeded`,status:`True`,type:`Succeeded`}],podName:`sample-task-run-pod-name-${t}`,startTime:`2019-08-21T17:12:21Z`,steps:[{name:`build`,terminated:{containerID:`docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95`,exitCode:e,finishedAt:`2019-08-21T17:12:29Z`,reason:`Completed`,startedAt:`2019-08-21T17:12:26Z`}}]}}}var F,I,L,R,z,B,V,H,U,W,_e,G,K,q,J,Y,X,Z,Q,$;function ve(){return(ve=e((()=>{p(),c(),ge(),h(),F=o(),{useArgs:I}=__STORYBOOK_MODULE_PREVIEW_API__,L={metadata:{name:`task1`,namespace:`default`,resourceVersion:`1902552`,selfLink:`/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1`,uid:`071c7563-c067-11e9-80e7-080027e83fe1`},spec:{steps:[{args:[`-c`,`echo storybook;`],command:[`/bin/bash`],image:`ubuntu`,name:`build`}]}},R=P({name:`sampleTaskRunName`,pipelineTaskName:`task1`}),z=P({exitCode:1,name:`sampleTaskRunName2`,pipelineTaskName:`task2`}),B=P({name:`sampleTaskRunName3`,pipelineTaskName:`task3`}),delete B.status.conditions,delete B.status.steps[0].terminated,V=P({name:`sampleTaskRunName4`,pipelineTaskName:`task4`}),V.status.steps[0].terminationReason=`Skipped`,H=P({exitCode:0,name:`sampleTaskRunName2`,pipelineTaskName:`task2`}),H.status.retriesStatus=[{completionTime:`2019-08-21T17:12:21Z`,conditions:[{lastTransitionTime:`2019-08-21T17:12:21Z`,message:`All Steps have completed executing`,reason:`Succeeded`,status:`False`,type:`Succeeded`}],podName:`sample-task-run-pod-name-0`,startTime:`2019-08-21T17:11:21Z`,steps:[{name:`build`,terminated:{containerID:`docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95`,exitCode:1,finishedAt:`2019-08-21T17:12:20Z`,reason:`Failed`,startedAt:`2019-08-21T17:11:22Z`}}]}],U={metadata:{labels:{"tekton.dev/pipeline":`pipeline`},name:`pipeline-run`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,uid:`7c266264-4d4d-45e3-ace0-041be8f7d06e`},spec:{pipelineRef:{name:`pipeline`}},status:{conditions:[{lastTransitionTime:`2019-08-16T12:49:28Z`,message:`All Tasks have completed executing`,reason:`Succeeded`,status:`True`,type:`Succeeded`}],skippedTasks:[{name:`task3`,reason:`When Expressions evaluated to false`}],startTime:`2019-08-21T17:12:20Z`,taskRuns:{sampleTaskRunName:{pipelineTaskName:`task1`,status:R.status},sampleTaskRunName2:{pipelineTaskName:`task2`,status:z.status},sampleTaskRunName3:{pipelineTaskName:`task3`,status:B.status},sampleTaskRunName4:{pipelineTaskName:`task4`,status:V.status}}}},W={metadata:{labels:{"tekton.dev/pipeline":`pipeline`},name:`pipeline-run`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,uid:`7c266264-4d4d-45e3-ace0-041be8f7d06e`},spec:{pipelineRef:{name:`pipeline`}},status:{conditions:[{lastTransitionTime:`2019-08-16T12:49:28Z`,message:`All Tasks have completed executing`,reason:`Succeeded`,status:`True`,type:`Succeeded`}],startTime:`2019-08-21T17:12:20Z`,childReferences:[{name:`sampleTaskRunName`,pipelineTaskName:`task1`},{name:`sampleTaskRunName2`,pipelineTaskName:`task2`}]}},_e={args:{selectedRetry:``,selectedStepId:void 0,selectedTaskId:void 0,view:void 0},component:M,decorators:[e=>(0,F.jsx)(e,{}),m()],subcomponents:{LogsToolbar:g},title:`PipelineRun`},G=`2024-11-14T14:10:53.354144861Z::info::Cloning repo
2024-11-14T14:10:56.300268594Z::debug::[get_repo_params:30] | get_repo_name called for https://github.com/example/app. Repository Name identified as app
2024-11-14T14:10:56.307088791Z::debug::[get_repo_params:18] | get_repo_owner called for https://github.com/example/app. Repository Owner identified as example
2024-11-14T14:10:56.815017386Z::debug::[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example/app in the cache. Attempt to fetch repository parameters.
2024-11-14T14:10:56.819937688Z::debug::[get_repo_params:39] | get_repo_server_name called for https://github.com/example/app. Repository Server Name identified as github.com
2024-11-14T14:10:56.869719012Z Sample with no log level
2024-11-14T14:10:56.869719012Z::error::Sample error
2024-11-14T14:10:56.869719012Z::warning::Sample warning
2024-11-14T14:10:56.869719012Z::notice::Sample notice
2024-11-14T14:10:56.869719012Z::trace::Sample trace
2024-11-14T14:11:08.065631069Z ::info::Details of asset created:
2024-11-14T14:11:11.849912684Z ┌─────┬──────┬────┬─────┐
2024-11-14T14:11:11.849981080Z │ Key │ Type │ ID │ URL │
2024-11-14T14:11:11.849987327Z └─────┴──────┴────┴─────┘
2024-11-14T14:11:11.869437298Z ::info::Details of evidence collected:
2024-11-14T14:11:15.892827575Z ┌─────────────────┬────────────────────┐
2024-11-14T14:11:15.892883264Z │ Attribute       │ Value              │
2024-11-14T14:11:15.892888519Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892895717Z │ Status          │ \x1B[32msuccess\x1B[39m            │
2024-11-14T14:11:15.892900191Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892904785Z │ Tool Type       │ jest               │
2024-11-14T14:11:15.892908480Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892912390Z │ Evidence ID     │ -                  │
2024-11-14T14:11:15.892916374Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892920207Z │ Evidence Type   │ com.ibm.unit_tests │
2024-11-14T14:11:15.892924894Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892930294Z │ Issues          │ -                  │
2024-11-14T14:11:15.892933984Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892938649Z │ Attachment URLs │                    │
2024-11-14T14:11:15.892942307Z │                 │                    │
2024-11-14T14:11:15.892947043Z └─────────────────┴────────────────────┘
2024-11-14T14:11:15.989838531Z success`,K=e=>{let[,t]=I();return(0,F.jsx)(M,{...e,fetchLogs:()=>`sample log output`,handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{t({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>t({view:e}),pipelineRun:U,taskRuns:[R,z,B,V],tasks:[L]})},q=e=>{let[,t]=I();return(0,F.jsx)(M,{...e,fetchLogs:()=>`sample log output`,handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{t({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>t({view:e}),pipelineRun:W,taskRuns:[R,z],tasks:[L]})},J=e=>{let[,t]=I();return(0,F.jsx)(M,{...e,fetchLogs:()=>`sample log output`,handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{t({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>t({view:e}),pipelineRun:U,pod:{events:[{metadata:{name:`guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4`,namespace:`test`,uid:`0f4218f0-270a-408d-b5bd-56fc35dda853`,resourceVersion:`2047658`,creationTimestamp:`2022-10-27T13:27:54Z`},involvedObject:{kind:`Pod`,namespace:`test`,name:`guarded-pr-vkm6w-check-file-pod`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,apiVersion:`v1`,resourceVersion:`2047624`},reason:`Scheduled`,message:`Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane`,"…":``},{metadata:{name:`guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7`,namespace:`test`,uid:`d1c8e367-66d1-4cd7-a04b-e49bdf9f322e`,resourceVersion:`2047664`,creationTimestamp:`2022-10-27T13:27:54Z`},involvedObject:{kind:`Pod`,namespace:`test`,name:`guarded-pr-vkm6w-check-file-pod`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,apiVersion:`v1`,resourceVersion:`2047657`,fieldPath:`spec.initContainers{prepare}`},reason:`Pulled`,message:`Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine`,"…":``}],resource:{kind:`Pod`,apiVersion:`v1`,metadata:{name:`some-pod-name`,namespace:`test`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,resourceVersion:`2047732`,creationTimestamp:`2022-10-27T13:27:49Z`},spec:{"…":``}}},selectedTaskId:`task1`,taskRuns:[R],tasks:[L],view:`pod`})},Y={args:{fetchLogs:()=>G,logLevels:{error:!0,warning:!0,notice:!0,info:!0,debug:!1,trace:!1},pipelineRun:W,selectedStepId:`build`,selectedTaskId:L.metadata.name,showLogLevels:!0,showLogTimestamps:!0,taskRuns:[R],tasks:[L]},render:e=>{let[,t]=I();return(0,F.jsx)(M,{...e,getLogsToolbar:n=>(0,F.jsx)(g,{...n,logLevels:e.logLevels,onToggleLogLevel:n=>t({logLevels:{...e.logLevels,...n}}),onToggleShowTimestamps:e=>t({showLogTimestamps:e}),showTimestamps:e.showLogTimestamps}),handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{t({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>t({view:e}),pipelineRun:U,taskRuns:[R,z,B,V],tasks:[L]})}},X=e=>{let[,t]=I();return(0,F.jsx)(M,{...e,fetchLogs:()=>`sample log output`,handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{t({selectedStepId:e,selectedTaskId:n})},onRetryChange:e=>t({selectedRetry:`${e}`}),onViewChange:e=>t({view:e}),pipelineRun:W,taskRuns:[R,H],tasks:[L]})},Z={},Q={args:{error:`Internal server error`}},K.__docgenInfo={description:``,methods:[],displayName:`Default`},q.__docgenInfo={description:``,methods:[],displayName:`WithMinimalStatus`},J.__docgenInfo={description:``,methods:[],displayName:`WithPodDetails`},X.__docgenInfo={description:``,methods:[],displayName:`WithRetries`},$=[`Default`,`WithMinimalStatus`,`WithPodDetails`,`LogsWithTimestampsAndLevels`,`WithRetries`,`Empty`,`Error`],K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <PipelineRun {...args} fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    updateArgs({
      selectedStepId: stepId,
      selectedTaskId: taskId
    });
  }} onViewChange={selectedView => updateArgs({
    view: selectedView
  })} pipelineRun={pipelineRun} taskRuns={[taskRun, taskRunWithWarning, taskRunSkipped, taskRunWithSkippedStep]} tasks={[task]} />;
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <PipelineRun {...args} fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    updateArgs({
      selectedStepId: stepId,
      selectedTaskId: taskId
    });
  }} onViewChange={selectedView => updateArgs({
    view: selectedView
  })} pipelineRun={pipelineRunWithMinimalStatus} taskRuns={[taskRun, taskRunWithWarning]} tasks={[task]} />;
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <PipelineRun {...args} fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    updateArgs({
      selectedStepId: stepId,
      selectedTaskId: taskId
    });
  }} onViewChange={selectedView => updateArgs({
    view: selectedView
  })} pipelineRun={pipelineRun} pod={{
    events: [{
      metadata: {
        name: 'guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4',
        namespace: 'test',
        uid: '0f4218f0-270a-408d-b5bd-56fc35dda853',
        resourceVersion: '2047658',
        creationTimestamp: '2022-10-27T13:27:54Z'
      },
      involvedObject: {
        kind: 'Pod',
        namespace: 'test',
        name: 'guarded-pr-vkm6w-check-file-pod',
        uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
        apiVersion: 'v1',
        resourceVersion: '2047624'
      },
      reason: 'Scheduled',
      message: 'Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane',
      '…': ''
    }, {
      metadata: {
        name: 'guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7',
        namespace: 'test',
        uid: 'd1c8e367-66d1-4cd7-a04b-e49bdf9f322e',
        resourceVersion: '2047664',
        creationTimestamp: '2022-10-27T13:27:54Z'
      },
      involvedObject: {
        kind: 'Pod',
        namespace: 'test',
        name: 'guarded-pr-vkm6w-check-file-pod',
        uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
        apiVersion: 'v1',
        resourceVersion: '2047657',
        fieldPath: 'spec.initContainers{prepare}'
      },
      reason: 'Pulled',
      message: 'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',
      '…': ''
    }],
    resource: {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'some-pod-name',
        namespace: 'test',
        uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
        resourceVersion: '2047732',
        creationTimestamp: '2022-10-27T13:27:49Z'
      },
      spec: {
        '…': ''
      }
    }
  }} selectedTaskId="task1" taskRuns={[taskRun]} tasks={[task]} view="pod" />;
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => logsWithTimestampsAndLevels,
    logLevels: {
      error: true,
      warning: true,
      notice: true,
      info: true,
      debug: false,
      trace: false
    },
    pipelineRun: pipelineRunWithMinimalStatus,
    selectedStepId: 'build',
    selectedTaskId: task.metadata.name,
    showLogLevels: true,
    showLogTimestamps: true,
    taskRuns: [taskRun],
    tasks: [task]
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <PipelineRun {...args} getLogsToolbar={toolbarProps => <LogsToolbar {...toolbarProps} logLevels={args.logLevels} onToggleLogLevel={level => updateArgs({
      logLevels: {
        ...args.logLevels,
        ...level
      }
    })} onToggleShowTimestamps={showLogTimestamps => updateArgs({
      showLogTimestamps
    })} showTimestamps={args.showLogTimestamps} />} handleTaskSelected={({
      selectedStepId: stepId,
      selectedTaskId: taskId
    }) => {
      updateArgs({
        selectedStepId: stepId,
        selectedTaskId: taskId
      });
    }} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} pipelineRun={pipelineRun} taskRuns={[taskRun, taskRunWithWarning, taskRunSkipped, taskRunWithSkippedStep]} tasks={[task]} />;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <PipelineRun {...args} fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    updateArgs({
      selectedStepId: stepId,
      selectedTaskId: taskId
    });
  }} onRetryChange={selectedRetry => updateArgs({
    selectedRetry: \`\${selectedRetry}\`
  })} onViewChange={selectedView => updateArgs({
    view: selectedView
  })} pipelineRun={pipelineRunWithMinimalStatus} taskRuns={[taskRun, taskRunWithRetries]} tasks={[task]} />;
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Internal server error'
  }
}`,...Q.parameters?.docs?.source}}}})))()}ve();export{K as Default,Z as Empty,Q as Error,Y as LogsWithTimestampsAndLevels,q as WithMinimalStatus,J as WithPodDetails,X as WithRetries,$ as __namedExportsOrder,_e as default};
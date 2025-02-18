import{j as t}from"./jsx-runtime-B0wN4eWF.js";import{r as ae}from"./index-BLsgEXh-.js";import"./usePrefix-DVhi0s40.js";import{I as D}from"./Notification-D7G8vrn6.js";import{S as Ne}from"./SkeletonText-BsZPl02y.js";import{u as _e}from"./index-CbuwW4_d.js";import{b as ye,g as ne,d as We,e as je}from"./index-CfoIBI3E.js";import{r as Ce}from"./index-CTl86HqP.js";import{R as re}from"./RunHeader-CiMMMYWz.js";import{T as Ee}from"./TaskTree-CUfBEgk9.js";import{S as Me}from"./StepDetails-DXb_LI18.js";import{T as De}from"./TaskRunDetails-DoflBmZC.js";import{L as Oe}from"./Log-CuX5kE6N.js";import{l as _}from"./constants-CJ-WDauL.js";import{L as Fe}from"./LogsToolbar-B2O21g5A.js";import"./index-DS1rTf2F.js";import"./index-Cn2DnnuS.js";import"./index-CvulwabO.js";import"./index-7UTgOZSF.js";import"./Button-DXQXyzWq.js";import"./index-mhCn_TNf.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./noopFn-g4z370MD.js";import"./wrapFocus-Cvvm2ck9.js";import"./Text-9nRGETFr.js";import"./bucket-9-CFGufIsT.js";import"./Icon-Dlg6_ItC.js";import"./bucket-18-D1v83Eua.js";import"./bucket-3-igrvqujs.js";import"./bucket-6-KyTwAsSL.js";import"./index-yR6ZHKQV.js";import"./debounce-DBudwqRe.js";import"./index-BIJfH8ZR.js";import"./bucket-4-BNyHiU9t.js";import"./FormattedDate-BAqjGlH3.js";import"./Task-BEm7IuJI.js";import"./index-CLdR1d0e.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-DVDhO4p7.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./Step-C5G7DejP.js";import"./Tabs-4y_hjRYw.js";import"./useControllableState-BPNuw5M3.js";import"./DetailsHeader-B1o2hUA4.js";import"./FormattedDuration-hz7jymot.js";import"./StepDefinition-p1dHpIVX.js";import"./ViewYAML-BQtIWtmr.js";import"./Table-C546lFM3.js";import"./index-DhdmMkKS.js";import"./bucket-0-B3IHR_5I.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./Search-C-UQoaUd.js";import"./FormContext-D3yeToZb.js";import"./bucket-15-DETD0dec.js";import"./extends-CF3RwP-h.js";import"./bucket-5-B__QRtnz.js";import"./LogFormat-Bv_ssSfo.js";import"./DotSpinner-D8BlggaK.js";import"./bucket-11-CJvd3vIe.js";import"./bucket-10-C-nanEs4.js";const $e=({children:a,container:s})=>Ce.createPortal(a,s);function oe({pipeline:a,pipelineRun:s,selectedTaskId:e,taskRun:n}){const g=n?.metadata?.labels?.[_.MEMBER_OF];return(s.spec?.pipelineSpec?.[g]||s.status?.pipelineSpec?.[g]||a?.spec?.[g])?.find(L=>L.name===e)}function k({customNotification:a,enableLogAutoScroll:s,enableLogScrollButtons:e,error:n,fetchLogs:g,forceLogPolling:$,getLogsToolbar:L,handleTaskSelected:de=()=>{},icon:U,loading:j,logLevels:pe,maximizedLogsContainer:C,onRetryChange:le,onViewChange:B=()=>{},pipeline:q,pipelineRun:r,pod:ce,pollingInterval:ue,runActions:me,selectedRetry:f,selectedStepId:d=null,selectedTaskId:c=null,selectedTaskRunName:E,showLogLevels:ke,showLogTimestamps:ge,taskRuns:fe,tasks:Te,triggerHeader:K,view:z=null}){const x=_e(),[Z,he]=ae.useState(!1);function Re(){if(!r.status?.taskRuns&&!r.status?.childReferences)return null;const{status:{childReferences:o,taskRuns:p}}=r,{message:l,status:T,reason:te}=ne(r);return T==="False"&&!p&&!o&&{message:l,reason:te}}function Se(){he(o=>!o)}function be({stepName:o,stepStatus:p,taskRun:l}){if(!d||!p)return null;const T=Z&&C?$e:ae.Fragment;return t.jsx(T,{...Z?{container:C}:null,children:t.jsx(Oe,{toolbar:L&&p&&L({id:`${c}-${d}-${f}-logs-toolbar`,isMaximized:Z,onToggleMaximized:!!C&&Se,stepStatus:p,taskRun:l}),fetchLogs:()=>g({stepName:o,stepStatus:p,taskRun:l}),forcePolling:$,logLevels:pe,pollingInterval:ue,stepStatus:p,isLogsMaximized:Z,enableLogAutoScroll:s,enableLogScrollButtons:e,showLevels:ke,showTimestamps:ge},`${c}:${d}:${f}`)})}function Y(){return!r?.status?.taskRuns&&!r?.status?.childReferences?[]:fe||[]}function ve({selectedRetry:o,selectedStepId:p,selectedTaskId:l,taskRunName:T}){const Ae=Y().find(({metadata:Pe})=>Pe.labels?.[_.PIPELINE_TASK]===l)||{},Ve=oe({pipeline:q,pipelineRun:r,selectedTaskId:l,taskRun:Ae});de({selectedRetry:o,selectedStepId:p,selectedTaskId:l,taskRunName:Ve?.matrix?T:void 0})}if(j)return t.jsx(Ne,{heading:!0,width:"60%"});if(n)return t.jsxs(t.Fragment,{children:[a,t.jsx(D,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:x.formatMessage({id:"dashboard.pipelineRun.error",defaultMessage:"Error loading PipelineRun"}),subtitle:ye(n)})]});if(!r)return t.jsxs(t.Fragment,{children:[a,t.jsx(D,{kind:"info",hideCloseButton:!0,lowContrast:!0,title:x.formatMessage({id:"dashboard.pipelineRun.failed",defaultMessage:"Cannot load PipelineRun"}),subtitle:x.formatMessage({id:"dashboard.pipelineRun.notFound",defaultMessage:"PipelineRun not found"})})]});const Ie=r.metadata.name||r.metadata.generateName,M=Re(),{lastTransitionTime:G,message:we,reason:Le,status:H}=ne(r);if(M)return t.jsxs(t.Fragment,{children:[t.jsx(re,{icon:U,lastTransitionTime:G,loading:j,pipelineRun:r,runName:r.pipelineRunName,reason:"Error",status:H,triggerHeader:K}),a,t.jsx(D,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:x.formatMessage({id:"dashboard.pipelineRun.failedMessage",defaultMessage:"Unable to load PipelineRun: {reason}"},{reason:M.reason}),subtitle:M.message})]});const A=Y();let i=A.find(({metadata:o})=>o.labels?.[_.PIPELINE_TASK]===c)||{};const J=oe({pipeline:q,pipelineRun:r,selectedTaskId:c,taskRun:i});J?.matrix&&E&&(i=A.find(({metadata:o})=>o.name===E)),i.status?.retriesStatus&&f&&(i={...i,status:i.status.retriesStatus[f]});const Q=i.spec?.taskRef?.name&&Te?.find(o=>o.metadata.name===i.spec.taskRef.name)||{},xe=We({selectedStepId:d,task:Q,taskRun:i}),X=je({selectedStepId:d,taskRun:i}),Ze=be({stepName:d,stepStatus:X,taskRun:i}),ee=r.status?.skippedTasks||[],se=ee.find(o=>o.name===c);return t.jsxs(t.Fragment,{children:[t.jsx(re,{icon:U,lastTransitionTime:G,loading:j,message:we,runName:Ie,reason:Le,status:H,triggerHeader:K,children:me}),a,A.length>0&&t.jsxs("div",{className:"tkn--tasks",children:[t.jsx(Ee,{isSelectedTaskMatrix:!!J?.matrix,onRetryChange:le,onSelect:ve,selectedRetry:f,selectedStepId:d,selectedTaskId:c,selectedTaskRunName:E,skippedTasks:ee,taskRuns:A}),d&&t.jsx(Me,{definition:xe,logContainer:Ze,onViewChange:B,skippedTask:se,stepName:d,stepStatus:X,taskRun:i,view:z})||c&&t.jsx(De,{onViewChange:B,pod:ce,skippedTask:se,task:Q,taskRun:i,view:z})]})]})}k.__docgenInfo={description:"",methods:[],displayName:"PipelineRun",props:{handleTaskSelected:{defaultValue:{value:"() => {}",computed:!1},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},required:!1},selectedStepId:{defaultValue:{value:"null",computed:!1},required:!1},selectedTaskId:{defaultValue:{value:"null",computed:!1},required:!1},view:{defaultValue:{value:"null",computed:!1},required:!1}}};const{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,u={metadata:{name:"task1",namespace:"default",resourceVersion:"1902552",selfLink:"/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1",uid:"071c7563-c067-11e9-80e7-080027e83fe1"},spec:{steps:[{args:["-c","echo storybook;"],command:["/bin/bash"],image:"ubuntu",name:"build"}]}};function I({exitCode:a=0,name:s,pipelineTaskName:e}){return{metadata:{labels:{[_.PIPELINE_TASK]:e},name:s,namespace:"default",uid:s},spec:{params:{},serviceAccountName:"default",taskRef:{kind:"Task",name:"task1"},timeout:"24h0m0s"},status:{completionTime:"2019-08-21T17:15:31Z",conditions:[{lastTransitionTime:"2019-08-21T17:15:31Z",message:"All Steps have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],podName:`sample-task-run-pod-name-${s}`,startTime:"2019-08-21T17:12:21Z",steps:[{name:"build",terminated:{containerID:"docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95",exitCode:a,finishedAt:"2019-08-21T17:12:29Z",reason:"Completed",startedAt:"2019-08-21T17:12:26Z"}}]}}}const m=I({name:"sampleTaskRunName",pipelineTaskName:"task1"}),y=I({exitCode:1,name:"sampleTaskRunName2",pipelineTaskName:"task2"}),w=I({name:"sampleTaskRunName3",pipelineTaskName:"task3"});delete w.status.conditions;delete w.status.steps[0].terminated;const W=I({name:"sampleTaskRunName4",pipelineTaskName:"task4"});W.status.steps[0].terminationReason="Skipped";const ie=I({exitCode:0,name:"sampleTaskRunName2",pipelineTaskName:"task2"});ie.status.retriesStatus=[{completionTime:"2019-08-21T17:12:21Z",conditions:[{lastTransitionTime:"2019-08-21T17:12:21Z",message:"All Steps have completed executing",reason:"Succeeded",status:"False",type:"Succeeded"}],podName:"sample-task-run-pod-name-0",startTime:"2019-08-21T17:11:21Z",steps:[{name:"build",terminated:{containerID:"docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95",exitCode:1,finishedAt:"2019-08-21T17:12:20Z",reason:"Failed",startedAt:"2019-08-21T17:11:22Z"}}]}];const O={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],skippedTasks:[{name:"task3",reason:"When Expressions evaluated to false"}],startTime:"2019-08-21T17:12:20Z",taskRuns:{sampleTaskRunName:{pipelineTaskName:"task1",status:m.status},sampleTaskRunName2:{pipelineTaskName:"task2",status:y.status},sampleTaskRunName3:{pipelineTaskName:"task3",status:w.status},sampleTaskRunName4:{pipelineTaskName:"task4",status:W.status}}}},F={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",childReferences:[{name:"sampleTaskRunName",pipelineTaskName:"task1"},{name:"sampleTaskRunName2",pipelineTaskName:"task2"}]}},tt={args:{selectedRetry:"",selectedStepId:void 0,selectedTaskId:void 0,view:void 0},component:k,decorators:[a=>t.jsx(a,{})],title:"PipelineRun"},Ue=`2024-11-14T14:10:53.354144861Z::info::Cloning repo
2024-11-14T14:10:56.300268594Z::debug::[get_repo_params:30] | get_repo_name called for https://github.com/example/app. Repository Name identified as app
2024-11-14T14:10:56.307088791Z::debug::[get_repo_params:18] | get_repo_owner called for https://github.com/example/app. Repository Owner identified as example
2024-11-14T14:10:56.815017386Z::debug::[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example/app in the cache. Attempt to fetch repository parameters.
2024-11-14T14:10:56.819937688Z::debug::[get_repo_params:39] | get_repo_server_name called for https://github.com/example/app. Repository Server Name identified as github.com
2024-11-14T14:10:56.869719012Z Sample with no log level
2024-11-14T14:10:56.869719012Z::error::Sample error
2024-11-14T14:10:56.869719012Z::warning::Sample warning
2024-11-14T14:10:56.869719012Z::notice::Sample notice
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
2024-11-14T14:11:15.989838531Z success`,h=a=>{const[,s]=v();return t.jsx(k,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{s({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>s({view:e}),pipelineRun:O,taskRuns:[m,y,w,W],tasks:[u]})},R=a=>{const[,s]=v();return t.jsx(k,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{s({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>s({view:e}),pipelineRun:F,taskRuns:[m,y],tasks:[u]})},S=a=>{const[,s]=v();return t.jsx(k,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{s({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>s({view:e}),pipelineRun:O,pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},selectedTaskId:"task1",taskRuns:[m],tasks:[u],view:"pod"})},V={args:{fetchLogs:()=>Ue,logLevels:{error:!0,warning:!0,notice:!0,info:!0,debug:!1},pipelineRun:F,selectedStepId:"build",selectedTaskId:u.metadata.name,showLogLevels:!0,showLogTimestamps:!0,taskRuns:[m],tasks:[u]},render:a=>{const[,s]=v();return t.jsx(k,{...a,getLogsToolbar:e=>t.jsx(Fe,{...e,logLevels:a.logLevels,onToggleLogLevel:n=>s({logLevels:{...a.logLevels,...n}}),onToggleShowTimestamps:n=>s({showLogTimestamps:n}),showTimestamps:a.showLogTimestamps}),handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{s({selectedStepId:e,selectedTaskId:n})},onViewChange:e=>s({view:e}),pipelineRun:O,taskRuns:[m,y,w,W],tasks:[u]})}},b=a=>{const[,s]=v();return t.jsx(k,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:e,selectedTaskId:n})=>{s({selectedStepId:e,selectedTaskId:n})},onRetryChange:e=>s({selectedRetry:`${e}`}),onViewChange:e=>s({view:e}),pipelineRun:F,taskRuns:[m,ie],tasks:[u]})},P={},N={args:{error:"Internal server error"}};h.__docgenInfo={description:"",methods:[],displayName:"Default"};R.__docgenInfo={description:"",methods:[],displayName:"WithMinimalStatus"};S.__docgenInfo={description:"",methods:[],displayName:"WithPodDetails"};b.__docgenInfo={description:"",methods:[],displayName:"WithRetries"};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`args => {
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
}`,...h.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`args => {
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
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`args => {
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
}`,...S.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    fetchLogs: () => logsWithTimestampsAndLevels,
    logLevels: {
      error: true,
      warning: true,
      notice: true,
      info: true,
      debug: false
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
}`,...V.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`args => {
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
}`,...b.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:"{}",...P.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Internal server error'
  }
}`,...N.parameters?.docs?.source}}};const at=["Default","WithMinimalStatus","WithPodDetails","LogsWithTimestampsAndLevels","WithRetries","Empty","Error"];export{h as Default,P as Empty,N as Error,V as LogsWithTimestampsAndLevels,R as WithMinimalStatus,S as WithPodDetails,b as WithRetries,at as __namedExportsOrder,tt as default};

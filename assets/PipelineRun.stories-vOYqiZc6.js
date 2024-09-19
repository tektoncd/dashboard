import{j as e}from"./jsx-runtime-QvtbNqby.js";import{r as Y}from"./index-BjzEU6Zr.js";import"./usePrefix-C48kcqDW.js";import{I as M}from"./Notification-DK9HV3HX.js";import{S as be}from"./SkeletonText-DN73_2Nu.js";import{u as Se}from"./index-R-2E0Llw.js";import{b as ve,g as G,d as Ie,e as xe}from"./index-CfoIBI3E.js";import{r as Pe}from"./index-B22udTS1.js";import{R as H}from"./RunHeader-BasQcaLa.js";import{T as Ve}from"./TaskTree-DfkrJi18.js";import{S as we}from"./StepDetails-qG1lrq9u.js";import{T as je}from"./TaskRunDetails-DheTFajM.js";import{L as Ae}from"./Log-D3o9RkYO.js";import{l as P}from"./constants-BuFAfZC9.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-kGlasm3i.js";import"./deprecate-CHyGWMAj.js";import"./index-CjLpwf8N.js";import"./Button-B7xRuRrN.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./events-OVwOsPzJ.js";import"./noopFn-g4z370MD.js";import"./index-D7LnL1tT.js";import"./bucket-3-Dq7FRXBG.js";import"./Icon-CpyVU44g.js";import"./bucket-6-CywArVTS.js";import"./bucket-2-C9DXCKPV.js";import"./bucket-18-ByJs4WER.js";import"./bucket-9-DvpuiSZR.js";import"./index-Dc4QqC9m.js";import"./index-maZZ4XoJ.js";import"./FormattedDate-2caGO-l0.js";import"./Task-Cr8Qh3P_.js";import"./index-GBHdq2eR.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-CMgbqDR8.js";import"./StatusIcon-BOJjQf4B.js";import"./bucket-16-CiwkPD5r.js";import"./Spinner-Dbwi84XW.js";import"./bucket-13-CBnqkqgu.js";import"./Step-BGpekdcR.js";import"./Tabs-DccB0do-.js";import"./useControllableState-Co_owzu1.js";import"./DetailsHeader-DXO7Mvje.js";import"./FormattedDuration-BhxTaD9H.js";import"./StepDefinition-Zm2Nreff.js";import"./ViewYAML-DKM26Bir.js";import"./Table-uKt28NJQ.js";import"./bucket-0-C5s-C6Km.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./Search-CexipLRe.js";import"./FormContext-IWjAIOZU.js";import"./extends-CF3RwP-h.js";import"./inheritsLoose-CMy1E8oj.js";import"./bucket-17-bHtnLuTa.js";import"./bucket-5-BULz4hzg.js";import"./LogFormat-Bpe5Aqro.js";import"./DotSpinner-BSho4s4W.js";const Ne=({children:a,container:s})=>Pe.createPortal(a,s);function J({pipeline:a,pipelineRun:s,selectedTaskId:t,taskRun:o}){const u=o?.metadata?.labels?.[P.MEMBER_OF];return(s.spec?.pipelineSpec?.[u]||s.status?.pipelineSpec?.[u]||a?.spec?.[u])?.find(h=>h.name===t)}function T({customNotification:a,enableLogAutoScroll:s,enableLogScrollButtons:t,error:o,fetchLogs:u,forceLogPolling:L,getLogsToolbar:h,handleTaskSelected:ee=()=>{},icon:y,loading:w,maximizedLogsContainer:j,onRetryChange:se,onViewChange:W=()=>{},pipeline:Z,pipelineRun:n,pod:ae,pollingInterval:te,runActions:ne,selectedRetry:R,selectedStepId:c=null,selectedTaskId:l=null,selectedTaskRunName:A,taskRuns:re,tasks:ie,triggerHeader:D,view:O=null}){const b=Se(),[S,oe]=Y.useState(!1);function de(){if(!n.status?.taskRuns&&!n.status?.childReferences)return null;const{status:{childReferences:i,taskRuns:d}}=n,{message:p,status:m,reason:z}=G(n);return m==="False"&&!d&&!i&&{message:p,reason:z}}function ce(){oe(i=>!i)}function pe({stepName:i,stepStatus:d,taskRun:p}){if(!c||!d)return null;const m=S&&j?Ne:Y.Fragment;return e.jsx(m,{...S?{container:j}:null,children:e.jsx(Ae,{toolbar:h&&d&&h({isMaximized:S,stepStatus:d,taskRun:p,toggleMaximized:!!j&&ce}),fetchLogs:()=>u(i,d,p),forcePolling:L,pollingInterval:te,stepStatus:d,isLogsMaximized:S,enableLogAutoScroll:s,enableLogScrollButtons:t},`${l}:${c}:${R}`)})}function F(){return!n?.status?.taskRuns&&!n?.status?.childReferences?[]:re||[]}function ue({selectedRetry:i,selectedStepId:d,selectedTaskId:p,taskRunName:m}){const Te=F().find(({metadata:Re})=>Re.labels?.[P.PIPELINE_TASK]===p)||{},he=J({pipeline:Z,pipelineRun:n,selectedTaskId:p,taskRun:Te});ee({selectedRetry:i,selectedStepId:d,selectedTaskId:p,taskRunName:he?.matrix?m:void 0})}if(w)return e.jsx(be,{heading:!0,width:"60%"});if(o)return e.jsxs(e.Fragment,{children:[a,e.jsx(M,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:b.formatMessage({id:"dashboard.pipelineRun.error",defaultMessage:"Error loading PipelineRun"}),subtitle:ve(o)})]});if(!n)return e.jsxs(e.Fragment,{children:[a,e.jsx(M,{kind:"info",hideCloseButton:!0,lowContrast:!0,title:b.formatMessage({id:"dashboard.pipelineRun.failed",defaultMessage:"Cannot load PipelineRun"}),subtitle:b.formatMessage({id:"dashboard.pipelineRun.notFound",defaultMessage:"PipelineRun not found"})})]});const le=n.metadata.name||n.metadata.generateName,N=de(),{lastTransitionTime:q,message:me,reason:fe,status:B}=G(n);if(N)return e.jsxs(e.Fragment,{children:[e.jsx(H,{icon:y,lastTransitionTime:q,loading:w,pipelineRun:n,runName:n.pipelineRunName,reason:"Error",status:B,triggerHeader:D}),a,e.jsx(M,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:b.formatMessage({id:"dashboard.pipelineRun.failedMessage",defaultMessage:"Unable to load PipelineRun: {reason}"},{reason:N.reason}),subtitle:N.message})]});const v=F();let r=v.find(({metadata:i})=>i.labels?.[P.PIPELINE_TASK]===l)||{};const U=J({pipeline:Z,pipelineRun:n,selectedTaskId:l,taskRun:r});U?.matrix&&A&&(r=v.find(({metadata:i})=>i.name===A)),r.status?.retriesStatus&&R&&(r={...r,status:r.status.retriesStatus[R]});const K=r.spec?.taskRef?.name&&ie?.find(i=>i.metadata.name===r.spec.taskRef.name)||{},ke=Ie({selectedStepId:c,task:K,taskRun:r}),$=xe({selectedStepId:c,taskRun:r}),ge=pe({stepName:c,stepStatus:$,taskRun:r});return e.jsxs(e.Fragment,{children:[e.jsx(H,{icon:y,lastTransitionTime:q,loading:w,message:me,runName:le,reason:fe,status:B,triggerHeader:D,children:ne}),a,v.length>0&&e.jsxs("div",{className:"tkn--tasks",children:[e.jsx(Ve,{isSelectedTaskMatrix:!!U?.matrix,onRetryChange:se,onSelect:ue,selectedRetry:R,selectedStepId:c,selectedTaskId:l,selectedTaskRunName:A,taskRuns:v}),c&&e.jsx(we,{definition:ke,logContainer:ge,onViewChange:W,stepName:c,stepStatus:$,taskRun:r,view:O})||l&&e.jsx(je,{onViewChange:W,pod:ae,task:K,taskRun:r,view:O})]})]})}T.__docgenInfo={description:"",methods:[],displayName:"PipelineRun",props:{handleTaskSelected:{defaultValue:{value:"() => {}",computed:!1},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},required:!1},selectedStepId:{defaultValue:{value:"null",computed:!1},required:!1},selectedTaskId:{defaultValue:{value:"null",computed:!1},required:!1},view:{defaultValue:{value:"null",computed:!1},required:!1}}};const{useArgs:E}=__STORYBOOK_MODULE_PREVIEW_API__,_={metadata:{name:"task1",namespace:"default",resourceVersion:"1902552",selfLink:"/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1",uid:"071c7563-c067-11e9-80e7-080027e83fe1"},spec:{steps:[{args:["-c","echo storybook;"],command:["/bin/bash"],image:"ubuntu",name:"build"}]}};function Q({exitCode:a=0,name:s,pipelineTaskName:t}){return{metadata:{labels:{[P.PIPELINE_TASK]:t},name:s,namespace:"default",uid:s},spec:{params:{},serviceAccountName:"default",taskRef:{kind:"Task",name:"task1"},timeout:"24h0m0s"},status:{completionTime:"2019-08-21T17:15:31Z",conditions:[{lastTransitionTime:"2019-08-21T17:15:31Z",message:"All Steps have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],podName:`sample-task-run-pod-name-${s}`,startTime:"2019-08-21T17:12:21Z",steps:[{name:"build",terminated:{containerID:"docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95",exitCode:a,finishedAt:"2019-08-21T17:12:29Z",reason:"Completed",startedAt:"2019-08-21T17:12:26Z"}}]}}}const V=Q({name:"sampleTaskRunName",pipelineTaskName:"task1"}),C=Q({exitCode:1,name:"sampleTaskRunName2",pipelineTaskName:"task2"}),X={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",taskRuns:{sampleTaskRunName:{pipelineTaskName:"task1",status:V.status},sampleTaskRunName2:{pipelineTaskName:"task2",status:C.status}}}},Me={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",childReferences:[{name:"sampleTaskRunName",pipelineTaskName:"task1"},{name:"sampleTaskRunName2",pipelineTaskName:"task2"}]}},Ws={args:{selectedStepId:void 0,selectedTaskId:void 0,view:void 0},component:T,decorators:[a=>e.jsx(a,{})],title:"PipelineRun"},f=a=>{const[,s]=E();return e.jsx(T,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:t,selectedTaskId:o})=>{s({selectedStepId:t,selectedTaskId:o})},onViewChange:t=>s({view:t}),pipelineRun:X,taskRuns:[V,C],tasks:[_]})},k=a=>{const[,s]=E();return e.jsx(T,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:t,selectedTaskId:o})=>{s({selectedStepId:t,selectedTaskId:o})},onViewChange:t=>s({view:t}),pipelineRun:Me,taskRuns:[V,C],tasks:[_]})},g=a=>{const[,s]=E();return e.jsx(T,{...a,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:t,selectedTaskId:o})=>{s({selectedStepId:t,selectedTaskId:o})},onViewChange:t=>s({view:t}),pipelineRun:X,pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},taskRuns:[V],tasks:[_]})},I={},x={args:{error:"Internal server error"}};f.__docgenInfo={description:"",methods:[],displayName:"Default"};k.__docgenInfo={description:"",methods:[],displayName:"WithMinimalStatus"};g.__docgenInfo={description:"",methods:[],displayName:"WithPodDetails"};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`args => {
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
  })} pipelineRun={pipelineRun} taskRuns={[taskRun, taskRunWithWarning]} tasks={[task]} />;
}`,...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`args => {
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
}`,...k.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`args => {
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
  }} taskRuns={[taskRun]} tasks={[task]} />;
}`,...g.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:"{}",...I.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Internal server error'
  }
}`,...x.parameters?.docs?.source}}};const Zs=["Default","WithMinimalStatus","WithPodDetails","Empty","Error"];export{f as Default,I as Empty,x as Error,k as WithMinimalStatus,g as WithPodDetails,Zs as __namedExportsOrder,Ws as default};

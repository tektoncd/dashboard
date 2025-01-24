import{j as e}from"./jsx-runtime-CSYIdwKN.js";import{r as se}from"./index-j5XA6xUc.js";import"./usePrefix-CM90x8zf.js";import{I as C}from"./Notification-NGLhcSFb.js";import{S as Pe}from"./SkeletonText-fAN9o6aB.js";import{u as Ve}from"./index-CKzEcgge.js";import{b as _e,g as te,d as Ne,e as je}from"./index-CfoIBI3E.js";import{r as Ee}from"./index-aRs7OYaA.js";import{R as ae}from"./RunHeader-e5KWVXrO.js";import{T as Me}from"./TaskTree-BRxNTblt.js";import{S as We}from"./StepDetails-B-aodC12.js";import{T as ye}from"./TaskRunDetails-Dv85reBj.js";import{L as Ce}from"./Log-CG651GY6.js";import{l as P}from"./constants-PT-Qtcqm.js";import{L as De}from"./LogsToolbar-C9_4j60G.js";import"./index-BUz8uDZe.js";import"./index-CwuwC4oq.js";import"./index-ByVX7Zjn.js";import"./index-DMsN9lKV.js";import"./Button-BL0i1dXE.js";import"./index-Y04Ev2rt.js";import"./Tooltip-D8XmMmLg.js";import"./index-BKjU-s9g.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./noopFn-g4z370MD.js";import"./wrapFocus-CMZot74P.js";import"./Text-BecEi-D2.js";import"./bucket-3-GObMIxt2.js";import"./Icon-BvP5-OXx.js";import"./bucket-6-B0A61yNx.js";import"./bucket-2-BhDbOiqM.js";import"./bucket-18-he4L4bfw.js";import"./bucket-9-Tmqsekzu.js";import"./index-Dhzc4P7r.js";import"./debounce-DBudwqRe.js";import"./index-BSD0nbJn.js";import"./bucket-4-O8wYGsJQ.js";import"./FormattedDate-DoRrJ4Nk.js";import"./Task-D-SFGCQ9.js";import"./index-D2d4JviW.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-w4Le0n7o.js";import"./StatusIcon-kVEdrWuu.js";import"./bucket-17-LIiJ4OSj.js";import"./Spinner-DYyuEvhi.js";import"./bucket-13-j6L4X23M.js";import"./Step-C8s8S11l.js";import"./Tabs-Cj-lA-Ab.js";import"./useControllableState-DUOQ64nT.js";import"./DetailsHeader-CS3vknmW.js";import"./FormattedDuration-CnRRQHb0.js";import"./StepDefinition-Tt2E7LMh.js";import"./ViewYAML-B44mWFRd.js";import"./Table-C913vRMv.js";import"./index-B1POUp4B.js";import"./bucket-0-MNXPsXKu.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./Search-DnmSg_ZS.js";import"./FormContext-aPXE3suj.js";import"./bucket-14-B330O8PO.js";import"./extends-CF3RwP-h.js";import"./bucket-5-DYpy_Xue.js";import"./LogFormat-BDM0u6xS.js";import"./DotSpinner-Bc4qa0Jj.js";import"./bucket-11-DDPe_j1I.js";const Oe=({children:t,container:s})=>Ee.createPortal(t,s);function ne({pipeline:t,pipelineRun:s,selectedTaskId:a,taskRun:n}){const g=n?.metadata?.labels?.[P.MEMBER_OF];return(s.spec?.pipelineSpec?.[g]||s.status?.pipelineSpec?.[g]||t?.spec?.[g])?.find(b=>b.name===a)}function k({customNotification:t,enableLogAutoScroll:s,enableLogScrollButtons:a,error:n,fetchLogs:g,forceLogPolling:O,getLogsToolbar:b,handleTaskSelected:re=()=>{},icon:F,loading:E,logLevels:ie,maximizedLogsContainer:M,onRetryChange:de,onViewChange:U=()=>{},pipeline:B,pipelineRun:o,pod:pe,pollingInterval:le,runActions:me,selectedRetry:f,selectedStepId:d=null,selectedTaskId:m=null,selectedTaskRunName:W,showLogLevels:ce,showLogTimestamps:ue,taskRuns:ke,tasks:ge,triggerHeader:$,view:q=null}){const I=Ve(),[w,fe]=se.useState(!1);function Te(){if(!o.status?.taskRuns&&!o.status?.childReferences)return null;const{status:{childReferences:r,taskRuns:p}}=o,{message:l,status:T,reason:ee}=te(o);return T==="False"&&!p&&!r&&{message:l,reason:ee}}function he(){fe(r=>!r)}function Re({stepName:r,stepStatus:p,taskRun:l}){if(!d||!p)return null;const T=w&&M?Oe:se.Fragment;return e.jsx(T,{...w?{container:M}:null,children:e.jsx(Ce,{toolbar:b&&p&&b({id:`${m}-${d}-${f}-logs-toolbar`,isMaximized:w,onToggleMaximized:!!M&&he,stepStatus:p,taskRun:l}),fetchLogs:()=>g({stepName:r,stepStatus:p,taskRun:l}),forcePolling:O,logLevels:ie,pollingInterval:le,stepStatus:p,isLogsMaximized:w,enableLogAutoScroll:s,enableLogScrollButtons:a,showLevels:ce,showTimestamps:ue},`${m}:${d}:${f}`)})}function K(){return!o?.status?.taskRuns&&!o?.status?.childReferences?[]:ke||[]}function Se({selectedRetry:r,selectedStepId:p,selectedTaskId:l,taskRunName:T}){const xe=K().find(({metadata:Ae})=>Ae.labels?.[P.PIPELINE_TASK]===l)||{},Ze=ne({pipeline:B,pipelineRun:o,selectedTaskId:l,taskRun:xe});re({selectedRetry:r,selectedStepId:p,selectedTaskId:l,taskRunName:Ze?.matrix?T:void 0})}if(E)return e.jsx(Pe,{heading:!0,width:"60%"});if(n)return e.jsxs(e.Fragment,{children:[t,e.jsx(C,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:I.formatMessage({id:"dashboard.pipelineRun.error",defaultMessage:"Error loading PipelineRun"}),subtitle:_e(n)})]});if(!o)return e.jsxs(e.Fragment,{children:[t,e.jsx(C,{kind:"info",hideCloseButton:!0,lowContrast:!0,title:I.formatMessage({id:"dashboard.pipelineRun.failed",defaultMessage:"Cannot load PipelineRun"}),subtitle:I.formatMessage({id:"dashboard.pipelineRun.notFound",defaultMessage:"PipelineRun not found"})})]});const ve=o.metadata.name||o.metadata.generateName,y=Te(),{lastTransitionTime:z,message:be,reason:Ie,status:Y}=te(o);if(y)return e.jsxs(e.Fragment,{children:[e.jsx(ae,{icon:F,lastTransitionTime:z,loading:E,pipelineRun:o,runName:o.pipelineRunName,reason:"Error",status:Y,triggerHeader:$}),t,e.jsx(C,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:I.formatMessage({id:"dashboard.pipelineRun.failedMessage",defaultMessage:"Unable to load PipelineRun: {reason}"},{reason:y.reason}),subtitle:y.message})]});const L=K();let i=L.find(({metadata:r})=>r.labels?.[P.PIPELINE_TASK]===m)||{};const G=ne({pipeline:B,pipelineRun:o,selectedTaskId:m,taskRun:i});G?.matrix&&W&&(i=L.find(({metadata:r})=>r.name===W)),i.status?.retriesStatus&&f&&(i={...i,status:i.status.retriesStatus[f]});const H=i.spec?.taskRef?.name&&ge?.find(r=>r.metadata.name===i.spec.taskRef.name)||{},we=Ne({selectedStepId:d,task:H,taskRun:i}),J=je({selectedStepId:d,taskRun:i}),Le=Re({stepName:d,stepStatus:J,taskRun:i}),Q=o.status?.skippedTasks||[],X=Q.find(r=>r.name===m);return e.jsxs(e.Fragment,{children:[e.jsx(ae,{icon:F,lastTransitionTime:z,loading:E,message:be,runName:ve,reason:Ie,status:Y,triggerHeader:$,children:me}),t,L.length>0&&e.jsxs("div",{className:"tkn--tasks",children:[e.jsx(Me,{isSelectedTaskMatrix:!!G?.matrix,onRetryChange:de,onSelect:Se,selectedRetry:f,selectedStepId:d,selectedTaskId:m,selectedTaskRunName:W,skippedTasks:Q,taskRuns:L}),d&&e.jsx(We,{definition:we,logContainer:Le,onViewChange:U,skippedTask:X,stepName:d,stepStatus:J,taskRun:i,view:q})||m&&e.jsx(ye,{onViewChange:U,pod:pe,skippedTask:X,task:H,taskRun:i,view:q})]})]})}k.__docgenInfo={description:"",methods:[],displayName:"PipelineRun",props:{handleTaskSelected:{defaultValue:{value:"() => {}",computed:!1},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},required:!1},selectedStepId:{defaultValue:{value:"null",computed:!1},required:!1},selectedTaskId:{defaultValue:{value:"null",computed:!1},required:!1},view:{defaultValue:{value:"null",computed:!1},required:!1}}};const{useArgs:V}=__STORYBOOK_MODULE_PREVIEW_API__,c={metadata:{name:"task1",namespace:"default",resourceVersion:"1902552",selfLink:"/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1",uid:"071c7563-c067-11e9-80e7-080027e83fe1"},spec:{steps:[{args:["-c","echo storybook;"],command:["/bin/bash"],image:"ubuntu",name:"build"}]}};function _({exitCode:t=0,name:s,pipelineTaskName:a}){return{metadata:{labels:{[P.PIPELINE_TASK]:a},name:s,namespace:"default",uid:s},spec:{params:{},serviceAccountName:"default",taskRef:{kind:"Task",name:"task1"},timeout:"24h0m0s"},status:{completionTime:"2019-08-21T17:15:31Z",conditions:[{lastTransitionTime:"2019-08-21T17:15:31Z",message:"All Steps have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],podName:`sample-task-run-pod-name-${s}`,startTime:"2019-08-21T17:12:21Z",steps:[{name:"build",terminated:{containerID:"docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95",exitCode:t,finishedAt:"2019-08-21T17:12:29Z",reason:"Completed",startedAt:"2019-08-21T17:12:26Z"}}]}}}const u=_({name:"sampleTaskRunName",pipelineTaskName:"task1"}),N=_({exitCode:1,name:"sampleTaskRunName2",pipelineTaskName:"task2"}),v=_({name:"sampleTaskRunName3",pipelineTaskName:"task3"});delete v.status.conditions;delete v.status.steps[0].terminated;const j=_({name:"sampleTaskRunName4",pipelineTaskName:"task4"});j.status.steps[0].terminationReason="Skipped";const D={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],skippedTasks:[{name:"task3",reason:"When Expressions evaluated to false"}],startTime:"2019-08-21T17:12:20Z",taskRuns:{sampleTaskRunName:{pipelineTaskName:"task1",status:u.status},sampleTaskRunName2:{pipelineTaskName:"task2",status:N.status},sampleTaskRunName3:{pipelineTaskName:"task3",status:v.status},sampleTaskRunName4:{pipelineTaskName:"task4",status:j.status}}}},oe={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",childReferences:[{name:"sampleTaskRunName",pipelineTaskName:"task1"},{name:"sampleTaskRunName2",pipelineTaskName:"task2"}]}},et={args:{selectedStepId:void 0,selectedTaskId:void 0,view:void 0},component:k,decorators:[t=>e.jsx(t,{})],title:"PipelineRun"},Fe=`2024-11-14T14:10:53.354144861Z::info::Cloning repo
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
2024-11-14T14:11:15.989838531Z success`,h=t=>{const[,s]=V();return e.jsx(k,{...t,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:n})=>{s({selectedStepId:a,selectedTaskId:n})},onViewChange:a=>s({view:a}),pipelineRun:D,taskRuns:[u,N,v,j],tasks:[c]})},R=t=>{const[,s]=V();return e.jsx(k,{...t,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:n})=>{s({selectedStepId:a,selectedTaskId:n})},onViewChange:a=>s({view:a}),pipelineRun:oe,taskRuns:[u,N],tasks:[c]})},S=t=>{const[,s]=V();return e.jsx(k,{...t,fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:n})=>{s({selectedStepId:a,selectedTaskId:n})},onViewChange:a=>s({view:a}),pipelineRun:D,pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},selectedTaskId:"task1",taskRuns:[u],tasks:[c],view:"pod"})},x={args:{fetchLogs:()=>Fe,logLevels:{error:!0,warning:!0,notice:!0,info:!0,debug:!1},pipelineRun:oe,selectedStepId:"build",selectedTaskId:c.metadata.name,showLogLevels:!0,showLogTimestamps:!0,taskRuns:[u],tasks:[c]},render:t=>{const[,s]=V();return e.jsx(k,{...t,getLogsToolbar:a=>e.jsx(De,{...a,logLevels:t.logLevels,onToggleLogLevel:n=>s({logLevels:{...t.logLevels,...n}}),onToggleShowTimestamps:n=>s({showLogTimestamps:n}),showTimestamps:t.showLogTimestamps}),handleTaskSelected:({selectedStepId:a,selectedTaskId:n})=>{s({selectedStepId:a,selectedTaskId:n})},onViewChange:a=>s({view:a}),pipelineRun:D,taskRuns:[u,N,v,j],tasks:[c]})}},Z={},A={args:{error:"Internal server error"}};h.__docgenInfo={description:"",methods:[],displayName:"Default"};R.__docgenInfo={description:"",methods:[],displayName:"WithMinimalStatus"};S.__docgenInfo={description:"",methods:[],displayName:"WithPodDetails"};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`args => {
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
}`,...S.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:"{}",...Z.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Internal server error'
  }
}`,...A.parameters?.docs?.source}}};const st=["Default","WithMinimalStatus","WithPodDetails","LogsWithTimestampsAndLevels","Empty","Error"];export{h as Default,Z as Empty,A as Error,x as LogsWithTimestampsAndLevels,R as WithMinimalStatus,S as WithPodDetails,st as __namedExportsOrder,et as default};

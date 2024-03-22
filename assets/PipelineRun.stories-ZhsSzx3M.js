import{j as s}from"./jsx-runtime-HUm0hl9X.js";import{r as m,R as X}from"./index-HKyOzZPI.js";import{P as R}from"./index-MRYFjIDu.js";import{I as V}from"./index-HmHgEf58.js";import{S as Y}from"./SkeletonText-kd7LZ-_w.js";import{i as ee}from"./index-uZO_dCSX.js";import{a as O,d as te,e as se,h as ae}from"./index-WkqOPh6Z.js";import{r as ne}from"./index-lJISON2B.js";import{L as ie}from"./Log--a9RCb7B.js";import{R as q}from"./RunHeader-D7omKQN5.js";import{l as y,T as re}from"./TaskTree-6R3Rlnrg.js";import{S as oe}from"./StepDetails-pRMvPcg2.js";import{T as de}from"./TaskRunDetails-FJMnVKJf.js";import"./slicedToArray-MNgqcm8y.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./settings-zSvLtxj8.js";import"./extends-dGVwEr9R.js";import"./index-U9QwFHm3.js";import"./Button-HUe_pxfK.js";import"./toConsumableArray-ZcblzY6P.js";import"./deprecate-hcs7xc4A.js";import"./events-ZBveWIsY.js";import"./useId-J3cPtmMT.js";import"./setupGetInstanceId-vqAyjREf.js";import"./index-HaCShj3n.js";import"./index-7Q--xhFC.js";import"./match-bSaK7Hln.js";import"./useIsomorphicEffect-Y2lYA90t.js";import"./bucket-6-dQ54tAAx.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./bucket-34-ngKLiAY2.js";import"./bucket-17-g9LR_0Im.js";import"./bucket-11-aZiLYyFu.js";import"./bucket-5-mAOIXUdD.js";import"./assertThisInitialized-4q6YPdh3.js";import"./inheritsLoose-fS6oVJzb.js";import"./setPrototypeOf-ahVgEFUp.js";import"./bucket-32-GkAW8Hfz.js";import"./bucket-10-igEpBC92.js";import"./LogFormat-eqqK4TQi.js";import"./DotSpinner-iWDwO7sl.js";import"./index-n80ymgmT.js";import"./FormattedDate-YPZb9zK7.js";import"./Task-Jx7zcIXU.js";import"./index-_EeHE9S1.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./getPrototypeOf-VcprQjSG.js";import"./FloatingMenu-d5eX8xYS.js";import"./navigation-fv4tXnKy.js";import"./mergeRefs-Zi_35mDS.js";import"./StatusIcon-qrSsKqPY.js";import"./bucket-31-qnmMSxzE.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";import"./Step-D6gViGJa.js";import"./Tabs-qbQZOPvG.js";import"./useMergedRefs-0i-7LjaH.js";import"./DetailsHeader-mymHQUEI.js";import"./FormattedDuration-IgQos6RL.js";import"./StepDefinition-1kj_B2eA.js";import"./ViewYAML-uiPRJ4iW.js";import"./Tooltip-mZp08mPb.js";import"./isRequiredOneOf-qeCNFKMo.js";import"./Table-Mam_RXbH.js";import"./AriaPropTypes-1IBRuLX5.js";import"./bucket-0-7b2b0LPX.js";import"./Text--uoqbMaE.js";import"./requiredIfGivenPropIsTruthy-0WXqL08H.js";import"./index-39-lBfQL.js";import"./DataTableSkeleton-TOArWwz2.js";const pe=({children:r,container:e})=>ne.createPortal(r,e);function B({pipeline:r,pipelineRun:e,selectedTaskId:t,taskRun:n}){const a=n?.metadata?.labels?.[y.MEMBER_OF];return(e.spec?.pipelineSpec?.[a]||e.status?.pipelineSpec?.[a]||r?.spec?.[a])?.find(p=>p.name===t)}class L extends m.Component{state={isLogsMaximized:!1};getPipelineRunError=()=>{const{pipelineRun:e}=this.props;if(!e.status?.taskRuns&&!e.status?.childReferences)return null;const{status:{childReferences:t,taskRuns:n}}=e,{message:a,status:i,reason:p}=O(e);return i==="False"&&!n&&!t&&{message:a,reason:p}};getLogContainer({stepName:e,stepStatus:t,taskRun:n}){const{enableLogAutoScroll:a,enableLogScrollButtons:i,fetchLogs:p,forceLogPolling:u,getLogsToolbar:f,maximizedLogsContainer:d,pollingInterval:g,selectedRetry:T,selectedStepId:k,selectedTaskId:c}=this.props,{isLogsMaximized:l}=this.state;if(!k||!t)return null;const S=l&&d?pe:X.Fragment;return s.jsx(S,{...l?{container:d}:null,children:s.jsx(ie,{toolbar:f&&t&&f({isMaximized:l,stepStatus:t,taskRun:n,toggleMaximized:!!d&&this.toggleLogsMaximized}),fetchLogs:()=>p(e,t,n),forcePolling:u,pollingInterval:g,stepStatus:t,isLogsMaximized:l,enableLogAutoScroll:a,enableLogScrollButtons:i},`${c}:${k}:${T}`)})}toggleLogsMaximized=()=>{this.setState(({isLogsMaximized:e})=>({isLogsMaximized:!e}))};loadTaskRuns=()=>{const{pipelineRun:e}=this.props;if(!e?.status?.taskRuns&&!e?.status?.childReferences)return[];const{taskRuns:t}=this.props;return t||[]};onTaskSelected=({selectedRetry:e,selectedStepId:t,selectedTaskId:n,taskRunName:a})=>{const{handleTaskSelected:i,pipeline:p,pipelineRun:u}=this.props,d=this.loadTaskRuns().find(({metadata:T})=>T.labels?.[y.PIPELINE_TASK]===n)||{},g=B({pipeline:p,pipelineRun:u,selectedTaskId:n,taskRun:d});i({selectedRetry:e,selectedStepId:t,selectedTaskId:n,taskRunName:g?.matrix?a:void 0})};render(){const{customNotification:e,error:t,icon:n,intl:a,loading:i,onRetryChange:p,onViewChange:u,pipeline:f,pipelineRun:d,pod:g,runActions:T,selectedRetry:k,selectedStepId:c,selectedTaskId:l,selectedTaskRunName:S,triggerHeader:Z,view:_}=this.props;if(i)return s.jsx(Y,{heading:!0,width:"60%"});if(t)return s.jsxs(s.Fragment,{children:[e,s.jsx(V,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:a.formatMessage({id:"dashboard.pipelineRun.error",defaultMessage:"Error loading PipelineRun"}),subtitle:te(t)})]});if(!this.props.pipelineRun)return s.jsxs(s.Fragment,{children:[e,s.jsx(V,{kind:"info",hideCloseButton:!0,lowContrast:!0,title:a.formatMessage({id:"dashboard.pipelineRun.failed",defaultMessage:"Cannot load PipelineRun"}),subtitle:a.formatMessage({id:"dashboard.pipelineRun.notFound",defaultMessage:"PipelineRun not found"})})]});const H=d.metadata.name||d.metadata.generateName,C=this.getPipelineRunError(),{lastTransitionTime:W,message:U,reason:G,status:A}=O(d);if(C)return s.jsxs(s.Fragment,{children:[s.jsx(q,{icon:n,lastTransitionTime:W,loading:i,pipelineRun:d,runName:d.pipelineRunName,reason:"Error",status:A,triggerHeader:Z}),e,s.jsx(V,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:a.formatMessage({id:"dashboard.pipelineRun.failedMessage",defaultMessage:"Unable to load PipelineRun: {reason}"},{reason:C.reason}),subtitle:C.message})]});const x=this.loadTaskRuns();let o=x.find(({metadata:h})=>h.labels?.[y.PIPELINE_TASK]===l)||{};const D=B({pipeline:f,pipelineRun:d,selectedTaskId:l,taskRun:o});D?.matrix&&S&&(o=x.find(({metadata:h})=>h.name===S)),o.status?.retriesStatus&&k&&(o={...o,status:o.status.retriesStatus[k]});const z=o.spec?.taskRef?.name&&this.props.tasks?.find(h=>h.metadata.name===o.spec.taskRef.name)||{},J=se({selectedStepId:c,task:z,taskRun:o}),F=ae({selectedStepId:c,taskRun:o}),Q=this.getLogContainer({stepName:c,stepStatus:F,taskRun:o});return s.jsxs(s.Fragment,{children:[s.jsx(q,{icon:n,lastTransitionTime:W,loading:i,message:U,runName:H,reason:G,status:A,triggerHeader:Z,children:T}),e,x.length>0&&s.jsxs("div",{className:"tkn--tasks",children:[s.jsx(re,{isSelectedTaskMatrix:!!D?.matrix,onRetryChange:p,onSelect:this.onTaskSelected,selectedRetry:k,selectedStepId:c,selectedTaskId:l,selectedTaskRunName:S,taskRuns:x}),c&&s.jsx(oe,{definition:J,logContainer:Q,onViewChange:u,stepName:c,stepStatus:F,taskRun:o,view:_})||l&&s.jsx(de,{onViewChange:u,pod:g,task:z,taskRun:o,view:_})]})]})}}L.propTypes={handleTaskSelected:R.func,onViewChange:R.func,selectedStepId:R.string,selectedTaskId:R.string,view:R.string};L.defaultProps={handleTaskSelected:()=>{},onViewChange:()=>{},selectedStepId:null,selectedTaskId:null,view:null};const j=ee(L);L.__docgenInfo={description:"",methods:[{name:"getPipelineRunError",docblock:null,modifiers:[],params:[],returns:null},{name:"getLogContainer",docblock:null,modifiers:[],params:[{name:"{ stepName, stepStatus, taskRun }",optional:!1,type:null}],returns:null},{name:"toggleLogsMaximized",docblock:null,modifiers:[],params:[],returns:null},{name:"loadTaskRuns",docblock:null,modifiers:[],params:[],returns:null},{name:"onTaskSelected",docblock:null,modifiers:[],params:[{name:`{
  selectedRetry: retry,
  selectedStepId,
  selectedTaskId,
  taskRunName
}`,optional:!1,type:null}],returns:null}],displayName:"PipelineRunContainer",props:{handleTaskSelected:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},selectedStepId:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"string"},required:!1},selectedTaskId:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"string"},required:!1},view:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"string"},required:!1}}};const E={metadata:{name:"task1",namespace:"default",resourceVersion:"1902552",selfLink:"/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1",uid:"071c7563-c067-11e9-80e7-080027e83fe1"},spec:{steps:[{args:["-c","echo storybook;"],command:["/bin/bash"],image:"ubuntu",name:"build"}]}};function $({exitCode:r=0,name:e,pipelineTaskName:t}){return{metadata:{labels:{[y.PIPELINE_TASK]:t},name:e,namespace:"default",uid:e},spec:{params:{},serviceAccountName:"default",taskRef:{kind:"Task",name:"task1"},timeout:"24h0m0s"},status:{completionTime:"2019-08-21T17:15:31Z",conditions:[{lastTransitionTime:"2019-08-21T17:15:31Z",message:"All Steps have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],podName:`sample-task-run-pod-name-${e}`,startTime:"2019-08-21T17:12:21Z",steps:[{name:"build",terminated:{containerID:"docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95",exitCode:r,finishedAt:"2019-08-21T17:12:29Z",reason:"Completed",startedAt:"2019-08-21T17:12:26Z"}}]}}}const M=$({name:"sampleTaskRunName",pipelineTaskName:"task1"}),w=$({exitCode:1,name:"sampleTaskRunName2",pipelineTaskName:"task2"}),K={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",taskRuns:{sampleTaskRunName:{pipelineTaskName:"task1",status:M.status},sampleTaskRunName2:{pipelineTaskName:"task2",status:w.status}}}},le={metadata:{name:"pipeline-run",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}],startTime:"2019-08-21T17:12:20Z",childReferences:[{name:"sampleTaskRunName",pipelineTaskName:"task1"},{name:"sampleTaskRunName2",pipelineTaskName:"task2"}]}},Lt={component:j,decorators:[r=>s.jsx(r,{})],title:"PipelineRun"},I=()=>{const[r,e]=m.useState(),[t,n]=m.useState();return s.jsx(j,{fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:i})=>{e(a),n(i)},pipelineRun:K,selectedStepId:r,selectedTaskId:t,taskRuns:[M,w],tasks:[E]})},b=()=>{const[r,e]=m.useState(),[t,n]=m.useState();return s.jsx(j,{fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:i})=>{e(a),n(i)},pipelineRun:le,selectedStepId:r,selectedTaskId:t,taskRuns:[M,w],tasks:[E]})},v=()=>{const[r,e]=m.useState(),[t,n]=m.useState();return s.jsx(j,{fetchLogs:()=>"sample log output",handleTaskSelected:({selectedStepId:a,selectedTaskId:i})=>{e(a),n(i)},pipelineRun:K,pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},selectedStepId:r,selectedTaskId:t,taskRuns:[M],tasks:[E]})},P={},N={args:{error:"Internal server error"}};I.__docgenInfo={description:"",methods:[],displayName:"Default"};b.__docgenInfo={description:"",methods:[],displayName:"WithMinimalStatus"};v.__docgenInfo={description:"",methods:[],displayName:"WithPodDetails"};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`() => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return <PipelineRun fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    setSelectedStepId(stepId);
    setSelectedTaskId(taskId);
  }} pipelineRun={pipelineRun} selectedStepId={selectedStepId} selectedTaskId={selectedTaskId} taskRuns={[taskRun, taskRunWithWarning]} tasks={[task]} />;
}`,...I.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`() => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return <PipelineRun fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    setSelectedStepId(stepId);
    setSelectedTaskId(taskId);
  }} pipelineRun={pipelineRunWithMinimalStatus} selectedStepId={selectedStepId} selectedTaskId={selectedTaskId} taskRuns={[taskRun, taskRunWithWarning]} tasks={[task]} />;
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`() => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return <PipelineRun fetchLogs={() => 'sample log output'} handleTaskSelected={({
    selectedStepId: stepId,
    selectedTaskId: taskId
  }) => {
    setSelectedStepId(stepId);
    setSelectedTaskId(taskId);
  }} pipelineRun={pipelineRun} pod={{
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
  }} selectedStepId={selectedStepId} selectedTaskId={selectedTaskId} taskRuns={[taskRun]} tasks={[task]} />;
}`,...v.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:"{}",...P.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Internal server error'
  }
}`,...N.parameters?.docs?.source}}};const jt=["Default","WithMinimalStatus","WithPodDetails","Empty","Error"];export{I as Default,P as Empty,N as Error,b as WithMinimalStatus,v as WithPodDetails,jt as __namedExportsOrder,Lt as default};

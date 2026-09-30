import{n as e,r as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./jsx-runtime-ATHzeHXA.js";import{i as r,r as i}from"./Link-DxoCdxb2.js";import{n as a,t as o}from"./RunHeader-B0plfM_5.js";var s=t({Complete:()=>m,Default:()=>f,Failed:()=>h,Loading:()=>g,Running:()=>p,WithDuration:()=>_,WithLabelOverflow:()=>y,WithTriggerInfo:()=>v,__namedExportsOrder:()=>b,default:()=>d}),c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{r(),a(),c=n(),l=new Date,u={metadata:{labels:{"tekton.dev/pipeline":`ci-pipeline`,gitRepo:`tektoncd/dashboard`,gitBranch:`main`}}},d={args:{name:`simple-pipeline`,resource:u,runName:`simple-pipeline-run-1`},component:o,title:`RunHeader`,decorators:[i()]},f={},p={args:{lastTransitionTime:l,message:`Not all Tasks have completed executing`,reason:`Running`,status:`Unknown`,labels:{"tekton.dev/pipeline":`hello-pipeline`,"triggers-eventid":`e9742d5b-00e4-4124-9aa1-da2fd670f2da`},namespace:`default`}},m={args:{lastTransitionTime:l,message:`All Tasks have completed executing`,reason:`Completed`,status:`True`}},h={args:{lastTransitionTime:l,message:`TaskRun demo-pipeline-run-1-build-skaffold-web-4dzrn has failed`,reason:`Failed`,status:`False`}},g={args:{loading:!0}},_={args:{...m.args,duration:3e4}},v={args:{...m.args,triggerHeader:(0,c.jsxs)(`span`,{children:[`Triggered by `,(0,c.jsx)(`a`,{href:`#`,children:`Update README.md`})]})}},y={args:{..._.args,resource:{metadata:{labels:{"app.kubernetes.io/managed-by":`tekton-pipelines`,"tekton.dev/memberOf":`tasks`,"tekton.dev/pipeline":`deploy-configmap`,"tekton.dev/pipelineRun":`deploy-configmap-prow-config-8zkk2`,"tekton.dev/pipelineRunUID":`4ed13cb0-87c6-4da4-8500-cd4d69c46416`,"tekton.dev/pipelineTask":`deploy`,"tekton.dev/task":`deploy-configmap`,"triggers.tekton.dev/eventlistener":`tekton-cd`,"triggers.tekton.dev/trigger":`configmaps`,"triggers.tekton.dev/triggers-eventid":`c2cd171d-2e51-47ca-b34e-42eda846a1d5`}}}}},b=[`Default`,`Running`,`Complete`,`Failed`,`Loading`,`WithDuration`,`WithTriggerInfo`,`WithLabelOverflow`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    lastTransitionTime: now,
    message: 'Not all Tasks have completed executing',
    reason: 'Running',
    status: 'Unknown',
    labels: {
      'tekton.dev/pipeline': 'hello-pipeline',
      'triggers-eventid': 'e9742d5b-00e4-4124-9aa1-da2fd670f2da'
    },
    namespace: 'default'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    lastTransitionTime: now,
    message: 'All Tasks have completed executing',
    reason: 'Completed',
    status: 'True'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    lastTransitionTime: now,
    message: 'TaskRun demo-pipeline-run-1-build-skaffold-web-4dzrn has failed',
    reason: 'Failed',
    status: 'False'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...Complete.args,
    duration: 30_000 // 30s
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Complete.args,
    triggerHeader: <span>
        Triggered by <a href="#">Update README.md</a>
      </span>
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithDuration.args,
    resource: {
      metadata: {
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'deploy-configmap',
          'tekton.dev/pipelineRun': 'deploy-configmap-prow-config-8zkk2',
          'tekton.dev/pipelineRunUID': '4ed13cb0-87c6-4da4-8500-cd4d69c46416',
          'tekton.dev/pipelineTask': 'deploy',
          'tekton.dev/task': 'deploy-configmap',
          'triggers.tekton.dev/eventlistener': 'tekton-cd',
          'triggers.tekton.dev/trigger': 'configmaps',
          'triggers.tekton.dev/triggers-eventid': 'c2cd171d-2e51-47ca-b34e-42eda846a1d5'
        }
      }
    }
  }
}`,...y.parameters?.docs?.source}}}})))()}export{s as n,x as r,h as t};
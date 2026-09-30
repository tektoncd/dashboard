import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t}from"./useIntl-lGVSqoC-.js";import{r as n}from"./lib-BZfqaDTj.js";import{t as r}from"./jsx-runtime-ATHzeHXA.js";import{n as i,t as a}from"./Table-DS-Krfts.js";import{n as o,t as s}from"./CancelStatusOptions-BQ4LN1c2.js";import{n as c,t as l}from"./Modal-BCU5b3Pi.js";var u,d;function f(){return(f=e((()=>{n(),o(),c(),i(),u=r(),d=({cancelStatus:e,onClose:n,onSubmit:r,kind:i,onChangeCancelStatus:o,resources:c,showNamespace:d=!0})=>{let f=t();return(0,u.jsxs)(l,{className:`tkn--stop-modal`,open:!0,primaryButtonText:f.formatMessage({id:`dashboard.actions.stopButton`,defaultMessage:`Stop`}),secondaryButtonText:f.formatMessage({id:`dashboard.modal.cancelButton`,defaultMessage:`Cancel`}),modalHeading:f.formatMessage({id:`dashboard.stopRuns.heading`,defaultMessage:`Stop {kind}`},{kind:i}),onSecondarySubmit:n,onRequestSubmit:r,onRequestClose:n,danger:!0,children:[(0,u.jsx)(`p`,{children:f.formatMessage({id:`dashboard.stopRuns.confirm`,defaultMessage:`Are you sure you want to stop these {kind}?`},{kind:i})}),(0,u.jsx)(a,{headers:[{key:`name`,header:f.formatMessage({id:`dashboard.tableHeader.name`,defaultMessage:`Name`})},d?{key:`namespace`,header:`Namespace`}:null].filter(Boolean),rows:c.map(e=>({id:e.metadata.uid,name:e.metadata.name,namespace:e.metadata.namespace})),size:`sm`}),e?(0,u.jsx)(s,{cancelStatus:e,onChangeCancelStatus:o}):null]})},d.__docgenInfo={description:``,methods:[],displayName:`StopModal`,props:{showNamespace:{defaultValue:{value:`true`,computed:!1},required:!1}}}})))()}var p,m,h,g,_;function v(){return(v=e((()=>{f(),{action:p}=__STORYBOOK_MODULE_ACTIONS__,m={component:d,title:`StopModal`},h={args:{cancelStatus:`Cancelled`,kind:`PipelineRuns`,onClose:p(`onClose`),onSubmit:p(`onSubmit`),resources:[{metadata:{name:`my-pipelinerun`,namespace:`my-namespace`,uid:`700c9915-65f0-4309-b7e0-54d2e4dc8bea`}}],onChangeCancelStatus:p(`onChangeCancelStatus`),showNamespace:!1}},g={args:{kind:`TaskRuns`,onClose:p(`onClose`),onSubmit:p(`onSubmit`),resources:[{metadata:{name:`my-taskrun`,namespace:`my-namespace`,uid:`700c9915-65f0-4309-b7e0-54d2e4dc8bea`}}],showNamespace:!1}},_=[`PipelineRuns`,`TaskRuns`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    cancelStatus: 'Cancelled',
    kind: 'PipelineRuns',
    onClose: action('onClose'),
    onSubmit: action('onSubmit'),
    resources: [{
      metadata: {
        name: 'my-pipelinerun',
        namespace: 'my-namespace',
        uid: '700c9915-65f0-4309-b7e0-54d2e4dc8bea'
      }
    }],
    onChangeCancelStatus: action('onChangeCancelStatus'),
    showNamespace: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    kind: 'TaskRuns',
    onClose: action('onClose'),
    onSubmit: action('onSubmit'),
    resources: [{
      metadata: {
        name: 'my-taskrun',
        namespace: 'my-namespace',
        uid: '700c9915-65f0-4309-b7e0-54d2e4dc8bea'
      }
    }],
    showNamespace: false
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{h as PipelineRuns,g as TaskRuns,_ as __namedExportsOrder,m as default};
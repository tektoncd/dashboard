import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./Node-CebPha6Y.js";var r,i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),r={component:n,args:{height:50,status:`success`,title:`some-task`,type:`card`,width:250,x:0,y:0},argTypes:{status:{control:{type:`select`},options:[`failed`,`git`,`manual`,`pending`,`running`,`success`,`success-warning`,`timer`,`trigger`,`warning`,`webhook`]},type:{control:{type:`inline-radio`},options:[`card`,`icon`]}},title:`Node`},i={args:{status:`failed`}},a={args:{status:`pending`}},o={args:{status:`running`}},s={args:{status:`success`}},c={args:{status:`success-warning`}},l={args:{status:`warning`}},u={args:{status:`trigger`,type:`icon`,width:24}},d={args:{...u.args,status:`git`}},f={args:{...u.args,status:`manual`}},p={args:{...u.args,status:`timer`}},m={args:{...u.args,status:`webhook`}},h=[`TaskFailed`,`TaskPending`,`TaskRunning`,`TaskSuccess`,`TaskSuccessWarning`,`TaskWarning`,`Trigger`,`TriggerGit`,`TriggerManual`,`TriggerTimer`,`TriggerWebhook`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed'
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'pending'
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'running'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success-warning'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'trigger',
    type: 'icon',
    width: shapeSize
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'git'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'manual'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'timer'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'webhook'
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{i as TaskFailed,a as TaskPending,o as TaskRunning,s as TaskSuccess,c as TaskSuccessWarning,l as TaskWarning,u as Trigger,d as TriggerGit,f as TriggerManual,p as TriggerTimer,m as TriggerWebhook,h as __namedExportsOrder,r as default};
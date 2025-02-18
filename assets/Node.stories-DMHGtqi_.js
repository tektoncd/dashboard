import{c as p,a as m,N as d,s as T}from"./constants-B7EbUzQT.js";import"./jsx-runtime-B0wN4eWF.js";import"./index-DS1rTf2F.js";import"./index-BLsgEXh-.js";import"./StatusIcon-n6boBcCh.js";import"./bucket-18-D1v83Eua.js";import"./Icon-Dlg6_ItC.js";import"./index-CvulwabO.js";import"./bucket-6-KyTwAsSL.js";import"./bucket-17-Dfp7XseK.js";import"./bucket-9-CFGufIsT.js";import"./bucket-12-DVDhO4p7.js";import"./bucket-1-mYJH3saD.js";import"./bucket-11-CJvd3vIe.js";import"./bucket-3-igrvqujs.js";const M={component:d,args:{height:m,status:"success",title:"some-task",type:"card",width:p,x:0,y:0},argTypes:{status:{control:{type:"select"},options:["failed","git","manual","pending","running","success","success-warning","timer","trigger","warning","webhook"]},type:{control:{type:"inline-radio"},options:["card","icon"]}},title:"Node"},r={args:{status:"failed"}},a={args:{status:"pending"}},e={args:{status:"running"}},t={args:{status:"success"}},o={args:{status:"success-warning"}},n={args:{status:"warning"}},s={args:{status:"trigger",type:"icon",width:T}},c={args:{...s.args,status:"git"}},i={args:{...s.args,status:"manual"}},g={args:{...s.args,status:"timer"}},u={args:{...s.args,status:"webhook"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'pending'
  }
}`,...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'running'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success-warning'
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning'
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'trigger',
    type: 'icon',
    width: shapeSize
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'git'
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'manual'
  }
}`,...i.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'timer'
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...Trigger.args,
    status: 'webhook'
  }
}`,...u.parameters?.docs?.source}}};const P=["TaskFailed","TaskPending","TaskRunning","TaskSuccess","TaskSuccessWarning","TaskWarning","Trigger","TriggerGit","TriggerManual","TriggerTimer","TriggerWebhook"];export{r as TaskFailed,a as TaskPending,e as TaskRunning,t as TaskSuccess,o as TaskSuccessWarning,n as TaskWarning,s as Trigger,c as TriggerGit,i as TriggerManual,g as TriggerTimer,u as TriggerWebhook,P as __namedExportsOrder,M as default};

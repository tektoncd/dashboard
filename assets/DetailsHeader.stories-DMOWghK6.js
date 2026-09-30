import{n as e,r as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./constants-CMP9haFk.js";import{c as r}from"./utils-jtJj5xm0.js";import{n as i,t as a}from"./DetailsHeader-BToKezQp.js";var o=t({Cancelled:()=>l,Completed:()=>u,CompletedWithWarning:()=>d,Failed:()=>m,Pending:()=>h,Running:()=>g,SkippedStep:()=>p,SkippedTask:()=>f,__namedExportsOrder:()=>_,default:()=>c}),s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),i(),s=({reason:e,status:t,terminationReason:n})=>({status:{conditions:[{reason:e,status:t,terminationReason:n,type:`Succeeded`}]}}),c={args:{type:`step`},argTypes:{type:{control:{type:`inline-radio`},options:[`step`,`taskRun`]}},component:a,title:`DetailsHeader`},l={args:{reason:`TaskRunCancelled`,status:`terminated`,displayName:`build`,taskRun:s({reason:`TaskRunCancelled`,status:`False`})}},u={args:{reason:`Completed`,status:`terminated`,displayName:`build`,taskRun:s({reason:`Succeeded`,status:`True`})}},d={args:{displayName:`build`,exitCode:1,hasWarning:!0,reason:`Completed`,status:`terminated`,taskRun:s({reason:`Succeeded`,status:`True`})},name:`Completed with warning`},f={args:{reason:n,displayName:`build`,taskRun:{},type:`taskRun`},argTypes:{type:{control:!1}}},p={args:{reason:`Completed`,status:`terminated`,stepStatus:{terminationReason:`Skipped`},displayName:`build`,type:`step`},argTypes:{type:{control:!1}}},m={args:{displayName:`build`,reason:`Error`,status:`terminated`,taskRun:s({reason:`Failed`,status:`False`})}},h={args:{taskRun:s({reason:`Pending`,status:`Unknown`})}},g={args:{displayName:`build`,status:`running`,taskRun:s({reason:`Running`,status:`Unknown`})}},_=[`Cancelled`,`Completed`,`CompletedWithWarning`,`SkippedTask`,`SkippedStep`,`Failed`,`Pending`,`Running`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'TaskRunCancelled',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({
      reason: 'TaskRunCancelled',
      status: 'False'
    })
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Completed',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({
      reason: 'Succeeded',
      status: 'True'
    })
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    exitCode: 1,
    hasWarning: true,
    reason: 'Completed',
    status: 'terminated',
    taskRun: getTaskRun({
      reason: 'Succeeded',
      status: 'True'
    })
  },
  name: 'Completed with warning'
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    reason: dashboardReasonSkipped,
    displayName: 'build',
    taskRun: {},
    type: 'taskRun'
  },
  argTypes: {
    type: {
      control: false
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Completed',
    status: 'terminated',
    stepStatus: {
      terminationReason: 'Skipped'
    },
    displayName: 'build',
    type: 'step'
  },
  argTypes: {
    type: {
      control: false
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    reason: 'Error',
    status: 'terminated',
    taskRun: getTaskRun({
      reason: 'Failed',
      status: 'False'
    })
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    taskRun: getTaskRun({
      reason: 'Pending',
      status: 'Unknown'
    })
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    status: 'running',
    taskRun: getTaskRun({
      reason: 'Running',
      status: 'Unknown'
    })
  }
}`,...g.parameters?.docs?.source}}}})))()}export{o as n,v as r,u as t};
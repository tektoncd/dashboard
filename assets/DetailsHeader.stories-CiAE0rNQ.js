import{D as l}from"./DetailsHeader-B1o2hUA4.js";import{d as c}from"./constants-CJ-WDauL.js";import"./jsx-runtime-B0wN4eWF.js";import"./index-DS1rTf2F.js";import"./index-CbuwW4_d.js";import"./index-BLsgEXh-.js";import"./index-CfoIBI3E.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-3-igrvqujs.js";import"./Icon-Dlg6_ItC.js";import"./index-CvulwabO.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-18-D1v83Eua.js";import"./bucket-12-DVDhO4p7.js";import"./FormattedDuration-hz7jymot.js";const e=({reason:p,status:u,terminationReason:m})=>({status:{conditions:[{reason:p,status:u,terminationReason:m,type:"Succeeded"}]}}),U={args:{type:"step"},argTypes:{type:{control:{type:"inline-radio"},options:["step","taskRun"]}},component:l,title:"DetailsHeader"},a={args:{reason:"TaskRunCancelled",status:"terminated",displayName:"build",taskRun:e({reason:"TaskRunCancelled",status:"False"})}},s={args:{reason:"Completed",status:"terminated",displayName:"build",taskRun:e({reason:"Succeeded",status:"True"})}},n={args:{displayName:"build",exitCode:1,hasWarning:!0,reason:"Completed",status:"terminated",taskRun:e({reason:"Succeeded",status:"True"})},name:"Completed with warning"},t={args:{reason:c,displayName:"build",taskRun:{},type:"taskRun"},argTypes:{type:{control:!1}}},r={args:{reason:"Completed",status:"terminated",stepStatus:{terminationReason:"Skipped"},displayName:"build",type:"step"},argTypes:{type:{control:!1}}},o={args:{displayName:"build",reason:"Error",status:"terminated",taskRun:e({reason:"Failed",status:"False"})}},d={args:{taskRun:e({reason:"Pending",status:"Unknown"})}},i={args:{displayName:"build",status:"running",taskRun:e({reason:"Running",status:"Unknown"})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'TaskRunCancelled',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({
      reason: 'TaskRunCancelled',
      status: 'False'
    })
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Completed',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({
      reason: 'Succeeded',
      status: 'True'
    })
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    reason: 'Error',
    status: 'terminated',
    taskRun: getTaskRun({
      reason: 'Failed',
      status: 'False'
    })
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    taskRun: getTaskRun({
      reason: 'Pending',
      status: 'Unknown'
    })
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    status: 'running',
    taskRun: getTaskRun({
      reason: 'Running',
      status: 'Unknown'
    })
  }
}`,...i.parameters?.docs?.source}}};const E=["Cancelled","Completed","CompletedWithWarning","SkippedTask","SkippedStep","Failed","Pending","Running"];export{a as Cancelled,s as Completed,n as CompletedWithWarning,o as Failed,d as Pending,i as Running,r as SkippedStep,t as SkippedTask,E as __namedExportsOrder,U as default};

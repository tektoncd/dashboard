import{D as d}from"./DetailsHeader-mymHQUEI.js";import"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import"./index-uZO_dCSX.js";import"./FormattedDuration-IgQos6RL.js";import"./index-WkqOPh6Z.js";import"./settings-zSvLtxj8.js";import"./StatusIcon-qrSsKqPY.js";import"./bucket-6-dQ54tAAx.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./index-MRYFjIDu.js";import"./bucket-31-qnmMSxzE.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";import"./bucket-5-mAOIXUdD.js";import"./bucket-34-ngKLiAY2.js";const e=({reason:i,status:u})=>({status:{conditions:[{reason:i,status:u,type:"Succeeded"}]}}),W={args:{type:"step"},argTypes:{type:{control:{type:"inline-radio"},options:["step","taskRun"]}},component:d,title:"DetailsHeader"},a={args:{reason:"TaskRunCancelled",status:"terminated",displayName:"build",taskRun:e({reason:"TaskRunCancelled",status:"False"})}},s={args:{reason:"Completed",status:"terminated",displayName:"build",taskRun:e({reason:"Succeeded",status:"True"})}},n={args:{displayName:"build",exitCode:1,hasWarning:!0,reason:"Completed",status:"terminated",taskRun:e({reason:"Succeeded",status:"True"})},name:"Completed with warning"},t={args:{displayName:"build",reason:"Error",status:"terminated",taskRun:e({reason:"Failed",status:"False"})}},r={args:{taskRun:e({reason:"Pending",status:"Unknown"})}},o={args:{displayName:"build",status:"running",taskRun:e({reason:"Running",status:"Unknown"})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
    displayName: 'build',
    reason: 'Error',
    status: 'terminated',
    taskRun: getTaskRun({
      reason: 'Failed',
      status: 'False'
    })
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    taskRun: getTaskRun({
      reason: 'Pending',
      status: 'Unknown'
    })
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    displayName: 'build',
    status: 'running',
    taskRun: getTaskRun({
      reason: 'Running',
      status: 'Unknown'
    })
  }
}`,...o.parameters?.docs?.source}}};const x=["Cancelled","Completed","CompletedWithWarning","Failed","Pending","Running"];export{a as Cancelled,s as Completed,n as CompletedWithWarning,t as Failed,r as Pending,o as Running,x as __namedExportsOrder,W as default};

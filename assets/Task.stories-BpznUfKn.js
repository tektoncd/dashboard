import{j as c}from"./jsx-runtime-QvtbNqby.js";import{a as u}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import{T as i}from"./Task-Cr8Qh3P_.js";import"./index-BjzEU6Zr.js";import"./v4-CQkTLCs1.js";import"./index-R-2E0Llw.js";import"./usePrefix-C48kcqDW.js";import"./index-GBHdq2eR.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./index-CjLpwf8N.js";import"./index-kGlasm3i.js";import"./deprecate-CHyGWMAj.js";import"./index-D7LnL1tT.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-CMgbqDR8.js";import"./Icon-CpyVU44g.js";import"./noopFn-g4z370MD.js";import"./index-CfoIBI3E.js";import"./StatusIcon-BOJjQf4B.js";import"./bucket-3-Dq7FRXBG.js";import"./bucket-16-CiwkPD5r.js";import"./Spinner-Dbwi84XW.js";import"./bucket-13-CBnqkqgu.js";import"./bucket-2-C9DXCKPV.js";import"./bucket-18-ByJs4WER.js";import"./Step-BGpekdcR.js";const{useArgs:g}=__STORYBOOK_MODULE_PREVIEW_API__,V={args:{displayName:"A Task",onSelect:u("selected"),selectedStepId:void 0,taskRun:{}},component:i,decorators:[d=>c.jsx("div",{style:{width:"250px"},children:c.jsx(d,{})})],title:"Task"},r={args:{succeeded:"True"}},s={args:{...r.args,steps:[{terminated:{exitCode:1,reason:"Completed"}}]},name:"Succeeded with warning"},a={args:{succeeded:"False"}},e={args:{succeeded:"Unknown"}},t={args:{...e.args,reason:"Pending"}},o={args:{...e.args,reason:"Running"}},n=d=>{const[,p]=g();return c.jsx(i,{...d,expanded:!0,onSelect:({selectedStepId:m})=>p({selectedStepId:m}),reason:"Running",steps:[{name:"lint",terminated:{exitCode:0,reason:"Completed"}},{name:"test",terminated:{exitCode:1,reason:"Completed"}},{name:"build",running:{}},{name:"deploy",running:{}}],succeeded:"Unknown"})};n.__docgenInfo={description:"",methods:[],displayName:"Expanded"};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'True'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ...Succeeded.args,
    steps: [{
      terminated: {
        exitCode: 1,
        reason: 'Completed'
      }
    }]
  },
  name: 'Succeeded with warning'
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'False'
  }
}`,...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'Unknown'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Pending'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Running'
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <Task {...args} expanded onSelect={({
    selectedStepId: stepId
  }) => updateArgs({
    selectedStepId: stepId
  })} reason="Running" steps={[{
    name: 'lint',
    terminated: {
      exitCode: 0,
      reason: 'Completed'
    }
  }, {
    name: 'test',
    terminated: {
      exitCode: 1,
      reason: 'Completed'
    }
  }, {
    name: 'build',
    running: {}
  }, {
    name: 'deploy',
    running: {}
  }]} succeeded="Unknown" />;
}`,...n.parameters?.docs?.source}}};const Y=["Succeeded","SucceededWithWarning","Failed","Unknown","Pending","Running","Expanded"];export{n as Expanded,a as Failed,t as Pending,o as Running,r as Succeeded,s as SucceededWithWarning,e as Unknown,Y as __namedExportsOrder,V as default};

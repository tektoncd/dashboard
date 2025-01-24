import{j as p}from"./jsx-runtime-CSYIdwKN.js";import{a as g}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import{T as c}from"./Task-D-SFGCQ9.js";import{d as l}from"./constants-PT-Qtcqm.js";import"./index-BUz8uDZe.js";import"./v4-CQkTLCs1.js";import"./index-j5XA6xUc.js";import"./index-CKzEcgge.js";import"./usePrefix-CM90x8zf.js";import"./index-D2d4JviW.js";import"./index-CwuwC4oq.js";import"./index-aRs7OYaA.js";import"./index-Dhzc4P7r.js";import"./index-ByVX7Zjn.js";import"./index-DMsN9lKV.js";import"./Text-BecEi-D2.js";import"./keys-fZP-1wUt.js";import"./index-Y04Ev2rt.js";import"./Tooltip-D8XmMmLg.js";import"./index-BKjU-s9g.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-w4Le0n7o.js";import"./Icon-BvP5-OXx.js";import"./wrapFocus-CMZot74P.js";import"./noopFn-g4z370MD.js";import"./index-CfoIBI3E.js";import"./StatusIcon-kVEdrWuu.js";import"./bucket-3-GObMIxt2.js";import"./bucket-17-LIiJ4OSj.js";import"./Spinner-DYyuEvhi.js";import"./bucket-13-j6L4X23M.js";import"./bucket-2-BhDbOiqM.js";import"./bucket-18-he4L4bfw.js";import"./Step-C8s8S11l.js";const{useArgs:S}=__STORYBOOK_MODULE_PREVIEW_API__,Q={args:{displayName:"A Task",onSelect:g("selected"),selectedStepId:void 0,taskRun:{}},component:c,decorators:[i=>p.jsx("div",{style:{width:"250px"},children:p.jsx(i,{})})],title:"Task"},r={args:{succeeded:"True"}},s={args:{...r.args,steps:[{terminated:{exitCode:1,reason:"Completed"}}]},name:"Succeeded with warning"},a={args:{succeeded:"False"}},e={args:{succeeded:"Unknown"}},o={args:{...e.args,reason:"Pending"}},t={args:{...e.args,reason:"Running"}},d={args:{reason:l}},n=i=>{const[,m]=S();return p.jsx(c,{...i,expanded:!0,onSelect:({selectedStepId:u})=>m({selectedStepId:u}),reason:"Running",steps:[{name:"lint",terminated:{exitCode:0,reason:"Completed"}},{name:"check",terminated:{exitCode:0,reason:"Completed"},terminationReason:"Skipped"},{name:"test",terminated:{exitCode:1,reason:"Completed"}},{name:"build",running:{}},{name:"deploy",running:{}}],succeeded:"Unknown"})};n.__docgenInfo={description:"",methods:[],displayName:"Expanded"};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Pending'
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Running'
  }
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    reason: dashboardReasonSkipped
  }
}`,...d.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`args => {
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
    name: 'check',
    terminated: {
      exitCode: 0,
      reason: 'Completed'
    },
    terminationReason: 'Skipped'
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
}`,...n.parameters?.docs?.source}}};const X=["Succeeded","SucceededWithWarning","Failed","Unknown","Pending","Running","Skipped","Expanded"];export{n as Expanded,a as Failed,o as Pending,t as Running,d as Skipped,r as Succeeded,s as SucceededWithWarning,e as Unknown,X as __namedExportsOrder,Q as default};

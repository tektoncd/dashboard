import{j as p}from"./jsx-runtime-B0wN4eWF.js";import{a as S}from"./chunk-D5ZWXAHU-BihnyLEY.js";import{T as g}from"./Task-BEm7IuJI.js";import{d as R}from"./constants-CJ-WDauL.js";import"./index-DS1rTf2F.js";import"./v4-CtRu48qb.js";import"./index-BLsgEXh-.js";import"./index-CbuwW4_d.js";import"./usePrefix-DVhi0s40.js";import"./index-CLdR1d0e.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-CvulwabO.js";import"./index-7UTgOZSF.js";import"./Text-9nRGETFr.js";import"./keys-fZP-1wUt.js";import"./index-mhCn_TNf.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-DVDhO4p7.js";import"./Icon-Dlg6_ItC.js";import"./wrapFocus-Cvvm2ck9.js";import"./noopFn-g4z370MD.js";import"./index-CfoIBI3E.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-3-igrvqujs.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-18-D1v83Eua.js";import"./Step-C5G7DejP.js";const{useArgs:l}=__STORYBOOK_MODULE_PREVIEW_API__,J={args:{displayName:"A Task",onSelect:S("selected"),selectedRetry:"",selectedStepId:void 0,taskRun:{}},component:g,decorators:[r=>p.jsx("div",{style:{width:"250px"},children:p.jsx(r,{})})],title:"Task"},n={args:{succeeded:"True"}},a={args:{...n.args,steps:[{terminated:{exitCode:1,reason:"Completed"}}]},name:"Succeeded with warning"},o={args:{succeeded:"False"}},e={args:{succeeded:"Unknown"}},d={args:{...e.args,reason:"Pending"}},c={args:{...e.args,reason:"Running"}},i={args:{reason:R}},s=r=>{const[,m]=l();return p.jsx(g,{...r,expanded:!0,onSelect:({selectedStepId:u})=>m({selectedStepId:u}),reason:"Running",steps:[{name:"lint",terminated:{exitCode:0,reason:"Completed"}},{name:"check",terminated:{exitCode:0,reason:"Completed"},terminationReason:"Skipped"},{name:"test",terminated:{exitCode:1,reason:"Completed"}},{name:"build",running:{}},{name:"deploy",running:{}}],succeeded:"Unknown"})},t=r=>{const[,m]=l();return p.jsx(g,{...r,expanded:!0,onRetryChange:u=>{m({selectedRetry:`${u}`})},reason:"Running",succeeded:"Unknown",taskRun:{status:{retriesStatus:[{},{}]}}})};s.__docgenInfo={description:"",methods:[],displayName:"Expanded"};t.__docgenInfo={description:"",methods:[],displayName:"Retries"};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'True'
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'False'
  }
}`,...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'Unknown'
  }
}`,...e.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Pending'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Running'
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    reason: dashboardReasonSkipped
  }
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`args => {
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
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`args => {
  const [, updateArgs] = useArgs();
  return <Task {...args} expanded onRetryChange={selectedRetry => {
    updateArgs({
      selectedRetry: \`\${selectedRetry}\`
    });
  }} reason="Running" succeeded="Unknown" taskRun={{
    status: {
      retriesStatus: [{}, {}]
    }
  }} />;
}`,...t.parameters?.docs?.source}}};const Q=["Succeeded","SucceededWithWarning","Failed","Unknown","Pending","Running","Skipped","Expanded","Retries"];export{s as Expanded,o as Failed,d as Pending,t as Retries,c as Running,i as Skipped,n as Succeeded,a as SucceededWithWarning,e as Unknown,Q as __namedExportsOrder,J as default};

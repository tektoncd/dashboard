import{j as c}from"./jsx-runtime-HUm0hl9X.js";import{r as g}from"./index-HKyOzZPI.js";import{a as l}from"./chunk-MZXVCX43-F-TLnGlB.js";import{T as i}from"./Task-Jx7zcIXU.js";import"./v4-yQnnJER4.js";import"./index-uZO_dCSX.js";import"./index-_EeHE9S1.js";import"./extends-dGVwEr9R.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./settings-zSvLtxj8.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./setPrototypeOf-ahVgEFUp.js";import"./assertThisInitialized-4q6YPdh3.js";import"./getPrototypeOf-VcprQjSG.js";import"./index-U9QwFHm3.js";import"./index-MRYFjIDu.js";import"./deprecate-hcs7xc4A.js";import"./index-7Q--xhFC.js";import"./match-bSaK7Hln.js";import"./FloatingMenu-d5eX8xYS.js";import"./index-lJISON2B.js";import"./navigation-fv4tXnKy.js";import"./toConsumableArray-ZcblzY6P.js";import"./mergeRefs-Zi_35mDS.js";import"./setupGetInstanceId-vqAyjREf.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./index-WkqOPh6Z.js";import"./StatusIcon-qrSsKqPY.js";import"./bucket-6-dQ54tAAx.js";import"./bucket-31-qnmMSxzE.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";import"./bucket-5-mAOIXUdD.js";import"./bucket-34-ngKLiAY2.js";import"./Step-D6gViGJa.js";const Y={args:{displayName:"A Task",onSelect:l("selected"),taskRun:{}},component:i,decorators:[d=>c.jsx("div",{style:{width:"250px"},children:c.jsx(d,{})})],title:"Task"},n={args:{succeeded:"True"}},s={args:{...n.args,steps:[{terminated:{exitCode:1,reason:"Completed"}}]},name:"Succeeded with warning"},t={args:{succeeded:"False"}},e={args:{succeeded:"Unknown"}},o={args:{...e.args,reason:"Pending"}},a={args:{...e.args,reason:"Running"}},r=d=>{const[p,m]=g.useState();return c.jsx(i,{...d,expanded:!0,onSelect:({selectedStepId:u})=>m(u),reason:"Running",selectedStepId:p,steps:[{name:"lint",terminated:{exitCode:0,reason:"Completed"}},{name:"test",terminated:{exitCode:1,reason:"Completed"}},{name:"build",running:{}},{name:"deploy",running:{}}],succeeded:"Unknown"})};r.__docgenInfo={description:"",methods:[],displayName:"Expanded"};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'True'
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'False'
  }
}`,...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    succeeded: 'Unknown'
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Pending'
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...Unknown.args,
    reason: 'Running'
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`args => {
  const [selectedStepId, setSelectedStepId] = useState();
  return <Task {...args} expanded onSelect={({
    selectedStepId: stepId
  }) => setSelectedStepId(stepId)} reason="Running" selectedStepId={selectedStepId} steps={[{
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
}`,...r.parameters?.docs?.source}}};const Z=["Succeeded","SucceededWithWarning","Failed","Unknown","Pending","Running","Expanded"];export{r as Expanded,t as Failed,o as Pending,a as Running,n as Succeeded,s as SucceededWithWarning,e as Unknown,Z as __namedExportsOrder,Y as default};

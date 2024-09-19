import{j as s}from"./jsx-runtime-QvtbNqby.js";import{T as r}from"./TaskTree-DfkrJi18.js";import"./index-BjzEU6Zr.js";import"./index-CfoIBI3E.js";import"./Task-Cr8Qh3P_.js";import"./index-R-2E0Llw.js";import"./usePrefix-C48kcqDW.js";import"./index-GBHdq2eR.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./index-CjLpwf8N.js";import"./index-kGlasm3i.js";import"./deprecate-CHyGWMAj.js";import"./index-D7LnL1tT.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-CMgbqDR8.js";import"./Icon-CpyVU44g.js";import"./noopFn-g4z370MD.js";import"./StatusIcon-BOJjQf4B.js";import"./bucket-3-Dq7FRXBG.js";import"./bucket-16-CiwkPD5r.js";import"./Spinner-Dbwi84XW.js";import"./bucket-13-CBnqkqgu.js";import"./bucket-2-C9DXCKPV.js";import"./bucket-18-ByJs4WER.js";import"./Step-BGpekdcR.js";import"./constants-BuFAfZC9.js";const{useArgs:d}=__STORYBOOK_MODULE_PREVIEW_API__,B={args:{selectedStepId:void 0,selectedTaskId:void 0,taskRuns:[{metadata:{labels:{"tekton.dev/pipelineTask":"Task 1"},uid:"task"},status:{conditions:[{reason:"Completed",status:"True",type:"Succeeded"}],steps:[{name:"build",terminated:{reason:"Completed"}},{name:"test",terminated:{reason:"Completed"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 2"},uid:"task2"},status:{conditions:[{reason:"Failed",status:"False",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Error"}},{name:"step 2",terminated:{reason:"Error"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 3"},uid:"task3"},pipelineTaskName:"Task 3",status:{conditions:[{reason:"Running",status:"Unknown",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Completed"}},{name:"step 2",running:{}}]}}]},component:r,decorators:[t=>s.jsx("div",{style:{width:"250px"},children:s.jsx(t,{})})],title:"TaskTree"},e={render:t=>{const[,a]=d();return s.jsx(r,{...t,onSelect:({selectedStepId:o,selectedTaskId:n})=>{a({selectedStepId:o,selectedTaskId:n})}})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskTree {...args} onSelect={({
      selectedStepId: stepId,
      selectedTaskId: taskId
    }) => {
      updateArgs({
        selectedStepId: stepId,
        selectedTaskId: taskId
      });
    }} />;
  }
}`,...e.parameters?.docs?.source}}};const K=["Default"];export{e as Default,K as __namedExportsOrder,B as default};

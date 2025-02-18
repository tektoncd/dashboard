import{j as r}from"./jsx-runtime-B0wN4eWF.js";import{T as n}from"./TaskTree-CUfBEgk9.js";import"./index-DS1rTf2F.js";import"./index-CfoIBI3E.js";import"./constants-CJ-WDauL.js";import"./Task-BEm7IuJI.js";import"./index-BLsgEXh-.js";import"./index-CbuwW4_d.js";import"./usePrefix-DVhi0s40.js";import"./index-CLdR1d0e.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-CvulwabO.js";import"./index-7UTgOZSF.js";import"./Text-9nRGETFr.js";import"./keys-fZP-1wUt.js";import"./index-mhCn_TNf.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-DVDhO4p7.js";import"./Icon-Dlg6_ItC.js";import"./wrapFocus-Cvvm2ck9.js";import"./noopFn-g4z370MD.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-3-igrvqujs.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-18-D1v83Eua.js";import"./Step-C5G7DejP.js";const{useArgs:d}=__STORYBOOK_MODULE_PREVIEW_API__,L={args:{selectedRetry:"",selectedStepId:void 0,selectedTaskId:void 0,skippedTasks:[{name:"Task 2"}],taskRuns:[{metadata:{labels:{"tekton.dev/pipelineTask":"Task 1"},uid:"task"},status:{conditions:[{reason:"Completed",status:"True",type:"Succeeded"}],steps:[{name:"build",terminated:{exitCode:0,reason:"Completed"}},{name:"test",terminated:{exitCode:1,reason:"Completed"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 2"},uid:"task2"},status:{conditions:[],steps:[{name:"build"},{name:"test"}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 3"},uid:"task3"},status:{conditions:[{reason:"Failed",status:"False",type:"Succeeded"}],retriesStatus:[{conditions:[{reason:"Failed",status:"False",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Error"}},{name:"step 2",terminated:{reason:"Error"}}]}],steps:[{name:"step 1",terminated:{reason:"Error"}},{name:"step 2",terminated:{reason:"Error"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 4"},uid:"task4"},pipelineTaskName:"Task 4",status:{conditions:[{reason:"Running",status:"Unknown",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Completed"}},{name:"step 2",running:{}}]}}]},component:n,decorators:[t=>r.jsx("div",{style:{width:"250px"},children:r.jsx(t,{})})],title:"TaskTree"},e={render:t=>{const[,a]=d();return r.jsx(n,{...t,onRetryChange:s=>a({selectedRetry:`${s}`}),onSelect:({selectedStepId:s,selectedTaskId:o})=>{a({selectedStepId:s,selectedTaskId:o})}})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskTree {...args} onRetryChange={selectedRetry => updateArgs({
      selectedRetry: \`\${selectedRetry}\`
    })} onSelect={({
      selectedStepId: stepId,
      selectedTaskId: taskId
    }) => {
      updateArgs({
        selectedStepId: stepId,
        selectedTaskId: taskId
      });
    }} />;
  }
}`,...e.parameters?.docs?.source}}};const M=["Default"];export{e as Default,M as __namedExportsOrder,L as default};

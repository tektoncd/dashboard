import{j as s}from"./jsx-runtime-CSYIdwKN.js";import{T as a}from"./TaskTree-BRxNTblt.js";import"./index-BUz8uDZe.js";import"./index-CfoIBI3E.js";import"./Task-D-SFGCQ9.js";import"./index-j5XA6xUc.js";import"./index-CKzEcgge.js";import"./usePrefix-CM90x8zf.js";import"./index-D2d4JviW.js";import"./index-CwuwC4oq.js";import"./index-aRs7OYaA.js";import"./index-Dhzc4P7r.js";import"./index-ByVX7Zjn.js";import"./index-DMsN9lKV.js";import"./Text-BecEi-D2.js";import"./keys-fZP-1wUt.js";import"./index-Y04Ev2rt.js";import"./Tooltip-D8XmMmLg.js";import"./index-BKjU-s9g.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-w4Le0n7o.js";import"./Icon-BvP5-OXx.js";import"./wrapFocus-CMZot74P.js";import"./noopFn-g4z370MD.js";import"./StatusIcon-kVEdrWuu.js";import"./bucket-3-GObMIxt2.js";import"./bucket-17-LIiJ4OSj.js";import"./Spinner-DYyuEvhi.js";import"./bucket-13-j6L4X23M.js";import"./bucket-2-BhDbOiqM.js";import"./bucket-18-he4L4bfw.js";import"./constants-PT-Qtcqm.js";import"./Step-C8s8S11l.js";const{useArgs:p}=__STORYBOOK_MODULE_PREVIEW_API__,N={args:{selectedStepId:void 0,selectedTaskId:void 0,skippedTasks:[{name:"Task 2"}],taskRuns:[{metadata:{labels:{"tekton.dev/pipelineTask":"Task 1"},uid:"task"},status:{conditions:[{reason:"Completed",status:"True",type:"Succeeded"}],steps:[{name:"build",terminated:{exitCode:0,reason:"Completed"}},{name:"test",terminated:{exitCode:1,reason:"Completed"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 2"},uid:"task2"},status:{conditions:[],steps:[{name:"build"},{name:"test"}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 3"},uid:"task3"},status:{conditions:[{reason:"Failed",status:"False",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Error"}},{name:"step 2",terminated:{reason:"Error"}}]}},{metadata:{labels:{"tekton.dev/pipelineTask":"Task 4"},uid:"task4"},pipelineTaskName:"Task 4",status:{conditions:[{reason:"Running",status:"Unknown",type:"Succeeded"}],steps:[{name:"step 1",terminated:{reason:"Completed"}},{name:"step 2",running:{}}]}}]},component:a,decorators:[t=>s.jsx("div",{style:{width:"250px"},children:s.jsx(t,{})})],title:"TaskTree"},e={render:t=>{const[,r]=p();return s.jsx(a,{...t,onSelect:({selectedStepId:o,selectedTaskId:n})=>{r({selectedStepId:o,selectedTaskId:n})}})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};const V=["Default"];export{e as Default,V as __namedExportsOrder,N as default};

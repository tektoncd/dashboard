import{j as n}from"./jsx-runtime-B0wN4eWF.js";import{S as e}from"./StatusIcon-CsvDFwWU.js";import{e as x}from"./bucket-17-Dfp7XseK.js";import{a as j,P as h}from"./bucket-12-DVDhO4p7.js";import"./index-DS1rTf2F.js";import"./index-CfoIBI3E.js";import"./bucket-3-igrvqujs.js";import"./index-BLsgEXh-.js";import"./Icon-Dlg6_ItC.js";import"./index-CvulwabO.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-18-D1v83Eua.js";import"./constants-CJ-WDauL.js";const U={component:e,args:{type:"normal"},argTypes:{type:{control:{type:"inline-radio"},if:{arg:"DefaultIcon",exists:!1},options:["normal","inverse"]}},title:"StatusIcon"},g={args:{reason:"Cancelled",status:"False"},name:"Cancelled - PipelineRun TEP-0058 graceful termination"},t={args:{reason:"PipelineRunCancelled",status:"False"},name:"Cancelled - PipelineRun legacy"},m={args:{reason:"TaskRunCancelled",status:"False"},name:"Cancelled - TaskRun"},s={args:{status:"False"}},c={args:{reason:"Pending",status:"Unknown"}},l={},a={args:{reason:"Running",status:"Unknown"}},r={args:{status:"True"}},i={args:{hasWarning:!0,status:"True"},name:"Succeeded with warning"},u={args:{status:"True",terminationReason:"Skipped"}},d={args:{DefaultIcon:j},name:"Task default - no status received yet"},o={args:{DefaultIcon:h},name:"Step default - no status received yet"},p={args:{DefaultIcon:x},name:"CustomRun (unknown status)"},S={render(){return n.jsxs("div",{className:"status-icons-list",children:[n.jsx("h3",{children:"PipelineRun"}),n.jsxs("ul",{children:[n.jsxs("li",{children:[n.jsx(e,{...t.args}),n.jsx("span",{children:"Cancelled"})]}),n.jsxs("li",{children:[n.jsx(e,{...s.args}),n.jsx("span",{children:"Failed"})]}),n.jsxs("li",{children:[n.jsx(e,{...c.args}),n.jsx("span",{children:"Pending"})]}),n.jsxs("li",{children:[n.jsx(e,{...l.args}),n.jsx("span",{children:"Queued"})]}),n.jsxs("li",{children:[n.jsx(e,{...a.args}),n.jsx("span",{children:"Running"})]}),n.jsxs("li",{children:[n.jsx(e,{...r.args}),n.jsx("span",{children:"Succeeded"})]}),n.jsxs("li",{children:[n.jsx(e,{...i.args}),n.jsx("span",{children:"Succeeded with warning"})]})]}),n.jsx("h3",{children:"TaskRun"}),n.jsxs("ul",{children:[n.jsxs("li",{children:[n.jsx(e,{...t.args}),n.jsx("span",{children:"Cancelled"})]}),n.jsxs("li",{children:[n.jsx(e,{...s.args}),n.jsx("span",{children:"Failed"})]}),n.jsxs("li",{children:[n.jsx(e,{...c.args}),n.jsx("span",{children:"Pending"})]}),n.jsxs("li",{children:[n.jsx(e,{...l.args}),n.jsx("span",{children:"Queued"})]}),n.jsxs("li",{children:[n.jsx(e,{...a.args}),n.jsx("span",{children:"Running"})]}),n.jsxs("li",{children:[n.jsx(e,{...r.args}),n.jsx("span",{children:"Succeeded"})]}),n.jsxs("li",{children:[n.jsx(e,{...i.args}),n.jsx("span",{children:"Succeeded with warning"})]}),n.jsxs("li",{children:[n.jsx(e,{...u.args}),n.jsx("span",{children:"Skipped"})]}),n.jsxs("li",{children:[n.jsx(e,{...d.args}),n.jsx("span",{children:"Default - no status received yet"})]}),n.jsxs("li",{children:[n.jsx(e,{...p.args}),n.jsx("span",{children:"CustomRun - custom status"})]})]}),n.jsx("h3",{children:"Step"}),n.jsxs("ul",{children:[n.jsxs("li",{children:[n.jsx(e,{...s.args,type:"inverse"}),n.jsx("span",{children:"Failed"})]}),n.jsxs("li",{children:[n.jsx(e,{...a.args,type:"inverse"}),n.jsx("span",{children:"Running"})]}),n.jsxs("li",{children:[n.jsx(e,{...r.args,type:"inverse"}),n.jsx("span",{children:"Succeeded"})]}),n.jsxs("li",{children:[n.jsx(e,{...i.args,type:"inverse"}),n.jsx("span",{children:"Succeeded with warning"})]}),n.jsxs("li",{children:[n.jsx(e,{...u.args,type:"inverse"}),n.jsx("span",{children:"Skipped"})]}),n.jsxs("li",{children:[n.jsx(e,{...o.args}),n.jsx("span",{children:"Default - no status received yet"})]})]})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Cancelled',
    status: 'False'
  },
  name: 'Cancelled - PipelineRun TEP-0058 graceful termination'
}`,...g.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'PipelineRunCancelled',
    status: 'False'
  },
  name: 'Cancelled - PipelineRun legacy'
}`,...t.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'TaskRunCancelled',
    status: 'False'
  },
  name: 'Cancelled - TaskRun'
}`,...m.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'False'
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Pending',
    status: 'Unknown'
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"{}",...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    reason: 'Running',
    status: 'Unknown'
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'True'
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    hasWarning: true,
    status: 'True'
  },
  name: 'Succeeded with warning'
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'True',
    terminationReason: 'Skipped'
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    DefaultIcon: DefaultTaskIcon
  },
  name: 'Task default - no status received yet'
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    DefaultIcon: DefaultStepIcon
  },
  name: 'Step default - no status received yet'
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    DefaultIcon: UnknownIcon
  },
  name: 'CustomRun (unknown status)'
}`,...p.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render() {
    return <div className="status-icons-list">
        <h3>PipelineRun</h3>
        <ul>
          <li>
            <StatusIcon {...CancelledPipelineRun.args} />
            <span>Cancelled</span>
          </li>
          <li>
            <StatusIcon {...Failed.args} />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Pending.args} />
            <span>Pending</span>
          </li>
          <li>
            <StatusIcon {...Queued.args} />
            <span>Queued</span>
          </li>
          <li>
            <StatusIcon {...Running.args} />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} />
            <span>Succeeded with warning</span>
          </li>
        </ul>

        <h3>TaskRun</h3>
        <ul>
          <li>
            <StatusIcon {...CancelledPipelineRun.args} />
            <span>Cancelled</span>
          </li>
          <li>
            <StatusIcon {...Failed.args} />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Pending.args} />
            <span>Pending</span>
          </li>
          <li>
            <StatusIcon {...Queued.args} />
            <span>Queued</span>
          </li>
          <li>
            <StatusIcon {...Running.args} />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} />
            <span>Succeeded with warning</span>
          </li>
          <li>
            <StatusIcon {...Skipped.args} />
            <span>Skipped</span>
          </li>
          <li>
            <StatusIcon {...DefaultTask.args} />
            <span>Default - no status received yet</span>
          </li>
          <li>
            <StatusIcon {...CustomRun.args} />
            <span>CustomRun - custom status</span>
          </li>
        </ul>

        <h3>Step</h3>
        <ul>
          <li>
            <StatusIcon {...Failed.args} type="inverse" />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Running.args} type="inverse" />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} type="inverse" />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} type="inverse" />
            <span>Succeeded with warning</span>
          </li>
          <li>
            <StatusIcon {...Skipped.args} type="inverse" />
            <span>Skipped</span>
          </li>
          <li>
            <StatusIcon {...DefaultStep.args} />
            <span>Default - no status received yet</span>
          </li>
        </ul>
      </div>;
  }
}`,...S.parameters?.docs?.source}}};const E=["CancelledGraceful","CancelledPipelineRun","CancelledTaskRun","Failed","Pending","Queued","Running","Succeeded","SucceededWithWarning","Skipped","DefaultTask","DefaultStep","CustomRun","AllIcons"];export{S as AllIcons,g as CancelledGraceful,t as CancelledPipelineRun,m as CancelledTaskRun,p as CustomRun,o as DefaultStep,d as DefaultTask,s as Failed,c as Pending,l as Queued,a as Running,u as Skipped,r as Succeeded,i as SucceededWithWarning,E as __namedExportsOrder,U as default};

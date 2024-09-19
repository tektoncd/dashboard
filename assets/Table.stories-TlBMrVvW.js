import{j as m}from"./jsx-runtime-QvtbNqby.js";import{a}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import"./usePrefix-C48kcqDW.js";import{D as p}from"./Dropdown-B-Cs8uS9.js";import{T as d}from"./Table-uKt28NJQ.js";import{A as c}from"./bucket-0-C5s-C6Km.js";import{a as u,R as g}from"./bucket-13-CBnqkqgu.js";import{T as l}from"./bucket-17-bHtnLuTa.js";import"./index-BjzEU6Zr.js";import"./v4-CQkTLCs1.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./index-s8SKy-Kq.js";import"./extends-CF3RwP-h.js";import"./index-kGlasm3i.js";import"./index-R-2E0Llw.js";import"./index-CjLpwf8N.js";import"./deprecate-CHyGWMAj.js";import"./FormContext-IWjAIOZU.js";import"./bucket-2-C9DXCKPV.js";import"./Icon-CpyVU44g.js";import"./bucket-3-Dq7FRXBG.js";import"./mergeRefs-CTUecegF.js";import"./bucket-18-ByJs4WER.js";import"./Button-B7xRuRrN.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./events-OVwOsPzJ.js";import"./index-Dc4QqC9m.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./index-GBHdq2eR.js";import"./index-D7LnL1tT.js";import"./bucket-12-CMgbqDR8.js";import"./noopFn-g4z370MD.js";import"./Search-CexipLRe.js";import"./index-CfoIBI3E.js";const Y={args:{emptyTextAllNamespaces:"No rows in any namespace",emptyTextSelectedNamespace:"No rows in selected namespace",loading:!1,size:"md",title:"Resource Name"},argTypes:{size:{type:"select",options:["xs","sm","md","lg","xl"]}},component:d,title:"Table"},e={args:{headers:[{key:"name",header:"Name"},{key:"namespace",header:"Namespace"},{key:"date",header:"Date created"}],rows:[],selectedNamespace:"*"},parameters:{notes:"simple table with title, no rows, no buttons"}},t={args:{...e.args,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"}],toolbarButtons:[{onClick:a("handleNew"),text:"Add",icon:c}]},parameters:{notes:"table with 1 row, 1 toolbar button, no batch actions"}},n={args:{...e.args,rows:t.args.rows,batchActionButtons:[{onClick:a("handleDelete"),text:"Delete",icon:l}]},parameters:{notes:"table with 1 row, 1 batch action"}},o={args:{...e.args,batchActionButtons:[{onClick:a("handleDelete"),text:"Delete",icon:l},{onClick:a("handleRerun"),text:"Rerun",icon:u}],isSortable:!0,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"},{id:"default:resource-two",name:"resource-two",namespace:"default",date:"2 weeks ago"},{id:"tekton:resource-three",name:"resource-three",namespace:"tekton",date:"2 minutes ago"}],toolbarButtons:[{icon:g,kind:"secondary",onClick:a("handleRerunAll"),text:"RerunAll"},{icon:c,onClick:a("handleNew"),text:"Add"}]},parameters:{notes:"table with sortable rows, 2 batch actions, and 2 toolbar buttons"}},r={args:{...t.args,filters:m.jsx(p,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],label:"Status",titleText:"Status:",type:"inline"})},parameters:{notes:"table with filters"}},s={args:{...t.args,loading:!0},parameters:{notes:"table loading state"}},i={args:{...r.args,loading:!0},parameters:{notes:"table loading state with filters"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    headers: [{
      key: 'name',
      header: 'Name'
    }, {
      key: 'namespace',
      header: 'Namespace'
    }, {
      key: 'date',
      header: 'Date created'
    }],
    rows: [],
    selectedNamespace: '*'
  },
  parameters: {
    notes: 'simple table with title, no rows, no buttons'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Simple.args,
    rows: [{
      id: 'namespace1:resource-one',
      name: 'resource-one',
      namespace: 'namespace1',
      date: '100 years ago'
    }],
    toolbarButtons: [{
      onClick: action('handleNew'),
      text: 'Add',
      icon: Add
    }]
  },
  parameters: {
    notes: 'table with 1 row, 1 toolbar button, no batch actions'
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...Simple.args,
    rows: ToolbarButton.args.rows,
    batchActionButtons: [{
      onClick: action('handleDelete'),
      text: 'Delete',
      icon: Delete
    }]
  },
  parameters: {
    notes: 'table with 1 row, 1 batch action'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Simple.args,
    batchActionButtons: [{
      onClick: action('handleDelete'),
      text: 'Delete',
      icon: Delete
    }, {
      onClick: action('handleRerun'),
      text: 'Rerun',
      icon: Rerun
    }],
    isSortable: true,
    rows: [{
      id: 'namespace1:resource-one',
      name: 'resource-one',
      namespace: 'namespace1',
      date: '100 years ago'
    }, {
      id: 'default:resource-two',
      name: 'resource-two',
      namespace: 'default',
      date: '2 weeks ago'
    }, {
      id: 'tekton:resource-three',
      name: 'resource-three',
      namespace: 'tekton',
      date: '2 minutes ago'
    }],
    toolbarButtons: [{
      icon: RerunAll,
      kind: 'secondary',
      onClick: action('handleRerunAll'),
      text: 'RerunAll'
    }, {
      icon: Add,
      onClick: action('handleNew'),
      text: 'Add'
    }]
  },
  parameters: {
    notes: 'table with sortable rows, 2 batch actions, and 2 toolbar buttons'
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    ...ToolbarButton.args,
    filters: <Dropdown id="status-filter" initialSelectedItem="All" items={['All', 'Succeeded', 'Failed']} label="Status" titleText="Status:" type="inline" />
  },
  parameters: {
    notes: 'table with filters'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ...ToolbarButton.args,
    loading: true
  },
  parameters: {
    notes: 'table loading state'
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...Filters.args,
    loading: true
  },
  parameters: {
    notes: 'table loading state with filters'
  }
}`,...i.parameters?.docs?.source}}};const Z=["Simple","ToolbarButton","BatchActions","Sorting","Filters","Loading","LoadingWithFilters"];export{n as BatchActions,r as Filters,s as Loading,i as LoadingWithFilters,e as Simple,o as Sorting,t as ToolbarButton,Z as __namedExportsOrder,Y as default};

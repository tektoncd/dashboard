import{j as m}from"./jsx-runtime-CSYIdwKN.js";import{a}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import"./usePrefix-CM90x8zf.js";import{D as p}from"./Dropdown-4W64npmB.js";import{T as d}from"./Table-C913vRMv.js";import{A as c}from"./bucket-0-MNXPsXKu.js";import{R as u}from"./bucket-14-B330O8PO.js";import{T as l}from"./bucket-17-LIiJ4OSj.js";import{R as g}from"./bucket-13-j6L4X23M.js";import"./index-BUz8uDZe.js";import"./v4-CQkTLCs1.js";import"./index-j5XA6xUc.js";import"./index-CwuwC4oq.js";import"./index-aRs7OYaA.js";import"./index-Dhzc4P7r.js";import"./index-ByVX7Zjn.js";import"./index-DswfrUh6.js";import"./extends-CF3RwP-h.js";import"./index-CKzEcgge.js";import"./index-DMsN9lKV.js";import"./FormContext-aPXE3suj.js";import"./bucket-3-GObMIxt2.js";import"./Icon-BvP5-OXx.js";import"./mergeRefs-CTUecegF.js";import"./bucket-18-he4L4bfw.js";import"./bucket-2-BhDbOiqM.js";import"./Button-BL0i1dXE.js";import"./index-Y04Ev2rt.js";import"./Tooltip-D8XmMmLg.js";import"./index-BKjU-s9g.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./index-B1POUp4B.js";import"./debounce-DBudwqRe.js";import"./Text-BecEi-D2.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./index-D2d4JviW.js";import"./bucket-12-w4Le0n7o.js";import"./wrapFocus-CMZot74P.js";import"./noopFn-g4z370MD.js";import"./Search-DnmSg_ZS.js";import"./index-CfoIBI3E.js";const re={args:{emptyTextAllNamespaces:"No rows in any namespace",emptyTextSelectedNamespace:"No rows in selected namespace",loading:!1,size:"md",title:"Resource Name"},argTypes:{size:{type:"select",options:["xs","sm","md","lg","xl"]}},component:d,title:"Table"},e={args:{headers:[{key:"name",header:"Name"},{key:"namespace",header:"Namespace"},{key:"date",header:"Date created"}],rows:[],selectedNamespace:"*"},parameters:{notes:"simple table with title, no rows, no buttons"}},t={args:{...e.args,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"}],toolbarButtons:[{onClick:a("handleNew"),text:"Add",icon:c}]},parameters:{notes:"table with 1 row, 1 toolbar button, no batch actions"}},o={args:{...e.args,rows:t.args.rows,batchActionButtons:[{onClick:a("handleDelete"),text:"Delete",icon:l}]},parameters:{notes:"table with 1 row, 1 batch action"}},n={args:{...e.args,batchActionButtons:[{onClick:a("handleDelete"),text:"Delete",icon:l},{onClick:a("handleRerun"),text:"Rerun",icon:u}],isSortable:!0,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"},{id:"default:resource-two",name:"resource-two",namespace:"default",date:"2 weeks ago"},{id:"tekton:resource-three",name:"resource-three",namespace:"tekton",date:"2 minutes ago"}],toolbarButtons:[{icon:g,kind:"secondary",onClick:a("handleRerunAll"),text:"RerunAll"},{icon:c,onClick:a("handleNew"),text:"Add"}]},parameters:{notes:"table with sortable rows, 2 batch actions, and 2 toolbar buttons"}},r={args:{...t.args,filters:m.jsx(p,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],label:"Status",titleText:"Status:",type:"inline"})},parameters:{notes:"table with filters"}},s={args:{...t.args,loading:!0},parameters:{notes:"table loading state"}},i={args:{...r.args,loading:!0},parameters:{notes:"table loading state with filters"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const oe=["Simple","ToolbarButton","BatchActions","Sorting","Filters","Loading","LoadingWithFilters"];export{o as BatchActions,r as Filters,s as Loading,i as LoadingWithFilters,e as Simple,n as Sorting,t as ToolbarButton,oe as __namedExportsOrder,re as default};

import{j as c}from"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import{a as t}from"./chunk-MZXVCX43-F-TLnGlB.js";import{D as m}from"./Dropdown-j941xoI5.js";import{T as l}from"./Table-Mam_RXbH.js";import{A as s}from"./bucket-0-7b2b0LPX.js";import{a as i}from"./bucket-32-GkAW8Hfz.js";import{a as p,b as d}from"./bucket-25-O-KA0EH0.js";import"./v4-yQnnJER4.js";import"./extends-dGVwEr9R.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./settings-zSvLtxj8.js";import"./createPropAdapter-l_oREwkT.js";import"./assertThisInitialized-4q6YPdh3.js";import"./inheritsLoose-fS6oVJzb.js";import"./setPrototypeOf-ahVgEFUp.js";import"./index-MRYFjIDu.js";import"./index-U9QwFHm3.js";import"./index-7Q--xhFC.js";import"./slicedToArray-MNgqcm8y.js";import"./bucket-5-mAOIXUdD.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./bucket-6-dQ54tAAx.js";import"./mergeRefs-Zi_35mDS.js";import"./deprecate-hcs7xc4A.js";import"./index-HaCShj3n.js";import"./setupGetInstanceId-vqAyjREf.js";import"./bucket-34-ngKLiAY2.js";import"./index-uZO_dCSX.js";import"./Button-HUe_pxfK.js";import"./toConsumableArray-ZcblzY6P.js";import"./events-ZBveWIsY.js";import"./useId-J3cPtmMT.js";import"./match-bSaK7Hln.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./getPrototypeOf-VcprQjSG.js";import"./index-n80ymgmT.js";import"./AriaPropTypes-1IBRuLX5.js";import"./isRequiredOneOf-qeCNFKMo.js";import"./Text--uoqbMaE.js";import"./requiredIfGivenPropIsTruthy-0WXqL08H.js";import"./useMergedRefs-0i-7LjaH.js";import"./index-_EeHE9S1.js";import"./FloatingMenu-d5eX8xYS.js";import"./index-lJISON2B.js";import"./navigation-fv4tXnKy.js";import"./index-39-lBfQL.js";import"./index-WkqOPh6Z.js";import"./DataTableSkeleton-TOArWwz2.js";const me={args:{emptyTextAllNamespaces:"No rows in any namespace",emptyTextSelectedNamespace:"No rows in selected namespace",loading:!1,size:"md",title:"Resource Name"},argTypes:{size:{type:"select",options:["xs","sm","md","lg","xl"]}},component:l,title:"Table"},e={args:{headers:[{key:"name",header:"Name"},{key:"namespace",header:"Namespace"},{key:"date",header:"Date created"}],rows:[],selectedNamespace:"*"},parameters:{notes:"simple table with title, no rows, no buttons"}},a={args:{...e.args,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"}],toolbarButtons:[{onClick:t("handleNew"),text:"Add",icon:s}]},parameters:{notes:"table with 1 row, 1 toolbar button, no batch actions"}},o={args:{...e.args,rows:a.args.rows,batchActionButtons:[{onClick:t("handleDelete"),text:"Delete",icon:i}]},parameters:{notes:"table with 1 row, 1 batch action"}},n={args:{...e.args,batchActionButtons:[{onClick:t("handleDelete"),text:"Delete",icon:i},{onClick:t("handleRerun"),text:"Rerun",icon:p}],isSortable:!0,rows:[{id:"namespace1:resource-one",name:"resource-one",namespace:"namespace1",date:"100 years ago"},{id:"default:resource-two",name:"resource-two",namespace:"default",date:"2 weeks ago"},{id:"tekton:resource-three",name:"resource-three",namespace:"tekton",date:"2 minutes ago"}],toolbarButtons:[{icon:d,kind:"secondary",onClick:t("handleRerunAll"),text:"RerunAll"},{icon:s,onClick:t("handleNew"),text:"Add"}]},parameters:{notes:"table with sortable rows, 2 batch actions, and 2 toolbar buttons"}},r={args:{...a.args,filters:c.jsx(m,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],light:!0,label:"Status",titleText:"Status:",type:"inline"})},parameters:{notes:"table with filters"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
    filters: <Dropdown id="status-filter" initialSelectedItem="All" items={['All', 'Succeeded', 'Failed']} light label="Status" titleText="Status:" type="inline" />
  },
  parameters: {
    notes: 'table with filters'
  }
}`,...r.parameters?.docs?.source}}};const le=["Simple","ToolbarButton","BatchActions","Sorting","Filters"];export{o as BatchActions,r as Filters,e as Simple,n as Sorting,a as ToolbarButton,le as __namedExportsOrder,me as default};

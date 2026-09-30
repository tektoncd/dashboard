import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{i as n,t as r}from"./bucket-0-Dg-rwVNS.js";import{n as i,t as a}from"./Table-DS-Krfts.js";import{n as o,r as s,t as c}from"./bucket-16-Ixoxxxuj.js";import{s as l,t as u}from"./bucket-20-D9XU2xQJ.js";import{t as d}from"./es-BERic32k.js";import{t as f}from"./Dropdown-BCYDJwA5.js";var p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{d(),n(),l(),s(),i(),p=t(),{action:m}=__STORYBOOK_MODULE_ACTIONS__,h={args:{emptyTextAllNamespaces:`No rows in any namespace`,emptyTextSelectedNamespace:`No rows in selected namespace`,loading:!1,size:`md`,title:`Resource Name`},argTypes:{size:{type:`select`,options:[`xs`,`sm`,`md`,`lg`,`xl`]}},component:a,title:`Table`},g={args:{headers:[{key:`name`,header:`Name`},{key:`namespace`,header:`Namespace`},{key:`date`,header:`Date created`}],rows:[],selectedNamespace:`*`},parameters:{notes:`simple table with title, no rows, no buttons`}},_={args:{...g.args,rows:[{id:`namespace1:resource-one`,name:`resource-one`,namespace:`namespace1`,date:`100 years ago`}],toolbarButtons:[{onClick:m(`handleNew`),text:`Add`,icon:r}]},parameters:{notes:`table with 1 row, 1 toolbar button, no batch actions`}},v={args:{...g.args,rows:_.args.rows,batchActionButtons:[{onClick:m(`handleDelete`),text:`Delete`,icon:u}]},parameters:{notes:`table with 1 row, 1 batch action`}},y={args:{...g.args,batchActionButtons:[{onClick:m(`handleDelete`),text:`Delete`,icon:u},{onClick:m(`handleRerun`),text:`Rerun`,icon:o}],isSortable:!0,rows:[{id:`namespace1:resource-one`,name:`resource-one`,namespace:`namespace1`,date:`100 years ago`},{id:`default:resource-two`,name:`resource-two`,namespace:`default`,date:`2 weeks ago`},{id:`tekton:resource-three`,name:`resource-three`,namespace:`tekton`,date:`2 minutes ago`}],toolbarButtons:[{icon:c,kind:`secondary`,onClick:m(`handleRerunAll`),text:`RerunAll`},{icon:r,onClick:m(`handleNew`),text:`Add`}]},parameters:{notes:`table with sortable rows, 2 batch actions, and 2 toolbar buttons`}},b={args:{..._.args,filters:(0,p.jsx)(f,{id:`status-filter`,initialSelectedItem:`All`,items:[`All`,`Succeeded`,`Failed`],label:`Status`,titleText:`Status:`,type:`inline`})},parameters:{notes:`table with filters`}},x={args:{..._.args,loading:!0},parameters:{notes:`table loading state`}},S={args:{...b.args,loading:!0},parameters:{notes:`table loading state with filters`}},C=[`Simple`,`ToolbarButton`,`BatchActions`,`Sorting`,`Filters`,`Loading`,`LoadingWithFilters`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...ToolbarButton.args,
    filters: <Dropdown id="status-filter" initialSelectedItem="All" items={['All', 'Succeeded', 'Failed']} label="Status" titleText="Status:" type="inline" />
  },
  parameters: {
    notes: 'table with filters'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...ToolbarButton.args,
    loading: true
  },
  parameters: {
    notes: 'table loading state'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Filters.args,
    loading: true
  },
  parameters: {
    notes: 'table loading state with filters'
  }
}`,...S.parameters?.docs?.source}}}})))()}w();export{v as BatchActions,b as Filters,x as Loading,S as LoadingWithFilters,g as Simple,y as Sorting,_ as ToolbarButton,C as __namedExportsOrder,h as default};
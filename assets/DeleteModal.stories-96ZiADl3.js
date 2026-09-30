import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t}from"./useIntl-lGVSqoC-.js";import{r as n}from"./lib-BZfqaDTj.js";import{t as r}from"./jsx-runtime-ATHzeHXA.js";import{n as i,t as a}from"./Table-DS-Krfts.js";import{n as o,t as s}from"./Modal-BCU5b3Pi.js";var c,l;function u(){return(u=e((()=>{n(),o(),i(),c=r(),l=({onClose:e,onSubmit:n,kind:r,resources:i,showNamespace:o=!0})=>{let l=t();return(0,c.jsxs)(s,{className:`tkn--delete-modal`,open:!0,primaryButtonText:l.formatMessage({id:`dashboard.actions.deleteButton`,defaultMessage:`Delete`}),secondaryButtonText:l.formatMessage({id:`dashboard.modal.cancelButton`,defaultMessage:`Cancel`}),modalHeading:l.formatMessage({id:`dashboard.deleteResources.heading`,defaultMessage:`Delete {kind}`},{kind:r}),onSecondarySubmit:e,onRequestSubmit:n,onRequestClose:e,danger:!0,children:[(0,c.jsx)(`p`,{children:l.formatMessage({id:`dashboard.deleteResources.confirm`,defaultMessage:`Are you sure you want to delete these {kind}?`},{kind:r})}),(0,c.jsx)(a,{headers:[{key:`name`,header:l.formatMessage({id:`dashboard.tableHeader.name`,defaultMessage:`Name`})},o?{key:`namespace`,header:`Namespace`}:null].filter(Boolean),rows:i.map(e=>({id:e.metadata.uid,name:e.metadata.name,namespace:e.metadata.namespace})),size:`sm`})]})},l.__docgenInfo={description:``,methods:[],displayName:`DeleteModal`,props:{showNamespace:{defaultValue:{value:`true`,computed:!1},required:!1}}}})))()}var d,f,p,m;function h(){return(h=e((()=>{u(),{action:d}=__STORYBOOK_MODULE_ACTIONS__,f={component:l,title:`DeleteModal`},p={args:{kind:`Pipelines`,onClose:d(`onClose`),onSubmit:d(`onSubmit`),resources:[{metadata:{name:`my-pipeline`,namespace:`my-namespace`,uid:`700c9915-65f0-4309-b7e0-54d2e4dc8bea`}}],showNamespace:!1}},m=[`Default`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    kind: 'Pipelines',
    onClose: action('onClose'),
    onSubmit: action('onSubmit'),
    resources: [{
      metadata: {
        name: 'my-pipeline',
        namespace: 'my-namespace',
        uid: '700c9915-65f0-4309-b7e0-54d2e4dc8bea'
      }
    }],
    showNamespace: false
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{p as Default,m as __namedExportsOrder,f as default};
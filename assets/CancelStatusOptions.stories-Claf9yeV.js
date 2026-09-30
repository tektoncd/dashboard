import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{n,t as r}from"./CancelStatusOptions-BQ4LN1c2.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{n(),i=t(),{action:a}=__STORYBOOK_MODULE_ACTIONS__,{useArgs:o}=__STORYBOOK_MODULE_PREVIEW_API__,s={component:r,title:`CancelStatusOptions`},c={args:{cancelStatus:`Cancelled`,onChangeCancelStatus:a(`onChangeCancelStatus`)},render:e=>{let[,t]=o();return(0,i.jsx)(r,{...e,onChangeCancelStatus:e=>t({cancelStatus:e})})}},l=[`Default`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    cancelStatus: 'Cancelled',
    onChangeCancelStatus: action('onChangeCancelStatus')
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <CancelStatusOptions {...args} onChangeCancelStatus={cancelStatus => updateArgs({
      cancelStatus
    })} />;
  }
}`,...c.parameters?.docs?.source}}}})))()}u();export{c as Default,l as __namedExportsOrder,s as default};
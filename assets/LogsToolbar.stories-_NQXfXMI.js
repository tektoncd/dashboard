import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{n,t as r}from"./LogsToolbar-BDX0TP9V.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,o={component:r,decorators:[e=>(0,i.jsx)(`pre`,{className:`tkn--log`,style:{width:`300px`},children:(0,i.jsx)(e,{})})],title:`LogsToolbar`},s={args:{id:`logs-toolbar`,showTimestamps:!1},render:e=>{let[,t]=a();return(0,i.jsx)(r,{...e,onToggleShowTimestamps:e=>t({showTimestamps:e})})}},c={args:{...s.args,logLevels:{error:!0,warning:!0,info:!0,notice:!0,debug:!1,trace:!1}},render:e=>{let[,t]=a();return(0,i.jsx)(r,{...e,onToggleLogLevel:n=>t({logLevels:{...e.logLevels,...n}}),onToggleShowTimestamps:e=>t({showTimestamps:e})})}},l={args:{...c.args,isMaximized:!1},render:e=>{let[,t]=a();return(0,i.jsx)(r,{...e,onToggleLogLevel:n=>t({logLevels:{...e.logLevels,...n}}),onToggleMaximized:()=>t({isMaximized:!e.isMaximized}),onToggleShowTimestamps:e=>t({showTimestamps:e})})}},u=[`Default`,`WithLogLevels`,`WithMaximize`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    id: 'logs-toolbar',
    showTimestamps: false
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <LogsToolbar {...args} onToggleShowTimestamps={showTimestamps => updateArgs({
      showTimestamps
    })} />;
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false,
      trace: false
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <LogsToolbar {...args} onToggleLogLevel={logLevel => updateArgs({
      logLevels: {
        ...args.logLevels,
        ...logLevel
      }
    })} onToggleShowTimestamps={showTimestamps => updateArgs({
      showTimestamps
    })} />;
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithLogLevels.args,
    isMaximized: false
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <LogsToolbar {...args} onToggleLogLevel={logLevel => updateArgs({
      logLevels: {
        ...args.logLevels,
        ...logLevel
      }
    })} onToggleMaximized={() => updateArgs({
      isMaximized: !args.isMaximized
    })} onToggleShowTimestamps={showTimestamps => updateArgs({
      showTimestamps
    })} />;
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{s as Default,c as WithLogLevels,l as WithMaximize,u as __namedExportsOrder,o as default};
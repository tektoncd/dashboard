import{j as r}from"./jsx-runtime-CSYIdwKN.js";import{L as g}from"./LogsToolbar-C9_4j60G.js";import"./index-BUz8uDZe.js";import"./index-CKzEcgge.js";import"./index-j5XA6xUc.js";import"./usePrefix-CM90x8zf.js";import"./index-CwuwC4oq.js";import"./index-aRs7OYaA.js";import"./index-Dhzc4P7r.js";import"./index-ByVX7Zjn.js";import"./index-DMsN9lKV.js";import"./noopFn-g4z370MD.js";import"./Text-BecEi-D2.js";import"./bucket-18-he4L4bfw.js";import"./Icon-BvP5-OXx.js";import"./index-BKjU-s9g.js";import"./bucket-11-DDPe_j1I.js";import"./bucket-9-Tmqsekzu.js";import"./bucket-5-DYpy_Xue.js";import"./bucket-14-B330O8PO.js";const{useArgs:l}=__STORYBOOK_MODULE_PREVIEW_API__,E={component:g,decorators:[e=>r.jsx("pre",{className:"tkn--log",style:{width:"300px"},children:r.jsx(e,{})})],title:"LogsToolbar"},a={args:{id:"logs-toolbar",showTimestamps:!1},render:e=>{const[,o]=l();return r.jsx(g,{...e,onToggleShowTimestamps:s=>o({showTimestamps:s})})}},n={args:{...a.args,logLevels:{error:!0,warning:!0,info:!0,notice:!0,debug:!1}},render:e=>{const[,o]=l();return r.jsx(g,{...e,onToggleLogLevel:s=>o({logLevels:{...e.logLevels,...s}}),onToggleShowTimestamps:s=>o({showTimestamps:s})})}},t={args:{...n.args,isMaximized:!1},render:e=>{const[,o]=l();return r.jsx(g,{...e,onToggleLogLevel:s=>o({logLevels:{...e.logLevels,...s}}),onToggleMaximized:()=>o({isMaximized:!e.isMaximized}),onToggleShowTimestamps:s=>o({showTimestamps:s})})}},i={args:{...t.args,name:"some_filename.txt",url:"/some/logs/url"},render:e=>{const[,o]=l();return r.jsx(g,{...e,onToggleLogLevel:s=>o({logLevels:{...e.logLevels,...s}}),onToggleMaximized:()=>o({isMaximized:!e.isMaximized}),onToggleShowTimestamps:s=>o({showTimestamps:s})})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    logLevels: {
      error: true,
      warning: true,
      info: true,
      notice: true,
      debug: false
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
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithMaximize.args,
    name: 'some_filename.txt',
    url: '/some/logs/url'
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
}`,...i.parameters?.docs?.source}}};const O=["Default","WithLogLevels","WithMaximize","WithURL"];export{a as Default,n as WithLogLevels,t as WithMaximize,i as WithURL,O as __namedExportsOrder,E as default};

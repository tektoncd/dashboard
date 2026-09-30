import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./FormattedDuration-zgKifZEI.js";var r,i,a,o,s;function c(){return(c=e((()=>{t(),r={component:n,title:`FormattedDuration`},i={args:{milliseconds:1e3},name:`1 second`},a={args:{milliseconds:61e3},name:`1 minute 1 second`},o={args:{milliseconds:727e4}},s=[`OneSecond`,`OneMinuteOneSecond`,`Other`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    milliseconds: 1000
  },
  name: '1 second'
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    milliseconds: 61000
  },
  name: '1 minute 1 second'
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    milliseconds: 2 * 60 * 60 * 1000 + 1 * 60 * 1000 + 10 * 1000 // 2h 1m 10s
  }
}`,...o.parameters?.docs?.source}}}})))()}c();export{a as OneMinuteOneSecond,i as OneSecond,o as Other,s as __namedExportsOrder,r as default};
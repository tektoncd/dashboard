import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-B6tGW3fj.js";import{n as r}from"./useIntl-lGVSqoC-.js";import{r as i}from"./lib-BZfqaDTj.js";import{t as a}from"./jsx-runtime-ATHzeHXA.js";import{n as o,t as s}from"./Icon-B1yYnJMR.js";import{i as c,n as l}from"./bucket-0-Dg-rwVNS.js";import{t as u}from"./es-BERic32k.js";import{t as d}from"./Button-4Zt1SdMp.js";import{t as f}from"./TextInput-C4tOjBtS.js";var p,m,h;function g(){return(g=t((()=>{o(),p=e(n()),m=a(),h=p.forwardRef(function({children:e,size:t=16,...n},r){return p.createElement(s,{width:t,height:t,ref:r,xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 32 32`,fill:`currentColor`,...n},(0,m.jsx)(`path`,{d:`M16,4c6.6,0,12,5.4,12,12s-5.4,12-12,12S4,22.6,4,16S9.4,4,16,4 M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14 S23.7,2,16,2z`}),(0,m.jsx)(`path`,{d:`M8 15H24V17H8z`}),e)})})))()}var _,v;function y(){return(y=t((()=>{i(),u(),c(),g(),_=a(),v=({invalidFields:e,invalidText:t,keyValues:n,legendText:i,minKeyValues:a=0,onAdd:o,onChange:s,onRemove:c})=>{let u=r(),p=u.formatMessage({id:`dashboard.keyValueList.add`,defaultMessage:`Add`}),m=u.formatMessage({id:`dashboard.keyValueList.remove`,defaultMessage:`Remove`}),g=!1,v=n.map(({id:t,key:r,keyPlaceholder:i,value:o,valuePlaceholder:l},u)=>{let p=`${t}-key`,v=`${t}-value`,y=p in e,b=v in e;return g=g||y||b,(0,_.jsxs)(`div`,{className:`tkn--keyvalue-row`,children:[(0,_.jsx)(f,{id:p,labelText:``,value:r,placeholder:i,onChange:e=>{s({type:`key`,index:u,value:e.target.value})},invalid:y,autoComplete:`off`}),(0,_.jsx)(f,{id:v,labelText:``,value:o,placeholder:l,onChange:e=>{s({type:`value`,index:u,value:e.target.value})},invalid:b,autoComplete:`off`}),n.length>a&&(0,_.jsx)(d,{hasIconOnly:!0,iconDescription:m,kind:`ghost`,onClick:()=>c(u),renderIcon:h,size:`md`,tooltipAlignment:`center`,tooltipPosition:`bottom`})]},`keyvalueRow${t}`)});return(0,_.jsxs)(`div`,{className:`tkn--keyvalues`,children:[(0,_.jsx)(`p`,{className:`tkn--keyvalue-label`,children:i}),g&&(0,_.jsx)(`p`,{className:`tkn--keyvalue-invalid`,children:t}),v,(0,_.jsx)(d,{iconDescription:p,kind:`ghost`,onClick:o,renderIcon:e=>(0,_.jsx)(l,{size:24,...e}),children:p})]})},v.__docgenInfo={description:``,methods:[],displayName:`KeyValueList`,props:{minKeyValues:{defaultValue:{value:`0`,computed:!1},required:!1}}}})))()}var b,x,S,C,w;function T(){return(T=t((()=>{y(),{action:b}=__STORYBOOK_MODULE_ACTIONS__,x={args:{legendText:`Legend Text`},component:v,title:`KeyValueList`},S={args:{invalidFields:{"2-key":!0,"3-value":!0},invalidText:`There are invalid KeyValue entries.`,keyValues:[{id:`0`,key:`foo`,keyPlaceholder:`foo`,value:`bar`,valuePlaceholder:`bar`},{id:`1`,key:``,keyPlaceholder:`key placeholder`,value:``,valuePlaceholder:`value placeholder`},{id:`2`,key:`invalid key`,keyPlaceholder:``,value:`bar`,valuePlaceholder:``},{id:`3`,key:`foo`,keyPlaceholder:``,value:`invalid value`,valuePlaceholder:``}],onAdd:b(`onAdd`),onChange:b(`onChange`),onRemove:b(`onRemove`)}},C={args:{invalidFields:{},keyValues:[{id:`0`,key:`foo`,keyPlaceholder:`foo`,value:`bar`,valuePlaceholder:`bar`}],minKeyValues:1,onAdd:b(`onAdd`),onChange:b(`onChange`),onRemove:b(`onRemove`)},name:`minKeyValues`},w=[`Default`,`MinKeyValues`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    invalidFields: {
      '2-key': true,
      '3-value': true
    },
    invalidText: 'There are invalid KeyValue entries.',
    keyValues: [{
      id: '0',
      key: 'foo',
      keyPlaceholder: 'foo',
      value: 'bar',
      valuePlaceholder: 'bar'
    }, {
      id: '1',
      key: '',
      keyPlaceholder: 'key placeholder',
      value: '',
      valuePlaceholder: 'value placeholder'
    }, {
      id: '2',
      key: 'invalid key',
      keyPlaceholder: '',
      value: 'bar',
      valuePlaceholder: ''
    }, {
      id: '3',
      key: 'foo',
      keyPlaceholder: '',
      value: 'invalid value',
      valuePlaceholder: ''
    }],
    onAdd: action('onAdd'),
    onChange: action('onChange'),
    onRemove: action('onRemove')
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    invalidFields: {},
    keyValues: [{
      id: '0',
      key: 'foo',
      keyPlaceholder: 'foo',
      value: 'bar',
      valuePlaceholder: 'bar'
    }],
    minKeyValues: 1,
    onAdd: action('onAdd'),
    onChange: action('onChange'),
    onRemove: action('onRemove')
  },
  name: 'minKeyValues'
}`,...C.parameters?.docs?.source}}}})))()}T();export{S as Default,C as MinKeyValues,w as __namedExportsOrder,x as default};
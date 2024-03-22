import{a}from"./chunk-MZXVCX43-F-TLnGlB.js";import{j as e}from"./jsx-runtime-HUm0hl9X.js";import{R as l}from"./index-HKyOzZPI.js";import{u as L}from"./index-uZO_dCSX.js";import{B as x}from"./Button-HUe_pxfK.js";import{T as P}from"./index-05dzIUjn.js";import{_ as S,I as E,a as N}from"./Icon-9ecdf98c-XZbtWap5.js";import{a as D}from"./bucket-0-7b2b0LPX.js";import"./v4-yQnnJER4.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./settings-zSvLtxj8.js";import"./toConsumableArray-ZcblzY6P.js";import"./slicedToArray-MNgqcm8y.js";import"./index-MRYFjIDu.js";import"./index-U9QwFHm3.js";import"./deprecate-hcs7xc4A.js";import"./events-ZBveWIsY.js";import"./useId-J3cPtmMT.js";import"./setupGetInstanceId-vqAyjREf.js";import"./index-HaCShj3n.js";import"./index-7Q--xhFC.js";import"./match-bSaK7Hln.js";import"./extends-dGVwEr9R.js";import"./bucket-34-ngKLiAY2.js";import"./bucket-11-aZiLYyFu.js";var b,C,F=["children"],$=l.forwardRef(function(o,n){var d=o.children,s=S(o,F);return l.createElement(E,N({width:16,height:16,viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",ref:n},s),b||(b=l.createElement("path",{d:"M16,4c6.6,0,12,5.4,12,12s-5.4,12-12,12S4,22.6,4,16S9.4,4,16,4 M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14	S23.7,2,16,2z"})),C||(C=l.createElement("path",{d:"M8 15H24V17H8z"})),d)});const K=({invalidFields:i,invalidText:o,keyValues:n,legendText:d,minKeyValues:s=0,onAdd:A,onChange:p,onRemove:R})=>{const h=L(),y=h.formatMessage({id:"dashboard.keyValueList.add",defaultMessage:"Add"}),T=h.formatMessage({id:"dashboard.keyValueList.remove",defaultMessage:"Remove"});let c=!1;const j=n.map(({id:u,key:I,keyPlaceholder:_,value:w,valuePlaceholder:M},m)=>{const k=`${u}-key`,f=`${u}-value`,g=k in i,V=f in i;return c=c||g||V,e.jsxs("div",{className:"tkn--keyvalue-row",children:[e.jsx(P,{id:k,labelText:"",value:I,placeholder:_,onChange:v=>{p({type:"key",index:m,value:v.target.value})},invalid:g,autoComplete:"off"}),e.jsx(P,{id:f,labelText:"",value:w,placeholder:M,onChange:v=>{p({type:"value",index:m,value:v.target.value})},invalid:V,autoComplete:"off"}),n.length>s&&e.jsx(x,{hasIconOnly:!0,iconDescription:T,kind:"ghost",onClick:()=>R(m),renderIcon:$,size:"field",tooltipAlignment:"center",tooltipPosition:"bottom"})]},`keyvalueRow${u}`)});return e.jsxs("div",{className:"tkn--keyvalues",children:[e.jsx("p",{className:"tkn--keyvalue-label",children:d}),c&&e.jsx("p",{className:"tkn--keyvalue-invalid",children:o}),j,e.jsx(x,{iconDescription:y,kind:"ghost",onClick:A,renderIcon:D,children:y})]})},z=K;K.__docgenInfo={description:"",methods:[],displayName:"KeyValueList",props:{minKeyValues:{defaultValue:{value:"0",computed:!1},required:!1}}};const pe={args:{legendText:"Legend Text"},component:z,title:"KeyValueList"},r={args:{invalidFields:{"2-key":!0,"3-value":!0},invalidText:"There are invalid KeyValue entries.",keyValues:[{id:"0",key:"foo",keyPlaceholder:"foo",value:"bar",valuePlaceholder:"bar"},{id:"1",key:"",keyPlaceholder:"key placeholder",value:"",valuePlaceholder:"value placeholder"},{id:"2",key:"invalid key",keyPlaceholder:"",value:"bar",valuePlaceholder:""},{id:"3",key:"foo",keyPlaceholder:"",value:"invalid value",valuePlaceholder:""}],onAdd:a("onAdd"),onChange:a("onChange"),onRemove:a("onRemove")}},t={args:{invalidFields:{},keyValues:[{id:"0",key:"foo",keyPlaceholder:"foo",value:"bar",valuePlaceholder:"bar"}],minKeyValues:1,onAdd:a("onAdd"),onChange:a("onChange"),onRemove:a("onRemove")},name:"minKeyValues"};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const he=["Default","MinKeyValues"];export{r as Default,t as MinKeyValues,he as __namedExportsOrder,pe as default};

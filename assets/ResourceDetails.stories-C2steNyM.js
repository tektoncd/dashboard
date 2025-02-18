import{j as e}from"./jsx-runtime-B0wN4eWF.js";import{_ as r}from"./index-CvulwabO.js";import{u as y}from"./index-CbuwW4_d.js";import"./usePrefix-DVhi0s40.js";import{I as D}from"./Notification-D7G8vrn6.js";import{S as T}from"./SkeletonText-BsZPl02y.js";import{T as A,a as C,b as x,c as _,d as j}from"./Tabs-4y_hjRYw.js";import{T as k}from"./Tag-CDRgvZ2L.js";import{b as N,f as L}from"./index-CfoIBI3E.js";import{F as E}from"./FormattedDate-BAqjGlH3.js";import{V as I}from"./ViewYAML-BQtIWtmr.js";import"./index-DS1rTf2F.js";import"./index-BLsgEXh-.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-7UTgOZSF.js";import"./Button-DXQXyzWq.js";import"./index-mhCn_TNf.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./noopFn-g4z370MD.js";import"./wrapFocus-Cvvm2ck9.js";import"./Text-9nRGETFr.js";import"./bucket-9-CFGufIsT.js";import"./Icon-Dlg6_ItC.js";import"./bucket-18-D1v83Eua.js";import"./bucket-3-igrvqujs.js";import"./bucket-6-KyTwAsSL.js";import"./useControllableState-BPNuw5M3.js";import"./debounce-DBudwqRe.js";const b=["overview","yaml"],O={onViewChange:()=>{}},l=({actions:t=null,additionalMetadata:n=null,children:i=null,error:f=null,loading:M,onViewChange:w=O.onViewChange,resource:g=null,view:V=null})=>{const s=y();if(M)return e.jsx(T,{heading:!0,width:"60%"});if(f||!g)return e.jsx(D,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:s.formatMessage({id:"dashboard.resourceDetails.errorloading",defaultMessage:"Error loading resource"}),subtitle:N(f)});let o=b.indexOf(V);o===-1&&(o=0);const h=L(g.metadata.labels),a={...g};return a.metadata?.managedFields&&delete a.metadata.managedFields,e.jsxs("div",{className:"tkn--resourcedetails",children:[e.jsxs("div",{className:"tkn--resourcedetails--header",children:[e.jsx("h1",{children:a.metadata.name}),t]}),e.jsxs(A,{onChange:c=>w(b[c.selectedIndex]),selectedIndex:o,children:[e.jsxs(C,{activation:"manual","aria-label":s.formatMessage({id:"dashboard.resourceDetails.ariaLabel",defaultMessage:"Resource details"}),children:[e.jsx(x,{children:s.formatMessage({id:"dashboard.resource.overviewTab",defaultMessage:"Overview"})}),e.jsx(x,{children:"YAML"})]}),e.jsxs(_,{children:[e.jsx(j,{children:o===0&&e.jsxs("div",{className:"tkn--details",children:[e.jsxs("ul",{className:"tkn--resourcedetails-metadata",children:[a.spec?.displayName&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.resourceDetails.spec.displayName",defaultMessage:"Display name:"})}),a.spec.displayName]}),a.spec?.description&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.resourceDetails.spec.description",defaultMessage:"Description:"})}),a.spec.description]}),e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.dateCreated",defaultMessage:"Date created:"})}),e.jsx(E,{date:a.metadata.creationTimestamp,relative:!0})]}),e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.labels",defaultMessage:"Labels:"})}),h.length===0?s.formatMessage({id:"dashboard.metadata.none",defaultMessage:"None"}):h.map(c=>e.jsx(k,{size:"sm",type:"blue",children:c},c))]}),a.metadata.namespace&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.namespace",defaultMessage:"Namespace:"})}),a.metadata.namespace]}),n]}),i]})}),e.jsx(j,{children:o===1&&e.jsx(I,{enableSyntaxHighlighting:!0,resource:a})})]})]})]})};l.propTypes={actions:r.node,additionalMetadata:r.node,children:r.node,error:r.oneOfType([r.string,r.shape({})]),onViewChange:r.func,resource:r.shape({}),view:r.string};l.__docgenInfo={description:"",methods:[],displayName:"ResourceDetails",props:{actions:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},additionalMetadata:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},children:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},error:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"union",value:[{name:"string"},{name:"shape",value:{}}]},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},resource:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"shape",value:{}},required:!1},view:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"string"},required:!1}}};const{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,R={apiVersion:"tekton.dev/v1",kind:"Task",metadata:{creationTimestamp:"2020-05-19T16:49:30Z",labels:{"label-key":"label-value"},name:"test",namespace:"tekton-pipelines"},spec:{steps:[{name:"test",image:"alpine",script:"echo hello"}]}},he={component:l,title:"ResourceDetails"},m={args:{error:"A helpful error message"}},p={args:{loading:!0}},d={args:{resource:R},render:t=>{const[,n]=v();return e.jsx(l,{...t,onViewChange:i=>n({view:i})})}},u={args:{...d.args,additionalMetadata:e.jsxs("li",{children:[e.jsx("span",{children:"Custom Field:"}),"some additional metadata"]}),children:e.jsx("p",{children:"some additional content"})},render:t=>{const[,n]=v();return e.jsx(l,{...t,onViewChange:i=>n({view:i})})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'A helpful error message'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    resource
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <ResourceDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    additionalMetadata: <li>
        <span>Custom Field:</span>some additional metadata
      </li>,
    children: <p>some additional content</p>
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <ResourceDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...u.parameters?.docs?.source}}};const xe=["Error","Loading","Default","WithAdditionalContent"];export{d as Default,m as Error,p as Loading,u as WithAdditionalContent,xe as __namedExportsOrder,he as default};

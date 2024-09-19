import{j as e}from"./jsx-runtime-QvtbNqby.js";import{P as r}from"./index-kGlasm3i.js";import{u as y}from"./index-R-2E0Llw.js";import"./usePrefix-C48kcqDW.js";import{I as T}from"./Notification-DK9HV3HX.js";import{S as D}from"./SkeletonText-DN73_2Nu.js";import{T as A,a as C,b as x,c as _,d as j}from"./Tabs-DccB0do-.js";import{T as k}from"./Tag-CcUuvbj3.js";import{b as N,f as L}from"./index-CfoIBI3E.js";import{F as E}from"./FormattedDate-2caGO-l0.js";import{V as I}from"./ViewYAML-DKM26Bir.js";import"./index-BjzEU6Zr.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./deprecate-CHyGWMAj.js";import"./index-CjLpwf8N.js";import"./Button-B7xRuRrN.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./events-OVwOsPzJ.js";import"./noopFn-g4z370MD.js";import"./index-D7LnL1tT.js";import"./bucket-3-Dq7FRXBG.js";import"./Icon-CpyVU44g.js";import"./bucket-6-CywArVTS.js";import"./bucket-2-C9DXCKPV.js";import"./bucket-18-ByJs4WER.js";import"./bucket-9-DvpuiSZR.js";import"./index-Dc4QqC9m.js";import"./useControllableState-Co_owzu1.js";const b=["overview","yaml"],O={onViewChange:()=>{}},l=({actions:t=null,additionalMetadata:n=null,children:i=null,error:f=null,loading:M,onViewChange:w=O.onViewChange,resource:g=null,view:V=null})=>{const s=y();if(M)return e.jsx(D,{heading:!0,width:"60%"});if(f||!g)return e.jsx(T,{kind:"error",hideCloseButton:!0,lowContrast:!0,title:s.formatMessage({id:"dashboard.resourceDetails.errorloading",defaultMessage:"Error loading resource"}),subtitle:N(f)});let o=b.indexOf(V);o===-1&&(o=0);const h=L(g.metadata.labels),a={...g};return a.metadata?.managedFields&&delete a.metadata.managedFields,e.jsxs("div",{className:"tkn--resourcedetails",children:[e.jsxs("div",{className:"tkn--resourcedetails--header",children:[e.jsx("h1",{children:a.metadata.name}),t]}),e.jsxs(A,{onChange:c=>w(b[c.selectedIndex]),selectedIndex:o,children:[e.jsxs(C,{activation:"manual","aria-label":s.formatMessage({id:"dashboard.resourceDetails.ariaLabel",defaultMessage:"Resource details"}),children:[e.jsx(x,{children:s.formatMessage({id:"dashboard.resource.overviewTab",defaultMessage:"Overview"})}),e.jsx(x,{children:"YAML"})]}),e.jsxs(_,{children:[e.jsx(j,{children:o===0&&e.jsxs("div",{className:"tkn--details",children:[e.jsxs("ul",{className:"tkn--resourcedetails-metadata",children:[a.spec?.displayName&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.resourceDetails.spec.displayName",defaultMessage:"Display name:"})}),a.spec.displayName]}),a.spec?.description&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.resourceDetails.spec.description",defaultMessage:"Description:"})}),a.spec.description]}),e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.dateCreated",defaultMessage:"Date created:"})}),e.jsx(E,{date:a.metadata.creationTimestamp,relative:!0})]}),e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.labels",defaultMessage:"Labels:"})}),h.length===0?s.formatMessage({id:"dashboard.metadata.none",defaultMessage:"None"}):h.map(c=>e.jsx(k,{size:"sm",type:"blue",children:c},c))]}),a.metadata.namespace&&e.jsxs("li",{children:[e.jsx("span",{children:s.formatMessage({id:"dashboard.metadata.namespace",defaultMessage:"Namespace:"})}),a.metadata.namespace]}),n]}),i]})}),e.jsx(j,{children:o===1&&e.jsx(I,{enableSyntaxHighlighting:!0,resource:a})})]})]})]})};l.propTypes={actions:r.node,additionalMetadata:r.node,children:r.node,error:r.oneOfType([r.string,r.shape({})]),onViewChange:r.func,resource:r.shape({}),view:r.string};l.__docgenInfo={description:"",methods:[],displayName:"ResourceDetails",props:{actions:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},additionalMetadata:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},children:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},error:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"union",value:[{name:"string"},{name:"shape",value:{}}]},required:!1},onViewChange:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},resource:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"shape",value:{}},required:!1},view:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"string"},required:!1}}};const{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,R={apiVersion:"tekton.dev/v1",kind:"Task",metadata:{creationTimestamp:"2020-05-19T16:49:30Z",labels:{"label-key":"label-value"},name:"test",namespace:"tekton-pipelines"},spec:{steps:[{name:"test",image:"alpine",script:"echo hello"}]}},ue={component:l,title:"ResourceDetails"},m={args:{error:"A helpful error message"}},p={args:{loading:!0}},d={args:{resource:R},render:t=>{const[,n]=v();return e.jsx(l,{...t,onViewChange:i=>n({view:i})})}},u={args:{...d.args,additionalMetadata:e.jsxs("li",{children:[e.jsx("span",{children:"Custom Field:"}),"some additional metadata"]}),children:e.jsx("p",{children:"some additional content"})},render:t=>{const[,n]=v();return e.jsx(l,{...t,onViewChange:i=>n({view:i})})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};const ge=["Error","Loading","Default","WithAdditionalContent"];export{d as Default,m as Error,p as Loading,u as WithAdditionalContent,ge as __namedExportsOrder,ue as default};

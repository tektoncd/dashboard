import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{n}from"./useIntl-lGVSqoC-.js";import{r}from"./lib-BZfqaDTj.js";import{n as i,t as a}from"./FormattedDate-DPcWDWIk.js";import{t as o}from"./jsx-runtime-ATHzeHXA.js";import{c as s,n as c,r as l}from"./utils-jtJj5xm0.js";import{t as u}from"./prop-types-Wc1gCLT4.js";import{t as d}from"./es-BERic32k.js";import{t as f}from"./SkeletonText-CWhiJ563.js";import{t as p}from"./Tag-D37rlvE-.js";import{a as m,i as h,n as g,o as _,t as v}from"./Tabs-SKfR6PHq.js";import{n as y}from"./Notification-wwp6wvbH.js";import{n as b,t as x}from"./ViewYAML-CuWDmQDS.js";var S,C,w,T,E;function D(){return(D=t((()=>{S=e(u(),1),r(),d(),s(),i(),b(),C=o(),w=[`overview`,`yaml`],T={onViewChange:()=>{}},E=({actions:e=null,additionalMetadata:t=null,children:r=null,error:i=null,loading:o,onViewChange:s=T.onViewChange,resource:u=null,view:d=null})=>{let b=n();if(o)return(0,C.jsx)(f,{heading:!0,width:`60%`});if(i||!u)return(0,C.jsx)(y,{kind:`error`,hideCloseButton:!0,lowContrast:!0,title:b.formatMessage({id:`dashboard.resourceDetails.errorloading`,defaultMessage:`Error loading resource`}),subtitle:l(i)});let S=w.indexOf(d);S===-1&&(S=0);let E=c(u.metadata.labels),D={...u};return D.metadata?.managedFields&&delete D.metadata.managedFields,(0,C.jsxs)(`div`,{className:`tkn--resourcedetails`,children:[(0,C.jsxs)(`div`,{className:`tkn--resourcedetails--header`,children:[(0,C.jsx)(`h1`,{tabIndex:-1,children:D.metadata.name}),e]}),(0,C.jsxs)(_,{onChange:e=>s(w[e.selectedIndex]),selectedIndex:S,children:[(0,C.jsxs)(g,{activation:`manual`,"aria-label":b.formatMessage({id:`dashboard.resourceDetails.ariaLabel`,defaultMessage:`Resource details`}),size:`md`,children:[(0,C.jsx)(v,{children:b.formatMessage({id:`dashboard.resource.overviewTab`,defaultMessage:`Overview`})}),(0,C.jsx)(v,{children:`YAML`})]}),(0,C.jsxs)(m,{children:[(0,C.jsx)(h,{children:S===0&&(0,C.jsxs)(`div`,{className:`tkn--details`,children:[(0,C.jsxs)(`ul`,{className:`tkn--resourcedetails-metadata`,children:[D.spec?.displayName&&(0,C.jsxs)(`li`,{children:[(0,C.jsx)(`span`,{children:b.formatMessage({id:`dashboard.resourceDetails.spec.displayName`,defaultMessage:`Display name:`})}),D.spec.displayName]}),D.spec?.description&&(0,C.jsxs)(`li`,{children:[(0,C.jsx)(`span`,{children:b.formatMessage({id:`dashboard.resourceDetails.spec.description`,defaultMessage:`Description:`})}),D.spec.description]}),(0,C.jsxs)(`li`,{children:[(0,C.jsx)(`span`,{children:b.formatMessage({id:`dashboard.metadata.dateCreated`,defaultMessage:`Date created:`})}),(0,C.jsx)(a,{date:D.metadata.creationTimestamp,relative:!0})]}),(0,C.jsxs)(`li`,{children:[(0,C.jsx)(`span`,{children:b.formatMessage({id:`dashboard.metadata.labels`,defaultMessage:`Labels:`})}),E.length===0?b.formatMessage({id:`dashboard.metadata.none`,defaultMessage:`None`}):E.map(e=>(0,C.jsx)(p,{size:`sm`,type:`blue`,children:e},e))]}),D.metadata.namespace&&(0,C.jsxs)(`li`,{children:[(0,C.jsx)(`span`,{children:b.formatMessage({id:`dashboard.metadata.namespace`,defaultMessage:`Namespace:`})}),D.metadata.namespace]}),t]}),r]})}),(0,C.jsx)(h,{children:S===1&&(0,C.jsx)(x,{enableSyntaxHighlighting:!0,resource:D})})]})]})]})},E.propTypes={actions:S.default.node,additionalMetadata:S.default.node,children:S.default.node,error:S.default.oneOfType([S.default.string,S.default.shape({})]),onViewChange:S.default.func,resource:S.default.shape({}),view:S.default.string},E.__docgenInfo={description:``,methods:[],displayName:`ResourceDetails`,props:{actions:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`node`},required:!1},additionalMetadata:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`node`},required:!1},children:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`node`},required:!1},error:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`union`,value:[{name:`string`},{name:`shape`,value:{}}]},required:!1},onViewChange:{defaultValue:{value:`() => {}`,computed:!1},description:``,type:{name:`func`},required:!1},resource:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`shape`,value:{}},required:!1},view:{defaultValue:{value:`null`,computed:!1},description:``,type:{name:`string`},required:!1}}}})))()}var O,k,A,j,M,N,P,F,I;function L(){return(L=t((()=>{D(),O=o(),{useArgs:k}=__STORYBOOK_MODULE_PREVIEW_API__,A={apiVersion:`tekton.dev/v1`,kind:`Task`,metadata:{creationTimestamp:`2020-05-19T16:49:30Z`,labels:{"label-key":`label-value`},name:`test`,namespace:`tekton-pipelines`},spec:{steps:[{name:`test`,image:`alpine`,script:`echo hello`}]}},j={component:E,title:`ResourceDetails`},M={args:{error:`A helpful error message`}},N={args:{loading:!0}},P={args:{resource:A},render:e=>{let[,t]=k();return(0,O.jsx)(E,{...e,onViewChange:e=>t({view:e})})}},F={args:{...P.args,additionalMetadata:(0,O.jsxs)(`li`,{children:[(0,O.jsx)(`span`,{children:`Custom Field:`}),`some additional metadata`]}),children:(0,O.jsx)(`p`,{children:`some additional content`})},render:e=>{let[,t]=k();return(0,O.jsx)(E,{...e,onViewChange:e=>t({view:e})})}},I=[`Error`,`Loading`,`Default`,`WithAdditionalContent`],M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'A helpful error message'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    resource
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <ResourceDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}}})))()}L();export{P as Default,M as Error,N as Loading,F as WithAdditionalContent,I as __namedExportsOrder,j as default};
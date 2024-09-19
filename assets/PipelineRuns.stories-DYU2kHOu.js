import{j as n}from"./jsx-runtime-QvtbNqby.js";import{a as se}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import"./usePrefix-C48kcqDW.js";import{D as re}from"./Dropdown-B-Cs8uS9.js";import{u as C,L as oe,B as le}from"./index-BWkLa28Y.js";import{u as pe}from"./index-R-2E0Llw.js";import{g as l}from"./index-CfoIBI3E.js";import{C as ue}from"./bucket-1-0rDURAtO.js";import{F as ce}from"./FormattedDate-2caGO-l0.js";import{A as de}from"./Actions-g7nSev_V.js";import{T as me}from"./Table-uKt28NJQ.js";import{S as L}from"./StatusIcon-BOJjQf4B.js";import{b as fe}from"./bucket-9-DvpuiSZR.js";import{F as ge}from"./FormattedDuration-BhxTaD9H.js";import{T as Te}from"./bucket-16-CiwkPD5r.js";import{P as Re}from"./bucket-12-CMgbqDR8.js";import{T as be}from"./bucket-17-bHtnLuTa.js";import"./index-BjzEU6Zr.js";import"./v4-CQkTLCs1.js";import"./floating-ui.core.mjs-BY1IpdyC.js";import"./index-B22udTS1.js";import"./index-s8SKy-Kq.js";import"./extends-CF3RwP-h.js";import"./index-kGlasm3i.js";import"./index-CjLpwf8N.js";import"./deprecate-CHyGWMAj.js";import"./FormContext-IWjAIOZU.js";import"./bucket-2-C9DXCKPV.js";import"./Icon-CpyVU44g.js";import"./bucket-3-Dq7FRXBG.js";import"./mergeRefs-CTUecegF.js";import"./bucket-18-ByJs4WER.js";import"./constants-BuFAfZC9.js";import"./Link-CMuAamWY.js";import"./Button-B7xRuRrN.js";import"./index-CZBwXVK3.js";import"./Tooltip-CzMs6ESB.js";import"./events-OVwOsPzJ.js";import"./useControllableState-Co_owzu1.js";import"./index-GBHdq2eR.js";import"./index-D7LnL1tT.js";import"./noopFn-g4z370MD.js";import"./Modal-l6B5wNgO.js";import"./bucket-6-CywArVTS.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./index-Dc4QqC9m.js";import"./bucket-0-C5s-C6Km.js";import"./Search-CexipLRe.js";import"./Spinner-Dbwi84XW.js";import"./bucket-13-CBnqkqgu.js";function V(e){const{status:i}=l(e);return i==="False"?n.jsxs("span",{className:"tkn--table--sub",title:l(e).message,children:[l(e).message," "]}):n.jsx("span",{className:"tkn--table--sub",children:" "})}const d=({batchActionButtons:e=[],columns:i=["run","status","pipeline","time"],customColumns:p={},filters:Z,getPipelineRunCreatedTime:A=a=>a.metadata.creationTimestamp,getPipelineRunDisplayName:N=({pipelineRunMetadata:a})=>a.name,getPipelineRunDisplayNameTooltip:F=N,getPipelineRunDuration:M=a=>{const o=A(a),{lastTransitionTime:s,status:r}=l(a);let h=Date.now();return(r==="False"||r==="True")&&(h=new Date(s).getTime()),h-new Date(o).getTime()},getPipelineRunIcon:q=()=>null,getPipelineRunId:I=a=>a.metadata.uid,getPipelineRunsByPipelineURL:U=C.pipelineRuns.byPipeline,getPipelineRunStatus:S=(a,o)=>{const{reason:s}=l(a);return s||o.formatMessage({id:"dashboard.taskRun.status.pending",defaultMessage:"Pending"})},getPipelineRunStatusDetail:_=V,getPipelineRunStatusIcon:O=a=>{const{reason:o,status:s}=l(a);return n.jsx(L,{DefaultIcon:r=>n.jsx(Re,{size:24,...r}),reason:o,status:s})},getPipelineRunStatusTooltip:E=(a,o)=>{const{message:s}=l(a),r=S(a,o);return s?`${r}: ${s}`:r},getPipelineRunTriggerInfo:H=a=>{const{labels:o={}}=a.metadata,s=o["triggers.tekton.dev/eventlistener"],r=o["triggers.tekton.dev/trigger"];return!s&&!r?null:n.jsxs("span",{title:`EventListener: ${s||"-"}
Trigger: ${r||"-"}`,children:[n.jsx(fe,{}),s,s&&r?" | ":"",r]})},getPipelineRunURL:K=C.pipelineRuns.byName,getRunActions:W=()=>[],LinkComponent:j=oe,loading:z,pipelineRuns:G,selectedNamespace:D,skeletonRowCount:J,toolbarButtons:Q})=>{const a=pe();let o=!1;const s={pipeline:a.formatMessage({id:"dashboard.tableHeader.pipeline",defaultMessage:"Pipeline"}),run:"Run",status:a.formatMessage({id:"dashboard.tableHeader.status",defaultMessage:"Status"}),time:""},r=i.map(t=>{const m=p[t]&&p[t].header||s[t];return{key:t,header:m}});function h(t){return Object.keys(p).reduce((m,u)=>(p[u].getValue&&(m[u]=p[u].getValue({pipelineRun:t})),m),{})}const X=G.map(t=>{const{annotations:m,namespace:u}=t.metadata,Y=A(t),P=N({pipelineRunMetadata:t.metadata}),ee=F({pipelineRunMetadata:t.metadata}),c=t.spec.pipelineRef&&t.spec.pipelineRef.name,{reason:ne,status:te}=l(t),ae=O(t),B=K({name:P,namespace:u,annotations:m}),w=c&&U({namespace:u,pipelineName:c});let f=M(t);f==null?f="-":f=n.jsx(ge,{milliseconds:f});const y=W(t);return y.length&&(o=!0),{id:I(t),run:n.jsxs("div",{children:[n.jsxs("span",{children:[B?n.jsx(j,{to:B,title:ee,children:P}):P,q({pipelineRunMetadata:t.metadata})]}),n.jsxs("span",{className:"tkn--table--sub",children:[H(t)," "]})]}),pipeline:n.jsxs("div",{children:[n.jsx("span",{children:c&&(w?n.jsx(j,{to:w,title:c,children:c}):n.jsx("span",{title:`Pipeline: ${c||"-"}`,children:c}))||"-"}),n.jsxs("span",{className:"tkn--table--sub",title:`Namespace: ${u}`,children:[u," "]})]}),status:n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status","data-status":te,"data-reason":ne,title:E(t,a),children:[ae,S(t,a)]})}),_(t)||V(t)]}),time:n.jsxs("div",{children:[n.jsxs("span",{children:[n.jsx(ue,{}),n.jsx(ce,{date:Y,formatTooltip:ie=>a.formatMessage({id:"dashboard.resource.createdTime",defaultMessage:"Created: {created}"},{created:ie})})]}),n.jsxs("div",{className:"tkn--table--sub",children:[n.jsx(Te,{}),f]})]}),actions:y.length&&n.jsx(de,{items:y,resource:t}),...h(t)}});return o&&r.push({key:"actions",header:""}),n.jsx(me,{batchActionButtons:e,filters:Z,hasDetails:!0,headers:r,rows:X,loading:z,selectedNamespace:D,emptyTextAllNamespaces:a.formatMessage({id:"dashboard.emptyState.allNamespaces",defaultMessage:"No matching {kind} found"},{kind:"PipelineRuns"}),emptyTextSelectedNamespace:a.formatMessage({id:"dashboard.emptyState.selectedNamespace",defaultMessage:"No matching {kind} found in namespace {selectedNamespace}"},{kind:"PipelineRuns",selectedNamespace:D}),skeletonRowCount:J,toolbarButtons:Q})};d.__docgenInfo={description:"",methods:[],displayName:"PipelineRuns",props:{batchActionButtons:{defaultValue:{value:"[]",computed:!1},required:!1},columns:{defaultValue:{value:"['run', 'status', 'pipeline', 'time']",computed:!1},required:!1},customColumns:{defaultValue:{value:"{}",computed:!1},required:!1},getPipelineRunCreatedTime:{defaultValue:{value:`pipelineRun =>
pipelineRun.metadata.creationTimestamp`,computed:!1},required:!1},getPipelineRunDisplayName:{defaultValue:{value:`({ pipelineRunMetadata }) =>
pipelineRunMetadata.name`,computed:!1},required:!1},getPipelineRunDisplayNameTooltip:{defaultValue:{value:`getPipelineRunDisplayName = ({ pipelineRunMetadata }) =>
pipelineRunMetadata.name`,computed:!1},required:!1},getPipelineRunDuration:{defaultValue:{value:`pipelineRun => {
  const creationTimestamp = getPipelineRunCreatedTime(pipelineRun);
  const { lastTransitionTime, status } = getStatus(pipelineRun);

  let endTime = Date.now();
  if (status === 'False' || status === 'True') {
    endTime = new Date(lastTransitionTime).getTime();
  }

  return endTime - new Date(creationTimestamp).getTime();
}`,computed:!1},required:!1},getPipelineRunIcon:{defaultValue:{value:"() => null",computed:!1},required:!1},getPipelineRunId:{defaultValue:{value:"pipelineRun => pipelineRun.metadata.uid",computed:!1},required:!1},getPipelineRunsByPipelineURL:{defaultValue:{value:"urls.pipelineRuns.byPipeline",computed:!0},required:!1},getPipelineRunStatus:{defaultValue:{value:`(pipelineRun, intl) => {
  const { reason } = getStatus(pipelineRun);
  return (
    reason ||
    intl.formatMessage({
      id: 'dashboard.taskRun.status.pending',
      defaultMessage: 'Pending'
    })
  );
}`,computed:!1},required:!1},getPipelineRunStatusDetail:{defaultValue:{value:`function getDefaultPipelineRunStatusDetail(pipelineRun) {
  const { status } = getStatus(pipelineRun);
  return status === 'False' ? (
    <span className="tkn--table--sub" title={getStatus(pipelineRun).message}>
      {getStatus(pipelineRun).message}&nbsp;
    </span>
  ) : (
    <span className="tkn--table--sub">&nbsp;</span>
  );
}`,computed:!1},required:!1},getPipelineRunStatusIcon:{defaultValue:{value:`pipelineRun => {
  const { reason, status } = getStatus(pipelineRun);

  return (
    <StatusIcon
      DefaultIcon={props => <DefaultIcon size={24} {...props} />}
      reason={reason}
      status={status}
    />
  );
}`,computed:!1},required:!1},getPipelineRunStatusTooltip:{defaultValue:{value:`(pipelineRun, intl) => {
  const { message } = getStatus(pipelineRun);
  const reason = getPipelineRunStatus(pipelineRun, intl);
  if (!message) {
    return reason;
  }
  return \`\${reason}: \${message}\`;
}`,computed:!1},required:!1},getPipelineRunTriggerInfo:{defaultValue:{value:`pipelineRun => {
  const { labels = {} } = pipelineRun.metadata;
  const eventListener = labels['triggers.tekton.dev/eventlistener'];
  const trigger = labels['triggers.tekton.dev/trigger'];
  if (!eventListener && !trigger) {
    return null;
  }

  return (
    <span
      title={\`EventListener: \${eventListener || '-'}\\nTrigger: \${
        trigger || '-'
      }\`}
    >
      <TriggersIcon />
      {eventListener}
      {eventListener && trigger ? ' | ' : ''}
      {trigger}
    </span>
  );
}`,computed:!1},required:!1},getPipelineRunURL:{defaultValue:{value:"urls.pipelineRuns.byName",computed:!0},required:!1},getRunActions:{defaultValue:{value:"() => []",computed:!1},required:!1},LinkComponent:{defaultValue:{value:`forwardRef(
  ({ onClick, replace = false, state, target, to, ...rest }, ref) => {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, {
      replace,
      state,
      target
    });

    return (
      <CarbonLink
        {...rest}
        href={href}
        onClick={event => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            handleClick(event);
          }
        }}
        ref={ref}
        target={target}
      />
    );
  }
)`,computed:!0},required:!1}}};function $(e){return e?n.jsx(re,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],label:"Status",titleText:"Status:",type:"inline"}):null}const Tn={component:d,decorators:[le()],title:"PipelineRuns"},g=()=>n.jsx(d,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:({namespace:e,pipelineName:i})=>e?`to-pipeline-${e}/${i}`:`to-pipeline/${i}`,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{metadata:{name:"pipeline-run-20190816170431",namespace:"21cf1eac-7392-4e67-a4d0-f654506fe04d",uid:"a7812005-f766-4877-abd4-b3d418b04f66",creationTimestamp:"2019-08-16T17:09:12Z",labels:{"triggers.tekton.dev/eventlistener":"tekton-nightly","triggers.tekton.dev/trigger":"dashboard-nightly-release"}},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T17:10:49Z",message:"Not all Tasks have completed executing",reason:"Running",status:"Unknown",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",creationTimestamp:"2019-10-09T17:10:49Z",uid:"01cb5ea7-0158-4031-bc70-6bf017533a94"},spec:{pipelineRef:{name:"output-pipeline"},serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),T=()=>n.jsx(d,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:()=>null,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8",creationTimestamp:"2019-10-09T17:10:49Z",uid:"905c1ab0-203d-49ce-ad8d-4553e5d06bf0"},spec:{serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),R=()=>n.jsx(d,{batchActionButtons:[{onClick:se("handleDelete"),text:"Delete",icon:be}],selectedNamespace:"default",getRunActions:()=>[{actionText:"An Action",action:e=>e,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"93531810-1b80-4246-a2bd-ee146c448d13"},spec:{pipelineRef:{name:"pipeline"}}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"default",creationTimestamp:"2019-10-09T17:10:49Z",uid:"77e0f4a3-40e5-46f1-84cc-ab7aa93c382c"},spec:{serviceAccountName:"default"}}]}),x={render:({showFilters:e})=>n.jsx(d,{columns:["run","status","time"],filters:$(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"c5ef252a-4635-46b5-ad7b-32c9e04cb6d2"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},k={render:({showFilters:e})=>n.jsx(d,{columns:["status","run","worker","time"],customColumns:{status:{getValue(){return n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status",children:[n.jsx(L,{})," Pending"]})}),n.jsx("span",{children:" "})]})}},worker:{header:"Worker",getValue({pipelineRun:i}){const p=i.metadata.labels["example.com/worker"];return n.jsxs("div",{children:[n.jsx("span",{title:p,children:p}),n.jsx("span",{children:" "})]})}}},filters:$(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",labels:{"example.com/worker":"my-worker"},uid:"b0461c38-90e1-4d83-b32d-293cf3d0ea72"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},b={args:{cancelPipelineRun:()=>{},pipelineRuns:[],selectedNamespace:"default"}},v={args:{...b.args,loading:!0}};g.__docgenInfo={description:"",methods:[],displayName:"Default"};T.__docgenInfo={description:"",methods:[],displayName:"NoPipelineLink"};R.__docgenInfo={description:"",methods:[],displayName:"BatchActions"};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
  namespace,
  pipelineRunName
}) => namespace ? \`to-pipelineRun-\${namespace}/\${pipelineRunName}\` : null} getPipelineRunsByPipelineURL={({
  namespace,
  pipelineName
}) => namespace ? \`to-pipeline-\${namespace}/\${pipelineName}\` : \`to-pipeline/\${pipelineName}\`} createPipelineRunTimestamp={pipelineRun => getStatus(pipelineRun).lastTransitionTime || pipelineRun.metadata.creationTimestamp} selectedNamespace="default" getRunActions={() => [{
  actionText: 'Cancel',
  action: resource => resource,
  disable: resource => resource.status && resource.status.conditions[0].reason !== 'Running',
  modalProperties: {
    heading: 'cancel',
    primaryButtonText: 'ok',
    secondaryButtonText: 'no',
    body: resource => \`cancel pipelineRun \${resource.metadata.name}\`
  }
}]} pipelineRuns={[{
  metadata: {
    name: 'pipeline-run-20190816124708',
    namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
    uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e',
    creationTimestamp: '2019-08-16T12:48:00Z'
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  },
  status: {
    conditions: [{
      lastTransitionTime: '2019-08-16T12:49:28Z',
      message: 'All Tasks have completed executing',
      reason: 'Succeeded',
      status: 'True',
      type: 'Succeeded'
    }]
  }
}, {
  metadata: {
    name: 'pipeline-run-20190816170431',
    namespace: '21cf1eac-7392-4e67-a4d0-f654506fe04d',
    uid: 'a7812005-f766-4877-abd4-b3d418b04f66',
    creationTimestamp: '2019-08-16T17:09:12Z',
    labels: {
      'triggers.tekton.dev/eventlistener': 'tekton-nightly',
      'triggers.tekton.dev/trigger': 'dashboard-nightly-release'
    }
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  },
  status: {
    conditions: [{
      lastTransitionTime: '2019-08-16T17:10:49Z',
      message: 'Not all Tasks have completed executing',
      reason: 'Running',
      status: 'Unknown',
      type: 'Succeeded'
    }]
  }
}, {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'PipelineRun',
  metadata: {
    name: 'output-pipeline-run',
    creationTimestamp: '2019-10-09T17:10:49Z',
    uid: '01cb5ea7-0158-4031-bc70-6bf017533a94'
  },
  spec: {
    pipelineRef: {
      name: 'output-pipeline'
    },
    serviceAccountName: 'default'
  }
}]} cancelPipelineRun={() => {}} />`,...g.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
  namespace,
  pipelineRunName
}) => namespace ? \`to-pipelineRun-\${namespace}/\${pipelineRunName}\` : null} getPipelineRunsByPipelineURL={() => null} createPipelineRunTimestamp={pipelineRun => getStatus(pipelineRun).lastTransitionTime || pipelineRun.metadata.creationTimestamp} selectedNamespace="default" getRunActions={() => [{
  actionText: 'Cancel',
  action: resource => resource,
  disable: resource => resource.status && resource.status.conditions[0].reason !== 'Running',
  modalProperties: {
    heading: 'cancel',
    primaryButtonText: 'ok',
    secondaryButtonText: 'no',
    body: resource => \`cancel pipelineRun \${resource.metadata.name}\`
  }
}]} pipelineRuns={[{
  metadata: {
    name: 'pipeline-run-20190816124708',
    namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
    uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e',
    creationTimestamp: '2019-08-16T12:48:00Z'
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  },
  status: {
    conditions: [{
      lastTransitionTime: '2019-08-16T12:49:28Z',
      message: 'All Tasks have completed executing',
      reason: 'Succeeded',
      status: 'True',
      type: 'Succeeded'
    }]
  }
}, {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'PipelineRun',
  metadata: {
    name: 'output-pipeline-run',
    namespace: '61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8',
    creationTimestamp: '2019-10-09T17:10:49Z',
    uid: '905c1ab0-203d-49ce-ad8d-4553e5d06bf0'
  },
  spec: {
    serviceAccountName: 'default'
  }
}]} cancelPipelineRun={() => {}} />`,...T.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`() => <PipelineRuns batchActionButtons={[{
  onClick: action('handleDelete'),
  text: 'Delete',
  icon: Delete
}]} selectedNamespace="default" getRunActions={() => [{
  actionText: 'An Action',
  action: resource => resource,
  modalProperties: {
    heading: 'An Action',
    primaryButtonText: 'OK',
    secondaryButtonText: 'Cancel',
    body: () => 'Do something interesting'
  }
}]} pipelineRuns={[{
  metadata: {
    name: 'pipeline-run-20190816124708',
    namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
    creationTimestamp: '2019-08-16T12:48:00Z',
    uid: '93531810-1b80-4246-a2bd-ee146c448d13'
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  }
}, {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'PipelineRun',
  metadata: {
    name: 'output-pipeline-run',
    namespace: 'default',
    creationTimestamp: '2019-10-09T17:10:49Z',
    uid: '77e0f4a3-40e5-46f1-84cc-ab7aa93c382c'
  },
  spec: {
    serviceAccountName: 'default'
  }
}]} />`,...R.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: ({
    showFilters
  }) => <PipelineRuns columns={['run', 'status', 'time']} filters={getFilters(showFilters)} getRunActions={() => [{
    actionText: 'An Action',
    action: resource => resource,
    modalProperties: {
      heading: 'An Action',
      primaryButtonText: 'OK',
      secondaryButtonText: 'Cancel',
      body: () => 'Do something interesting'
    }
  }]} pipelineRuns={[{
    metadata: {
      name: 'pipeline-run-20190816124708',
      namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
      creationTimestamp: '2019-08-16T12:48:00Z',
      uid: 'c5ef252a-4635-46b5-ad7b-32c9e04cb6d2'
    },
    spec: {
      pipelineRef: {
        name: 'pipeline'
      }
    }
  }]} />,
  args: {
    showFilters: false
  }
}`,...x.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: ({
    showFilters
  }) => <PipelineRuns columns={['status', 'run', 'worker', 'time']} customColumns={{
    status: {
      getValue() {
        return <div>
                <div className="tkn--definition">
                  <div className="tkn--status">
                    <StatusIcon /> Pending
                  </div>
                </div>
                <span>&nbsp;</span>
              </div>;
      }
    },
    worker: {
      header: 'Worker',
      getValue({
        pipelineRun
      }) {
        const worker = pipelineRun.metadata.labels['example.com/worker'];
        return <div>
                <span title={worker}>{worker}</span>
                <span>&nbsp;</span>
              </div>;
      }
    }
  }} filters={getFilters(showFilters)} getRunActions={() => [{
    actionText: 'An Action',
    action: resource => resource,
    modalProperties: {
      heading: 'An Action',
      primaryButtonText: 'OK',
      secondaryButtonText: 'Cancel',
      body: () => 'Do something interesting'
    }
  }]} pipelineRuns={[{
    metadata: {
      name: 'pipeline-run-20190816124708',
      namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
      creationTimestamp: '2019-08-16T12:48:00Z',
      labels: {
        'example.com/worker': 'my-worker'
      },
      uid: 'b0461c38-90e1-4d83-b32d-293cf3d0ea72'
    },
    spec: {
      pipelineRef: {
        name: 'pipeline'
      }
    }
  }]} />,
  args: {
    showFilters: false
  }
}`,...k.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    cancelPipelineRun: () => {},
    pipelineRuns: [],
    selectedNamespace: 'default'
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Empty.args,
    loading: true
  }
}`,...v.parameters?.docs?.source}}};const Rn=["Default","NoPipelineLink","BatchActions","HideColumns","CustomColumns","Empty","Loading"];export{R as BatchActions,k as CustomColumns,g as Default,b as Empty,x as HideColumns,v as Loading,T as NoPipelineLink,Rn as __namedExportsOrder,Tn as default};

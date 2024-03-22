import{j as n}from"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import{a as oe}from"./chunk-MZXVCX43-F-TLnGlB.js";import{D as le}from"./Dropdown-j941xoI5.js";import{u as pe}from"./index-uZO_dCSX.js";import{L as B,a as V,u as $}from"./Link-maqr4iwM.js";import{a as l}from"./index-WkqOPh6Z.js";import{C as ue,A as ce}from"./Actions-J6mNGQH2.js";import{F as de}from"./FormattedDate-YPZb9zK7.js";import{c as me,P as ge}from"./bucket-31-qnmMSxzE.js";import{T as fe}from"./Table-Mam_RXbH.js";import{S as C}from"./StatusIcon-qrSsKqPY.js";import{a as Te}from"./bucket-18-BR8jqrSD.js";import{F as Re}from"./FormattedDuration-IgQos6RL.js";import{a as be}from"./bucket-32-GkAW8Hfz.js";import"./v4-yQnnJER4.js";import"./extends-dGVwEr9R.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./settings-zSvLtxj8.js";import"./createPropAdapter-l_oREwkT.js";import"./assertThisInitialized-4q6YPdh3.js";import"./inheritsLoose-fS6oVJzb.js";import"./setPrototypeOf-ahVgEFUp.js";import"./index-MRYFjIDu.js";import"./index-U9QwFHm3.js";import"./index-7Q--xhFC.js";import"./slicedToArray-MNgqcm8y.js";import"./bucket-5-mAOIXUdD.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./bucket-6-dQ54tAAx.js";import"./mergeRefs-Zi_35mDS.js";import"./deprecate-hcs7xc4A.js";import"./index-HaCShj3n.js";import"./setupGetInstanceId-vqAyjREf.js";import"./bucket-34-ngKLiAY2.js";import"./react-router-xN3h2phC.js";import"./tiny-invariant-bHgPayXn.js";import"./Link-XhJnQ1ld.js";import"./Button-HUe_pxfK.js";import"./toConsumableArray-ZcblzY6P.js";import"./events-ZBveWIsY.js";import"./useId-J3cPtmMT.js";import"./match-bSaK7Hln.js";import"./index-_EeHE9S1.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./getPrototypeOf-VcprQjSG.js";import"./FloatingMenu-d5eX8xYS.js";import"./index-lJISON2B.js";import"./navigation-fv4tXnKy.js";import"./Modal-63TJ2wX0.js";import"./requiredIfGivenPropIsTruthy-0WXqL08H.js";import"./index-n80ymgmT.js";import"./AriaPropTypes-1IBRuLX5.js";import"./isRequiredOneOf-qeCNFKMo.js";import"./bucket-0-7b2b0LPX.js";import"./Text--uoqbMaE.js";import"./useMergedRefs-0i-7LjaH.js";import"./index-39-lBfQL.js";import"./DataTableSkeleton-TOArWwz2.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";function L(e){const{status:i}=l(e);return i==="False"?n.jsxs("span",{className:"tkn--table--sub",title:l(e).message,children:[l(e).message," "]}):n.jsx("span",{className:"tkn--table--sub",children:" "})}const Z=({batchActionButtons:e=[],columns:i=["run","status","pipeline","time"],customColumns:p={},filters:M,getPipelineRunCreatedTime:A=a=>a.metadata.creationTimestamp,getPipelineRunDisplayName:N=({pipelineRunMetadata:a})=>a.name,getPipelineRunDisplayNameTooltip:I=N,getPipelineRunDuration:q=a=>{const r=A(a),{lastTransitionTime:s,status:o}=l(a);let h=Date.now();return(o==="False"||o==="True")&&(h=new Date(s).getTime()),h-new Date(r).getTime()},getPipelineRunIcon:U=()=>null,getPipelineRunId:_=a=>a.metadata.uid,getPipelineRunsByPipelineURL:O=$.pipelineRuns.byPipeline,getPipelineRunStatus:S=(a,r)=>{const{reason:s}=l(a);return s||r.formatMessage({id:"dashboard.taskRun.status.pending",defaultMessage:"Pending"})},getPipelineRunStatusDetail:E=L,getPipelineRunStatusIcon:K=a=>{const{reason:r,status:s}=l(a);return n.jsx(C,{DefaultIcon:ge,reason:r,status:s})},getPipelineRunStatusTooltip:H=(a,r)=>{const{message:s}=l(a),o=S(a,r);return s?`${o}: ${s}`:o},getPipelineRunTriggerInfo:W=a=>{const{labels:r={}}=a.metadata,s=r["triggers.tekton.dev/eventlistener"],o=r["triggers.tekton.dev/trigger"];return!s&&!o?null:n.jsxs("span",{title:`EventListener: ${s||"-"}
Trigger: ${o||"-"}`,children:[n.jsx(Te,{}),s,s&&o?" | ":"",o]})},getPipelineRunURL:z=$.pipelineRuns.byName,getRunActions:G=()=>[],loading:J,pipelineRuns:Q,selectedNamespace:j,skeletonRowCount:X,toolbarButtons:Y})=>{const a=pe();let r=!1;const s={pipeline:a.formatMessage({id:"dashboard.tableHeader.pipeline",defaultMessage:"Pipeline"}),run:"Run",status:a.formatMessage({id:"dashboard.tableHeader.status",defaultMessage:"Status"}),time:""},o=i.map(t=>{const d=p[t]&&p[t].header||s[t];return{key:t,header:d}});function h(t){return Object.keys(p).reduce((d,u)=>(p[u].getValue&&(d[u]=p[u].getValue({pipelineRun:t})),d),{})}const ee=Q.map(t=>{const{annotations:d,namespace:u}=t.metadata,ne=A(t),k=N({pipelineRunMetadata:t.metadata}),te=I({pipelineRunMetadata:t.metadata}),c=t.spec.pipelineRef&&t.spec.pipelineRef.name,{reason:ae,status:ie}=l(t),se=K(t),D=z({namespace:u,pipelineRunName:k,annotations:d}),w=c&&O({namespace:u,pipelineName:c});let g=q(t);g==null?g="-":g=n.jsx(Re,{milliseconds:g});const y=G(t);return y.length&&(r=!0),{id:_(t),run:n.jsxs("div",{children:[n.jsxs("span",{children:[D?n.jsx(B,{component:V,to:D,title:te,children:k}):k,U({pipelineRunMetadata:t.metadata})]}),n.jsxs("span",{className:"tkn--table--sub",children:[W(t)," "]})]}),pipeline:n.jsxs("div",{children:[n.jsx("span",{children:c&&(w?n.jsx(B,{component:V,to:w,title:c,children:c}):n.jsx("span",{title:`Pipeline: ${c||"-"}`,children:c}))||"-"}),n.jsxs("span",{className:"tkn--table--sub",title:`Namespace: ${u}`,children:[u," "]})]}),status:n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status","data-status":ie,"data-reason":ae,title:H(t,a),children:[se,S(t,a)]})}),E(t)||L(t)]}),time:n.jsxs("div",{children:[n.jsxs("span",{children:[n.jsx(ue,{}),n.jsx(de,{date:ne,formatTooltip:re=>a.formatMessage({id:"dashboard.resource.createdTime",defaultMessage:"Created: {created}"},{created:re})})]}),n.jsxs("div",{className:"tkn--table--sub",children:[n.jsx(me,{}),g]})]}),actions:y.length&&n.jsx(ce,{items:y,resource:t}),...h(t)}});return r&&o.push({key:"actions",header:""}),n.jsx(fe,{batchActionButtons:e,filters:M,hasDetails:!0,headers:o,rows:ee,loading:J,selectedNamespace:j,emptyTextAllNamespaces:a.formatMessage({id:"dashboard.emptyState.allNamespaces",defaultMessage:"No matching {kind} found"},{kind:"PipelineRuns"}),emptyTextSelectedNamespace:a.formatMessage({id:"dashboard.emptyState.selectedNamespace",defaultMessage:"No matching {kind} found in namespace {selectedNamespace}"},{kind:"PipelineRuns",selectedNamespace:j}),skeletonRowCount:X,toolbarButtons:Y})},m=Z;Z.__docgenInfo={description:"",methods:[],displayName:"PipelineRuns",props:{batchActionButtons:{defaultValue:{value:"[]",computed:!1},required:!1},columns:{defaultValue:{value:"['run', 'status', 'pipeline', 'time']",computed:!1},required:!1},customColumns:{defaultValue:{value:"{}",computed:!1},required:!1},getPipelineRunCreatedTime:{defaultValue:{value:`pipelineRun =>
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
    <StatusIcon DefaultIcon={DefaultIcon} reason={reason} status={status} />
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
}`,computed:!1},required:!1},getPipelineRunURL:{defaultValue:{value:"urls.pipelineRuns.byName",computed:!0},required:!1},getRunActions:{defaultValue:{value:"() => []",computed:!1},required:!1}}};function F(e){return e?n.jsx(le,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],light:!0,label:"Status",titleText:"Status:",type:"inline"}):null}const jn={component:m,title:"PipelineRuns"},f=()=>n.jsx(m,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:({namespace:e,pipelineName:i})=>e?`to-pipeline-${e}/${i}`:`to-pipeline/${i}`,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{metadata:{name:"pipeline-run-20190816170431",namespace:"21cf1eac-7392-4e67-a4d0-f654506fe04d",uid:"a7812005-f766-4877-abd4-b3d418b04f66",creationTimestamp:"2019-08-16T17:09:12Z",labels:{"triggers.tekton.dev/eventlistener":"tekton-nightly","triggers.tekton.dev/trigger":"dashboard-nightly-release"}},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T17:10:49Z",message:"Not all Tasks have completed executing",reason:"Running",status:"Unknown",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",creationTimestamp:"2019-10-09T17:10:49Z",uid:"01cb5ea7-0158-4031-bc70-6bf017533a94"},spec:{pipelineRef:{name:"output-pipeline"},serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),T=()=>n.jsx(m,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:()=>null,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8",creationTimestamp:"2019-10-09T17:10:49Z",uid:"905c1ab0-203d-49ce-ad8d-4553e5d06bf0"},spec:{serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),R=()=>n.jsx(m,{batchActionButtons:[{onClick:oe("handleDelete"),text:"Delete",icon:be}],selectedNamespace:"default",getRunActions:()=>[{actionText:"An Action",action:e=>e,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"93531810-1b80-4246-a2bd-ee146c448d13"},spec:{pipelineRef:{name:"pipeline"}}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"default",creationTimestamp:"2019-10-09T17:10:49Z",uid:"77e0f4a3-40e5-46f1-84cc-ab7aa93c382c"},spec:{serviceAccountName:"default"}}]}),x={render:({showFilters:e})=>n.jsx(m,{columns:["run","status","time"],filters:F(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"c5ef252a-4635-46b5-ad7b-32c9e04cb6d2"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},v={render:({showFilters:e})=>n.jsx(m,{columns:["status","run","worker","time"],customColumns:{status:{getValue(){return n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status",children:[n.jsx(C,{})," Pending"]})}),n.jsx("span",{children:" "})]})}},worker:{header:"Worker",getValue({pipelineRun:i}){const p=i.metadata.labels["example.com/worker"];return n.jsxs("div",{children:[n.jsx("span",{title:p,children:p}),n.jsx("span",{children:" "})]})}}},filters:F(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",labels:{"example.com/worker":"my-worker"},uid:"b0461c38-90e1-4d83-b32d-293cf3d0ea72"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},b={args:{cancelPipelineRun:()=>{},pipelineRuns:[],selectedNamespace:"default"}},P={args:{...b.args,loading:!0}};f.__docgenInfo={description:"",methods:[],displayName:"Default"};T.__docgenInfo={description:"",methods:[],displayName:"NoPipelineLink"};R.__docgenInfo={description:"",methods:[],displayName:"BatchActions"};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}]} cancelPipelineRun={() => {}} />`,...f.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}`,...x.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    cancelPipelineRun: () => {},
    pipelineRuns: [],
    selectedNamespace: 'default'
  }
}`,...b.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...Empty.args,
    loading: true
  }
}`,...P.parameters?.docs?.source}}};const Dn=["Default","NoPipelineLink","BatchActions","HideColumns","CustomColumns","Empty","Loading"];export{R as BatchActions,v as CustomColumns,f as Default,b as Empty,x as HideColumns,P as Loading,T as NoPipelineLink,Dn as __namedExportsOrder,jn as default};

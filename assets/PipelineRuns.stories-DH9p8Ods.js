import{j as n}from"./jsx-runtime-CSYIdwKN.js";import{a as oe}from"./chunk-D5ZWXAHU-5jmZk1IN.js";import"./usePrefix-CM90x8zf.js";import{D as le}from"./Dropdown-4W64npmB.js";import{u as C,L as pe,V as ce}from"./index-CD1u9lpx.js";import{u as ue}from"./index-CKzEcgge.js";import{g as p}from"./index-CfoIBI3E.js";import{C as de}from"./bucket-1-kyvp8nNf.js";import{F as me}from"./FormattedDate-DoRrJ4Nk.js";import{A as fe}from"./Actions-DrBFLItS.js";import{T as ge}from"./Table-C913vRMv.js";import{S as M}from"./StatusIcon-kVEdrWuu.js";import{R as j}from"./index-j5XA6xUc.js";import{I as Re}from"./Icon-BvP5-OXx.js";import{F as Te}from"./FormattedDuration-CnRRQHb0.js";import{a as be,T as he}from"./bucket-17-LIiJ4OSj.js";import{P as xe}from"./bucket-12-w4Le0n7o.js";import"./index-BUz8uDZe.js";import"./v4-CQkTLCs1.js";import"./index-CwuwC4oq.js";import"./index-aRs7OYaA.js";import"./index-Dhzc4P7r.js";import"./index-ByVX7Zjn.js";import"./index-DswfrUh6.js";import"./extends-CF3RwP-h.js";import"./index-DMsN9lKV.js";import"./FormContext-aPXE3suj.js";import"./bucket-3-GObMIxt2.js";import"./mergeRefs-CTUecegF.js";import"./bucket-18-he4L4bfw.js";import"./bucket-2-BhDbOiqM.js";import"./constants-PT-Qtcqm.js";import"./Link-B1ZNRv_t.js";import"./Button-BL0i1dXE.js";import"./index-Y04Ev2rt.js";import"./Tooltip-D8XmMmLg.js";import"./index-BKjU-s9g.js";import"./keys-fZP-1wUt.js";import"./events-OVwOsPzJ.js";import"./useControllableState-DUOQ64nT.js";import"./index-D2d4JviW.js";import"./Text-BecEi-D2.js";import"./wrapFocus-CMZot74P.js";import"./noopFn-g4z370MD.js";import"./Modal-ByUo5140.js";import"./bucket-6-B0A61yNx.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./debounce-DBudwqRe.js";import"./index-B1POUp4B.js";import"./bucket-0-MNXPsXKu.js";import"./Search-DnmSg_ZS.js";import"./bucket-14-B330O8PO.js";import"./Spinner-DYyuEvhi.js";import"./bucket-13-j6L4X23M.js";var $;const ve=j.forwardRef(function(i,l){let{children:A,size:f=16,...x}=i;return j.createElement(Re,{width:f,height:f,ref:l,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32",fill:"currentColor",...x},$||($=j.createElement("path",{d:"M11.61,29.92a1,1,0,0,1-.6-1.07L12.83,17H8a1,1,0,0,1-1-1.23l3-13A1,1,0,0,1,11,2H21a1,1,0,0,1,.78.37,1,1,0,0,1,.2.85L20.25,11H25a1,1,0,0,1,.9.56,1,1,0,0,1-.11,1l-13,17A1,1,0,0,1,12,30,1.09,1.09,0,0,1,11.61,29.92ZM17.75,13l2-9H11.8L9.26,15h5.91L13.58,25.28,23,13Z"})),A)});function Z(e){const{status:i}=p(e);return i==="False"?n.jsxs("span",{className:"tkn--table--sub",title:p(e).message,children:[p(e).message," "]}):n.jsx("span",{className:"tkn--table--sub",children:" "})}const d=({batchActionButtons:e=[],columns:i=["run","status","pipeline","time"],customColumns:l={},filters:A,getPipelineRunCreatedTime:f=a=>a.metadata.creationTimestamp,getPipelineRunDisplayName:x=({pipelineRunMetadata:a})=>a.name,getPipelineRunDisplayNameTooltip:I=x,getPipelineRunDuration:q=a=>{const o=f(a),{lastTransitionTime:s,status:r}=p(a);let v=Date.now();return(r==="False"||r==="True")&&(v=new Date(s).getTime()),v-new Date(o).getTime()},getPipelineRunIcon:U=()=>null,getPipelineRunId:_=a=>a.metadata.uid,getPipelineRunsByPipelineURL:H=C.pipelineRuns.byPipeline,getPipelineRunStatus:w=(a,o)=>{const{reason:s}=p(a);return s||o.formatMessage({id:"dashboard.taskRun.status.pending",defaultMessage:"Pending"})},getPipelineRunStatusDetail:E=Z,getPipelineRunStatusIcon:O=a=>{const{reason:o,status:s}=p(a);return n.jsx(M,{DefaultIcon:r=>n.jsx(xe,{size:24,...r}),reason:o,status:s})},getPipelineRunStatusTooltip:K=(a,o)=>{const{message:s}=p(a),r=w(a,o);return s?`${r}: ${s}`:r},getPipelineRunTriggerInfo:z=a=>{const{labels:o={}}=a.metadata,s=o["triggers.tekton.dev/eventlistener"],r=o["triggers.tekton.dev/trigger"];return!s&&!r?null:n.jsxs("span",{title:`EventListener: ${s||"-"}
Trigger: ${r||"-"}`,children:[n.jsx(ve,{}),s,s&&r?" | ":"",r]})},getPipelineRunURL:W=C.pipelineRuns.byName,getRunActions:G=()=>[],LinkComponent:D=pe,loading:J,pipelineRuns:Q,selectedNamespace:L,skeletonRowCount:X,toolbarButtons:Y})=>{const a=ue();let o=!1;const s={pipeline:a.formatMessage({id:"dashboard.tableHeader.pipeline",defaultMessage:"Pipeline"}),run:"Run",status:a.formatMessage({id:"dashboard.tableHeader.status",defaultMessage:"Status"}),time:""},r=i.map(t=>{const m=l[t]&&l[t].header||s[t];return{key:t,header:m}});function v(t){return Object.keys(l).reduce((m,c)=>(l[c].getValue&&(m[c]=l[c].getValue({pipelineRun:t})),m),{})}const ee=Q.map(t=>{const{annotations:m,namespace:c}=t.metadata,ne=f(t),N=x({pipelineRunMetadata:t.metadata}),te=I({pipelineRunMetadata:t.metadata}),u=t.spec.pipelineRef&&t.spec.pipelineRef.name,{reason:ae,status:ie}=p(t),se=O(t),B=W({name:N,namespace:c,annotations:m}),V=u&&H({namespace:c,pipelineName:u});let g=q(t);g==null?g="-":g=n.jsx(Te,{milliseconds:g});const S=G(t);return S.length&&(o=!0),{id:_(t),run:n.jsxs("div",{children:[n.jsxs("span",{children:[B?n.jsx(D,{to:B,title:te,children:N}):N,U({pipelineRunMetadata:t.metadata})]}),n.jsxs("span",{className:"tkn--table--sub",children:[z(t)," "]})]}),pipeline:n.jsxs("div",{children:[n.jsx("span",{children:u&&(V?n.jsx(D,{to:V,title:u,children:u}):n.jsx("span",{title:`Pipeline: ${u||"-"}`,children:u}))||"-"}),n.jsxs("span",{className:"tkn--table--sub",title:`Namespace: ${c}`,children:[c," "]})]}),status:n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status","data-status":ie,"data-reason":ae,title:K(t,a),children:[se,w(t,a)]})}),E(t)||Z(t)]}),time:n.jsxs("div",{children:[n.jsxs("span",{children:[n.jsx(de,{}),n.jsx(me,{date:ne,formatTooltip:re=>a.formatMessage({id:"dashboard.resource.createdTime",defaultMessage:"Created: {created}"},{created:re})})]}),n.jsxs("div",{className:"tkn--table--sub",children:[n.jsx(be,{}),g]})]}),actions:S.length&&n.jsx(fe,{items:S,resource:t}),...v(t)}});return o&&r.push({key:"actions",header:""}),n.jsx(ge,{batchActionButtons:e,filters:A,hasDetails:!0,headers:r,rows:ee,loading:J,selectedNamespace:L,emptyTextAllNamespaces:a.formatMessage({id:"dashboard.emptyState.allNamespaces",defaultMessage:"No matching {kind} found"},{kind:"PipelineRuns"}),emptyTextSelectedNamespace:a.formatMessage({id:"dashboard.emptyState.selectedNamespace",defaultMessage:"No matching {kind} found in namespace {selectedNamespace}"},{kind:"PipelineRuns",selectedNamespace:L}),skeletonRowCount:X,toolbarButtons:Y})};d.__docgenInfo={description:"",methods:[],displayName:"PipelineRuns",props:{batchActionButtons:{defaultValue:{value:"[]",computed:!1},required:!1},columns:{defaultValue:{value:"['run', 'status', 'pipeline', 'time']",computed:!1},required:!1},customColumns:{defaultValue:{value:"{}",computed:!1},required:!1},getPipelineRunCreatedTime:{defaultValue:{value:`pipelineRun =>
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
)`,computed:!0},required:!1}}};function F(e){return e?n.jsx(le,{id:"status-filter",initialSelectedItem:"All",items:["All","Succeeded","Failed"],label:"Status",titleText:"Status:",type:"inline"}):null}const Pn={component:d,decorators:[ce()],title:"PipelineRuns"},R=()=>n.jsx(d,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:({namespace:e,pipelineName:i})=>e?`to-pipeline-${e}/${i}`:`to-pipeline/${i}`,createPipelineRunTimestamp:e=>p(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{metadata:{name:"pipeline-run-20190816170431",namespace:"21cf1eac-7392-4e67-a4d0-f654506fe04d",uid:"a7812005-f766-4877-abd4-b3d418b04f66",creationTimestamp:"2019-08-16T17:09:12Z",labels:{"triggers.tekton.dev/eventlistener":"tekton-nightly","triggers.tekton.dev/trigger":"dashboard-nightly-release"}},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T17:10:49Z",message:"Not all Tasks have completed executing",reason:"Running",status:"Unknown",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",creationTimestamp:"2019-10-09T17:10:49Z",uid:"01cb5ea7-0158-4031-bc70-6bf017533a94"},spec:{pipelineRef:{name:"output-pipeline"},serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),T=()=>n.jsx(d,{getPipelineRunURL:({namespace:e,pipelineRunName:i})=>e?`to-pipelineRun-${e}/${i}`:null,getPipelineRunsByPipelineURL:()=>null,createPipelineRunTimestamp:e=>p(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:"default",getRunActions:()=>[{actionText:"Cancel",action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!=="Running",modalProperties:{heading:"cancel",primaryButtonText:"ok",secondaryButtonText:"no",body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",uid:"7c266264-4d4d-45e3-ace0-041be8f7d06e",creationTimestamp:"2019-08-16T12:48:00Z"},spec:{pipelineRef:{name:"pipeline"}},status:{conditions:[{lastTransitionTime:"2019-08-16T12:49:28Z",message:"All Tasks have completed executing",reason:"Succeeded",status:"True",type:"Succeeded"}]}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8",creationTimestamp:"2019-10-09T17:10:49Z",uid:"905c1ab0-203d-49ce-ad8d-4553e5d06bf0"},spec:{serviceAccountName:"default"}}],cancelPipelineRun:()=>{}}),b=()=>n.jsx(d,{batchActionButtons:[{onClick:oe("handleDelete"),text:"Delete",icon:he}],selectedNamespace:"default",getRunActions:()=>[{actionText:"An Action",action:e=>e,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"93531810-1b80-4246-a2bd-ee146c448d13"},spec:{pipelineRef:{name:"pipeline"}}},{apiVersion:"tekton.dev/v1alpha1",kind:"PipelineRun",metadata:{name:"output-pipeline-run",namespace:"default",creationTimestamp:"2019-10-09T17:10:49Z",uid:"77e0f4a3-40e5-46f1-84cc-ab7aa93c382c"},spec:{serviceAccountName:"default"}}]}),k={render:({showFilters:e})=>n.jsx(d,{columns:["run","status","time"],filters:F(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",uid:"c5ef252a-4635-46b5-ad7b-32c9e04cb6d2"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},P={render:({showFilters:e})=>n.jsx(d,{columns:["status","run","worker","time"],customColumns:{status:{getValue(){return n.jsxs("div",{children:[n.jsx("div",{className:"tkn--definition",children:n.jsxs("div",{className:"tkn--status",children:[n.jsx(M,{})," Pending"]})}),n.jsx("span",{children:" "})]})}},worker:{header:"Worker",getValue({pipelineRun:i}){const l=i.metadata.labels["example.com/worker"];return n.jsxs("div",{children:[n.jsx("span",{title:l,children:l}),n.jsx("span",{children:" "})]})}}},filters:F(e),getRunActions:()=>[{actionText:"An Action",action:i=>i,modalProperties:{heading:"An Action",primaryButtonText:"OK",secondaryButtonText:"Cancel",body:()=>"Do something interesting"}}],pipelineRuns:[{metadata:{name:"pipeline-run-20190816124708",namespace:"cb4552a6-b2d7-45e2-9773-3d4ca33909ff",creationTimestamp:"2019-08-16T12:48:00Z",labels:{"example.com/worker":"my-worker"},uid:"b0461c38-90e1-4d83-b32d-293cf3d0ea72"},spec:{pipelineRef:{name:"pipeline"}}}]}),args:{showFilters:!1}},h={args:{cancelPipelineRun:()=>{},pipelineRuns:[],selectedNamespace:"default"}},y={args:{...h.args,loading:!0}};R.__docgenInfo={description:"",methods:[],displayName:"Default"};T.__docgenInfo={description:"",methods:[],displayName:"NoPipelineLink"};b.__docgenInfo={description:"",methods:[],displayName:"BatchActions"};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}]} cancelPipelineRun={() => {}} />`,...R.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}]} cancelPipelineRun={() => {}} />`,...T.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`() => <PipelineRuns batchActionButtons={[{
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
}]} />`,...b.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    cancelPipelineRun: () => {},
    pipelineRuns: [],
    selectedNamespace: 'default'
  }
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...Empty.args,
    loading: true
  }
}`,...y.parameters?.docs?.source}}};const yn=["Default","NoPipelineLink","BatchActions","HideColumns","CustomColumns","Empty","Loading"];export{b as BatchActions,P as CustomColumns,R as Default,h as Empty,k as HideColumns,y as Loading,T as NoPipelineLink,yn as __namedExportsOrder,Pn as default};

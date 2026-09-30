import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./FormattedDuration-zgKifZEI.js";import{n as r}from"./useIntl-lGVSqoC-.js";import{r as i}from"./lib-BZfqaDTj.js";import{n as a,t as o}from"./FormattedDate-DPcWDWIk.js";import{t as s}from"./jsx-runtime-ATHzeHXA.js";import{c,f as l}from"./utils-jtJj5xm0.js";import{i as u,n as d,o as f,r as p,t as m}from"./Link-DxoCdxb2.js";import{n as h,t as g}from"./Table-DS-Krfts.js";import{a as _,n as v}from"./bucket-2-DPY-8qO4.js";import{a as y,i as b}from"./bucket-11-DQvVBk_5.js";import{i as x,n as S}from"./bucket-14-BZ2wPrQ2.js";import{r as C,t as w}from"./bucket-19-BBCbGHZk.js";import{s as T,t as E}from"./bucket-20-D9XU2xQJ.js";import{n as D,t as O}from"./StatusIcon-CqVkcvSs.js";import{t as k}from"./es-BERic32k.js";import{n as A,t as j}from"./Actions-CGFMc83h.js";import{t as M}from"./Dropdown-BCYDJwA5.js";function N(e){let{status:t}=l(e);return t===`False`?(0,P.jsxs)(`span`,{className:`tkn--table--sub`,title:l(e).message,children:[l(e).message,`\xA0`]}):(0,P.jsx)(`span`,{className:`tkn--table--sub`,children:`\xA0`})}var P,F;function I(){return(I=e((()=>{i(),c(),_(),x(),C(),y(),A(),a(),t(),d(),D(),h(),P=s(),F=({batchActionButtons:e=[],columns:t=[`run`,`status`,`pipeline`,`time`],customColumns:i={},filters:a,getPipelineRunCreatedTime:s=e=>e.metadata.creationTimestamp,getPipelineRunDisplayName:c=({pipelineRunMetadata:e})=>e.name,getPipelineRunDisplayNameTooltip:u=c,getPipelineRunDuration:d=e=>{let t=s(e),{lastTransitionTime:n,status:r}=l(e),i=Date.now();return(r===`False`||r===`True`)&&(i=new Date(n).getTime()),i-new Date(t).getTime()},getPipelineRunId:p=e=>e.metadata.uid,getPipelineRunsByPipelineURL:h=f.pipelineRuns.byPipeline,getPipelineRunStatus:_=(e,t)=>{let{reason:n}=l(e);return n||t.formatMessage({id:`dashboard.taskRun.status.pending`,defaultMessage:`Pending`})},getPipelineRunStatusDetail:y=N,getPipelineRunStatusIcon:x=e=>{let{reason:t,status:n}=l(e);return(0,P.jsx)(O,{DefaultIcon:e=>(0,P.jsx)(S,{size:24,...e}),reason:t,status:n})},getPipelineRunStatusTooltip:C=(e,t)=>{let{message:n}=l(e),r=_(e,t);return n?`${r}: ${n}`:r},getPipelineRunTriggerInfo:T=e=>{let{labels:t={}}=e.metadata,n=t[`triggers.tekton.dev/eventlistener`],r=t[`triggers.tekton.dev/trigger`];return!n&&!r?null:(0,P.jsxs)(`span`,{title:`EventListener: ${n||`-`}\nTrigger: ${r||`-`}`,children:[(0,P.jsx)(b,{}),n,n&&r?` | `:``,r]})},getPipelineRunURL:E=f.pipelineRuns.byName,getRunActions:D=()=>[],LinkComponent:k=m,loading:A,pipelineRuns:M,selectedNamespace:F,skeletonRowCount:I,toolbarButtons:L})=>{let R=r(),z=!1,B={pipeline:R.formatMessage({id:`dashboard.tableHeader.pipeline`,defaultMessage:`Pipeline`}),run:`Run`,status:R.formatMessage({id:`dashboard.tableHeader.status`,defaultMessage:`Status`}),time:``},V=t.map(e=>({key:e,header:i[e]&&i[e].header||B[e]}));function H(e){return Object.keys(i).reduce((t,n)=>(i[n].getValue&&(t[n]=i[n].getValue({pipelineRun:e})),t),{})}let U=M.map(e=>{let{annotations:t,namespace:r}=e.metadata,i=s(e),a=c({pipelineRunMetadata:e.metadata}),f=u({pipelineRunMetadata:e.metadata}),m=e.spec.pipelineRef&&e.spec.pipelineRef.name,{reason:g,status:b}=l(e),S=x(e),O=E({name:a,namespace:r,annotations:t}),A=m&&h({namespace:r,pipelineName:m}),M=d(e);M=M==null?`-`:(0,P.jsx)(n,{milliseconds:M});let F=D(e);return F.length&&(z=!0),{id:p(e),run:(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`span`,{children:O?(0,P.jsx)(k,{to:O,title:f,children:a}):a}),(0,P.jsxs)(`span`,{className:`tkn--table--sub`,children:[T(e),`\xA0`]})]}),pipeline:(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`span`,{children:m&&(A?(0,P.jsx)(k,{to:A,title:m,children:m}):(0,P.jsx)(`span`,{title:`Pipeline: ${m||`-`}`,children:m}))||`-`}),(0,P.jsxs)(`span`,{className:`tkn--table--sub`,title:`Namespace: ${r}`,children:[r,`\xA0`]})]}),status:(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`div`,{className:`tkn--definition`,children:(0,P.jsxs)(`div`,{className:`tkn--status`,"data-status":b,"data-reason":g,title:C(e,R),children:[S,_(e,R)]})}),y(e)||N(e)]}),time:(0,P.jsxs)(`div`,{children:[(0,P.jsxs)(`span`,{children:[(0,P.jsx)(v,{}),(0,P.jsx)(o,{date:i,formatTooltip:e=>R.formatMessage({id:`dashboard.resource.createdTime`,defaultMessage:`Created: {created}`},{created:e})})]}),(0,P.jsxs)(`div`,{className:`tkn--table--sub`,children:[(0,P.jsx)(w,{}),M]})]}),actions:F.length&&(0,P.jsx)(j,{items:F,resource:e}),...H(e)}});return z&&V.push({key:`actions`,header:``}),(0,P.jsx)(g,{batchActionButtons:e,filters:a,hasDetails:!0,headers:V,rows:U,loading:A,selectedNamespace:F,emptyTextAllNamespaces:R.formatMessage({id:`dashboard.emptyState.allNamespaces`,defaultMessage:`No matching {kind} found`},{kind:`PipelineRuns`}),emptyTextSelectedNamespace:R.formatMessage({id:`dashboard.emptyState.selectedNamespace`,defaultMessage:`No matching {kind} found in namespace {selectedNamespace}`},{kind:`PipelineRuns`,selectedNamespace:F}),skeletonRowCount:I,toolbarButtons:L})},F.__docgenInfo={description:``,methods:[],displayName:`PipelineRuns`,props:{batchActionButtons:{defaultValue:{value:`[]`,computed:!1},required:!1},columns:{defaultValue:{value:`['run', 'status', 'pipeline', 'time']`,computed:!1},required:!1},customColumns:{defaultValue:{value:`{}`,computed:!1},required:!1},getPipelineRunCreatedTime:{defaultValue:{value:`pipelineRun =>
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
}`,computed:!1},required:!1},getPipelineRunId:{defaultValue:{value:`pipelineRun => pipelineRun.metadata.uid`,computed:!1},required:!1},getPipelineRunsByPipelineURL:{defaultValue:{value:`urls.pipelineRuns.byPipeline`,computed:!0},required:!1},getPipelineRunStatus:{defaultValue:{value:`(pipelineRun, intl) => {
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
}`,computed:!1},required:!1},getPipelineRunURL:{defaultValue:{value:`urls.pipelineRuns.byName`,computed:!0},required:!1},getRunActions:{defaultValue:{value:`() => []`,computed:!1},required:!1},LinkComponent:{defaultValue:{value:`forwardRef(function Link(
  { onClick, replace = false, state, target, to, ...rest },
  ref
) {
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
})`,computed:!0},required:!1}}}})))()}function L(e){return e?(0,R.jsx)(M,{id:`status-filter`,initialSelectedItem:`All`,items:[`All`,`Succeeded`,`Failed`],label:`Status`,titleText:`Status:`,type:`inline`}):null}var R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{c(),T(),k(),u(),D(),I(),R=s(),{action:z}=__STORYBOOK_MODULE_ACTIONS__,B={component:F,decorators:[p()],title:`PipelineRuns`},V=()=>(0,R.jsx)(F,{getPipelineRunURL:({namespace:e,pipelineRunName:t})=>e?`to-pipelineRun-${e}/${t}`:null,getPipelineRunsByPipelineURL:({namespace:e,pipelineName:t})=>e?`to-pipeline-${e}/${t}`:`to-pipeline/${t}`,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:`default`,getRunActions:()=>[{actionText:`Cancel`,action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!==`Running`,modalProperties:{heading:`cancel`,primaryButtonText:`ok`,secondaryButtonText:`no`,body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:`pipeline-run-20190816124708`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,uid:`7c266264-4d4d-45e3-ace0-041be8f7d06e`,creationTimestamp:`2019-08-16T12:48:00Z`},spec:{pipelineRef:{name:`pipeline`}},status:{conditions:[{lastTransitionTime:`2019-08-16T12:49:28Z`,message:`All Tasks have completed executing`,reason:`Succeeded`,status:`True`,type:`Succeeded`}]}},{metadata:{name:`pipeline-run-20190816170431`,namespace:`21cf1eac-7392-4e67-a4d0-f654506fe04d`,uid:`a7812005-f766-4877-abd4-b3d418b04f66`,creationTimestamp:`2019-08-16T17:09:12Z`,labels:{"triggers.tekton.dev/eventlistener":`tekton-nightly`,"triggers.tekton.dev/trigger":`dashboard-nightly-release`}},spec:{pipelineRef:{name:`pipeline`}},status:{conditions:[{lastTransitionTime:`2019-08-16T17:10:49Z`,message:`Not all Tasks have completed executing`,reason:`Running`,status:`Unknown`,type:`Succeeded`}]}},{apiVersion:`tekton.dev/v1alpha1`,kind:`PipelineRun`,metadata:{name:`output-pipeline-run`,creationTimestamp:`2019-10-09T17:10:49Z`,uid:`01cb5ea7-0158-4031-bc70-6bf017533a94`},spec:{pipelineRef:{name:`output-pipeline`},serviceAccountName:`default`}}],cancelPipelineRun:()=>{}}),H=()=>(0,R.jsx)(F,{getPipelineRunURL:({namespace:e,pipelineRunName:t})=>e?`to-pipelineRun-${e}/${t}`:null,getPipelineRunsByPipelineURL:()=>null,createPipelineRunTimestamp:e=>l(e).lastTransitionTime||e.metadata.creationTimestamp,selectedNamespace:`default`,getRunActions:()=>[{actionText:`Cancel`,action:e=>e,disable:e=>e.status&&e.status.conditions[0].reason!==`Running`,modalProperties:{heading:`cancel`,primaryButtonText:`ok`,secondaryButtonText:`no`,body:e=>`cancel pipelineRun ${e.metadata.name}`}}],pipelineRuns:[{metadata:{name:`pipeline-run-20190816124708`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,uid:`7c266264-4d4d-45e3-ace0-041be8f7d06e`,creationTimestamp:`2019-08-16T12:48:00Z`},spec:{pipelineRef:{name:`pipeline`}},status:{conditions:[{lastTransitionTime:`2019-08-16T12:49:28Z`,message:`All Tasks have completed executing`,reason:`Succeeded`,status:`True`,type:`Succeeded`}]}},{apiVersion:`tekton.dev/v1alpha1`,kind:`PipelineRun`,metadata:{name:`output-pipeline-run`,namespace:`61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8`,creationTimestamp:`2019-10-09T17:10:49Z`,uid:`905c1ab0-203d-49ce-ad8d-4553e5d06bf0`},spec:{serviceAccountName:`default`}}],cancelPipelineRun:()=>{}}),U=()=>(0,R.jsx)(F,{batchActionButtons:[{onClick:z(`handleDelete`),text:`Delete`,icon:E}],selectedNamespace:`default`,getRunActions:()=>[{actionText:`An Action`,action:e=>e,modalProperties:{heading:`An Action`,primaryButtonText:`OK`,secondaryButtonText:`Cancel`,body:()=>`Do something interesting`}}],pipelineRuns:[{metadata:{name:`pipeline-run-20190816124708`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,creationTimestamp:`2019-08-16T12:48:00Z`,uid:`93531810-1b80-4246-a2bd-ee146c448d13`},spec:{pipelineRef:{name:`pipeline`}}},{apiVersion:`tekton.dev/v1alpha1`,kind:`PipelineRun`,metadata:{name:`output-pipeline-run`,namespace:`default`,creationTimestamp:`2019-10-09T17:10:49Z`,uid:`77e0f4a3-40e5-46f1-84cc-ab7aa93c382c`},spec:{serviceAccountName:`default`}}]}),W={render:({showFilters:e})=>(0,R.jsx)(F,{columns:[`run`,`status`,`time`],filters:L(e),getRunActions:()=>[{actionText:`An Action`,action:e=>e,modalProperties:{heading:`An Action`,primaryButtonText:`OK`,secondaryButtonText:`Cancel`,body:()=>`Do something interesting`}}],pipelineRuns:[{metadata:{name:`pipeline-run-20190816124708`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,creationTimestamp:`2019-08-16T12:48:00Z`,uid:`c5ef252a-4635-46b5-ad7b-32c9e04cb6d2`},spec:{pipelineRef:{name:`pipeline`}}}]}),args:{showFilters:!1}},G={render:({showFilters:e})=>(0,R.jsx)(F,{columns:[`status`,`run`,`worker`,`time`],customColumns:{status:{getValue(){return(0,R.jsxs)(`div`,{children:[(0,R.jsx)(`div`,{className:`tkn--definition`,children:(0,R.jsxs)(`div`,{className:`tkn--status`,children:[(0,R.jsx)(O,{}),` Pending`]})}),(0,R.jsx)(`span`,{children:`\xA0`})]})}},worker:{header:`Worker`,getValue({pipelineRun:e}){let t=e.metadata.labels[`example.com/worker`];return(0,R.jsxs)(`div`,{children:[(0,R.jsx)(`span`,{title:t,children:t}),(0,R.jsx)(`span`,{children:`\xA0`})]})}}},filters:L(e),getRunActions:()=>[{actionText:`An Action`,action:e=>e,modalProperties:{heading:`An Action`,primaryButtonText:`OK`,secondaryButtonText:`Cancel`,body:()=>`Do something interesting`}}],pipelineRuns:[{metadata:{name:`pipeline-run-20190816124708`,namespace:`cb4552a6-b2d7-45e2-9773-3d4ca33909ff`,creationTimestamp:`2019-08-16T12:48:00Z`,labels:{"example.com/worker":`my-worker`},uid:`b0461c38-90e1-4d83-b32d-293cf3d0ea72`},spec:{pipelineRef:{name:`pipeline`}}}]}),args:{showFilters:!1}},K={args:{cancelPipelineRun:()=>{},pipelineRuns:[],selectedNamespace:`default`}},q={args:{...K.args,loading:!0}},V.__docgenInfo={description:``,methods:[],displayName:`Default`},H.__docgenInfo={description:``,methods:[],displayName:`NoPipelineLink`},U.__docgenInfo={description:``,methods:[],displayName:`BatchActions`},J=[`Default`,`NoPipelineLink`,`BatchActions`,`HideColumns`,`CustomColumns`,`Empty`,`Loading`],V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}]} cancelPipelineRun={() => {}} />`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`() => <PipelineRuns getPipelineRunURL={({
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
}]} cancelPipelineRun={() => {}} />`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`() => <PipelineRuns batchActionButtons={[{
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
}]} />`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    cancelPipelineRun: () => {},
    pipelineRuns: [],
    selectedNamespace: 'default'
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    ...Empty.args,
    loading: true
  }
}`,...q.parameters?.docs?.source}}}})))()}Y();export{U as BatchActions,G as CustomColumns,V as Default,K as Empty,W as HideColumns,q as Loading,H as NoPipelineLink,J as __namedExportsOrder,B as default};
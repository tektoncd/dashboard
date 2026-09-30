import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-B6tGW3fj.js";import{n}from"./useIntl-lGVSqoC-.js";import{r}from"./lib-BZfqaDTj.js";import{t as i}from"./jsx-runtime-ATHzeHXA.js";import{c as a}from"./utils-jtJj5xm0.js";import{n as o,o as s,t as c}from"./Link-DxoCdxb2.js";import{i as l,t as u}from"./es-BERic32k.js";import{m as d,p as f}from"./IconButton-DUBKBcJe.js";import{t as p}from"./Modal-B3C4ttf4.js";import{t as m}from"./TextInput-C4tOjBtS.js";function h({namespace:e,resource:t,LinkComponent:r=c}){let i=n(),a=l(),o=(0,g.useRef)(null),u=t.metadata?.labels||{},h=Object.entries(u),v=h.slice(0,4),y=h.slice(4,9),b=h.slice(9),x=h.length-4,S=t.kind,[C,w]=(0,g.useState)(!1),[T,E]=(0,g.useState)(``),[D,O]=(0,g.useState)(!1),k=()=>{w(!0)},A=()=>{O(!1)},j=()=>{w(!1)},M=e=>{E(e.target.value)},N=h.filter(([e,t])=>e.toLowerCase().includes(T.toLowerCase())||t.toLowerCase().includes(T.toLowerCase())),P=({label:t,name:n})=>s.pipelineRuns.labels({namespace:e,label:t,name:n,resourceType:S}),F=t=>t.map(([t,n])=>(0,_.jsx)(r,{className:`${a}--tag ${a}--tag__label`,to:P({namespace:e,label:t,name:n}),title:`${t}: ${n}`,children:`${t}: ${n}`},t));return(0,_.jsxs)(`div`,{className:`tkn--overflow-menu-container`,children:[F(v),x>0&&(0,_.jsx)(`div`,{className:`tkn--tag-popover-container`,children:(0,_.jsxs)(f,{className:`tkn--tag-popover`,dropShadow:!0,highContrast:!0,caret:!0,open:D,onRequestClose:A,ref:o,onBlur:e=>{o.current&&!o.current.contains(e.relatedTarget)&&A()},onKeyDown:e=>{e.key===`Escape`&&A()},children:[(0,_.jsx)(`button`,{type:`button`,className:`${a}--tag`,onClick:()=>{O(!D)},children:`+${x}`}),(0,_.jsx)(d,{children:(0,_.jsxs)(`div`,{style:{padding:`0.5rem`},children:[F(y),b.length>0&&(0,_.jsx)(`button`,{type:`button`,className:`${a}--tag tkn--tag-popover-container`,onClick:k,children:`+${b.length}`})]})})]})}),C&&(0,_.jsxs)(p,{open:C,onRequestClose:j,modalHeading:i.formatMessage({id:`dashboard.runMetadata.allLabels`,defaultMessage:`All labels`}),primaryButtonText:i.formatMessage({id:`dashboard.modal.close`,defaultMessage:`Close`}),passiveModal:!0,children:[(0,_.jsx)(m,{"data-modal-primary-focus":!0,id:`tkn--runMetadata--label-search`,labelText:i.formatMessage({id:`dashboard.runMetadata.searchLabel`,defaultMessage:`Search`}),placeholder:i.formatMessage({id:`dashboard.runMetadata.searchForLabel`,defaultMessage:`Search for a label`}),value:T,onChange:M}),(0,_.jsx)(`div`,{className:`tkn--tag-list`,children:F(N)})]})]})}var g,_;function v(){return(v=e((()=>{r(),g=t(),u(),a(),o(),_=i(),h.__docgenInfo={description:``,methods:[],displayName:`LabelsWithOverflow`,props:{LinkComponent:{defaultValue:{value:`forwardRef(function Link(
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
})`,computed:!0},required:!1}}}})))()}export{v as n,h as t};
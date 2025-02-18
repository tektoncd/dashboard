import{d as F}from"./index-ogSvIofg.js";const{useEffect:h,useMemo:E}=__STORYBOOK_MODULE_PREVIEW_API__,{global:Y}=__STORYBOOK_MODULE_GLOBAL__,{logger:H}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var p="backgrounds",R={light:{name:"light",value:"#F8F8F8"},dark:{name:"dark",value:"#333"}},{document:c,window:K}=Y,C=()=>!!K?.matchMedia("(prefers-reduced-motion: reduce)")?.matches,_=a=>{(Array.isArray(a)?a:[a]).forEach(P)},P=a=>{let e=c.getElementById(a);e&&e.parentElement?.removeChild(e)},I=(a,e)=>{let t=c.getElementById(a);if(t)t.innerHTML!==e&&(t.innerHTML=e);else{let d=c.createElement("style");d.setAttribute("id",a),d.innerHTML=e,c.head.appendChild(d)}},z=(a,e,t)=>{let d=c.getElementById(a);if(d)d.innerHTML!==e&&(d.innerHTML=e);else{let r=c.createElement("style");r.setAttribute("id",a),r.innerHTML=e;let n=`addon-backgrounds-grid${t?`-docs-${t}`:""}`,o=c.getElementById(n);o?o.parentElement?.insertBefore(r,o):c.head.appendChild(r)}},j={cellSize:100,cellAmount:10,opacity:.8},L="addon-backgrounds",G="addon-backgrounds-grid",X=C()?"":"transition: background-color 0.3s;",N=(a,e)=>{let{globals:t,parameters:d,viewMode:r,id:n}=e,{options:o=R,disable:i,grid:l=j}=d[p]||{},g=t[p]||{},u=g.value,$=u?o[u]:void 0,b=$?.value||"transparent",f=g.grid||!1,m=!!$&&!i,v=r==="docs"?`#anchor--${n} .docs-story`:".sb-show-main",O=r==="docs"?`#anchor--${n} .docs-story`:".sb-show-main",U=d.layout===void 0||d.layout==="padded",w=r==="docs"?20:U?16:0,{cellAmount:y,cellSize:s,opacity:k,offsetX:x=w,offsetY:S=w}=l,A=r==="docs"?`${L}-docs-${n}`:`${L}-color`,T=r==="docs"?n:null;h(()=>{let M=`
    ${v} {
      background: ${b} !important;
      ${X}
      }`;if(!m){_(A);return}z(A,M,T)},[v,A,T,m,b]);let B=r==="docs"?`${G}-docs-${n}`:`${G}`;return h(()=>{if(!f){_(B);return}let M=[`${s*y}px ${s*y}px`,`${s*y}px ${s*y}px`,`${s}px ${s}px`,`${s}px ${s}px`].join(", "),D=`
        ${O} {
          background-size: ${M} !important;
          background-position: ${x}px ${S}px, ${x}px ${S}px, ${x}px ${S}px, ${x}px ${S}px !important;
          background-blend-mode: difference !important;
          background-image: linear-gradient(rgba(130, 130, 130, ${k}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${k}) 1px, transparent 1px),
           linear-gradient(rgba(130, 130, 130, ${k/2}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${k/2}) 1px, transparent 1px) !important;
        }
      `;I(B,D)},[y,s,O,B,f,x,S,k]),a()},W=(a,e=[],t)=>{if(a==="transparent")return"transparent";if(e.find(r=>r.value===a)||a)return a;let d=e.find(r=>r.name===t);if(d)return d.value;if(t){let r=e.map(n=>n.name).join(", ");H.warn(F`
        Backgrounds Addon: could not find the default color "${t}".
        These are the available colors for your story based on your configuration:
        ${r}.
      `)}return"transparent"},q=(a,e)=>{let{globals:t,parameters:d}=e,r=t[p]?.value,n=d[p],o=E(()=>n.disable?"transparent":W(r,n.values,n.default),[n,r]),i=E(()=>o&&o!=="transparent",[o]),l=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",g=E(()=>`
      ${l} {
        background: ${o} !important;
        ${C()?"":"transition: background-color 0.3s;"}
      }
    `,[o,l]);return h(()=>{let u=e.viewMode==="docs"?`addon-backgrounds-docs-${e.id}`:"addon-backgrounds-color";if(!i){_(u);return}z(u,g,e.viewMode==="docs"?e.id:null)},[i,g,e]),a()},J=(a,e)=>{let{globals:t,parameters:d}=e,r=d[p].grid,n=t[p]?.grid===!0&&r.disable!==!0,{cellAmount:o,cellSize:i,opacity:l}=r,g=e.viewMode==="docs",u=d.layout===void 0||d.layout==="padded"?16:0,$=r.offsetX??(g?20:u),b=r.offsetY??(g?20:u),f=E(()=>{let m=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",v=[`${i*o}px ${i*o}px`,`${i*o}px ${i*o}px`,`${i}px ${i}px`,`${i}px ${i}px`].join(", ");return`
      ${m} {
        background-size: ${v} !important;
        background-position: ${$}px ${b}px, ${$}px ${b}px, ${$}px ${b}px, ${$}px ${b}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${l}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${l}) 1px, transparent 1px),
         linear-gradient(rgba(130, 130, 130, ${l/2}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${l/2}) 1px, transparent 1px) !important;
      }
    `},[i]);return h(()=>{let m=e.viewMode==="docs"?`addon-backgrounds-grid-docs-${e.id}`:"addon-backgrounds-grid";if(!n){_(m);return}I(m,f)},[n,f,e]),a()},V=FEATURES?.backgroundsStoryGlobals?[N]:[J,q],ee={[p]:{grid:{cellSize:20,opacity:.5,cellAmount:5},disable:!1,...!FEATURES?.backgroundsStoryGlobals&&{values:Object.values(R)}}},Q={[p]:{value:void 0,grid:!1}},re=FEATURES?.backgroundsStoryGlobals?Q:{[p]:null};export{V as decorators,re as initialGlobals,ee as parameters};

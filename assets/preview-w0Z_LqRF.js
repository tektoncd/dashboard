import{d as _}from"./index-PPLHz8o0.js";const{useMemo:f,useEffect:y}=__STORYBOOK_MODULE_PREVIEW_API__,{global:E}=__STORYBOOK_MODULE_GLOBAL__,{logger:M}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var g="backgrounds",{document:l,window:h}=E,B=()=>h.matchMedia("(prefers-reduced-motion: reduce)").matches,x=(r,e=[],n)=>{if(r==="transparent")return"transparent";if(e.find(a=>a.value===r))return r;let d=e.find(a=>a.name===n);if(d)return d.value;if(n){let a=e.map(i=>i.name).join(", ");M.warn(_`
        Backgrounds Addon: could not find the default color "${n}".
        These are the available colors for your story based on your configuration:
        ${a}.
      `)}return"transparent"},v=r=>{(Array.isArray(r)?r:[r]).forEach(O)},O=r=>{let e=l.getElementById(r);e&&e.parentElement?.removeChild(e)},S=(r,e)=>{let n=l.getElementById(r);if(n)n.innerHTML!==e&&(n.innerHTML=e);else{let d=l.createElement("style");d.setAttribute("id",r),d.innerHTML=e,l.head.appendChild(d)}},w=(r,e,n)=>{let d=l.getElementById(r);if(d)d.innerHTML!==e&&(d.innerHTML=e);else{let a=l.createElement("style");a.setAttribute("id",r),a.innerHTML=e;let i=`addon-backgrounds-grid${n?`-docs-${n}`:""}`,t=l.getElementById(i);t?t.parentElement?.insertBefore(a,t):l.head.appendChild(a)}},A=(r,e)=>{let{globals:n,parameters:d}=e,a=n[g]?.value,i=d[g],t=f(()=>i.disable?"transparent":x(a,i.values,i.default),[i,a]),o=f(()=>t&&t!=="transparent",[t]),s=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",p=f(()=>`
      ${s} {
        background: ${t} !important;
        ${B()?"":"transition: background-color 0.3s;"}
      }
    `,[t,s]);return y(()=>{let u=e.viewMode==="docs"?`addon-backgrounds-docs-${e.id}`:"addon-backgrounds-color";if(!o){v(u);return}w(u,p,e.viewMode==="docs"?e.id:null)},[o,p,e]),r()},L=(r,e)=>{let{globals:n,parameters:d}=e,a=d[g].grid,i=n[g]?.grid===!0&&a.disable!==!0,{cellAmount:t,cellSize:o,opacity:s}=a,p=e.viewMode==="docs",u=d.layout===void 0||d.layout==="padded"?16:0,c=a.offsetX??(p?20:u),m=a.offsetY??(p?20:u),$=f(()=>{let b=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",k=[`${o*t}px ${o*t}px`,`${o*t}px ${o*t}px`,`${o}px ${o}px`,`${o}px ${o}px`].join(", ");return`
      ${b} {
        background-size: ${k} !important;
        background-position: ${c}px ${m}px, ${c}px ${m}px, ${c}px ${m}px, ${c}px ${m}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(rgba(130, 130, 130, ${s/2}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s/2}) 1px, transparent 1px) !important;
      }
    `},[o]);return y(()=>{let b=e.viewMode==="docs"?`addon-backgrounds-grid-docs-${e.id}`:"addon-backgrounds-grid";if(!i){v(b);return}S(b,$)},[i,$,e]),r()},C=[L,A],I={[g]:{grid:{cellSize:20,opacity:.5,cellAmount:5},values:[{name:"light",value:"#F8F8F8"},{name:"dark",value:"#333333"}]}},R={[g]:null};export{C as decorators,R as globals,I as parameters};

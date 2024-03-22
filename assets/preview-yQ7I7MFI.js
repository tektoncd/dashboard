const{global:r}=__STORYBOOK_MODULE_GLOBAL__,{addons:s}=__STORYBOOK_MODULE_PREVIEW_API__,{STORY_CHANGED:O}=__STORYBOOK_MODULE_CORE_EVENTS__;var n="storybook/highlight",i="storybookHighlight",g=`${n}/add`,E=`${n}/reset`,{document:h}=r,H=(e="#FF4785",t="dashed")=>`
  outline: 2px ${t} ${e};
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`,I=e=>({outline:`2px dashed ${e}`,outlineOffset:2,boxShadow:"0 0 0 6px rgba(255,255,255,0.6)"}),l=s.getChannel(),T=e=>{let t=i;_();let d=Array.from(new Set(e.elements)),o=h.createElement("style");o.setAttribute("id",t),o.innerHTML=d.map(a=>`${a}{
          ${H(e.color,e.style)}
         }`).join(" "),h.head.appendChild(o)},_=()=>{let e=i,t=h.getElementById(e);t&&t.parentNode?.removeChild(t)};l.on(O,_);l.on(E,_);l.on(g,T);export{I as highlightObject,H as highlightStyle};

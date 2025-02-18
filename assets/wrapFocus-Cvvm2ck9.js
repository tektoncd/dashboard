import"./index-BLsgEXh-.js";import{m as d,A as b,c as u}from"./keys-fZP-1wUt.js";import{t as N}from"./index-Cn2DnnuS.js";const D=(t,e,n)=>{if(d(t,b))return(e+1)%n;if(d(t,u))return(e+n-1)%n},O=typeof Node<"u"&&Node.DOCUMENT_POSITION_PRECEDING|Node.DOCUMENT_POSITION_CONTAINS,p=typeof Node<"u"&&Node.DOCUMENT_POSITION_FOLLOWING|Node.DOCUMENT_POSITION_CONTAINED_BY,f=`
  a[href], area[href], input:not([disabled]):not([tabindex='-1']),
  button:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),
  textarea:not([disabled]):not([tabindex='-1']),
  iframe, object, embed, *[tabindex]:not([tabindex='-1']):not([disabled]), *[contenteditable=true]
`,A=`
  a[href], area[href], input:not([disabled]),
  button:not([disabled]),select:not([disabled]),
  textarea:not([disabled]),
  iframe, object, embed, *[tabindex]:not([disabled]), *[contenteditable=true]
`;function m(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:[];if(t&&typeof t.closest=="function")return[".cds--overflow-menu-options",".cds--tooltip",".flatpickr-calendar",...e].some(s=>t.closest(s))}function P(t){let{bodyNode:e,startTrapNode:n,endTrapNode:s,currentActiveNode:o,oldActiveNode:a,selectorsFloatingMenus:l}=t;if(e&&o&&a&&!e.contains(o)&&!m(o,l)){const c=a.compareDocumentPosition(o);if(o===n||c&O){const i=[...e.querySelectorAll(f)].reverse().find(r=>!!r.offsetParent);i?i.focus():e!==a&&e.focus()}else if(o===s||c&p){const i=Array.prototype.find.call(e.querySelectorAll(f),r=>!!r.offsetParent);i?i.focus():e!==a&&e.focus()}}}function S(t){let{containerNode:e,currentActiveNode:n,event:s}=t;["blur","focusout","focusin","focus"].includes(s.type);const o=N(e),a=o[0],l=o[o.length-1];n===l&&!s.shiftKey&&(s.preventDefault(),a.focus()),n===a&&s.shiftKey&&(s.preventDefault(),l.focus())}export{P as a,A as b,m as e,D as g,f as s,S as w};

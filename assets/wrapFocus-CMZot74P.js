import"./index-j5XA6xUc.js";import{m as d,A as u,c as b}from"./keys-fZP-1wUt.js";import{t as N}from"./index-CwuwC4oq.js";const _=(t,e,n)=>{if(d(t,u))return(e+1)%n;if(d(t,b))return(e+n-1)%n},p=typeof Node<"u"&&Node.DOCUMENT_POSITION_PRECEDING|Node.DOCUMENT_POSITION_CONTAINS,O=typeof Node<"u"&&Node.DOCUMENT_POSITION_FOLLOWING|Node.DOCUMENT_POSITION_CONTAINED_BY,f=`
  a[href], area[href], input:not([disabled]):not([tabindex='-1']),
  button:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),
  textarea:not([disabled]):not([tabindex='-1']),
  iframe, object, embed, *[tabindex]:not([tabindex='-1']):not([disabled]), *[contenteditable=true]
`,S=`
  a[href], area[href], input:not([disabled]),
  button:not([disabled]),select:not([disabled]),
  textarea:not([disabled]),
  iframe, object, embed, *[tabindex]:not([disabled]), *[contenteditable=true]
`;function m(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:[];if(t&&typeof t.closest=="function")return[".cds--overflow-menu-options",".cds--tooltip",".flatpickr-calendar",...e].some(s=>t.closest(s))}function x(t){let{bodyNode:e,startTrapNode:n,endTrapNode:s,currentActiveNode:o,oldActiveNode:a,selectorsFloatingMenus:i}=t;if(e&&o&&a&&!e.contains(o)&&!m(o,i)){const c=a.compareDocumentPosition(o);if(o===n||c&p){const r=[...e.querySelectorAll(f)].reverse().find(l=>!!l.offsetParent);r?r.focus():e!==a&&e.focus()}else if(o===s||c&O){const r=Array.prototype.find.call(e.querySelectorAll(f),l=>!!l.offsetParent);r?r.focus():e!==a&&e.focus()}}}function A(t){let{containerNode:e,currentActiveNode:n,event:s}=t;["blur","focusout","focusin","focus"].includes(s.type);const o=N(e),a=o[0],i=o[o.length-1];n===i&&!s.shiftKey&&(s.preventDefault(),a.focus()),n===a&&s.shiftKey&&(s.preventDefault(),i.focus())}export{A as a,S as b,m as e,_ as g,f as s,x as w};

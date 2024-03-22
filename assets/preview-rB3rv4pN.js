function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["./DocsRenderer-K4EAMTCU-CbLvwPbD.js","./iframe-I-CUBaEU.js","./index-HKyOzZPI.js","./react-16-O1BSJ9Bj.js","./index-lJISON2B.js","./index-YiErSYF9.js","./_commonjs-dynamic-modules-h-SxKiO4.js","./extends-dGVwEr9R.js","./index-GCvOZpsZ.js","./assertThisInitialized-4q6YPdh3.js","./inheritsLoose-fS6oVJzb.js","./setPrototypeOf-ahVgEFUp.js","./getPrototypeOf-VcprQjSG.js","./index-YJjKa7sz.js","./index-PPLHz8o0.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{_ as a}from"./iframe-I-CUBaEU.js";import"../sb-preview/runtime.js";const{global:s}=__STORYBOOK_MODULE_GLOBAL__;var _=Object.entries(s.TAGS_OPTIONS??{}).reduce((e,r)=>{let[t,o]=r;return o.excludeFromDocsStories&&(e[t]=!0),e},{}),d={docs:{renderer:async()=>{let{DocsRenderer:e}=await a(()=>import("./DocsRenderer-K4EAMTCU-CbLvwPbD.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]),import.meta.url);return new e},stories:{filter:e=>(e.tags||[]).filter(r=>_[r]).length===0&&!e.parameters.docs?.disable}}};export{d as parameters};

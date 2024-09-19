import{L as c}from"./LogFormat-Bpe5Aqro.js";import"./jsx-runtime-QvtbNqby.js";import"./index-BjzEU6Zr.js";import"./index-kGlasm3i.js";import"./index-CfoIBI3E.js";const i=(()=>{let r="";return[30,90,40,100].forEach(t=>{for(let e=0;e<8;e+=1)r+=`\x1B[${t+e}m${e}  \x1B[0m`;r+=`
`}),r+=`
`,[38,48].forEach(t=>{for(let e=0;e<256;e+=1)r+=`\x1B[${t};5;${e}m${e}  \x1B[0m`,(e+1)%6===4&&(r+=`
`);r+=`
`}),r})(),d=(()=>{const r={bold:1,italic:3,underline:4,conceal:8,cross:9};let t="";return Object.entries(r).forEach(([e,n])=>{t+=`\x1B[${n}m${e}\x1B[0m
`}),t})(),h={component:c,parameters:{themes:{themeOverride:"dark"}},title:"LogFormat"},o={args:{children:i}},a={args:{children:d}},s={args:{children:`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \${IMAGES[@]}))
`}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: ansiColors
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: ansiTextStyles
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: \`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \\\${IMAGES[@]}))
\`
  }
}`,...s.parameters?.docs?.source}}};const k=["Colors","TextStyles","URLDetection"];export{o as Colors,a as TextStyles,s as URLDetection,k as __namedExportsOrder,h as default};

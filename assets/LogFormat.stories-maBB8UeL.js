import{L as m}from"./LogFormat-Bv_ssSfo.js";import"./jsx-runtime-B0wN4eWF.js";import"./index-DS1rTf2F.js";import"./index-CfoIBI3E.js";import"./FormattedDate-BAqjGlH3.js";import"./index-CbuwW4_d.js";import"./index-BLsgEXh-.js";const l=(()=>{const s=[];return[30,90,40,100].forEach(a=>{let t="";for(let e=0;e<8;e+=1)t+=`\x1B[${a+e}m${e}  \x1B[0m`;s.push(t)}),s.push(""),[38,48].forEach(a=>{let t="";for(let e=0;e<256;e+=1)t+=`\x1B[${a};5;${e}m${e}  \x1B[0m`,(e+1)%6===4&&(s.push(t),t="");s.push("")}),s.map(a=>({message:a}))})(),i=Object.entries({bold:1,italic:3,underline:4,conceal:8,cross:9}).map(([t,e])=>({message:`\x1B[${e}m${t}\x1B[0m`})),v={component:m,parameters:{themes:{themeOverride:"dark"}},title:"LogFormat"},o={args:{logs:l}},r={args:{logs:i}},p={args:{logs:`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \${IMAGES[@]}))
`.split(`
`).map(s=>({message:s}))}},n={args:{fields:{level:!0,timestamp:!0},logs:[{timestamp:"2024-11-14T14:10:53.354144861Z",level:"info",message:"Cloning repo"},{timestamp:"2024-11-14T14:10:56.300268594Z",level:"debug",message:"[get_repo_params:30] | get_repo_name called for https://github.com/example-org/example-app. Repository Name identified as example-app"},{timestamp:"2024-11-14T14:10:56.307088791Z",level:"debug",message:"[get_repo_params:18] | get_repo_owner called for https://github.com/example-org/example-app. Repository Owner identified as example-org"},{timestamp:"2024-11-14T14:10:56.815017386Z",level:"debug",message:"[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example-org/example-app in the cache. Attempt to fetch repository parameters."},{timestamp:"2024-11-14T14:10:56.819937688Z",level:"debug",message:"[get_repo_params:39] | get_repo_server_name called for https://github.com/example-org/example-app. Repository Server Name identified as github.com"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:null,message:"Sample with no log level"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:"error",message:"Sample error"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:"warning",message:"Sample warning"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:"notice",message:"Sample notice"},{timestamp:"2024-11-14T14:10:56.869719012Z",command:"group",expanded:!1,message:"Collapsed group"},{timestamp:"2024-11-14T14:10:56.869719012Z",command:"group",expanded:!0,message:"Expanded group"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:"info",isInGroup:!0,message:"First line inside group"},{timestamp:"2024-11-14T14:10:56.869719012Z",level:"debug",isInGroup:!0,message:"Second line inside group"},{timestamp:"2024-11-14T14:10:56.869719012Z",isInGroup:!0,message:"A line with no log level inside a group"}]}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    logs: ansiColors
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    logs: ansiTextStyles
  }
}`,...r.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    logs: \`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \\\${IMAGES[@]}))
\`.split('\\n').map(message => ({
      message
    }))
  }
}`,...p.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    fields: {
      level: true,
      timestamp: true
    },
    logs: [{
      timestamp: '2024-11-14T14:10:53.354144861Z',
      level: 'info',
      message: 'Cloning repo'
    }, {
      timestamp: '2024-11-14T14:10:56.300268594Z',
      level: 'debug',
      message: '[get_repo_params:30] | get_repo_name called for https://github.com/example-org/example-app. Repository Name identified as example-app'
    }, {
      timestamp: '2024-11-14T14:10:56.307088791Z',
      level: 'debug',
      message: '[get_repo_params:18] | get_repo_owner called for https://github.com/example-org/example-app. Repository Owner identified as example-org'
    }, {
      timestamp: '2024-11-14T14:10:56.815017386Z',
      level: 'debug',
      message: '[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example-org/example-app in the cache. Attempt to fetch repository parameters.'
    }, {
      timestamp: '2024-11-14T14:10:56.819937688Z',
      level: 'debug',
      message: '[get_repo_params:39] | get_repo_server_name called for https://github.com/example-org/example-app. Repository Server Name identified as github.com'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: null,
      message: 'Sample with no log level'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: 'error',
      message: 'Sample error'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: 'warning',
      message: 'Sample warning'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: 'notice',
      message: 'Sample notice'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      command: 'group',
      expanded: false,
      message: 'Collapsed group'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      command: 'group',
      expanded: true,
      message: 'Expanded group'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: 'info',
      isInGroup: true,
      message: 'First line inside group'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      level: 'debug',
      isInGroup: true,
      message: 'Second line inside group'
    }, {
      timestamp: '2024-11-14T14:10:56.869719012Z',
      isInGroup: true,
      message: 'A line with no log level inside a group'
    }]
  }
}`,...n.parameters?.docs?.source}}};const f=["Colors","TextStyles","URLDetection","LogLevelsAndTimestamps"];export{o as Colors,n as LogLevelsAndTimestamps,r as TextStyles,p as URLDetection,f as __namedExportsOrder,v as default};

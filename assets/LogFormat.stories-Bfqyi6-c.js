import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./LogFormat-CyWvVSay.js";var r,i,a,o,s,c,l,u;function d(){return(d=e((()=>{t(),r=(()=>{let e=[];return[30,90,40,100].forEach(t=>{let n=``;for(let e=0;e<8;e+=1)n+=`\u001b[${t+e}m${e}  \u001b[0m`;e.push(n)}),e.push(``),[38,48].forEach(t=>{let n=``;for(let r=0;r<256;r+=1)n+=`\u001b[${t};5;${r}m${r}  \u001b[0m`,(r+1)%6==4&&(e.push(n),n=``);e.push(``)}),e.map(e=>({message:e}))})(),i=Object.entries({bold:1,italic:3,underline:4,conceal:8,cross:9}).map(([e,t])=>({message:`\u001b[${t}m${e}\u001b[0m`})),a={component:n,parameters:{themes:{themeOverride:`dark`}},title:`LogFormat`},o={args:{logs:r}},s={args:{logs:i}},c={args:{logs:`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \${IMAGES[@]}))
`.split(`
`).map(e=>({message:e}))}},l={args:{fields:{level:!0,timestamp:!0},logs:[{timestamp:`2024-11-14T14:10:53.354144861Z`,level:`info`,message:`Cloning repo`},{timestamp:`2024-11-14T14:10:56.300268594Z`,level:`debug`,message:`[get_repo_params:30] | get_repo_name called for https://github.com/example-org/example-app. Repository Name identified as example-app`},{timestamp:`2024-11-14T14:10:56.307088791Z`,level:`debug`,message:`[get_repo_params:18] | get_repo_owner called for https://github.com/example-org/example-app. Repository Owner identified as example-org`},{timestamp:`2024-11-14T14:10:56.815017386Z`,level:`debug`,message:`[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example-org/example-app in the cache. Attempt to fetch repository parameters.`},{timestamp:`2024-11-14T14:10:56.819937688Z`,level:`debug`,message:`[get_repo_params:39] | get_repo_server_name called for https://github.com/example-org/example-app. Repository Server Name identified as github.com`},{timestamp:`2024-11-14T14:10:56.819947739Z`,level:`trace`,message:`{ "metric_name": "script_duration", "value": 1234 }`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:null,message:`Sample with no log level`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:`error`,message:`Sample error`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:`warning`,message:`Sample warning`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:`notice`,message:`Sample notice`},{timestamp:`2024-11-14T14:10:56.869719012Z`,command:`group`,expanded:!1,message:`Collapsed group`},{timestamp:`2024-11-14T14:10:56.869719012Z`,command:`group`,expanded:!0,message:`Expanded group`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:`info`,isInGroup:!0,message:`First line inside group`},{timestamp:`2024-11-14T14:10:56.869719012Z`,level:`debug`,isInGroup:!0,message:`Second line inside group`},{timestamp:`2024-11-14T14:10:56.869719012Z`,isInGroup:!0,message:`A line with no log level inside a group`}]}},u=[`Colors`,`TextStyles`,`URLDetection`,`LogLevelsAndTimestamps`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    logs: ansiColors
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    logs: ansiTextStyles
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
      timestamp: '2024-11-14T14:10:56.819947739Z',
      level: 'trace',
      message: '{ "metric_name": "script_duration", "value": 1234 }'
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
}`,...l.parameters?.docs?.source}}}})))()}d();export{o as Colors,l as LogLevelsAndTimestamps,s as TextStyles,c as URLDetection,u as __namedExportsOrder,a as default};
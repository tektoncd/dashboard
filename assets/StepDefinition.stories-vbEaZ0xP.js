import{S as t}from"./StepDefinition-1kj_B2eA.js";import"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import"./index-uZO_dCSX.js";import"./ViewYAML-uiPRJ4iW.js";import"./index-MRYFjIDu.js";import"./index-WkqOPh6Z.js";import"./settings-zSvLtxj8.js";const u={component:t,title:"StepDefinition"},e={},o={args:{definition:{args:["build","-f","${params.pathToDockerFile}","-t","${resources.outputs.builtImage.url}","${params.pathToContext}"],command:["docker"],image:"docker",name:"build",volumeMounts:[{mountPath:"/var/run/docker.sock",name:"docker-socket"}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    definition: {
      args: ['build', '-f', '\${params.pathToDockerFile}', '-t', '\${resources.outputs.builtImage.url}', '\${params.pathToContext}'],
      command: ['docker'],
      image: 'docker',
      name: 'build',
      volumeMounts: [{
        mountPath: '/var/run/docker.sock',
        name: 'docker-socket'
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};const d=["Default","WithContent"];export{e as Default,o as WithContent,d as __namedExportsOrder,u as default};

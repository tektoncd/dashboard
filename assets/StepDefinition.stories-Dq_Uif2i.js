import{S as t}from"./StepDefinition-p1dHpIVX.js";import"./jsx-runtime-B0wN4eWF.js";import"./index-DS1rTf2F.js";import"./index-BLsgEXh-.js";import"./index-CbuwW4_d.js";import"./ViewYAML-BQtIWtmr.js";import"./index-CvulwabO.js";import"./index-CfoIBI3E.js";import"./usePrefix-DVhi0s40.js";const d={component:t,title:"StepDefinition"},o={},e={args:{definition:{args:["build","-f","${params.pathToDockerFile}","-t","${resources.outputs.builtImage.url}","${params.pathToContext}"],command:["docker"],image:"docker",name:"build",volumeMounts:[{mountPath:"/var/run/docker.sock",name:"docker-socket"}]}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};const l=["Default","WithContent"];export{o as Default,e as WithContent,l as __namedExportsOrder,d as default};

import{S as t}from"./StepDefinition-Tt2E7LMh.js";import"./jsx-runtime-CSYIdwKN.js";import"./index-BUz8uDZe.js";import"./index-j5XA6xUc.js";import"./index-CKzEcgge.js";import"./ViewYAML-B44mWFRd.js";import"./index-ByVX7Zjn.js";import"./index-CfoIBI3E.js";import"./usePrefix-CM90x8zf.js";const d={component:t,title:"StepDefinition"},o={},e={args:{definition:{args:["build","-f","${params.pathToDockerFile}","-t","${resources.outputs.builtImage.url}","${params.pathToContext}"],command:["docker"],image:"docker",name:"build",volumeMounts:[{mountPath:"/var/run/docker.sock",name:"docker-socket"}]}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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

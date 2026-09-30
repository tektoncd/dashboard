import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./StepDefinition-D58oDsKG.js";var r,i,a,o;function s(){return(s=e((()=>{t(),r={component:n,title:`StepDefinition`},i={},a={args:{definition:{args:[`build`,`-f`,"${params.pathToDockerFile}",`-t`,"${resources.outputs.builtImage.url}","${params.pathToContext}"],command:[`docker`],image:`docker`,name:`build`,volumeMounts:[{mountPath:`/var/run/docker.sock`,name:`docker-socket`}]}}},o=[`Default`,`WithContent`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}}})))()}s();export{i as Default,a as WithContent,o as __namedExportsOrder,r as default};
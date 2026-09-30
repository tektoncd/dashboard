import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{n,t as r}from"./TaskRunDetails-DVFcVDpT.js";function i(e){let[,t]=o();return(0,a.jsx)(r,{...e,onViewChange:e=>t({view:e})})}var a,o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),a=t(),{useArgs:o}=__STORYBOOK_MODULE_PREVIEW_API__,s=[{name:`k`,value:`v`}],c=[{name:`message`,value:`hello`}],l={events:[{metadata:{name:`guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4`,namespace:`test`,uid:`0f4218f0-270a-408d-b5bd-56fc35dda853`,resourceVersion:`2047658`,creationTimestamp:`2022-10-27T13:27:54Z`},involvedObject:{kind:`Pod`,namespace:`test`,name:`guarded-pr-vkm6w-check-file-pod`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,apiVersion:`v1`,resourceVersion:`2047624`},reason:`Scheduled`,message:`Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane`,"…":``},{metadata:{name:`guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7`,namespace:`test`,uid:`d1c8e367-66d1-4cd7-a04b-e49bdf9f322e`,resourceVersion:`2047664`,creationTimestamp:`2022-10-27T13:27:54Z`},involvedObject:{kind:`Pod`,namespace:`test`,name:`guarded-pr-vkm6w-check-file-pod`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,apiVersion:`v1`,resourceVersion:`2047657`,fieldPath:`spec.initContainers{prepare}`},reason:`Pulled`,message:`Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine`,"…":``}],resource:{kind:`Pod`,apiVersion:`v1`,metadata:{name:`some-pod-name`,namespace:`test`,uid:`939a4823-2203-4b5a-8c00-6a2c9f15549d`,resourceVersion:`2047732`,creationTimestamp:`2022-10-27T13:27:49Z`},spec:{"…":``}}},u={metadata:{name:`my-task`,namespace:`my-namespace`,uid:`my-task`},spec:{params:s,taskSpec:{params:[{name:s[0].name,description:`A useful description of the param…`}],results:[{name:c[0].name,description:`A useful description of the result…`}]}},status:{completionTime:`2021-03-03T15:25:34Z`,podName:`my-task-h7d6j-pod-pdtb7`,startTime:`2021-03-03T15:25:27Z`,results:c}},d={...u,status:{...u.status,conditions:[{reason:`Succeeded`,status:`True`,type:`Succeeded`}],steps:[{name:`build`,terminated:{exitCode:1,reason:`Completed`}}]}},f={component:r,title:`TaskRunDetails`},p={args:{logs:`Sample log output`,taskRun:u,view:`logs`},render:i},m={args:{logs:`Command completed with a warning exit code.`,taskRun:d,view:`logs`},render:i},h={args:{pod:l,taskRun:{metadata:{name:`my-task`,uid:`my-task`},spec:{},status:{completionTime:`2021-03-03T15:25:34Z`,podName:`my-task-h7d6j-pod-pdtb7`,startTime:`2021-03-03T15:25:27Z`}},view:`pod`},render:i},g={args:{logs:`This step did not run as the task was skipped. See status for more details.`,skippedTask:{reason:`When Expressions evaluated to false`,whenExpressions:[{cel:`'yes'=='missing'`}]},taskRun:u,view:`logs`},render:i},_=[`Default`,`WithWarning`,`Pod`,`Skipped`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    logs: 'Sample log output',
    taskRun,
    view: 'logs'
  },
  render: renderStory
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    logs: 'Command completed with a warning exit code.',
    taskRun: taskRunWithWarning,
    view: 'logs'
  },
  render: renderStory
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    pod,
    taskRun: {
      metadata: {
        name: 'my-task',
        uid: 'my-task'
      },
      spec: {},
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        startTime: '2021-03-03T15:25:27Z'
      }
    },
    view: 'pod'
  },
  render: renderStory
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    logs: 'This step did not run as the task was skipped. See status for more details.',
    skippedTask: {
      reason: 'When Expressions evaluated to false',
      whenExpressions: [{
        cel: \`'yes'=='missing'\`
      }]
    },
    taskRun,
    view: 'logs'
  },
  render: renderStory
}`,...g.parameters?.docs?.source}}}})))()}v();export{p as Default,h as Pod,g as Skipped,m as WithWarning,_ as __namedExportsOrder,f as default};
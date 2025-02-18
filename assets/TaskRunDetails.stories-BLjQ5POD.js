import{j as d}from"./jsx-runtime-B0wN4eWF.js";import{T as i}from"./TaskRunDetails-DoflBmZC.js";import"./index-DS1rTf2F.js";import"./index-BLsgEXh-.js";import"./index-CvulwabO.js";import"./index-CbuwW4_d.js";import"./index-CfoIBI3E.js";import"./usePrefix-DVhi0s40.js";import"./index-CLdR1d0e.js";import"./index-Cn2DnnuS.js";import"./index-CTl86HqP.js";import"./index-yR6ZHKQV.js";import"./index-7UTgOZSF.js";import"./Text-9nRGETFr.js";import"./keys-fZP-1wUt.js";import"./index-mhCn_TNf.js";import"./Tooltip-wylFaEsh.js";import"./index-DN2bqo_D.js";import"./mergeRefs-CTUecegF.js";import"./bucket-12-DVDhO4p7.js";import"./Icon-Dlg6_ItC.js";import"./wrapFocus-Cvvm2ck9.js";import"./noopFn-g4z370MD.js";import"./index-BIJfH8ZR.js";import"./events-OVwOsPzJ.js";import"./Tabs-4y_hjRYw.js";import"./useControllableState-BPNuw5M3.js";import"./bucket-3-igrvqujs.js";import"./debounce-DBudwqRe.js";import"./ViewYAML-BQtIWtmr.js";import"./Table-C546lFM3.js";import"./Button-DXQXyzWq.js";import"./index-DhdmMkKS.js";import"./bucket-0-B3IHR_5I.js";import"./requiredIfGivenPropIsTruthy-CU7JwK8h.js";import"./Search-C-UQoaUd.js";import"./FormContext-D3yeToZb.js";import"./bucket-14-DcJR6G3p.js";import"./bucket-15-DETD0dec.js";import"./DetailsHeader-B1o2hUA4.js";import"./StatusIcon-CsvDFwWU.js";import"./bucket-17-Dfp7XseK.js";import"./Spinner-DYuuIb8Y.js";import"./bucket-18-D1v83Eua.js";import"./constants-CJ-WDauL.js";import"./FormattedDuration-hz7jymot.js";import"./bucket-9-CFGufIsT.js";const{useArgs:c}=__STORYBOOK_MODULE_PREVIEW_API__,u="k",l="v",m=[{name:u,value:l}],p=[{name:"message",value:"hello"}],ie={component:i,title:"TaskRunDetails"},n={args:{taskRun:{metadata:{name:"my-task",namespace:"my-namespace"},spec:{params:m,taskSpec:{params:[{name:m[0].name,description:"A useful description of the param…"}],results:[{name:p[0].name,description:"A useful description of the result…"}]}},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",startTime:"2021-03-03T15:25:27Z",results:p}}},render:e=>{const[,a]=c();return d.jsx(i,{...e,onViewChange:s=>a({view:s})})}},r={args:{taskRun:{metadata:{name:"my-task",namespace:"my-namespace"},spec:{params:m},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",conditions:[{reason:"Succeeded",status:"True",type:"Succeeded"}],steps:[{terminated:{exitCode:1,reason:"Completed"}}],startTime:"2021-03-03T15:25:27Z",results:p}}},render:e=>{const[,a]=c();return d.jsx(i,{...e,onViewChange:s=>a({view:s})})}},t={args:{pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},taskRun:{metadata:{name:"my-task"},spec:{},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",startTime:"2021-03-03T15:25:27Z"}}},render:e=>{const[,a]=c();return d.jsx(i,{...e,onViewChange:s=>a({view:s})})}},o={args:{...t.args,skippedTask:{reason:"When Expressions evaluated to false",whenExpressions:[{cel:"'yes'=='missing'"}]}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    taskRun: {
      metadata: {
        name: 'my-task',
        namespace: 'my-namespace'
      },
      spec: {
        params,
        taskSpec: {
          params: [{
            name: params[0].name,
            description: 'A useful description of the param…'
          }],
          results: [{
            name: results[0].name,
            description: 'A useful description of the result…'
          }]
        }
      },
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        startTime: '2021-03-03T15:25:27Z',
        results
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskRunDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    taskRun: {
      metadata: {
        name: 'my-task',
        namespace: 'my-namespace'
      },
      spec: {
        params
      },
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        conditions: [{
          reason: 'Succeeded',
          status: 'True',
          type: 'Succeeded'
        }],
        steps: [{
          terminated: {
            exitCode: 1,
            reason: 'Completed'
          }
        }],
        startTime: '2021-03-03T15:25:27Z',
        results
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskRunDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    pod: {
      events: [{
        metadata: {
          name: 'guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4',
          namespace: 'test',
          uid: '0f4218f0-270a-408d-b5bd-56fc35dda853',
          resourceVersion: '2047658',
          creationTimestamp: '2022-10-27T13:27:54Z'
        },
        involvedObject: {
          kind: 'Pod',
          namespace: 'test',
          name: 'guarded-pr-vkm6w-check-file-pod',
          uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
          apiVersion: 'v1',
          resourceVersion: '2047624'
        },
        reason: 'Scheduled',
        message: 'Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane',
        '…': ''
      }, {
        metadata: {
          name: 'guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7',
          namespace: 'test',
          uid: 'd1c8e367-66d1-4cd7-a04b-e49bdf9f322e',
          resourceVersion: '2047664',
          creationTimestamp: '2022-10-27T13:27:54Z'
        },
        involvedObject: {
          kind: 'Pod',
          namespace: 'test',
          name: 'guarded-pr-vkm6w-check-file-pod',
          uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
          apiVersion: 'v1',
          resourceVersion: '2047657',
          fieldPath: 'spec.initContainers{prepare}'
        },
        reason: 'Pulled',
        message: 'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',
        '…': ''
      }],
      resource: {
        kind: 'Pod',
        apiVersion: 'v1',
        metadata: {
          name: 'some-pod-name',
          namespace: 'test',
          uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
          resourceVersion: '2047732',
          creationTimestamp: '2022-10-27T13:27:49Z'
        },
        spec: {
          '…': ''
        }
      }
    },
    taskRun: {
      metadata: {
        name: 'my-task'
      },
      spec: {},
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        startTime: '2021-03-03T15:25:27Z'
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskRunDetails {...args} onViewChange={selectedView => updateArgs({
      view: selectedView
    })} />;
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Pod.args,
    skippedTask: {
      reason: 'When Expressions evaluated to false',
      whenExpressions: [{
        cel: \`'yes'=='missing'\`
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};const me=["Default","WithWarning","Pod","Skipped"];export{n as Default,t as Pod,o as Skipped,r as WithWarning,me as __namedExportsOrder,ie as default};

import{T as r}from"./TaskRunDetails-FJMnVKJf.js";import"./jsx-runtime-HUm0hl9X.js";import"./index-HKyOzZPI.js";import"./index-MRYFjIDu.js";import"./index-uZO_dCSX.js";import"./index-WkqOPh6Z.js";import"./settings-zSvLtxj8.js";import"./extends-dGVwEr9R.js";import"./unsupportedIterableToArray-6HFs0nJu.js";import"./objectWithoutPropertiesLoose-9Q1jwsKS.js";import"./possibleConstructorReturn-2JYOJJsv.js";import"./setPrototypeOf-ahVgEFUp.js";import"./assertThisInitialized-4q6YPdh3.js";import"./getPrototypeOf-VcprQjSG.js";import"./index-U9QwFHm3.js";import"./deprecate-hcs7xc4A.js";import"./events-ZBveWIsY.js";import"./match-bSaK7Hln.js";import"./navigation-fv4tXnKy.js";import"./Tabs-qbQZOPvG.js";import"./index-7Q--xhFC.js";import"./slicedToArray-MNgqcm8y.js";import"./useIsomorphicEffect-Y2lYA90t.js";import"./index-n80ymgmT.js";import"./useId-J3cPtmMT.js";import"./setupGetInstanceId-vqAyjREf.js";import"./useMergedRefs-0i-7LjaH.js";import"./bucket-5-mAOIXUdD.js";import"./Icon-9ecdf98c-XZbtWap5.js";import"./Tooltip-mZp08mPb.js";import"./FloatingMenu-d5eX8xYS.js";import"./index-lJISON2B.js";import"./toConsumableArray-ZcblzY6P.js";import"./mergeRefs-Zi_35mDS.js";import"./isRequiredOneOf-qeCNFKMo.js";import"./bucket-17-g9LR_0Im.js";import"./ViewYAML-uiPRJ4iW.js";import"./Table-Mam_RXbH.js";import"./Button-HUe_pxfK.js";import"./index-HaCShj3n.js";import"./AriaPropTypes-1IBRuLX5.js";import"./bucket-0-7b2b0LPX.js";import"./Text--uoqbMaE.js";import"./requiredIfGivenPropIsTruthy-0WXqL08H.js";import"./index-_EeHE9S1.js";import"./index-39-lBfQL.js";import"./bucket-6-dQ54tAAx.js";import"./DataTableSkeleton-TOArWwz2.js";import"./DetailsHeader-mymHQUEI.js";import"./FormattedDuration-IgQos6RL.js";import"./StatusIcon-qrSsKqPY.js";import"./bucket-31-qnmMSxzE.js";import"./Spinner-qYFnY_Hx.js";import"./bucket-25-O-KA0EH0.js";import"./bucket-34-ngKLiAY2.js";const o="k",m="v",t=[{name:o,value:m}],s=[{name:"message",value:"hello"}],pe={component:r,title:"TaskRunDetails"},e={args:{taskRun:{metadata:{name:"my-task",namespace:"my-namespace"},spec:{params:t,taskSpec:{params:[{name:t[0].name,description:"A useful description of the param…"}],results:[{name:s[0].name,description:"A useful description of the result…"}]}},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",startTime:"2021-03-03T15:25:27Z",results:s}}}},a={args:{taskRun:{metadata:{name:"my-task",namespace:"my-namespace"},spec:{params:t},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",conditions:[{reason:"Succeeded",status:"True",type:"Succeeded"}],steps:[{terminated:{exitCode:1,reason:"Completed"}}],startTime:"2021-03-03T15:25:27Z",results:s}}}},n={args:{pod:{events:[{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4",namespace:"test",uid:"0f4218f0-270a-408d-b5bd-56fc35dda853",resourceVersion:"2047658",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047624"},reason:"Scheduled",message:"Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane","…":""},{metadata:{name:"guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7",namespace:"test",uid:"d1c8e367-66d1-4cd7-a04b-e49bdf9f322e",resourceVersion:"2047664",creationTimestamp:"2022-10-27T13:27:54Z"},involvedObject:{kind:"Pod",namespace:"test",name:"guarded-pr-vkm6w-check-file-pod",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",apiVersion:"v1",resourceVersion:"2047657",fieldPath:"spec.initContainers{prepare}"},reason:"Pulled",message:'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',"…":""}],resource:{kind:"Pod",apiVersion:"v1",metadata:{name:"some-pod-name",namespace:"test",uid:"939a4823-2203-4b5a-8c00-6a2c9f15549d",resourceVersion:"2047732",creationTimestamp:"2022-10-27T13:27:49Z"},spec:{"…":""}}},taskRun:{metadata:{name:"my-task"},spec:{},status:{completionTime:"2021-03-03T15:25:34Z",podName:"my-task-h7d6j-pod-pdtb7",startTime:"2021-03-03T15:25:27Z"}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
  }
}`,...n.parameters?.docs?.source}}};const de=["Default","WithWarning","Pod"];export{e as Default,n as Pod,a as WithWarning,de as __namedExportsOrder,pe as default};

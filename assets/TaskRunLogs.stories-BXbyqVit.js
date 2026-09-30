import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{n,t as r}from"./TaskRunLogs-C3bEEtNC.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{n(),i=t(),{action:a}=__STORYBOOK_MODULE_ACTIONS__,{useArgs:o}=__STORYBOOK_MODULE_PREVIEW_API__,s={component:r,title:`TaskRunLogs`},c={expandedSteps:{},getLogContainer:()=>(0,i.jsx)(`pre`,{children:`[2025-01-01 10:00:00] Starting step…
[2025-01-01 10:00:01] Processing files…
${Array.from({length:50},(e,t)=>`[2025-01-01 10:00:02] ${t}`).join(`
`)}
[2025-01-01 10:00:05] Step completed successfully`}),ignoredSidecars:{},onStepSelected:a(`onStepSelected`),selectedRetry:0,selectedTaskId:`task-1`,skippedTask:!1,task:{spec:{steps:[{args:[`build`,`-f`,"${params.pathToDockerFile}",`-t`,"${resources.outputs.builtImage.url}","${params.pathToContext}"],command:[`docker`],image:`docker`,name:`build`,volumeMounts:[{mountPath:`/var/run/docker.sock`,name:`docker-socket`}]}]}}},l={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`build`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:05:30Z`}}]}}}},u={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`clone`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:01:00Z`}},{name:`build`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:01:00Z`,finishedAt:`2025-01-01T10:05:30Z`}},{name:`test`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:05:30Z`,finishedAt:`2025-01-01T10:06:00Z`}}]}}},render:e=>{let[,t]=o();return(0,i.jsx)(r,{...e,onStepSelected:({isOpen:n,selectedStepId:r})=>t({expandedSteps:{...e.expandedSteps,[r]:n}})})}},d={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`clone`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:01:00Z`}},{name:`build`,running:{startedAt:`2025-01-01T10:01:00Z`}},{name:`test`,waiting:{}}]}}}},f={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`clone`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:01:00Z`}},{name:`build`,terminated:{exitCode:1,reason:`Error`,startedAt:`2025-01-01T10:01:00Z`,finishedAt:`2025-01-01T10:01:30Z`}}]}}}},p={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`build`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:05:30Z`}}],sidecars:[{name:`logging`,running:{startedAt:`2025-01-01T10:00:00Z`}},{name:`monitoring`,running:{startedAt:`2025-01-01T10:00:00Z`}}]}}},render:e=>{let[,t]=o();return(0,i.jsx)(r,{...e,onStepSelected:({isOpen:n,selectedStepId:r})=>t({expandedSteps:{...e.expandedSteps,[r]:n}})})}},m={args:{...c,ignoredSidecars:{monitoring:!0},taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`build`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:05:30Z`}}],sidecars:[{name:`logging`,running:{startedAt:`2025-01-01T10:00:00Z`}},{name:`monitoring`,running:{startedAt:`2025-01-01T10:00:00Z`}}]}}}},h={args:{...c,taskRun:{metadata:{name:`taskrun-1`},status:{}}}},g={args:{...c,skippedTask:!0,taskRun:{metadata:{name:`taskrun-1`},status:{steps:[]}}}},_={args:{...c,expandedSteps:{build:!0},taskRun:{metadata:{name:`taskrun-1`},status:{steps:[{name:`build`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:00:00Z`,finishedAt:`2025-01-01T10:05:30Z`}},{name:`test`,terminated:{exitCode:0,reason:`Completed`,startedAt:`2025-01-01T10:05:30Z`,finishedAt:`2025-01-01T10:06:00Z`}}]}}}},v=[`SingleStep`,`MultipleSteps`,`WithRunningStep`,`WithFailedStep`,`WithSidecars`,`WithIgnoredSidecars`,`NoStepsAvailable`,`SkippedTask`,`WithExpandedStep`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'build',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:05:30Z'
          }
        }]
      }
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'clone',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:01:00Z'
          }
        }, {
          name: 'build',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:01:00Z',
            finishedAt: '2025-01-01T10:05:30Z'
          }
        }, {
          name: 'test',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:05:30Z',
            finishedAt: '2025-01-01T10:06:00Z'
          }
        }]
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskRunLogs {...args} onStepSelected={({
      isOpen,
      selectedStepId: stepId
    }) => updateArgs({
      expandedSteps: {
        ...args.expandedSteps,
        [stepId]: isOpen
      }
    })} />;
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'clone',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:01:00Z'
          }
        }, {
          name: 'build',
          running: {
            startedAt: '2025-01-01T10:01:00Z'
          }
        }, {
          name: 'test',
          waiting: {}
        }]
      }
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'clone',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:01:00Z'
          }
        }, {
          name: 'build',
          terminated: {
            exitCode: 1,
            reason: 'Error',
            startedAt: '2025-01-01T10:01:00Z',
            finishedAt: '2025-01-01T10:01:30Z'
          }
        }]
      }
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'build',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:05:30Z'
          }
        }],
        sidecars: [{
          name: 'logging',
          running: {
            startedAt: '2025-01-01T10:00:00Z'
          }
        }, {
          name: 'monitoring',
          running: {
            startedAt: '2025-01-01T10:00:00Z'
          }
        }]
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return <TaskRunLogs {...args} onStepSelected={({
      isOpen,
      selectedStepId: stepId
    }) => updateArgs({
      expandedSteps: {
        ...args.expandedSteps,
        [stepId]: isOpen
      }
    })} />;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    ignoredSidecars: {
      monitoring: true
    },
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'build',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:05:30Z'
          }
        }],
        sidecars: [{
          name: 'logging',
          running: {
            startedAt: '2025-01-01T10:00:00Z'
          }
        }, {
          name: 'monitoring',
          running: {
            startedAt: '2025-01-01T10:00:00Z'
          }
        }]
      }
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {}
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    skippedTask: true,
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: []
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...baseProps,
    expandedSteps: {
      build: true
    },
    taskRun: {
      metadata: {
        name: 'taskrun-1'
      },
      status: {
        steps: [{
          name: 'build',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:00:00Z',
            finishedAt: '2025-01-01T10:05:30Z'
          }
        }, {
          name: 'test',
          terminated: {
            exitCode: 0,
            reason: 'Completed',
            startedAt: '2025-01-01T10:05:30Z',
            finishedAt: '2025-01-01T10:06:00Z'
          }
        }]
      }
    }
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{u as MultipleSteps,h as NoStepsAvailable,l as SingleStep,g as SkippedTask,_ as WithExpandedStep,f as WithFailedStep,m as WithIgnoredSidecars,d as WithRunningStep,p as WithSidecars,v as __namedExportsOrder,s as default};
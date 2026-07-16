import React from 'react';
import StatusIcon from '../StatusIcon';
import { PendingFilled } from '@carbon/react/icons';


export default function HorizontalPipeline({
  taskRuns = [],
  selectedTaskId,
  onSelect
}) {
  if (!taskRuns.length) {
    return null;
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        padding: '20px',
        marginBottom: '25px',
        gap: '0'
      }}
    >
      {taskRuns.map((taskRun, index) => {
        const taskName =
          taskRun.metadata.labels?.['tekton.dev/pipelineTask'] ||
          taskRun.metadata.name;

        const duration =
          taskRun.status?.completionTime && taskRun.status?.startTime
            ? Math.round(
                (new Date(taskRun.status.completionTime) -
                  new Date(taskRun.status.startTime)) /
                  1000
              )
            : '-';

const reason = taskRun.status?.conditions?.[0]?.reason;
const status = taskRun.status?.conditions?.[0]?.status;

let label = reason || 'Pending';
let color = '#8d8d8d';

if (reason === 'Succeeded') {
  color = '#24a148';
} else if (reason === 'Failed') {
  color = '#da1e28';
} else if (status === 'Unknown') {
  color = '#f1c21b';
  label = 'Running';
}

        return (
          <React.Fragment key={taskRun.metadata.uid}>
            <div
              onClick={() =>
                onSelect({
                  selectedTaskId: taskName,
                  taskRunName: taskRun.metadata.name
                })
              }
              style={{
                minWidth: 180,
                padding: 15,
                borderRadius: 10,
                border: selectedTaskId === taskName
                  ? '2px solid #0f62fe'
                  : '1px solid #dcdcdc',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,.08)'
              }}
>

<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 8
  }}
>
  <StatusIcon
    DefaultIcon={props => <PendingFilled size={20} {...props} />}
    reason={reason}
    status={status}
  />

  <span>{taskName}</span>
</div>



	      <div
		style={{
                color,
                fontSize: 13,
                fontWeight: 500
               }}
              >
                {label}
	      </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  color: '#777'
                }}
              >
                {duration}s
              </div>
            </div>

            {index !== taskRuns.length - 1 && (
              <div
                style={{
                  fontSize: 34,
                  margin: '0 18px',
                  color: '#888'
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

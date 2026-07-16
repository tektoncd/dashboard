import { Tile } from '@carbon/react';

export default function PipelineSummary({
  pipelineRun,
  taskRuns = [],
  duration
}) {
  const passed = taskRuns.filter(
    t => t.status?.conditions?.[0]?.status === 'True'
  ).length;

  const failed = taskRuns.filter(
    t => t.status?.conditions?.[0]?.status === 'False'
  ).length;

  const running = taskRuns.filter(
    t => !t.status?.completionTime && t.status?.startTime
  ).length;

  return (
    <Tile className="tkn--pipeline-summary">
      <h4>{pipelineRun?.metadata?.name}</h4>

      <div>Status: {pipelineRun?.status?.conditions?.[0]?.reason}</div>

      <div>Duration: {duration}</div>

      <div>
        Passed: {passed} | Failed: {failed} | Running: {running}
      </div>
    </Tile>
  );
}

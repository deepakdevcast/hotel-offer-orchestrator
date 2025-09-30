import { Worker } from '@temporalio/worker';
import * as activities from './activities/hotelActivities';
import { hotelWorkflow } from './workflows/hotelWorkflow';
import { config } from './config';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows/hotelWorkflow'),
    activities,
    taskQueue: 'hotel-orchestrator-queue',
  });

  console.log('Temporal worker started');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});

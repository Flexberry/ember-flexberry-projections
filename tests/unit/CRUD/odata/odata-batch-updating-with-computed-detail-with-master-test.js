import executeTest from './execute-odata-test';
import batchUpdating from '../base/base-batch-updating-with-computed-detail-with-master-test';

executeTest('batchUpdatingWhithComputedDetailWithMasterTest', (store, assert) => {
  batchUpdating(store, assert);
});

import executeTest from './execute-offline-test';
import batchReadingFunctions from '../base/base-batch-reading-test';

executeTest('reading | batch reading', (store, assert) => {
  batchReadingFunctions(store, assert);
});

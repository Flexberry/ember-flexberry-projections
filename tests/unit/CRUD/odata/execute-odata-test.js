import Ember from 'ember';
import { module, skip, test } from 'qunit';
import OnlineStore from 'ember-flexberry-data/stores/online-store';

import { Adapter, Projection } from 'ember-flexberry-data';

import startApp from '../../../helpers/start-app';
import config from '../../../../../dummy/config/environment';

import { clearOnlineData } from '../../../helpers/clear-data';

const skipTestNames = [
  'reading | restrictions | odata functions',
];

export default function executeTest(testName, callback) {
  if (config.APP.testODataService) {
    let baseUrl;
    if (config.APP.testODataServiceURL.indexOf('http') >= 0) {
      baseUrl = config.APP.testODataServiceURL;
    } else {
      baseUrl = 'http://localhost:6500/odata';
    }

    const app = startApp();
    const store = app.__container__.lookup('service:store');
    let onlineStore = OnlineStore.reopen(Projection.StoreMixin).create(app.__container__.ownerInjection());
    store.set('onlineStore', onlineStore);

    // Override store.unloadAll method.
    const originalUnloadAll = store.unloadAll;
    store.unloadAll = function() {
      originalUnloadAll.apply(store, arguments);

      // Clean up type maps otherwise internal models won't be cleaned from stores,
      // and it will cause some exceptions related to store's internal-models statuses.
      Ember.A([store, store.get('onlineStore'), store.get('offlineStore')]).forEach((s) => {
        Ember.set(s, 'typeMaps', {});
      });
    };

    // Define OData-adapter as default adapter for online store.
    const adapter = Adapter.Odata.create(app.__container__.ownerInjection());
    Ember.set(adapter, 'host', baseUrl);
    Ember.set(adapter, 'store', store);
    store.get('onlineStore').reopen({
      adapterFor() {

        return adapter;
      }
    });

    module('CRUD | odata-' + testName);

    if (skipTestNames.indexOf(testName) > -1) {
      skip(testName, (assert) => clearOnlineData(store).then(() => callback(store, assert, app)));
    } else {
      test(testName, (assert) => clearOnlineData(store).then(() => callback(store, assert, app)));
    }
  }
}

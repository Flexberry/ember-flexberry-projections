import Ember from 'ember';
import { module, test } from 'qunit';
import config from 'dummy/config/environment';
import startApp from 'dummy/tests/helpers/start-app';
import { Adapter } from 'ember-flexberry-data';

if (config.APP.testODataService) {
  let App;
  let store;
  let odataAdapter;

  let baseUrl = null;
  if (config.APP.testODataServiceURL.indexOf('http') >= 0) {
    let index = config.APP.testODataServiceURL.lastIndexOf('/');
    if (index !== config.APP.testODataServiceURL.length - 1) {
      baseUrl = config.APP.testODataServiceURL;
    } else {
      baseUrl = config.APP.testODataServiceURL.slice(0, -1);
    }
  }

  module('Integration | Adapter | odata', {
    beforeEach() {
      App = startApp();
      App.register('adapter:application', Adapter.Odata.extend({ host: baseUrl }));

      store = App.__container__.lookup('service:store');
      odataAdapter = store.adapterFor('application');
    },

    afterEach() {
      Ember.run(App, 'destroy');
    },
  });

  test('check method returns typed result', function(assert) {
    let done = assert.async();

    Ember.run(() => {
       odataAdapter.callAction({
        actionName: 'ODataTestTypedResult',
        data: null,
        store: store,
        modelName: 'ember-flexberry-dummy-application-user',
        url: baseUrl
      })
      .then((records) => {
        assert.equal(records.length, 3);
        assert.equal(records[0].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[0], 'name'), 'TestName1');
        assert.equal(Ember.get(records[0], 'eMail'), 'TestEmail1');
        assert.equal(records[1].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[1], 'name'), 'TestName2');
        assert.equal(Ember.get(records[1], 'eMail'), 'TestEmail2');
        assert.equal(records[2].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[2], 'name'), 'TestName3');
        assert.equal(Ember.get(records[2], 'eMail'), 'TestEmail3');
      })
      .finally(done);     
    });
  });

  test('check method returns not typed result', function(assert) {
    let done = assert.async();

    Ember.run(() => {
       odataAdapter.callAction({
        actionName: 'ODataTestNotTypedResult',
        data: null,
        store: store,
        modelName: 'ember-flexberry-dummy-application-user',
        url: baseUrl
      })
      .then((records) => {
        assert.equal(records.length, 3);
        assert.equal(records[0].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[0], 'name'), 'TestName1');
        assert.equal(Ember.get(records[0], 'eMail'), 'TestEmail1');
        assert.equal(records[1].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[1], 'name'), 'TestName2');
        assert.equal(Ember.get(records[1], 'eMail'), 'TestEmail2');
        assert.equal(records[2].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[2], 'name'), 'TestName3');
        assert.equal(Ember.get(records[2], 'eMail'), 'TestEmail3');
      })
      .finally(done);     
    });
  });

  test('check method returns multy typed result', function(assert) {
    let done = assert.async();
    let applicationSerializer = store.serializerFor('application');
    Ember.set(applicationSerializer, 'primaryKey', '__PrimaryKey');

    Ember.run(() => {
       odataAdapter.callAction({
        actionName: 'ODataTestMultyTypedResult',
        data: null,
        store: store,
        modelName: 'model',
        url: baseUrl
      })
      .then((records) => {
        assert.equal(records.length, 3);
        assert.equal(records[0].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[0], 'name'), 'TestUserName');
        assert.equal(Ember.get(records[0], 'eMail'), 'TestUserEmail');
        assert.equal(records[1].constructor.modelName, 'ember-flexberry-dummy-suggestion');
        assert.equal(Ember.get(records[1], 'address'), 'TestSuggestionAddress');
        assert.equal(Ember.get(records[1], 'text'), 'TestSuggestionText');
        assert.equal(records[2].constructor.modelName, 'ember-flexberry-dummy-suggestion-type');
        assert.equal(Ember.get(records[2], 'name'), 'TestSuggestionTypeName');
      })
      .finally(done);     
    });
  });

  test('check method returns multy typed linked result', function(assert) {
    let done = assert.async();
    let applicationSerializer = store.serializerFor('application');
    Ember.set(applicationSerializer, 'primaryKey', '__PrimaryKey');

    Ember.run(() => {
       odataAdapter.callAction({
        actionName: 'ODataTestMultyTypedWithLinksResult',
        data: null,
        store: store,
        modelName: 'model',
        url: baseUrl
      })
      .then((records) => {
        // OData actions not return masters yet.
        assert.equal(records.length, 2);
        assert.equal(records[0].constructor.modelName, 'ember-flexberry-dummy-application-user');
        assert.equal(Ember.get(records[0], 'name'), 'TestUserName');
        assert.equal(Ember.get(records[0], 'eMail'), 'TestUserEmail');
        assert.equal(records[1].constructor.modelName, 'ember-flexberry-dummy-suggestion');
        assert.equal(Ember.get(records[1], 'address'), 'TestSuggestionAddress');
        assert.equal(Ember.get(records[1], 'text'), 'TestSuggestionText');
      })
      .finally(done);     
    });
  });

  test('check method throws exception when model is not defined', function(assert) {
    Ember.run(() => {
       assert.throws(
         odataAdapter.callAction({
        actionName: 'ODataTestTypedResult',
        data: null,
        store: store,
        modelName: null,
        url: baseUrl
      }));     
    });
  });
}

import Ember from 'ember';
import DS from 'ember-data';
import Dexie from 'npm:dexie';
import { moduleFor, skip, test } from 'ember-qunit';
import { Adapter, Query, } from 'ember-flexberry-data';
import config from 'dummy/config/environment';
import startApp from 'dummy/tests/helpers/start-app';

if (config.APP.testODataService) {
  let App;
  let baseUrl = null;
  if (config.APP.testODataServiceURL.indexOf('http') >= 0) {
    let index = config.APP.testODataServiceURL.lastIndexOf('/');
    if (index !== config.APP.testODataServiceURL.length - 1) {
      baseUrl = config.APP.testODataServiceURL;
    } else {
      baseUrl = config.APP.testODataServiceURL.slice(0, -1);
    }
  }

  moduleFor('service:syncer', 'Integration | Service | syncer', {
    needs: [
      'model:ember-flexberry-dummy-application-user',
    ],

    beforeEach(assert) {
      let done = assert.async();
      Dexie.delete('TestDB').then(() => {
        App = startApp();
        App.register('adapter:application', Adapter.Odata.extend({ host: baseUrl }));
        done();
      });
    },

    afterEach() {
      Ember.run(App, 'destroy');
    },
  });

  test('create and sync without audit', function(assert) {
    runTest(App, 2, assert, (store, syncer, done) => {
      syncer.set('auditEnabled', false);
      store.get('offlineGlobals').setOnlineAvailable(false);
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then((user) => {
        user.set('name', 'SuperMan');
        user.set('eMail', 'super.man@example.com');
        return user.save().then(() => {
          store.get('offlineGlobals').setOnlineAvailable(true);
          return syncer.syncUp().then((result) => {
            assert.equal(result, 1, 'Only one operation was executed.');
            let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
              .selectByProjection('ApplicationUserE')
              .byId(user.get('id'));
            return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
              assert.equal(onlineRecord.get('name'), 'SuperMan', 'Now SuperMan is omnipresent.');
              return new Ember.RSVP.resolve(onlineRecord);
            });
          });
        });
      }).then(user => user.destroyRecord()).finally(done);
    });
  });

  test('create and sync with audit', function(assert) {
    runTest(App, 2, assert, (store, syncer, done) => {
      store.get('offlineGlobals').setOnlineAvailable(false);
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then((user) => {
        user.set('name', 'SuperMan');
        user.set('eMail', 'super.man@example.com');
        return user.save().then(() => {
          store.get('offlineGlobals').setOnlineAvailable(true);
          return syncer.syncUp().then((result) => {
            assert.equal(result, 2, 'Two operations were executed.');
            let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
              .selectByProjection('ApplicationUserE')
              .byId(user.get('id'));
            return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
              assert.equal(onlineRecord.get('name'), 'SuperMan', 'Now SuperMan is omnipresent.');
              return new Ember.RSVP.resolve(onlineRecord);
            });
          });
        });
      }).then(user => user.destroyRecord()).finally(done);
    });
  });

  test('update and sync without audit', function(assert) {
    runTest(App, 3, assert, (store, syncer, done) => {
      syncer.set('auditEnabled', false);
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then(user => syncer.syncDown(user).then(() => {
        store.get('offlineGlobals').setOnlineAvailable(false);
        let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
          .selectByProjection('ApplicationUserE')
          .byId(user.get('id'));
        return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((offlineRecord) => {
          offlineRecord.set('name', 'SuperMan');
          return offlineRecord.save().then((offlineRecord) => {
            offlineRecord.set('eMail', 'super.man@example.com');
            return offlineRecord.save().then(() => {
              store.get('offlineGlobals').setOnlineAvailable(true);
              return syncer.syncUp().then((result) => {
                assert.equal(result, 1, 'Only one operation was executed.');
                let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
                  .selectByProjection('ApplicationUserE')
                  .byId(user.get('id'));
                return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
                  assert.equal(onlineRecord.get('name'), 'SuperMan', `Now he's SuperMan.`);
                  assert.equal(onlineRecord.get('eMail'), 'super.man@example.com', 'Now he has a new email address.');
                  return new Ember.RSVP.resolve(onlineRecord);
                });
              });
            });
          });
        });
      })).then(user => user.destroyRecord()).finally(done);
    });
  });

  test('update and sync with audit', function(assert) {
    runTest(App, 3, assert, (store, syncer, done) => {
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then(user => syncer.syncDown(user).then(() => {
        store.get('offlineGlobals').setOnlineAvailable(false);
        let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
          .selectByProjection('ApplicationUserE')
          .byId(user.get('id'));
        return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((offlineRecord) => {
          offlineRecord.set('name', 'SuperMan');
          return offlineRecord.save().then((offlineRecord) => {
            offlineRecord.set('eMail', 'super.man@example.com');
            return offlineRecord.save().then(() => {
              store.get('offlineGlobals').setOnlineAvailable(true);
              return syncer.syncUp().then((result) => {
                assert.equal(result, 2, 'Two operations were executed.');
                let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
                  .selectByProjection('ApplicationUserE')
                  .byId(user.get('id'));
                return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
                  assert.equal(onlineRecord.get('name'), 'SuperMan', `Now he's SuperMan.`);
                  assert.equal(onlineRecord.get('eMail'), 'super.man@example.com', 'Now he has a new email address.');
                  return new Ember.RSVP.resolve(onlineRecord);
                });
              });
            });
          });
        });
      })).then(user => user.destroyRecord()).finally(done);
    });
  });

  test('delete and sync without audit', function(assert) {
    runTest(App, 2, assert, (store, syncer, done) => {
      syncer.set('auditEnabled', false);
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then(user => syncer.syncDown(user).then(() => {
        store.get('offlineGlobals').setOnlineAvailable(false);
        let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
          .selectByProjection('ApplicationUserE')
          .byId(user.get('id'));
        return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((offlineRecord) => {
          offlineRecord.set('name', 'SuperMan');
          offlineRecord.set('eMail', 'super.man@example.com');
          return offlineRecord.save().then(offlineRecord => offlineRecord.destroyRecord().then(() => {
            store.get('offlineGlobals').setOnlineAvailable(true);
            return syncer.syncUp().then((result) => {
              assert.equal(result, 1, 'Only one operation was executed.');
              let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
                .selectByProjection('ApplicationUserE')
                .byId(user.get('id'));
              return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
                assert.notOk(onlineRecord, 'SuperMan is gone.');
              });
            });
          }));
        });
      })).finally(done);
    });
  });

  test('delete and sync with audit', function(assert) {
    runTest(App, 2, assert, (store, syncer, done) => {
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then(user => syncer.syncDown(user).then(() => {
        store.get('offlineGlobals').setOnlineAvailable(false);
        let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
          .selectByProjection('ApplicationUserE')
          .byId(user.get('id'));
        return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((offlineRecord) => {
          offlineRecord.set('name', 'SuperMan');
          offlineRecord.set('eMail', 'super.man@example.com');
          return offlineRecord.save().then(offlineRecord => offlineRecord.destroyRecord().then(() => {
            store.get('offlineGlobals').setOnlineAvailable(true);
            return syncer.syncUp().then((result) => {
              assert.equal(result, 2, 'Two operations were executed.');
              let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
                .selectByProjection('ApplicationUserE')
                .byId(user.get('id'));
              return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
                assert.notOk(onlineRecord, 'SuperMan is gone.');
              });
            });
          }));
        });
      })).finally(done);
    });
  });

  test('sync without data to sync', function(assert) {
    runTest(App, 1, assert, (store, syncer, done) => {
      Ember.set(syncer, 'auditEnabled', false);
      Ember.get(store, 'offlineGlobals').setOnlineAvailable(true);
      return syncer.syncUp().then((result) => {
        assert.equal(result, undefined, 'No operation was executed and promise was resolved.');
      }).finally(done);;
    });
  });

  test('sync up with server error', function(assert) {
    runTest(App, 2, assert, (store, syncer, done) => {
      // Not cast value and throw error.
      store.modelFor('ember-flexberry-dummy-application-user').reopen({
        vip: DS.attr('string'),
      });

      store.get('offlineGlobals').setOnlineAvailable(false);
      return store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'SuperMan',
        eMail: 'super.man@example.com',
        vip: 'invalid',
      }).save().then((user) => {
        store.get('offlineGlobals').setOnlineAvailable(true);
        return syncer.syncUp().catch((rejectedJob) => {
          assert.equal(rejectedJob.get('executionResult'), 'Ошибка', 'Job not executed.');
          let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
            .selectByProjection('ApplicationUserE')
            .byId(user.get('id'));
          return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
            assert.notOk(onlineRecord, 'SuperMan is not there.');
          });
        });
      }).finally(done);
    });
  });

  skip('sync up with not found record', function(assert) {
    runTest(App, 3, assert, (store, syncer, done) => {
      store.createRecord('ember-flexberry-dummy-application-user', {
        name: 'Man',
        eMail: 'man@example.com',
      }).save().then((user) => {
        let id = user.get('id');
        return syncer.syncDown(user).then(() => {
          store.get('offlineGlobals').setOnlineAvailable(false);
          let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
            .selectByProjection('ApplicationUserE')
            .byId(id);
          return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((offlineRecord) => {
            offlineRecord.set('name', 'SuperMan');
            offlineRecord.set('eMail', 'super.man@example.com');
            return offlineRecord.save().then(() => {
              store.get('offlineGlobals').setOnlineAvailable(true);
              let builder = new Query.Builder(store, 'ember-flexberry-dummy-application-user')
                .selectByProjection('ApplicationUserE')
                .byId(id);
              return store.queryRecord('ember-flexberry-dummy-application-user', builder.build()).then((onlineRecord) => {
                assert.notEqual(onlineRecord.get('name'), 'SuperMan', `He was still an ordinary person.`);
                return onlineRecord.destroyRecord().then(() => {
                  let options = { continueOnError: true };
                  return syncer.syncUp(null, options).then((result) => {
                    assert.equal(result, 0, 'He never managed to become a SuperMan.');
                    let query = new Query.Builder(store, 'i-c-s-soft-s-t-o-r-m-n-e-t-business-audit-objects-audit-entity')
                      .select('id,objectPrimaryKey,operationType,executionResult,objectType,auditFields')
                      .where('objectPrimaryKey', 'eq', id).build();
                    return store.queryRecord(query.modelName, query).then((auditEntity) => {
                      assert.deepEqual({
                        objectPrimaryKey: auditEntity.get('objectPrimaryKey'),
                        operationType: auditEntity.get('operationType'),
                        executionResult: auditEntity.get('executionResult'),
                        objectType: auditEntity.get('objectType.name'),
                        changesCount: auditEntity.get('auditFields.length'),
                        name: auditEntity.get('auditFields').shiftObject().get('newValue'),
                        email: auditEntity.get('auditFields').shiftObject().get('newValue'),
                      }, {
                        objectPrimaryKey: id,
                        operationType: 'UPDATE',
                        executionResult: 'Не выполнено',
                        objectType: 'ember-flexberry-dummy-application-user',
                        changesCount: 4,
                        name: 'SuperMan',
                        email: 'super.man@example.com',
                      }, 'But we remember him.');
                    });
                  });
                });
              });
            });
          });
        });
      }).finally(done);
    });
  });
}

/**
  @method runTest
  @param {Application} app
  @param {Number} expect
  @param {Assert} assert
  @param {Function} test
  @private
*/
function runTest(app, expect, assert, test) {
  let store = app.__container__.lookup('service:store');
  let syncer = store.get('syncer');
  let done = assert.async();
  assert.expect(expect);
  Ember.run(null, test, store, syncer, done);
}

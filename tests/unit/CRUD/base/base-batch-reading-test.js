import Ember from 'ember';
import QueryBuilder from 'ember-flexberry-data/query/builder';

export default function batchReadingFunctions(store, assert) {
  Ember.run(() => {
    assert.expect(20);
    const done = assert.async();

    let userId;
    let user2Id;
    initTestData(store)

    // byId.
    .then((records) => {
      userId = records[0].get('id');
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .byId(userId);
      user2Id = records[1].get('id');
      const builder2 = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .byId(user2Id);
      const queries = [builder.build(), builder2.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 2, 'response | Length');
        assert.equal(data[0].get('length'), 1, 'byId | Length');
        assert.equal(data[0].get('firstObject.id'), userId, 'byId | Data');
        assert.equal(data[1].get('length'), 1, 'byId | Length');
        assert.equal(data[1].get('firstObject.id'), user2Id, 'byId | Data');
      });
    })

    // find record.
    .then(() => {
      const modelName = 'ember-flexberry-dummy-application-user';
      const modelProjection = 'ApplicationUserL';
      return store.batchFindRecord(modelName, userId, modelProjection).then((record) => {
        assert.equal(record.get('id'), userId, 'find record | Data');
      });
    })

    // where.
    .then(() => {
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .where('name', '==', 'VasyaBatch');
      const builder2 = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .where('name', '==', 'OlegBatch');
      const queries = [builder.build(), builder2.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 2, 'response | Length');
        assert.ok(data[0].get('length') === 2 && data[0].every(item => item.get('name') === 'VasyaBatch'), 'where');
        assert.ok(data[1].get('length') === 1 && data[1].get('firstObject.name') === 'OlegBatch');
      });
    })

    // orderBy.
    .then(() => {
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .orderBy('karma');
      const queries = [builder.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 1, 'response | Length');

        let isDataCorrect = true;
        for (let i = 0; i < data[0].get('length') - 1 && isDataCorrect; i++) {
          if (data[0].objectAt(i).get('karma') > data[0].objectAt(i + 1).get('karma')) { isDataCorrect = false; }
        }

        assert.ok(isDataCorrect, 'orderBy | Data');
        assert.equal(data[0].get('length'), 3, 'orderBy | Length');
      });
    })

    // top.
    .then(() => {
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .orderBy('karma')
        .top(2);
      const queries = [builder.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 1, 'response | Length');
        assert.equal(data[0].get('length'), 2, 'top');
      });
    })

    // skip.
    .then(() => {
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .orderBy('karma')
        .skip(1);
      const queries = [builder.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 1, 'response | Length');
        assert.equal(data[0].get('firstObject.karma'), 4, 'skip | Data');
        assert.equal(data[0].get('length'), 2, 'skip | Length');
      });
    })

    // count.
    .then(() => {
      const builder = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .where('name', '==', 'VasyaBatch')
        .count();
      const builder2 = new QueryBuilder(store)
        .from('ember-flexberry-dummy-application-user')
        .where('name', '==', 'OlegBatch')
        .count();
      const queries = [builder.build(), builder2.build()];
      return runTest(store, queries, (data) => {
        assert.equal(data.get('length'), 2, 'response | Length');
        assert.equal(data[0].meta.count, 2, 'count');
        assert.equal(data[1].meta.count, 1, 'count');
      });
    })
    .catch((e) => {
      console.log(e, e.message);
      throw e;
    })
    .finally(done);
  });
}

function initTestData(store) {
  return Ember.RSVP.Promise.all([
    store.createRecord('ember-flexberry-dummy-application-user', {
      name: 'VasyaBatch',
      eMail: '1@mail.ru',
      karma: 5
    }).save(),

    store.createRecord('ember-flexberry-dummy-application-user', {
      name: 'VasyaBatch',
      eMail: '2@mail.ru',
      karma: 3
    }).save(),

    store.createRecord('ember-flexberry-dummy-application-user', {
      name: 'OlegBatch',
      eMail: '3@mail.ru',
      activated: true,
      karma: 4
    }).save()
  ]);
}

function runTest(store, queries, callback) {
  return store.batchSelect(queries)
  .then((data) => callback(data));
}

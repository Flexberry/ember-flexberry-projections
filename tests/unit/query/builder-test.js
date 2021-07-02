import Ember from 'ember';
import { module, test } from 'qunit';

import { Query } from 'ember-flexberry-data';

import startApp from '../../helpers/start-app';

const { Builder } = Query;
let app;
let store;

module('query', {
  setup: function () {
    app = startApp();
    store = app.__container__.lookup('service:store');
  },
  teardown: function () {
    Ember.run(app, 'destroy');
  }
});

test('query builder | constructor', assert => {
  assert.ok(new Builder(store, 'Customer'));
  assert.ok(new Builder(store).from('Customer'));

  assert.ok(new Builder(store, 'Customer').where('Name', 'eq', 'Vasya'));
});

test('query builder | isOf method', (assert) => {
  let builder1 = new Builder(store, 'creator').isOf('bot');
  let builder2 = new Builder(store, 'creator').where('Age', 'ge', 0).isOf('bot');

  assert.throws(() => new Builder(store, 'creator').isOf('inavlid-model-name'));
  assert.ok(builder1._predicate instanceof Query.IsOfPredicate);
  assert.ok(builder2._predicate instanceof Query.ComplexPredicate);
});

test('query builder | select by projection', assert => {
  // Arrange.
  let builder = new Builder(store, 'ember-flexberry-dummy-comment').selectByProjection('CommentE');

  // Act.
  let result = builder.build();

  // Assert.
  assert.ok(result);
  assert.equal(result.projectionName, 'CommentE');

  assert.ok(result.select);
  assert.equal(result.select.length, 7);
  assert.equal(result.select[0], 'id');
  assert.equal(result.select[1], 'suggestion');
  assert.equal(result.select[2], 'text');
  assert.equal(result.select[3], 'votes');
  assert.equal(result.select[4], 'moderated');
  assert.equal(result.select[5], 'author');
  assert.equal(result.select[6], 'userVotes');

  assert.ok(result.expand);
  assert.ok(result.extend);

  assert.notOk(result.extend.suggestion);
  assert.notOk(result.extend.author);
  assert.notOk(result.extend.userVotes);

  assert.ok(result.extend.select);
  assert.equal(result.extend.select.length, 1);
  assert.equal(result.extend.select[0], 'id');

  assert.ok(result.expand.suggestion);
  assert.ok(result.expand.suggestion.select);
  assert.ok(result.expand.suggestion.expand);
  assert.equal(result.expand.suggestion.select.length, 2);
  assert.equal(result.expand.suggestion.select[0], 'id');
  assert.equal(result.expand.suggestion.select[1], 'address');

  assert.ok(result.expand.author);
  assert.ok(result.expand.author.select);
  assert.ok(result.expand.author.expand);
  assert.equal(result.expand.author.select.length, 2);
  assert.equal(result.expand.author.select[0], 'id');
  assert.equal(result.expand.author.select[1], 'name');

  assert.ok(result.expand.userVotes);
  assert.ok(result.expand.userVotes.select);
  assert.ok(result.expand.userVotes.expand);
  assert.equal(result.expand.userVotes.select.length, 3);
  assert.equal(result.expand.userVotes.select[0], 'id');
  assert.equal(result.expand.userVotes.select[1], 'voteType');
  assert.equal(result.expand.userVotes.select[2], 'applicationUser');

  assert.ok(result.expand.userVotes.expand.applicationUser);
  assert.ok(result.expand.userVotes.expand.applicationUser.select);
  assert.ok(result.expand.userVotes.expand.applicationUser.expand);
  assert.equal(result.expand.userVotes.expand.applicationUser.select.length, 2);
  assert.equal(result.expand.userVotes.expand.applicationUser.select[0], 'id');
  assert.equal(result.expand.userVotes.expand.applicationUser.select[1], 'name');
});

test('query builder | select by attributes list', assert => {
  // Arrange.
  let attrs = 'id,text,votes,author,author.name,userVotes,userVotes.voteType,userVotes.applicationUser,userVotes.applicationUser.name';
  let builder = new Builder(store, 'ember-flexberry-dummy-comment').select(attrs);

  // Act.
  let result = builder.build();

  // Assert.
  assert.ok(result);
  assert.notOk(result.projectionName);

  assert.ok(result.select);
  assert.equal(result.select.length, 5);
  assert.equal(result.select[0], 'id');
  assert.equal(result.select[1], 'text');
  assert.equal(result.select[2], 'votes');
  assert.equal(result.select[3], 'author');
  assert.equal(result.select[4], 'userVotes');

  assert.ok(result.expand);
  assert.ok(result.extend);

  assert.notOk(result.expand.suggestion);

  assert.notOk(result.extend.suggestion);
  assert.notOk(result.extend.author);
  assert.notOk(result.extend.userVotes);

  assert.ok(result.extend.select);
  assert.equal(result.extend.select.length, 1);
  assert.equal(result.extend.select[0], 'id');

  assert.ok(result.expand.author);
  assert.ok(result.expand.author.select);
  assert.ok(result.expand.author.expand);
  assert.equal(result.expand.author.select.length, 2);
  assert.equal(result.expand.author.select[0], 'id');
  assert.equal(result.expand.author.select[1], 'name');

  assert.ok(result.expand.userVotes);
  assert.ok(result.expand.userVotes.select);
  assert.ok(result.expand.userVotes.expand);
  assert.equal(result.expand.userVotes.select.length, 3);
  assert.equal(result.expand.userVotes.select[0], 'id');
  assert.equal(result.expand.userVotes.select[1], 'voteType');
  assert.equal(result.expand.userVotes.select[2], 'applicationUser');

  assert.ok(result.expand.userVotes.expand.applicationUser);
  assert.ok(result.expand.userVotes.expand.applicationUser.select);
  assert.ok(result.expand.userVotes.expand.applicationUser.expand);
  assert.equal(result.expand.userVotes.expand.applicationUser.select.length, 2);
  assert.equal(result.expand.userVotes.expand.applicationUser.select[0], 'id');
  assert.equal(result.expand.userVotes.expand.applicationUser.select[1], 'name');
});

test('query builder | enrichment', assert => {
  // Arrange.
  let attrs = 'id,text';
  let builder = new Builder(store, 'ember-flexberry-dummy-comment').select(attrs).orderBy('votes asc,author.name desc');

  // Act.
  let result = builder.build();

  // Assert.
  assert.ok(result);
  assert.notOk(result.projectionName);

  assert.ok(result.select);
  assert.equal(result.select.length, 2);
  assert.equal(result.select[0], 'id');
  assert.equal(result.select[1], 'text');

  assert.ok(result.expand);
  assert.ok(result.extend);

  assert.notOk(result.expand.suggestion);
  assert.notOk(result.expand.author);
  assert.notOk(result.expand.userVotes);

  assert.ok(result.extend);
  assert.ok(result.extend.select);
  assert.ok(result.extend.expand);
  assert.notOk(result.extend.expand.suggestion);
  assert.notOk(result.extend.expand.userVotes);

  assert.equal(result.extend.select.length, 3);
  assert.equal(result.extend.select[0], 'id');
  assert.equal(result.extend.select[1], 'votes');
  assert.equal(result.extend.select[2], 'author');
  assert.equal(result.extend.expand.author.select.length, 2);
  assert.equal(result.extend.expand.author.select[0], 'id');
  assert.equal(result.extend.expand.author.select[1], 'name');
});

test('query builder | offline model', assert => {
  // Arrange.
  store.offlineModels = {
    'ember-flexberry-dummy-comment': true,
  };

  let builder = new Builder(store, 'ember-flexberry-dummy-comment').selectByProjection('CommentD').orderBy('suggestion.address desc');
  let commentPkName = builder._localStore.serializerFor('ember-flexberry-dummy-comment').get('primaryKey');
  let authorPkName = builder._localStore.serializerFor('ember-flexberry-dummy-application-user').get('primaryKey');
  let suggestionPkName = builder._localStore.serializerFor('ember-flexberry-dummy-suggestion').get('primaryKey');

  // Act.
  let result = builder.build();

  // Assert.
  assert.ok(result);
  assert.equal(result.projectionName, 'CommentD');

  assert.ok(result.expand);
  assert.ok(result.extend);

  assert.ok(result.expand.author);
  assert.notOk(result.expand.suggestion);
  assert.notOk(result.expand.userVotes);

  assert.ok(result.extend.expand.suggestion);
  assert.notOk(result.extend.expand.author);
  assert.notOk(result.extend.expand.userVotes);

  //Primary key name should always get from offline serializers for offline model and it's relationships.
  assert.equal(result.primaryKeyName, commentPkName);
  assert.equal(result.expand.author.primaryKeyName, authorPkName);
  assert.equal(result.extend.expand.suggestion.primaryKeyName, suggestionPkName);
});

test('query builder | null and undefined | byId', assert => {
  assert.throws(() => new Builder(store, 'Customer').byId(null), Error);
  assert.throws(() => new Builder(store, 'Customer').byId(undefined), Error);
});

test('query builder | null and undefined | from', assert => {
  assert.throws(() => new Builder(store).from(null), Error);
  assert.throws(() => new Builder(store).from(undefined), Error);
});

test('query builder | null and undefined | selectByProjection ', assert => {
  assert.throws(() => new Builder(store, 'Customer').selectByProjection(null), Error);
  assert.throws(() => new Builder(store, 'Customer').selectByProjection(undefined), Error);
});

test('query builder | null and undefined | where', assert => {
  assert.throws(() => new Builder(store, 'Customer').where(undefined), Error);
  assert.throws(() => new Builder(store, 'Customer').where(null), Error);
  assert.ok(new Builder(store, 'Customer').where('Name', 'eq', null));
});

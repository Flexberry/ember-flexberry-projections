/**
  @module ember-flexberry-data
*/

import Ember from 'ember';
import DS from 'ember-data';
import OfflineAdapter from '../adapters/offline';
import QueryBuilder from '../query/builder';

/**
  Store that used in offline mode by default.

  @class LocalStore
  @namespace Offline
  @extends <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
  @private
*/
export default DS.Store.extend({
  /**
    Database name for IndexedDB.

    @property dbName
    @type String
    @default 'ember-flexberry-data'
  */
  dbName: Ember.computed({
    get() {
      return this.get('adapter.dbName');
    },
    set(key, value) {
      return this.set('adapter.dbName', value);
    },
  }),

  /**
    Initializing instance.
    [More info](http://emberjs.com/api/data/classes/DS.Store.html#method_init).

    @method init
  */
  init() {
    this._super(...arguments);
    let dbName = this.get('dbName');
    let owner = Ember.getOwner(this);
    this.set('adapter', OfflineAdapter.create(owner.ownerInjection(), dbName ? { dbName } : {}));
  },

  /**
   * Returns an instance of the serializer for a given type.
   * Offline serializers should have name with postfix '-offline'.
   *
   * @method serializerFor
   * @param {String} modelName The name of the model type.
   * @public
   */
  serializerFor: function(modelName) {
    let owner = Ember.getOwner(this);
    let serializer = owner.lookup(`serializer:${modelName}-offline`);
    if (!serializer) {
      serializer = owner.lookup(`serializer:application-offline`);
      if (!serializer) {
        serializer = this.adapterFor(modelName).defaultSerializer;
      }
    }

    return serializer;
  },

  /**
   * Returns an instance of the adapter for a given type.
   * Offline adapters should have name with postfix '-offline'.
   *
   * @method adapterFor
   * @param {String} modelName The name of the model type.
   * @public
   */
  adapterFor: function(modelName) {
    let owner = Ember.getOwner(this);
    let adapter = owner.lookup(`adapter:${modelName}-offline`);
    if (!adapter) {
      adapter = owner.lookup(`adapter:application-offline`);
      if (!adapter) {
        adapter = this.get('adapter');
      }
    }

    return adapter;
  },

  /**
   * Finds the records for the given model type.
   *
   * See {{#crossLink "DS.Store/findAll:method"}}{{/crossLink}} for details.
   *
   * @method findAll
   * @public
   *
   * @param {String} modelName The name of the model type.
   * @param {Object} [options] Options.
   * @param {String} options.projection Projection name.
   * @return {DS.AdapterPopulatedRecordArray} Records promise.
   */
  findAll: function(modelName, options) {
    Ember.debug(`Flexberry Local Store::findAll ${modelName}`);

    let builder = new QueryBuilder(this, modelName);
    if (options && options.projection) {
      Ember.debug(`Flexberry Local Store::findAll using projection '${options.projection}'`);

      builder.selectByProjection(options.projection);
      return this.query(modelName, builder.build());
    }

    let queryObject = builder.build();

    // Now if projection is not specified then only 'id' field will be selected.
    queryObject.select = [];
    return this.query(modelName, queryObject);
  },

  /**
   * Returns a record for a given type and id combination.
   *
   * See {{#crossLink "DS.Store/findRecord:method"}}{{/crossLink}} for details.
   *
   * @method findRecord
   * @public
   *
   * @param {String} modelName The name of the model type.
   * @param {String|Integer} id Record ID.
   * @param {Object} [options] Options.
   * @param {String} options.projection Projection name.
   * @return {Promise} Record promise.
   */
  findRecord: function(modelName, id, options) {
    // TODO: case of options.reload === false.
    Ember.debug(`Flexberry Local Store::findRecord ${modelName}(${id})`);

    let builder = new QueryBuilder(this, modelName).byId(id);
    if (options && options.projection) {
      Ember.debug(`Flexberry Local Store::findRecord using projection '${options.projection}'`);

      builder.selectByProjection(options.projection);
      return this.queryRecord(modelName, builder.build());
    }

    let queryObject = builder.build();

    // Now if projection is not specified then only 'id' field will be selected.
    queryObject.select = [];
    return this.queryRecord(modelName, queryObject);
  },

  /**
   * This method delegates a query to the adapter.
   *
   * See {{#crossLink "DS.Store/query:method"}}{{/crossLink}} for details.
   *
   * @method query
   * @public
   *
   * @param {String} modelName The name of the model type.
   * @param {Object} query An opaque query to be used by the adapter.
   * @param {String} [query.projection] Projection name.
   * @return {Promise} A promise, which is resolved with a
   *                   {{#crossLink "DS.RecordArray"}}RecordArray{{/crossLink}}
   *                   once the server returns.
   */
  query: function(modelName, query) {
    Ember.debug(`Flexberry Local Store::query ${modelName}`, query);

    let promise = this._super(...arguments);
    return new Ember.RSVP.Promise((resolve, reject) => {
      promise.then((results) => {
        if (results && Ember.isArray(results)) {
          results.forEach((result) => {
            result.didLoad();
          });
        }

        resolve(results);
      }, reject);
    });
  },

  /**
   * This method delegates a query to the adapter.
   *
   * See {{#crossLink "DS.Store/queryRecord:method"}}{{/crossLink}} for details.
   *
   * @method queryRecord
   * @public
   *
   * @param {String} modelName The name of the model type.
   * @param {Object} query An opaque query to be used by the adapter.
   * @param {String} [query.projection] Projection name.
   * @return {Promise} A promise, which is resolved with a
   *                   {{#crossLink "DS.RecordObject"}}RecordObject{{/crossLink}}
   *                   once the server returns.
   */
  queryRecord: function(modelName, query) {
    Ember.debug(`Flexberry Local Store::queryRecord ${modelName}`, query);

    let promise = this._super(...arguments);
    return new Ember.RSVP.Promise((resolve, reject) => {
      promise.then((result) => {
        if (result) {
          result.didLoad();
        }

        resolve(result);
      }, reject);
    });
  },

  /**
    Delete all record from the current store.
    @method deleteRecord
    @param {String} modelName modelName
    @param {Object} filter filter
  */
  deleteAllRecords: function(modelName, filter) {
    let adapter = this.adapterFor(modelName);
    if (Ember.isNone(adapter.deleteAllRecords)) {
      Ember.assert('Method \'deleteAllRecords\' is missing');
    }

    return adapter.deleteAllRecords(adapter.store, modelName, filter);
  },

  /**
    Calls the `save` method on each passed model and returns a promise that is resolved by an array of saved models.

    The array which fulfilled the promise may contain the following values:
    - `same model object` - for created, updated or unaltered records.
    - `null` - for deleted records.

    @method batchUpdate
    @param {DS.Model[]|DS.Model} models Is array of models or single model for batch update.
    @return {Promise} A promise that fulfilled with an array of models in the new state.
  */
  batchUpdate(models) {
    return Ember.RSVP.all(Ember.isArray(models) ? models.map((model) => {
      if (model.get('dirtyType') === 'deleted') {
        return model.save().then(() => null);
      }

      return model.save();
    }) : [models.save()]);
  },

  /**
    A method to get array of models with batch request.

    @method batchSelect
    @param {Query} queries Array of Flexberry Query objects.
    @return {Promise} A promise that fulfilled with an array of query responses.
  */
  batchSelect(queries) {
    return this.adapterFor('application').batchSelect(this, queries);
  },

  /**
    A method to get single record with batch request.

    @method batchFindRecord
    @param {String} modelName Model name.
    @param {String} modelId Record id.
    @param {String} projectionName Projection name.
    @return {Promise} A promise that fulfilled with single record.
  */
  batchFindRecord(modelName, modelId, projectionName) {
    return this.adapterFor('application').batchFindRecord(this, modelName, modelId, projectionName);
  },

  /**
   * Pushes into store the model that exists in backend without a request to it.
   * @param {String} modelName Name of the model to push into store.
   * @param {String} primaryKey Primery key of the model to push into store.
   */
  createExistingRecord(modelName, primaryKey) {
    Ember.assert('Model name for store.createExistingRecord() method must not be blank.', !Ember.isBlank(modelName));
    Ember.assert('Model primary key for store.createExistingRecord() method must not be blank.', !Ember.isBlank(primaryKey));

    return this.push({
      data: {
        id: primaryKey,
        type: modelName
      }
    });
  }
});

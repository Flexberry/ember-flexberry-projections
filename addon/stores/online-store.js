/**
  @module ember-flexberry-data
*/

import Ember from 'ember';
import DS from 'ember-data';

/**
  Store that used in online mode by default.

  @class OnlineStore
  @namespace OData
  @extends <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
  @private
*/
export default DS.Store.extend({

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
    A method to send batch update, create or delete models in single transaction.

    All models saving using this method must have identifiers.

    The array which fulfilled the promise may contain the following values:
    - `same model object` - for created, updated or unaltered records.
    - `null` - for deleted records.

    @method batchUpdate
    @param {DS.Model[]|DS.Model} models Is array of models or single model for batch update.
    @return {Promise} A promise that fulfilled with an array of models in the new state.
  */
  batchUpdate(models) {
    return this.adapterFor('application').batchUpdate(this, models);
  },

  /**
    A method to get array of models.

    @method batchSelect
    @param {Array} queries Array of Flexberry Query objects.
    @return {Promise} A promise that fulfilled with an array of query responses.
  */
  batchSelect(queries) {
    return this.adapterFor('application').batchSelect(this, queries).then(result => {
      const batchResult = Ember.A();
      result.forEach((records, index) => {
        const array = this.recordArrayManager.createAdapterPopulatedRecordArray(queries[index].modelName, queries[index]);
        array.loadRecords(this.push(records), records);
        batchResult.addObject(array);
      });

      return batchResult;
    });
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

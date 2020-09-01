import Ember from 'ember';
import DS from 'ember-data';
import decorateAdapter from './base-store/decorate-adapter';
import decorateAPICall from './base-store/decorate-api-call';
import QueryObject from '../query/query-object';
import isObject from '../utils/is-object';
import OnlineStore from './online-store';

/**
  Base class for application store.
  service:store should point to instance of that class.

  @class Store
  @namespace Offline
  @extends <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
*/
export default DS.Store.extend({
  /**
    Store offline schemas for all databases.

    @property _offlineSchema
    @type Object
    @private
    @default 'Schema of 1 version for internal models addon'
  */
  _offlineSchema: Ember.computed(function() {
    return {
      'ember-flexberry-data': {
        1: this.get('offlineGlobals').getOfflineSchema(),
      }
    };
  }),

  /**
    Store that use for making requests in online mode.
    It can be specified in application that use offline mode support.
    If it is not specified then instance of <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
    is set as value of this property during initialization of {{#crossLink "BaseStore"}}{{/crossLink}} class.

    @property onlineStore
    @type <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
  */
  onlineStore: null,

  /**
    Store that use for making requests in offline mode.
    By default it is set to global instane of {{#crossLink "LocalStore"}}{{/crossLink}} class.

    @property offlineStore
    @type <a href="http://emberjs.com/api/data/classes/DS.Store.html">DS.Store</a>
  */
  offlineStore: null,
  offlineGlobals: Ember.inject.service('offline-globals'),

  /**
    Set schema for your database.

    @example
      ```javascript
      // app/services/store.js
      ...
        init() {
          this.set('offlineSchema', {
            <name of database>: {
              <number of version>: {
                <name of model>: <table definition>,
              },
            },
            dbName: {
              1: {
                modelName: 'id,attribute1,attribute2,belongsToRelationship1,belongsToRelationship2,*hasManyRelationship1,*hasManyRelationship2',
                changedModelName: 'id,attribute1,attribute2',
                thisModelWillBeRemovedInNextVersion: 'id,attribute1',
              },
              2: {
                newModelName: 'id,attribute1',
                changedModelName: 'id,attribute1,attribute3,attribute4',
                thisModelWillBeRemovedInNextVersion: null,
              },
            },
          });
          return this._super(...arguments);
        },
      ...
      ```

    @property offlineSchema
    @type Object
  */
  offlineSchema: Ember.computed({
    get() {
      return this.get('_offlineSchema');
    },
    set(key, value) {
      let offlineSchema = this.get('offlineSchema');
      for (let db in value) {
        if (offlineSchema.hasOwnProperty(db)) {
          for (let version in value[db]) {
            let schema = offlineSchema[db][version] || {};
            offlineSchema[db][version] = Ember.merge(schema, value[db][version]);
          }
        } else {
          offlineSchema[db] = value[db];
        }
      }

      return this.set('_offlineSchema', offlineSchema);
    },
  }),

  /**
    Add model names that be loaded from offline store.

    @example
      ```javascript
      // app/services/store.js
      ...
        offlineModels: {
          myModel: true,
        },
      ...
      ```

    @property offlineModels
    @type Object
    @default {}
  */
  offlineModels: {},

  /**
    Global instance of {{#crossLink "Syncer"}}{{/crossLink}} class that contains methods to sync model.

    @property syncer
    @type Syncer
    @readOnly
  */
  syncer: Ember.inject.service('syncer'),

  /**
    Instance of dexie service.

    @property dexieService
    @type Offline.DexieService
  */
  dexieService: Ember.inject.service('dexie'),

  /*
    Store initialization.
  */
  init() {
    this._super(...arguments);
    let owner = Ember.getOwner(this);

    // Set online store if it is not specified in application explicitly.
    if (Ember.isNone(this.get('onlineStore'))) {
      let onlineStore = OnlineStore.create(owner.ownerInjection());
      this.set('onlineStore', onlineStore);
    }

    // Set offline store.
    let offlineStore = owner.lookup('store:local');
    this.set('offlineStore', offlineStore);
    this.set('offlineStore.offlineSchema', this.get('offlineSchema'));

    this._dbInit();
  },

  /**
    This method returns a fresh collection from the server, regardless of if there is already records
    in the store or not.
    @method findAll
    @param {String} modelName
    @param {Object} options
    @param {Boolean} [options.useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Promise} promise
  */
  findAll(modelName, options) {
    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let offlineStore = this.get('offlineStore');
      let useOnlineStoreParam = !Ember.isEmpty(options) && !Ember.isEmpty(options.useOnlineStore) ? options.useOnlineStore : null;
      let useOnlineStoreCondition = this._useOnlineStore(modelName, useOnlineStoreParam);
      return useOnlineStoreCondition ? this._decorateMethodAndCall('all', 'findAll', arguments, 1) : offlineStore.findAll.apply(offlineStore, arguments);
    } else {
      let onlineStore = this.get('onlineStore');
      return onlineStore.findAll.apply(onlineStore, arguments);
    }
  },

  /**
   * This method returns a record for a given type and id combination.
   * NOTE: this will trigger syncUp twice, this is OK. And since this is
   *  a public method, we probably want to preserve this.
    @method findRecord
    @param {String} modelName
    @param {String|Integer} id
    @param {Object} options
    @param {Boolean} [options.useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Promise} promise
   */
  findRecord(modelName, id, options) {
    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let offlineStore = this.get('offlineStore');
      let useOnlineStoreParam = !Ember.isEmpty(options) && !Ember.isEmpty(options.useOnlineStore) ? options.useOnlineStore : null;
      let useOnlineStoreCondition = this._useOnlineStore(modelName, useOnlineStoreParam);
      return useOnlineStoreCondition ?
        this._decorateMethodAndCall('single', 'findRecord', arguments, 2) :
        offlineStore.findRecord.apply(offlineStore, arguments);
    } else {
      let onlineStore = this.get('onlineStore');
      return onlineStore.findRecord.apply(onlineStore, arguments);
    }
  },

  /**
    Query for records that meet certain criteria. Resolves with [DS.RecordArray](http://emberjs.com/api/data/classes/DS.RecordArray.html).
	For more information see [query method](http://emberjs.com/api/data/classes/DS.Store.html#method_query) of [DS.Store](http://emberjs.com/api/data/classes/DS.Store.html).
    @method query
    @param {String} modelName
    @param {Object} query
    @param {Boolean} [query.useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Promise} promise
  */
  query(modelName, query) {
    // TODO: Method `copy` bewitch `QueryObject` into `Object`.
    let _query = query instanceof QueryObject ? query : Ember.copy(query);

    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let offlineStore = this.get('offlineStore');
      let useOnlineStoreParam = !Ember.isEmpty(_query) && !Ember.isEmpty(_query.useOnlineStore) ? _query.useOnlineStore : null;
      if (!Ember.isEmpty(_query) && !Ember.isEmpty(_query.useOnlineStore)) {
        delete _query.useOnlineStore;
      }

      let useOnlineStoreCondition = this._useOnlineStore(modelName, useOnlineStoreParam);
      return useOnlineStoreCondition ?
        this._decorateMethodAndCall('multiple', 'query', [modelName, _query], -1) :
        offlineStore.query.apply(offlineStore, [modelName, _query]);
    } else {
      let onlineStore = this.get('onlineStore');
      return onlineStore.query.apply(onlineStore, [modelName, _query]);
    }
  },

  /**
    Query for record that meet certain criteria. Resolves with single record.
    @method query
    @param {String} modelName
    @param {Object} query
    @param {Boolean} [query.useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Promise} promise
  */
  queryRecord(modelName, query) {
    // TODO: Method `copy` bewitch `QueryObject` into `Object`.
    let _query = query instanceof QueryObject ? query : Ember.copy(query);

    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let offlineStore = this.get('offlineStore');
      let useOnlineStoreParam = !Ember.isEmpty(_query) && !Ember.isEmpty(_query.useOnlineStore) ? _query.useOnlineStore : null;
      if (!Ember.isEmpty(_query) && !Ember.isEmpty(_query.useOnlineStore)) {
        delete _query.useOnlineStore;
      }

      let useOnlineStoreCondition = this._useOnlineStore(modelName, useOnlineStoreParam);
      return useOnlineStoreCondition ?
        this._decorateMethodAndCall('single', 'queryRecord', [modelName, _query], -1) :
        offlineStore.queryRecord.apply(offlineStore, [modelName, _query]);
    } else {
      let onlineStore = this.get('onlineStore');
      return onlineStore.queryRecord.apply(onlineStore, [modelName, _query]);
    }
  },

  /**
    Create a new record in the current store. The properties passed to this method are set on the newly created record.
    @method createRecord
    @param {String} modelName
    @param {Object} inputProperties A hash of properties to set on the newly created record.
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Promise} promise
  */
  createRecord() {
    return this._callSuperMethod('createRecord', 2, arguments);
  },

  /**
    For symmetry, a record can be deleted via the store.
    @method deleteRecord
    @param {DS.Model} record
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
  */
  deleteRecord() {
    return this._callSuperMethod('deleteRecord', 1, arguments);
  },

  /**
    Delete all record from the current store.
    @method deleteRecord
    @param {DS.Model} record
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
  */
  deleteAllRecords() {
    return this._callSuperMethod('deleteAllRecords', 2, arguments);
  },

  /**
    Get the reference for the specified record.
    @method getReference
    @param {String} type
    @param {String|Integer} id
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {RecordReference} promise
  */
  getReference() {
    return this._callSuperMethod('getReference', 2, arguments);
  },

  /**
    Returns true if a record for a given type and ID is already loaded.
    @method hasRecordForId
    @param {String|DS.Model} modelName
    @param {String|Integer} inputId
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Boolean}
  */
  hasRecordForId() {
    return this._callSuperMethod('hasRecordForId', 2, arguments);
  },

  /**
    Converts a json payload into the normalized form that {{#crossLink "BaseStore/push:method"}}{{/crossLink}} expects.
    @method normalize
    @param {String} modelName The name of the model type for this payload
    @param {Object} payload
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Object} The normalized payload
  */
  normalize() {
    return this._callSuperMethod('normalize', 2, arguments);
  },

  /**
    This method returns a filtered array that contains all of the known records for a given type in the store.
    @method peekAll
    @param {String} modelName
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {DS.RecordArray}
  */
  peekAll() {
    return this._callSuperMethod('peekAll', 1, arguments);
  },

  /**
    Get a record by a given type and ID without triggering a fetch.
    @method peekRecord
    @param {String} modelName
    @param {String|Integer} id
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {DS.Model|null} Record
  */
  peekRecord() {
    return this._callSuperMethod('peekRecord', 2, arguments);
  },

  /**
    Push some data for a given type into the store.
    @method push
    @param {Object} data
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {DS.Model|Array} The record(s) that was created or updated.
  */
  push() {
    return this._callSuperMethod('push', 1, arguments);
  },

  /**
    Push some raw data into the store.
    @method pushPayload
    @param {String} modelName
    @param {Object} inputPayload
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
  */
  pushPayload() {
    return this._callSuperMethod('pushPayload', 2, arguments);
  },

  /**
    This method returns if a certain record is already loaded in the store.
    @method recordIsLoaded
    @param {String} modelName
    @param {String|Integer} id
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {Boolean}
  */
  recordIsLoaded() {
    return this._callSuperMethod('recordIsLoaded', 2, arguments);
  },

  /**
    This method unloads all records in the store.
    @method unloadAll
    @param {String} modelName
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
  */
  unloadAll() {
    return this._callSuperMethod('unloadAll', 1, arguments);
  },

  /**
    For symmetry, a record can be unloaded via the store. Only non-dirty records can be unloaded.
    @method unloadRecord
    @param {DS.Model} record
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
  */
  unloadRecord() {
    return this._callSuperMethod('unloadRecord', 1, arguments);
  },

  /**
   * Pushes into store the model that exists in backend without a request to it.
   * @method createExistingRecord
   * @param {String} modelName Name of the model to push into store.
   * @param {String} primaryKey Primery key of the model to push into store.
   * @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
   */
  createExistingRecord() {
    return this._callSuperMethod('createExistingRecord', 2, arguments);
  },

  /**
    A method to send batch update, create or delete models in single transaction.

    All models saving using this method must have identifiers.

    The array which fulfilled the promise may contain the following values:
    - `same model object` - for created, updated or unaltered records.
    - `null` - for deleted records.

    @method batchUpdate
    @param {DS.Model[]|DS.Model} models Is array of models or single model for batch update.
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status.
    @return {Promise} A promise that fulfilled with an array of models in the new state.
  */
  batchUpdate() {
    return this._callSuperMethod('batchUpdate', 1, arguments);
  },

  /**
    A method to get array of models with batch request.

    @method batchSelect
    @param {Query} queries Array of Flexberry Query objects.
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status.
    @return {Promise} A promise that fulfilled with an array of query responses.
  */
  batchSelect() {
    return this._callSuperMethod('batchSelect', 2, arguments);
  },

  /**
    A method to get single record with batch request.

    @method batchFindRecord
    @param {String} modelName Model name.
    @param {String} modelId Record id.
    @param {String} projectionName Projection name.
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status.
    @return {Promise} A promise that fulfilled with single record.
  */
  batchFindRecord() {
    return this._callSuperMethod('batchFindRecord', 3, arguments);
  },

  /**
    Returns an instance of the adapter for a given type.
    @method adapterFor
    @param {String} modelName
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {DS.Adapter or subclass} Adapter
  */
  adapterFor(modelName, useOnlineStore) {
    let onlineStore = this.get('onlineStore');
    let offlineStore = this.get('offlineStore');
    let adapter = onlineStore.adapterFor(modelName);
    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let useOnlineStoreCondition = this._useOnlineStore(modelName, !Ember.isNone(useOnlineStore) ? useOnlineStore : null);
      return useOnlineStoreCondition ? decorateAdapter.call(this, adapter, modelName) : offlineStore.adapterFor.call(offlineStore, modelName);
    } else {
      return adapter;
    }
  },

  /**
    Returns an instance of the serializer for a given type.
    @method serializerFor
    @param {String} modelName
    @param {Boolean} [useOnlineStore] Allow to explicitly specify online or offline store using independently of global online status
    @return {DS.Serializer or subclass} Serializer
  */
  serializerFor(modelName, useOnlineStore) {
    let onlineStore = this.get('onlineStore');
    let offlineStore = this.get('offlineStore');
    let serializer = onlineStore.serializerFor(modelName);
    if (this.get('offlineGlobals.isOfflineEnabled')) {
      let useOnlineStoreCondition = this._useOnlineStore(modelName, !Ember.isNone(useOnlineStore) ? useOnlineStore : null);
      return useOnlineStoreCondition ? onlineStore.serializerFor.call(onlineStore, modelName) : offlineStore.serializerFor.call(offlineStore, modelName);
    } else {
      return serializer;
    }
  },

  /*
    Decorate specified method of online store for add extra syncing features.
  */
  _decorateMethodAndCall(finderType, originMethodName, originMethodArguments, optionsIndex) {
    let onlineStore = this.get('onlineStore');
    let originMethod = onlineStore[originMethodName];
    let decoratedMethod = decorateAPICall(finderType, originMethod);
    if (optionsIndex > -1) {
      let options = originMethodArguments[optionsIndex];
      options = this.get('offlineGlobals.isOfflineEnabled') ? options : Ember.$.extend(true, { bypass: true }, options);
      originMethodArguments[optionsIndex] = options;
    }

    return decoratedMethod.apply(onlineStore, originMethodArguments);
  },

  /*
    Detect global online status.
  */
  _isOnline() {
    return this.get('offlineGlobals.isOnline');
  },

  /*
    Pass control flow to online or offline store depend on global online status
    and explicitly specified store to use.
  */
  _callSuperMethod(methodName, useOnlineStoreParamNum, ...args) {
    let onlineStore = this.get('onlineStore');
    let offlineStore = this.get('offlineStore');
    let modelName = this._getModelName(methodName, args[0]);
    let useOnlineStoreParam = (args[0].length - 1) >= useOnlineStoreParamNum ? args[0][useOnlineStoreParamNum] : null;
    let useOnlineStoreCondition = this._useOnlineStore(modelName, useOnlineStoreParam);
    let offlineEnabled = this.get('offlineGlobals.isOfflineEnabled');
    return !offlineEnabled || (offlineEnabled && useOnlineStoreCondition) ?
      onlineStore[methodName].apply(onlineStore, args[0]) :
      offlineStore[methodName].apply(offlineStore, args[0]);
  },

  /**
    Detect model name by method name and arguments.

    @method _getModelName
    @private
    @param {String} methodName
    @param {Array} methodArguments
    @return {String}
  */
  _getModelName(methodName, methodArguments) {
    let methodsWithExplicitlySpecifiedModelName = ['createRecord', 'getReference', 'hasRecordForId', 'normalize', 'peekAll', 'peekRecord', 'recordIsLoaded'];
    let methodsWithImplicitlySpecifiedModelName = ['deleteRecord', 'unloadRecord'];
    if (methodsWithExplicitlySpecifiedModelName.indexOf(methodName) > -1) {
      return methodArguments[0];
    } else if (methodsWithImplicitlySpecifiedModelName.indexOf(methodName) > -1) {
      return methodArguments[0].constructor.modelName;
    } else if (methodName === 'push') {
      let hash = methodArguments[0].data;
      if (isObject(hash)) {
        return hash.type;
      } else if (Ember.$.isArray(hash)) {
        return hash.length > 0 ? hash[0].type : '';
      } else if (isObject(methodArguments[0]) && methodArguments[0].hasOwnProperty('type')) {
        return methodArguments[0].type;
      } else {
        return '';
      }
    } else if (methodName === 'pushPayload' || methodName === 'unloadAll') {
      if (!Ember.isNone(methodArguments[0]) && typeof methodArguments[0] === 'string') {
        return methodArguments[0];
      } else {
        return '';
      }
    } else {
      return '';
    }
  },

  /*
    Detect which store should be used for specified modelName.
  */
  _useOnlineStore(modelName, useOnlineStoreParam) {
    let isOfflineModel = !Ember.isEmpty(modelName) ? this.get(`offlineModels.${modelName}`) : undefined;
    let useOnlineStore = useOnlineStoreParam === null ? typeof isOfflineModel === 'boolean' ? !isOfflineModel : null : useOnlineStoreParam;
    return (useOnlineStore === true) || (useOnlineStore === null && this._isOnline());
  },

  /**
    Update all databases in accordance with actual schemas.

    @method _dbInit
    @private
  */
  _dbInit() {
    let offlineSchema = this.get('offlineSchema');
    let dexieService = this.get('dexieService');
    for (let dbName in offlineSchema) {
      dexieService.dexie(dbName, this.get('offlineStore'));
    }
  },
});

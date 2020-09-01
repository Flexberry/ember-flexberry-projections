# Change Log

## [Unreleased]
### Added
- Store
    - `batchSelect` and `batchFindRecord` methods for loading data with batch.

## [2.5.0-beta.8] - 2020-08-25
### Added
- Passing headers when adapter's callFunction or callAction method called.

## [2.5.0-beta.7] - 2020-08-24
### Fixed
- When processing the response in the `batchUpdate` method of the `OData` adapter, models with only the `belongsTo` relationships changed were ignored.

### Changed
- When records stored in `IndexedDB` refer to other records that are not in `IndexedDB`, when querying those records using `IndexedDBAdapter`, you will see a warning in the console instead of a query error.

### Breaking changes
- The implementation of the `batchUpdate` method in the `Adapter.Offline` adapter has been removed, and the `save` method is now used instead.

## [2.5.0-beta.6] - 2020-08-06
### Added
- Rejecting promise if sync up through batch update failed.

### Fixed
- Prevent unloading record in syncer for not created entities completely.
- Logic of storing entities in offline if audit disabled.

## [2.5.0-beta.4] - 2020-07-22
### Added
- [WIP] The ability to skip data inconsistency errors when reading with the `IndexedDBAdapter` adapter.

## [2.5.0-beta.2] - 2020-06-22
### Added
- Store
    - createExistingRecord method to create record, that exists in backend, without request to it.
- Syncer service
    - Implemented sync up through batch update when useBatchUpdate flag set to true.
### Moved
- Logic for getting projection for syncing up into syncer service method.

## [2.5.0-beta.1] - 2020-06-10
### Fixed
- Not loaded `belongsTo` relationships were serialized to `null` when saved.

## [2.5.0-beta.0] - 2020-05-29
### Fixed
- [WIP] The `batchUpdate` method of the `Offline` adapter for models with polymorphic relationships does not work.

## [2.4.1] - 2020-05-18
### Fixed
- The `fields` parameter with the `xhrFields` property for the request in the `callFunction` and `callAction` methods of the `OData` adapter is lost.

## [2.4.0] - 2020-05-18
### Fixed
- The `save` method of the `audit-model` mixin loses arguments when the super method is called.
- For models using the `audit-model` mixin, when saved using batch update methods, the audit fields do not fill.
- For models using `Offline.ModelMixin`, no change history is generated when saved using batch update methods.
- The `OData` adapter:
    - The `callEmberOdataFunction` method returns a model without relationships, you must specify the projection name to get a model with relationships.
    - When building query for getting the record in the `batchUpdate` method, the serializer relationships settings were not used.
    - Building a query with using `IsOfPredicate` when the model name includes a namespace.
- Records deleted using the `batchUpdate` method of the `OData` or `Offline` adapters remained in the store.

### Deprecated
- The `callEmberOdataAction` and` callEmberOdataFunction` methods in the `OData` adapter.

### Breaking changes
- Now, when saving using batch update methods, the `save` method with the `softSave` option is called for all models.

## [2.3.0] - 2020-03-10
### Added
- `Adapter.Offline`:
    - Add `batchUpdate` method for store data in offline database.

### Fixed
- Building `OData` queries when using quotes (') in the `SimplePredicate` and `StringPredicate` predicates.
- Now the `DS.AdapterError` class is used for errors in the `batchUpdate` method of the `OData` adapter.

## [2.2.0] - 2019-12-26
### Added
- `Adapter.Odata`:
    - The `batchUpdate` method to send batch update, create or delete models in single transaction, also it's proxy in `Offline.Store`, `OData.OnlineStore` and `Offline.LocalStore`.
- `offline-globals`:
    - Add `getOfflineSchema` method for get offline schema.
- `Utils`:
    - Add `isUUID` function in utils for check attribute.
- Query language:
    - Add `stringToPredicate` method for converting strings to predicates.
- Add copyable mixin for models.

### Fixed
- Fix `batchUpdate` to prevent binded models becoming unavailable after pushPayload().
- Fix `batchUpdate` for models with relationships.
- Fix `batchUpdate` when empty array passed.
- The `batchUpdate` method in the `Adapter.Odata` class built invalid URL to create objects and mutated `headers` property.

## [2.1.0] - 2019-04-30
### Added
- Add package ember-moment to project.
- `Utils`:
    - Add `isOrdered` function in `Information` utils for check ordered attribute.
- `Adapter.Odata`
    - The `callEmberOdataFunction` and `callEmberOdataAction` methods to make OData-function and OData-action calls, returns ember models.

## [2.0.0] - 2018-12-07
### Added
- `Serializer.Base`:
    - The `normalize` method for update `typeClass` in case of polymorphic relationships.
- Query language:
    - `GeometryPredicate` for geometry data types.

### Fixed
- `Serializer.OData`:
    - The `normalize` method for update `typeClass` in case of hasMany polymorphic relationships.

## [0.13.0-beta.0] - 2018-09-17
### Added
- Query language:
    - The `IsOfPredicate` with implementation for `OData`.
    - The `isOf` method in `Query.Builder` for simple usage `IsOfPredicate`.

### Fixed
- Loss of `intersectsValue` in the `GeographyPredicate` when it inside `NotPredicate`.

## [0.12.0] - 2018-05-28
### Added
- `Projection.OnlineStore` as online store for `Offline.Store`.
- Implemented `deleteAllRecords` method for online and offline stores of `Offline.Store`.

### Changed
- Query language:
    - Now it's impossible to create `Query.DatePredicate` with invalid date or `null` value.

### Fixed
- `Audit.ModelMixin`:
    - Fix audit fields saving when `currentUserName` property returns promise.
- Query language:
    - The `timeless` mode of `Query.DatePredicate` for `Query.JsAdapter`.
    - Building queries for models that have `string` primary key type.

### Breaking changes
- `idType` property for defining primary key type on backed, moved from `Adapter.OData` to `Projection.Model`.

## [0.11.0] - 2018-02-20
### Added
- Query language:
    - `Timeless` mode for `DatePredicate`.
- `Adapter.Odata`
    - The `makeRequest`, `callAction` and `callFunction` methods to make AJAX-requests, OData-action and OData-function calls correspondingly.

### Fixed
- `Projection.Model`:
    - When calling `save` method, `model` was always saved offline.

## [0.10.0] - 2018-01-25
### Added
- `Projection.Model`:
    - `hasChangedBelongsTo` function to check 'belongsTo' relationship changes.
- Query language:
    - `NotPredicate` for `not` expressions.
- `Adapter.Odata`
    - If errors are occured adapter now responses with errors expected in [OData JSON Format](http://docs.oasis-open.org/odata/odata-json-format/v4.0/errata03/os/odata-json-format-v4.0-errata03-os-complete.html#_Toc453766668).

### Changed
- `user` service:
    - Getting of current user name is now able by calling `getCurrentUserName` method from `user` service.

### Fixed
- `Projection.Model`:
    - When calling `validate` method for `hasMany` relationships arguments are lost.
    - When extending `Projection.Model` and using inheritance, the entire hierarchy of models has a shared `projections` object. Now each child model has its own `projections` object and copy of parent `projections` object.
- `syncer` service:
    - Tracking changes for `syncUp` when `belongsTo` relationships changes.
- Query language:
    - `GeographyPredicate` was fixed.

## [0.9.0] - 2017-09-29
### Added
- Add `GeographyPredicate` for spatial data types.
- Add `DatePredicate` for dates.
- `Query.Builder`:
    - Add `customQueryParams` and `dataType` properties.
- `Adapter.Odata`:
    - Add `buildExportExcelURL` function to receive exported excel file URL.
- `Utils`:
    - Add `firstLoadOfflineObjects` function for initial loading and saving objects to IndexedDB.

### Changed
- Now if record saving fail, audit record won't be created.
- Replace `Ember.String` functions usage by functions with cyrillic support.
- `Adapter.Odata`:
    - Improve `buildExportExcelURL` function to receive exported excel file URL.
    - Now `query` method can return files.

### Fixed
- `Projection.Model`:
    - Fix `_aggregateHasManyRelationshipValidationErrors` method validation error when deleting new unsaved detail.
    - Fix `_saveCanonicalBelongsTo` method error when `canonicalBelongsTo` value changed to `null`.
- `Adapter.Offline`:
    - Fix `syncDownTime` property addition for offline models.
- `syncer` service:
    - Fix wrong converting of `'true'` strings to boolean value when performing sync up process.

## [0.8.4] - 2017-02-09
### Fixed
- `Projection.Model`:
    - Fix `changedHasMany` function: added supporting of `undefined` internal models.

## [0.8.3] - 2017-02-08
### Fixed
- `syncer` service:
    - Fix wrong `store` in `syncUp` method.

## [0.8.2] - 2017-02-06
### Fixed
- `Projection.Model`:
    - Now canonical state of hasMany relationships sets to current state after saving.

## [0.8.1] - 2017-01-26
### Fixed
- `Query.IndexedDBAdapter`:
    - Fix `meta.count` computing.
- `Query.JsAdapter`:
    - Fixed error when hasMany relationship is undefined in indexed DB.

## [0.8.0] - 2016-12-30
### Added
- `Query.IndexedDBAdapter`:
    - Added implementation in-memory joins for offline data instead very slowly relation-by-relation scan and load objects by id.
    - Support `count` function of query builder.
- `Offline.Store`:
    - Property `offlineModels` for specifying models that should be always loaded from offline store.
    - Properties `queueSyncDownWorksCount` and `completeSyncDownWorksCount` for tracking count of objects that should be synced down.
- `Adapter.Offline`:
    - Ability to specify table name for `clear` method. This case can be used for clearing one table.
    - Logic for saving parent models in offline mode (for create/update/delete operations). Now it is not using transactions (will be added in next versions).
- `Adapter.Odata`:
    - `timeout` property.
- `syncer` service:
    - Default error handlers. Override [`resolveServerError`](https://github.com/Flexberry/ember-flexberry-data/blob/5a4ae8a2ab6e8c85dff17a6908b25ead887b6f6d/addon/services/syncer.js#L222) and [`resolveNotFoundRecord`](https://github.com/Flexberry/ember-flexberry-data/blob/5a4ae8a2ab6e8c85dff17a6908b25ead887b6f6d/addon/services/syncer.js#L259) methods to add custom logic.
    - Saving changed relationships for sync up process.
    - Ability to specify query object in `syncDown` method in case of syncing down records by model type.
    - Ability to specify option for unloading records from online store when sync down. It's topical for sync down big data. Please add `{ unloadSyncedRecords: true }` as fourth parameter in `syncDown` method calls where needed.
    - `syncDownTime` property of model is setting now when performing sync down operation.
    - `allowSyncDownRelatedRecordsWithoutProjection` option for offline settings. If true then record will be synced down completely, i.e. including with all related records with arbitrary nesting. Otherwise only requested record will be synced down without related records.
- `Projection.Model`:
    - Validations for 'hasMany' relationships.
    - Model properties:
        - `isSyncingUp` - true if model is syncing up.
        - `isCreatedDuringSyncUp` - true if model is created during sync up process.
        - `isUpdatedDuringSyncUp` - true if model is updated last time during sync up process.
        - `isDestroyedDuringSyncUp` - true if model is destroyed during sync up process.
- Now `dexie` service can work with multiple DBs.
- Some parameters checks for `Query.Builder` and `Utils.Information` classes.


### Changed
- Update Dexie to 1.4.2 version.
- `Offline.Store`:
    - Now uses static `offlineSchema`. You must define `offlineSchema` property in `store` service of your application. **Important**. This changes are breaking!
- `syncer` service:
    - Changed arguments for `syncUp` method, first parameter now can be and array of jobs for execute, object with options for sync is second parameter now. **Important**. This changes are breaking!
    - Disable models unloads after sync down and sync up operations.
    - Now we don't replace entire record when sync down. Instead we save only changed properties which are specified in projection for existing records in local store.
- `Query.IndexedDBAdapter`:
    - Search by string (e.g. by all fields in lists) is now case insensitive.
- `Offline.LocalStore` and `Adapter.Offline`:
    - Renamed property `databaseName` to `dbName`.
- It is not necessary now to add attribute or relationship to model projection if it is needed for building restriction with query language.
- `Ember.Logger.xxx` changed to `Ember.xxx` calls and throwing errors. So redundant messages will not display in console in production.

### Fixed
- Loading relationships in offline mode moved "under" offline adapter layer, i.e. offline adapter now get "full object" at once with embedded objects for embedded relationships. So now fixed:
    - `Adapter.Offline` apply filters after loading relationships. This allows to filter data by master and detail model's proprties.
    - There is no relationships that "disappear" unexpectedly after reading data.
    - Improved performance for reading data in offline mode.
- `Adapter.Offline`:
    - Error at attempt to save existing records into IndexedDB.
    - Now it is able to save and read `null` value in `boolean` attributes in offline mode.
    - Not quite adequate implementation of `updateRecord` method.
    - Closing IndexedDB connection during CRUD operations.
    - Errors during parallel requests to IndexedDB (now using queue of requests).
    - Errors when making predicates for query object (when passed query to `query` method is not `QueryObject`).
    - Result type for `createRecord` and `updateRecord` methods.
- `Projection.StoreMixin`:
    - Wrong projection for reading data used in `findRecord` and `findAll` methods if projection was not specified for query.
- `Query.IndexedDBAdapter`:
    - IndexedDB not support filter by keys type of `boolean`.
    - Searching presence of relationships in query with `containsRelationships` method could return wrong results.
    - Sorting is now applying before skip and top.
- `Query.JsAdapter`:
    - Search by empty fields.
- Query language:
    - Querying records by fields of `date` type.
    - Filter by boolean value in offline mode, if restriction was passed through complex predicate.
- Optimizing performance:
    - For sync down operation.
    - Application loading performance.
    - For different operations with data in addon by setting some factories as singletons. It optimizes performance of lookup operation for particular factory because new instance of factory class is not creating.
    - CRUD operations in offline adapter.
- `syncer` service:
    - Unloading synced records from online store after sync down operation.
    - Relationships of model are not reset now when syncing up after changing model in offline mode.
    - Validation errors could break syncing up if model was updated in offline mode.
    - Wrong store instance was used for loading relationships in offline mode, it causes errors when syncing up.
    - Casting for `boolean` type and casting for `null` value of all types while performing sync up.
    - Saving of wrong relationship type for polymorphic belongsTo relationships in offline audit objects.
    - Some internal bugs in `syncDown` method.
    - Loading only one last relationship when restoring changes for record while performing sync up.
    - Considering types of attributes when restoring values while performing sync up, now it makes casting for `date` and `number` types.
    - `reloadLocalRecords` method tried to clear table using model class instead of model name.
- `Serializer.Offline`:
    - Now we are setting proper types of polymorphic belongsTo relationships in offline mode.
    - Serializing attributes of `boolean`, `number` and `decimal` types when saving offline.
    - `normalizeArrayResponse` method did not expect that adapter can return response in various format.
    - Processing of included objects in `normalizeArrayResponse` method.
- `Projection.Model`:
    - `rollbackBelongsTo` method.
    - Now `changedBelongsTo` is empty after saving created model.
- `Offline.ModelMixin`:
    - Audit fields was not filled because `save` method of `Offline.ModelMixin` run before `save` method of `Audit.ModelMixin`.
- `Offline.Store`:
    - Syncing down records with option `syncDownWhenOnlineEnabled` is now using specified projection for online store's method call.
    - `useOnlineStore` parameter is not deleting now from query object for `query` and `queryRecord` methods.
- `Offline.LocalStore`:
    - Projection passed in options now processing correctly in `findAll` and `findRecord` methods.
- Disable offline audit for `i-c-s-soft-s-t-o-r-m-n-e-t-security-agent` model.
- Remove validation from audit models.

### Removed
- Redundant decoration of online serializer.
- Obsolete code in `syncer` service.

### Known issues
- It is not possible for now to specify Dexie upgrage functions when specifying offline schema versions.

## [0.6.1] - 2016-09-16
### Fixed
- `Adapter.Offline`:
    - Using primary key type of string.
    - Schema versioning for [Dexie](https://github.com/dfahlander/Dexie.js/wiki/Design#database-versioning).

## [0.6.0] - 2016-09-14
### Added
- Query language support for `offline` adapter.
- Dependency on [`node-uuid` package](https://github.com/broofa/node-uuid). Please update addon using `ember install` command or add this dependency to `package.json` manually.

### Changed
- Model key automatically added for queries without projection (using method `Query.Builder.select`).
- Moved base model validation from [`ember-flexberry` addon](https://github.com/Flexberry/ember-flexberry).
- Update models for supporting role based security.

### Fixed
- Errors in building queries without projection (using `Query.Builder.select`).

### Removed
- Dependency on `ember-locaforage-adapter` addon and `localforage` library. **Please remove these dependencies** from `package.json` and `bower.json` in your application. Also **please delete corresponding folders** from `node_modules` and `bower_components` in applicatoin's sources.

## [0.5.0] - 2016-09-05
### Added
- Enum support for OData query language adapter.
- `guid` transform to support adding constraints on attributes with guid type via query language.
- Methods for rollback relationships of model:
  - `changedBelongsTo` - to find out `belongsTo` relationships were changed.
  - `rollbackBelongsTo` - to perform rollback `belongsTo` relationships operation.
  - `changedHasMany` - to find out `hasMany` relationships were changed.
  - `rollbackHasMany` - to perform rollback `hasMany` relationships operation.
- Synchronization of model changes made in offline mode using `syncUp` method (with a server) in `Syncer` class.
- Models for supporting client side audit.

### Changed
- Now `syncer` is an ember service.

### Fixed
- Using captions instead keys for enum fields in `syncer`.
- Now using `query` method instead of `queryRecord` in `Syncer` because of [issue in `ember-data@2.4.3`](https://github.com/emberjs/data/issues/4310).
- Added missing files to `app/initializers` which are required for offline support.

## [0.4.0] - 2016-08-14
### Added
- Transforms, models, enums and enum initializer from [`ember-flexberry`](https://github.com/Flexberry/ember-flexberry) addon.
- `decimal` transform for ability to use '.' and ',' as decimal separator in float numbers. So now it is possible to use `decimal` type for declaring attributes of models.
- CRUD operations tests for OData.

### Changed
- Function `enumCaptions` now returns object without null values.
- Offline support:
    - It is not necessary now to specify projection when syncing down or reading data from offline storage.

### Fixed
- Using `pathForType` function in `ODataAdapter` for building URL.
- It is possible now to specify `namespace` property in `ODataAdapter` for building URL.

## [0.3.1] - 2016-07-26
### Added
- As you can see, we started to use integrated tests with OData...

### Removed
- Method `QueryBuilder.expand` removed.

### Fixed
- Error in building OData query for details.
- Missing classes in `Query` namespace that should be exported.
- Error in building OData query for projections.
- Error in building OData query for details.
- Method `store.findRecord` now correctly returns single object.
- Using properties for relationships in projections do not cause errors when apply `selectByProjection` method of query language for reading models.

## [0.3.0] - 2016-07-19
### Added
- Support `polymorphic` options for `belongsTo` relationships.
- Support special 'id' attribute at query language:

  ```javascript
  new SimplePredicate('manager', 'eq', key) === new SimplePredicate('manager.id', 'eq', key)
  ```
- Classes to support work in offline mode. See `Offline` namespace in [api documentation](http://flexberry.github.io/Documentation/master/modules/ember-flexberry-data.html).

### Changed
- The addon is no longer exports `Projection` namespace with following extra changes:
    - `Projection`, `Offline`, `Adapter`, `Serializer`, `Query`, `Utils` namespaces are exporting now.
    - `Projection.Store` mixin renamed to `Projection.StoreMixin`.
    - `Projection.Adapter` mixin renamed to `Projection.AdapterMixin`.
    - All adapters were included into `Adapter` napespace.
    - All serializers were included into `Serializer` napespace.
    - All client query language classes were included into `Query` napespace.
    - `Information` class was included into `Utils` napespace.
  For more information please see [api documentation](http://flexberry.github.io/Documentation/master/modules/ember-flexberry-data.html).

### Fixed
- Using `QueryBuilder.byId` method for OData query language adapter.

### Known issues
- Using properties for relationships in projections may cause errors when apply `selectByProjection` method of query language for reading models.

## [0.2.0] - 2016-07-01
### Added
- Predicates for details with any / all functionality.
- Filtering and ordering by master (using primary key) and it's fields.
### Fixed
- Using nested complex predicates for all query language adapters.

## [0.1.0] - 2016-06-03
### Changed
- Downgrade version of `broccoli-jscs` to 1.2.2.
- Upgrade `ember-cli` to 2.4.3.

## [0.0.3] - 2016-06-02
### Added
- Implementation of abstract query language adapter for IndexedDB.
### Fixed
- Logical operators in OData queries.

## [0.0.2] - 2016-05-25
### Fixed
- Building OData URL for CRUD operations.

## [0.0.1] - 2016-05-20
The first release of ember-flexberry-data!
### Added
- Implementation of _projections_ - predefined named set of model attributes.
- Implementation of abstract query language and adapters for OData and JSON.
- Implementations of `DS.Store` and `DS.Adapter` with support of _projections_.

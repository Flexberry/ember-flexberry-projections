import Ember from 'ember';
import DS from 'ember-data';

import SnapshotTransform from '../utils/snapshot-transform';
import ODataQueryAdapter from '../query/odata-adapter';

/**
 * The OData adapter class.
 * Uses Flexberry Query as a language for requesting server.
 *
 * @module ember-flexberry-projections
 * @namespace DS
 * @class ODataAdapter
 * @extends DS.RESTAdapter
 * @public
 */
export default DS.RESTAdapter.extend({
  headers: {
    Prefer: 'return=representation'
  },

  idType: 'number',

  /**
   * Overloaded method from `RESTAdapter` (Ember Data).
   * Called by the sore in order to fetch data from the server.
   *
   * @method query
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {Query} query Flexberry Query object.
   * @return {Promise}
   */
  query(store, type, query) {
    var url = this.buildURL(type.modelName, null, null, 'query', query);
    var data = new ODataQueryAdapter('unused', store).getOData(query);

    if (this.sortQueryParams) {
      data = this.sortQueryParams(data);
    }

    Ember.Logger.debug('OData::query', data);

    return this.ajax(url, 'GET', { data: data });
  },

  /**
   * Overloaded method from `build-url-mixin` (Ember Data), that determines the pathname for a given type.
   * Additionally capitalizes the type name (requirement of Flexberry OData Server).
   *
   * @method pathForType
   * @param {String} modelName
   * @return {String} The path for a given type.
   */
  pathForType(modelName) {
    var camelized = Ember.String.camelize(modelName);
    var capitalized = Ember.String.capitalize(camelized);
    return Ember.String.pluralize(capitalized);
  },

  /**
   * Overloaded method from `build-url-mixin` (Ember Data), taht builds URL to OData feed.
   * Appends id as `(id)` (OData specification) instead of `/id`.
   *
   * @method _buildURL
   * @param {String} modelName
   * @param {String} id
   * @return {String}
   * @private
   */
  _buildURL(modelName, id) {
    var url = [];
    var host = Ember.get(this, 'host');
    var prefix = this.urlPrefix();
    var path;

    if (modelName) {
      path = this.pathForType(modelName);
      if (path) {
        url.push(path);
      }
    }

    if (prefix) {
      url.unshift(prefix);
    }

    url = url.join('/');
    if (!host && url && url.charAt(0) !== '/') {
      url = '/' + url;
    }

    if (id != null) {
      // Append id as `(id)` (OData specification) instead of `/id`.
      url = this._appendIdToURL(id, url);
    }

    return url;
  },

  createRecord(store, type, snapshot) {
    return this._sendRecord(store, type, snapshot, 'createRecord');
  },

  updateRecord(store, type, snapshot) {
    return this._sendRecord(store, type, snapshot, 'updateRecord');
  },

  deleteRecord(store, type, snapshot) {
    return this._sendRecord(store, type, snapshot, 'deleteRecord');
  },

  /**
   * Makes HTTP request for creating, updating or deleting the record.
   *
   * @method _sendRecord
   * @private
   */
  _sendRecord(store, type, snapshot, requestType) {
    // TODO: maybe move it into serializer (serialize or serializeIntoHash)?
    let skipUnchangedAttrs = true;
    SnapshotTransform.transformForSerialize(snapshot, skipUnchangedAttrs);

    // NOTE: for newly created records id is not defined.
    let url = this.buildURL(type.modelName, snapshot.id, snapshot, requestType);

    let httpMethod;
    switch (requestType) {
      case 'createRecord':
        httpMethod = 'POST';
        break;

      case 'updateRecord':
        httpMethod = skipUnchangedAttrs ? 'PATCH' : 'PUT';
        break;

      case 'deleteRecord':
        httpMethod = 'DELETE';
        break;

      default:
        throw new Error(`Unknown requestType: ${requestType}`);
    }

    let data;

    // Don't need to send any data for deleting.
    if (requestType !== 'deleteRecord') {
      let serializer = store.serializerFor(type.modelName);
      data = {};
      serializer.serializeIntoHash(data, type, snapshot);
    }

    return this.ajax(url, httpMethod, { data: data }).then(function(response) {
      return response;
    });
  },

  /**
   * Appends id to URL according to the OData specification.
   *
   * @method _appendIdToURL
   * @param {String} id
   * @param {String} url
   * @private
   */
  _appendIdToURL(id, url) {
    let encId = encodeURIComponent(id);
    let idType = Ember.get(this, 'idType');
    if (idType !== 'number') {
      encId = `'${encId}'`;
    }

    url += '(' + encId + ')';
    return url;
  }
});
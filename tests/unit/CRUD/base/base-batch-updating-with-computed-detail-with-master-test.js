import Ember from 'ember';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

export default function batchUpdatingWithCompDetailMasterTest(store, assert) {
  assert.expect(4);
  let done = assert.async();

  Ember.run(() => {
    let records = initTestData(store);
    store.adapterFor('application').batchUpdate(store, Ember.A(records)).then((result) => {
      assert.equal(result.length, 3);
      assert.ok(result[0] === records[0]);
      assert.ok(result[1] === records[1]);
      assert.ok(result[2] === records[2]);
    })
    .catch((e) => {
      console.log(e, e.message);
      throw e;
    })
    .finally(done);
  });
}

function initTestData(store) {
  // Parent type
  let result = [];

  let createdSuggestionType = store.createRecord('ember-flexberry-dummy-suggestion-type', {
    id: generateUniqueId(),
    name: 'Parent type',
  });

  let createdLocalization = store.createRecord('ember-flexberry-dummy-localization', {
    id: generateUniqueId(),
    name: 'en',
  });

  let createdLocalizationSuggestionType = store.createRecord('ember-flexberry-dummy-localized-suggestion-type', {
    id: generateUniqueId(),
    name: 'LocName',
    localization: createdLocalization,
    suggestionType: createdSuggestionType,
  });

  result.push(createdSuggestionType, createdLocalization, createdLocalizationSuggestionType);

  return result;
}

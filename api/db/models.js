const mongoose = require('mongoose');
const { createModels } = require('@openbiocure/data-schemas');
const models = createModels(mongoose);

module.exports = { ...models };

'use strict';

/**
 * test1 service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::test1.test1');

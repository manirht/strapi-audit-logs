export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/audit-logs',
        handler: 'audit-log.find',
        config: {
          policies: [
            {
              name: 'admin::hasPermissions',
              config: {
                actions: ['plugin::audit-logs.read'],
              },
            },
          ],
        },
      },
      {
        method: 'GET',
        path: '/audit-logs/:id',
        handler: 'audit-log.findOne',
        config: {
          policies: [
            {
              name: 'admin::hasPermissions',
              config: {
                actions: ['plugin::audit-logs.read'],
              },
            },
          ],
        },
      },
      {
        method: 'POST',
        path: '/audit-logs/cleanup',
        handler: 'audit-log.cleanup',
        config: {
          policies: [
            {
              name: 'admin::hasPermissions',
              config: {
                actions: ['plugin::audit-logs.cleanup'],
              },
            },
          ],
        },
      },
    ],
  },
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/',
        handler: 'audit-log.find',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/:id',
        handler: 'audit-log.findOne',
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/cleanup',
        handler: 'audit-log.cleanup',
        config: {
          policies: [],
        },
      },
    ],
  },
};

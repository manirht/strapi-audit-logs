import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'audit-logs',
    },
    {
      section: 'plugins',
      displayName: 'Cleanup',
      uid: 'cleanup',
      pluginName: 'audit-logs',
    },
  ];

  // Register the permissions/actions
  strapi.admin?.services?.permission?.actionProvider?.registerMany(actions);
};

export default register;

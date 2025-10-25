/**
 * Example configuration for the Audit Logs plugin
 * 
 * Add this to your config/plugins.js or config/plugins.ts file
 */

module.exports = {
  // ... other plugin configurations
  
  'audit-logs': {
    enabled: true,
    config: {
      // Enable or disable audit logging globally
      enabled: true,
      
      // Content types to exclude from logging
      // Add content type UIDs that you don't want to audit
      excludeContentTypes: [
        // Examples:
        // 'api::temporary-data.temporary-data',
        // 'api::analytics-event.analytics-event',
        // 'api::user-session.user-session',
      ],
      
      // Number of days to keep audit logs before cleanup
      // Default: 90 days
      retentionDays: 90,
    },
  },
};

/**
 * TypeScript version (config/plugins.ts)
 */
// export default {
//   'audit-logs': {
//     enabled: true,
//     config: {
//       enabled: true,
//       excludeContentTypes: [],
//       retentionDays: 90,
//     },
//   },
// };

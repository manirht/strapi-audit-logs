export default {
  default: {
    /**
     * Enable or disable audit logging globally
     */
    enabled: true,

    /**
     * Array of content types to exclude from audit logging
     * Example: ['api::article.article', 'api::comment.comment']
     */
    excludeContentTypes: [] as string[],

    /**
     * Number of days to keep audit logs before cleanup (optional)
     */
    retentionDays: 90,
  },
  validator: (config: any) => {
    if (typeof config.enabled !== 'boolean') {
      throw new Error('audit-logs.enabled must be a boolean');
    }
    if (!Array.isArray(config.excludeContentTypes)) {
      throw new Error('audit-logs.excludeContentTypes must be an array');
    }
    if (config.retentionDays && typeof config.retentionDays !== 'number') {
      throw new Error('audit-logs.retentionDays must be a number');
    }
  },
};

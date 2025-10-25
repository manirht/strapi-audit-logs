export default {
  kind: 'collectionType',
  collectionName: 'audit_logs',
  info: {
    singularName: 'audit-log',
    pluralName: 'audit-logs',
    displayName: 'Audit Log',
    description: 'Audit log entries for content changes',
  },
  options: {
    draftAndPublish: false,
    comment: 'Audit logs for tracking content changes',
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    contentType: {
      type: 'string',
      required: true,
      description: 'The content type name (e.g., api::article.article)',
    },
    recordId: {
      type: 'string',
      required: true,
      description: 'The ID of the content record that was modified',
    },
    action: {
      type: 'enumeration',
      enum: ['create', 'update', 'delete'],
      required: true,
      description: 'The type of action performed',
    },
    userId: {
      type: 'integer',
      description: 'The ID of the user who performed the action',
    },
    userName: {
      type: 'string',
      description: 'The name of the user who performed the action',
    },
    userEmail: {
      type: 'string',
      description: 'The email of the user who performed the action',
    },
    changedFields: {
      type: 'json',
      description: 'The fields that were changed (for update operations)',
    },
    previousData: {
      type: 'json',
      description: 'The previous values of changed fields (for update operations)',
    },
    newData: {
      type: 'json',
      description: 'The new values of changed fields (for update and create operations)',
    },
    payload: {
      type: 'json',
      description: 'Full payload data for the operation',
    },
  },
};

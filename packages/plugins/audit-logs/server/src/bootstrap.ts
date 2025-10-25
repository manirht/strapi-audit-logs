import type { Core } from '@strapi/strapi';

/**
 * Register lifecycle hooks for audit logging
 */
const registerAuditHooks = (strapi: Core.Strapi) => {
  // Hook into document service for create, update, delete operations
  strapi.documents.use(async (context, next) => {
    const { action, uid: contentType } = context;

    // Only log create, update, and delete actions
    if (!['create', 'update', 'delete'].includes(action)) {
      return next();
    }

    const auditLogService = strapi.plugin('audit-logs').service('audit-log');
    
    // Get user information from context
    const userInfo = auditLogService.getUserInfo(context);

    let previousData = null;
    let recordId = null;

    // For update and delete operations, get the current data first
    if (action === 'update' || action === 'delete') {
      try {
        const params = context.params as any;
        recordId = params?.documentId || params?.where?.documentId;

        if (recordId) {
          previousData = await strapi.documents(contentType).findOne({
            documentId: recordId,
          });
        }
      } catch (error) {
        strapi.log.warn('Failed to get previous data for audit log:', error);
      }
    }

    // Execute the actual operation
    const result = await next();

    // After the operation, create the audit log
    try {
      if (action === 'create') {
        // For create operations
        const newRecord = result as any;
        recordId = newRecord?.documentId || newRecord?.id;

        if (recordId) {
          const { changedFields, newData } = auditLogService.calculateDiff(
            null,
            newRecord
          );

          await auditLogService.createLog({
            contentType,
            recordId,
            action: 'create',
            ...userInfo,
            changedFields,
            newData,
            payload: newRecord,
          });
        }
      } else if (action === 'update') {
        // For update operations
        const updatedRecord = result as any;
        recordId = updatedRecord?.documentId || updatedRecord?.id || recordId;

        if (recordId && previousData) {
          const { changedFields, previousData: prevData, newData } = 
            auditLogService.calculateDiff(previousData, updatedRecord);

          // Only create log if there were actual changes
          if (changedFields.length > 0) {
            await auditLogService.createLog({
              contentType,
              recordId,
              action: 'update',
              ...userInfo,
              changedFields,
              previousData: prevData,
              newData,
              payload: updatedRecord,
            });
          }
        }
      } else if (action === 'delete') {
        // For delete operations
        if (recordId && previousData) {
          await auditLogService.createLog({
            contentType,
            recordId,
            action: 'delete',
            ...userInfo,
            previousData,
            payload: previousData,
          });
        }
      }
    } catch (error) {
      // Log error but don't fail the operation
      strapi.log.error('Failed to create audit log:', error);
    }

    return result;
  });

  strapi.log.info('Audit log hooks registered successfully');
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register audit logging hooks
  registerAuditHooks(strapi);

  strapi.log.info('Audit Logs plugin initialized');
};

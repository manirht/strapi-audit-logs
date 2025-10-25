import type { Core } from '@strapi/strapi';

export interface AuditLogData {
  contentType: string;
  recordId: string | number;
  action: 'create' | 'update' | 'delete';
  userId?: number;
  userName?: string;
  userEmail?: string;
  changedFields?: string[];
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  payload?: Record<string, any>;
}

const auditLogService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Create an audit log entry
   */
  async createLog(data: AuditLogData) {
    try {
      const config = strapi.config.get('plugin::audit-logs', {
        enabled: true,
        excludeContentTypes: [],
      });

      // Check if audit logging is enabled
      if (!config.enabled) {
        return null;
      }

      // Check if this content type is excluded
      if (config.excludeContentTypes?.includes(data.contentType)) {
        return null;
      }

      // Don't log audit log changes to prevent infinite loops
      if (data.contentType === 'plugin::audit-logs.audit-log') {
        return null;
      }

      const logEntry = await strapi.documents('plugin::audit-logs.audit-log').create({
        data: {
          contentType: data.contentType,
          recordId: String(data.recordId),
          action: data.action,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          changedFields: data.changedFields,
          previousData: data.previousData,
          newData: data.newData,
          payload: data.payload,
        },
      });

      return logEntry;
    } catch (error) {
      strapi.log.error('Error creating audit log:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  },

  /**
   * Calculate diff between old and new data
   */
  calculateDiff(
    oldData: Record<string, any> | null,
    newData: Record<string, any>
  ): {
    changedFields: string[];
    previousData: Record<string, any>;
    newData: Record<string, any>;
  } {
    const changedFields: string[] = [];
    const previousData: Record<string, any> = {};
    const currentData: Record<string, any> = {};

    // Ignore these meta fields
    const ignoreFields = [
      'id',
      'createdAt',
      'updatedAt',
      'publishedAt',
      'createdBy',
      'updatedBy',
    ];

    if (!oldData) {
      // For create operations, return all new data
      Object.keys(newData).forEach((key) => {
        if (!ignoreFields.includes(key)) {
          changedFields.push(key);
          currentData[key] = newData[key];
        }
      });
    } else {
      // For update operations, compare old and new
      Object.keys(newData).forEach((key) => {
        if (ignoreFields.includes(key)) return;

        const oldValue = oldData[key];
        const newValue = newData[key];

        // Deep comparison for objects and arrays
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changedFields.push(key);
          previousData[key] = oldValue;
          currentData[key] = newValue;
        }
      });
    }

    return {
      changedFields,
      previousData,
      newData: currentData,
    };
  },

  /**
   * Get user information from context
   */
  getUserInfo(context: any): {
    userId?: number;
    userName?: string;
    userEmail?: string;
  } {
    const user = context?.state?.user;
    
    if (!user) {
      return {};
    }

    return {
      userId: user.id,
      userName: user.username || user.name || user.firstname 
        ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
        : undefined,
      userEmail: user.email,
    };
  },

  /**
   * Find audit logs with filtering and pagination
   */
  async findLogs(params: {
    contentType?: string;
    userId?: number;
    action?: 'create' | 'update' | 'delete';
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    const {
      contentType,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      pageSize = 25,
      sort = 'createdAt:desc',
    } = params;

    const filters: any = {};

    if (contentType) {
      filters.contentType = { $eq: contentType };
    }

    if (userId) {
      filters.userId = { $eq: userId };
    }

    if (action) {
      filters.action = { $eq: action };
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = startDate;
      }
      if (endDate) {
        filters.createdAt.$lte = endDate;
      }
    }

    const results = await strapi.documents('plugin::audit-logs.audit-log').findMany({
      filters,
      sort: sort.split(','),
      page,
      pageSize,
    });

    return results;
  },

  /**
   * Get a single audit log by ID
   */
  async findOne(id: string | number) {
    return strapi.documents('plugin::audit-logs.audit-log').findOne({
      documentId: String(id),
    });
  },

  /**
   * Delete old audit logs (for cleanup)
   */
  async deleteOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldLogs = await strapi.db.query('plugin::audit-logs.audit-log').findMany({
      where: {
        createdAt: {
          $lt: cutoffDate.toISOString(),
        },
      },
      select: ['id'],
    });

    if (oldLogs.length > 0) {
      await strapi.db.query('plugin::audit-logs.audit-log').deleteMany({
        where: {
          id: {
            $in: oldLogs.map((log: any) => log.id),
          },
        },
      });

      strapi.log.info(`Deleted ${oldLogs.length} old audit logs`);
    }

    return oldLogs.length;
  },
});

export default auditLogService;

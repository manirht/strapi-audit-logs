import type { Core } from '@strapi/strapi';

const auditLogController = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get all audit logs with filtering and pagination
   * GET /audit-logs
   */
  async find(ctx: any) {
    try {
      const { query } = ctx.request;
      
      const {
        contentType,
        userId,
        action,
        startDate,
        endDate,
        page,
        pageSize,
        sort,
      } = query;

      const results = await strapi
        .plugin('audit-logs')
        .service('audit-log')
        .findLogs({
          contentType,
          userId: userId ? parseInt(userId, 10) : undefined,
          action,
          startDate,
          endDate,
          page: page ? parseInt(page, 10) : undefined,
          pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
          sort,
        });

      ctx.body = results;
    } catch (error: any) {
      ctx.throw(500, error?.message || 'Internal server error');
    }
  },

  /**
   * Get a single audit log by ID
   * GET /audit-logs/:id
   */
  async findOne(ctx: any) {
    try {
      const { id } = ctx.params;

      const log = await strapi
        .plugin('audit-logs')
        .service('audit-log')
        .findOne(id);

      if (!log) {
        return ctx.notFound('Audit log not found');
      }

      ctx.body = log;
    } catch (error: any) {
      ctx.throw(500, error?.message || 'Internal server error');
    }
  },

  /**
   * Delete old audit logs
   * POST /audit-logs/cleanup
   */
  async cleanup(ctx: any) {
    try {
      const { daysToKeep = 90 } = ctx.request.body;

      const deletedCount = await strapi
        .plugin('audit-logs')
        .service('audit-log')
        .deleteOldLogs(daysToKeep);

      ctx.body = {
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} old audit log entries`,
      };
    } catch (error: any) {
      ctx.throw(500, error?.message || 'Internal server error');
    }
  },
});

export default auditLogController;

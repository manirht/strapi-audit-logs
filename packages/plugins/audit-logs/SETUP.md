# Audit Logs Plugin - Setup Guide

## Quick Start

### 1. Build the Plugin

From the root of the Strapi monorepo:

```bash
npm run build
```

Or build just the audit-logs plugin:

```bash
cd packages/plugins/audit-logs
npm run build
```

### 2. Configure the Plugin

Create or edit `config/plugins.js` in your Strapi application:

```javascript
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: true,
      excludeContentTypes: [],
      retentionDays: 90,
    },
  },
};
```

### 3. Start Your Strapi Application

```bash
npm run develop
```

The plugin will automatically:
- Create the `audit_logs` table in your database
- Start logging all content changes
- Register the API endpoints

### 4. Grant Permissions

1. Go to **Settings** → **Administration Panel** → **Roles**
2. Select a role (e.g., "Super Admin")
3. Under **Plugins** → **Audit Logs**, check:
   - ✅ Read
   - ✅ Cleanup (optional, for admin roles only)
4. Save

### 5. Test the API

Get audit logs:

```bash
curl http://localhost:1337/api/audit-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Migration

The plugin automatically creates the `audit_logs` table when Strapi starts. No manual migration is needed.

The table structure:
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id VARCHAR(255),
  content_type VARCHAR(255) NOT NULL,
  record_id VARCHAR(255) NOT NULL,
  action ENUM('create', 'update', 'delete') NOT NULL,
  user_id INT,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  changed_fields JSON,
  previous_data JSON,
  new_data JSON,
  payload JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_content_type (content_type),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

## Advanced Configuration

### Exclude Specific Content Types

```javascript
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: true,
      excludeContentTypes: [
        'api::analytics-event.analytics-event',
        'api::user-session.user-session',
        'plugin::upload.file', // Don't log file uploads
      ],
      retentionDays: 90,
    },
  },
};
```

### Disable Logging Temporarily

```javascript
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: false, // Set to false to disable
      excludeContentTypes: [],
      retentionDays: 90,
    },
  },
};
```

### Environment-Specific Configuration

```javascript
module.exports = ({ env }) => ({
  'audit-logs': {
    enabled: true,
    config: {
      // Only enable in production
      enabled: env('NODE_ENV') === 'production',
      excludeContentTypes: [],
      retentionDays: env.int('AUDIT_LOG_RETENTION_DAYS', 90),
    },
  },
});
```

## Setting Up Automated Cleanup

Create `config/cron-tasks.js`:

```javascript
module.exports = {
  /**
   * Clean up audit logs older than retention period
   * Runs every Sunday at midnight
   */
  '0 0 * * 0': async ({ strapi }) => {
    const retentionDays = strapi.config.get('plugin::audit-logs.retentionDays', 90);
    const deletedCount = await strapi
      .plugin('audit-logs')
      .service('audit-log')
      .deleteOldLogs(retentionDays);
    
    strapi.log.info(`Cleaned up ${deletedCount} old audit logs`);
  },
};
```

## API Usage Examples

### Filter by Content Type

```bash
curl "http://localhost:1337/api/audit-logs?contentType=api::article.article" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by User

```bash
curl "http://localhost:1337/api/audit-logs?userId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Action

```bash
curl "http://localhost:1337/api/audit-logs?action=delete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Date Range

```bash
curl "http://localhost:1337/api/audit-logs?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Pagination and Sorting

```bash
curl "http://localhost:1337/api/audit-logs?page=2&pageSize=50&sort=createdAt:desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Combined Filters

```bash
curl "http://localhost:1337/api/audit-logs?contentType=api::article.article&action=update&userId=1&page=1&pageSize=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Programmatic Usage

### Create Custom Audit Logs

You can create custom audit logs in your code:

```javascript
// In a controller or service
await strapi.plugin('audit-logs').service('audit-log').createLog({
  contentType: 'api::article.article',
  recordId: '123',
  action: 'update',
  userId: ctx.state.user.id,
  userName: ctx.state.user.username,
  userEmail: ctx.state.user.email,
  changedFields: ['title', 'content'],
  previousData: { title: 'Old Title' },
  newData: { title: 'New Title' },
  payload: { /* full data */ },
});
```

### Query Audit Logs

```javascript
// Find audit logs
const logs = await strapi.plugin('audit-logs').service('audit-log').findLogs({
  contentType: 'api::article.article',
  userId: 1,
  action: 'update',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  page: 1,
  pageSize: 25,
});

console.log('Found logs:', logs.results);
console.log('Total:', logs.pagination.total);
```

### Manual Cleanup

```javascript
// Delete logs older than 30 days
const deletedCount = await strapi
  .plugin('audit-logs')
  .service('audit-log')
  .deleteOldLogs(30);

console.log(`Deleted ${deletedCount} logs`);
```

## Troubleshooting

### Plugin Not Loading

1. Ensure the plugin is built: `npm run build`
2. Check `config/plugins.js` has the correct configuration
3. Restart Strapi: `npm run develop`
4. Check logs for errors

### No Audit Logs Being Created

1. Verify `config.enabled` is `true`
2. Check if the content type is in `excludeContentTypes`
3. Ensure changes are being made through the Content API
4. Check Strapi logs for errors

### Permission Denied Errors

1. Go to Settings → Roles
2. Select the appropriate role
3. Grant the `plugin::audit-logs.read` permission
4. Save and try again

### Database Errors

If you see database errors:

1. Ensure your database user has CREATE TABLE permissions
2. Try restarting Strapi to trigger table creation
3. Check database logs for specific errors

## Performance Considerations

### For High-Volume Applications

1. **Exclude high-frequency content types**:
   ```javascript
   excludeContentTypes: [
     'api::analytics-event.analytics-event',
     'api::real-time-data.real-time-data',
   ]
   ```

2. **Reduce retention period**:
   ```javascript
   retentionDays: 30 // Instead of 90
   ```

3. **Set up regular cleanup**:
   - Use cron jobs to clean up old logs
   - Consider archiving to cold storage

4. **Monitor database size**:
   - Regularly check the size of the `audit_logs` table
   - Adjust retention policies based on storage capacity

5. **Consider database optimization**:
   - Ensure indexes are properly created
   - Use database partitioning for very large tables
   - Consider read replicas for audit log queries

## Security Best Practices

1. **Restrict Access**: Only grant read permissions to roles that need it
2. **Protect the API**: Ensure the audit logs API requires authentication
3. **Sensitive Data**: Be careful about logging sensitive information in payloads
4. **Regular Audits**: Regularly review who has access to audit logs
5. **Backup**: Include audit logs in your backup strategy

## Next Steps

- Set up automated cleanup with cron jobs
- Configure role-based access control
- Integrate with your monitoring system
- Set up alerts for specific actions
- Create custom dashboards for audit visualization

For more information, see the full README.md file.

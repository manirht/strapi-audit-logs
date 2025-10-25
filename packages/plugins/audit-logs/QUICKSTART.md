# Audit Logs Plugin - Quick Reference

## 🚀 Quick Start

```bash
# 1. Build the plugin
npm run build

# 2. Configure (config/plugins.js)
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

# 3. Start Strapi
npm run develop

# 4. Grant permissions: Settings → Roles → Audit Logs → ✅ Read
```

## 📡 API Endpoints

```bash
# Get all logs (with filters)
GET /api/audit-logs?contentType=api::article.article&action=update&page=1&pageSize=25

# Get single log
GET /api/audit-logs/:id

# Cleanup old logs
POST /api/audit-logs/cleanup
Body: { "daysToKeep": 30 }
```

## 🎛️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable globally |
| `excludeContentTypes` | array | `[]` | Content types to exclude |
| `retentionDays` | number | `90` | Days to keep logs |

## 🔍 Query Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `contentType` | `api::article.article` | Filter by content type |
| `userId` | `1` | Filter by user |
| `action` | `create|update|delete` | Filter by action |
| `startDate` | `2025-01-01` | Start date (ISO 8601) |
| `endDate` | `2025-12-31` | End date (ISO 8601) |
| `page` | `1` | Page number |
| `pageSize` | `25` | Items per page |
| `sort` | `createdAt:desc` | Sort field:direction |

## 📦 Audit Log Entry Structure

```json
{
  "id": 1,
  "contentType": "api::article.article",
  "recordId": "5",
  "action": "update",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "changedFields": ["title", "content"],
  "previousData": { "title": "Old" },
  "newData": { "title": "New" },
  "payload": { /* full data */ },
  "createdAt": "2025-10-25T10:30:00.000Z"
}
```

## 🔐 Permissions

- **Read:** `plugin::audit-logs.read` - View audit logs
- **Cleanup:** `plugin::audit-logs.cleanup` - Delete old logs

Grant in: **Settings → Roles → Plugins → Audit Logs**

## 💻 Programmatic Usage

```javascript
// Create audit log
await strapi.plugin('audit-logs').service('audit-log').createLog({
  contentType: 'api::article.article',
  recordId: '123',
  action: 'update',
  userId: 1,
  changedFields: ['title'],
  previousData: { title: 'Old' },
  newData: { title: 'New' },
});

// Query logs
const logs = await strapi
  .plugin('audit-logs')
  .service('audit-log')
  .findLogs({
    contentType: 'api::article.article',
    action: 'update',
    page: 1,
    pageSize: 25,
  });

// Cleanup
const deleted = await strapi
  .plugin('audit-logs')
  .service('audit-log')
  .deleteOldLogs(30);
```

## ⚙️ Cron Job (Optional)

```javascript
// config/cron-tasks.js
module.exports = {
  '0 0 * * 0': async ({ strapi }) => {
    await strapi
      .plugin('audit-logs')
      .service('audit-log')
      .deleteOldLogs(90);
  },
};
```

## 🧪 Testing

```bash
# Create content
POST /api/articles
{ "data": { "title": "Test" } }

# Check logs
GET /api/audit-logs

# Should see create entry

# Update content
PUT /api/articles/1
{ "data": { "title": "Updated" } }

# Check logs
GET /api/audit-logs

# Should see update entry with diff

# Delete content
DELETE /api/articles/1

# Check logs
GET /api/audit-logs

# Should see delete entry
```

## 🎯 Common Use Cases

### Audit Article Changes
```bash
GET /api/audit-logs?contentType=api::article.article&sort=createdAt:desc
```

### Find Who Deleted Content
```bash
GET /api/audit-logs?action=delete&contentType=api::article.article
```

### User Activity Report
```bash
GET /api/audit-logs?userId=1&startDate=2025-01-01&endDate=2025-12-31
```

### Recent Updates Only
```bash
GET /api/audit-logs?action=update&sort=createdAt:desc&pageSize=10
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| No logs created | Check `config.enabled` is `true` |
| Permission denied | Grant `plugin::audit-logs.read` permission |
| Content type excluded | Remove from `excludeContentTypes` |
| Logs too old | Adjust `retentionDays` or run cleanup |

## 📚 Documentation Files

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup guide  
- **API.md** - Full API reference
- **TESTING.md** - Testing procedures
- **IMPLEMENTATION.md** - Technical details
- **config.example.js** - Configuration examples

## 🎓 Best Practices

1. ✅ Exclude high-volume content types
2. ✅ Set appropriate retention days
3. ✅ Schedule regular cleanup
4. ✅ Grant read-only permissions
5. ✅ Monitor database size
6. ✅ Use filters for queries
7. ✅ Enable only in production

## 📊 What Gets Logged?

| Action | Captured Data |
|--------|---------------|
| **Create** | All new data in `newData` |
| **Update** | Only changed fields in `previousData` & `newData` |
| **Delete** | All deleted data in `previousData` |

All actions include: user info, timestamp, content type, record ID

## ⚡ Performance Tips

- Use specific filters (reduces data transfer)
- Limit page size (faster queries)
- Exclude analytics/session content types
- Schedule cleanup during off-peak hours
- Use date ranges for historical queries

## 🔗 Quick Links

- Strapi Docs: https://docs.strapi.io
- Plugin Repo: /packages/plugins/audit-logs
- Issues: GitHub Issues

---

**Need Help?** Check TESTING.md → Troubleshooting section

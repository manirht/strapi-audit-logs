# Strapi Audit Logs Plugin

Automated audit logging for all content changes in Strapi. This plugin tracks create, update, and delete operations on all content types through the Content API.

## Features

- **Automated Logging**: Automatically logs all content changes (create, update, delete)
- **Comprehensive Metadata**: Captures user info, timestamps, changed fields, and diffs
- **REST API**: Query audit logs with filtering, pagination, and sorting
- **Role-Based Access Control**: Restrict access to audit logs based on permissions
- **Configurable**: Enable/disable logging globally or exclude specific content types
- **Efficient**: Indexed database table for fast queries

## Installation

This plugin is already included in your Strapi project. To enable it, add it to your `config/plugins.js`:

```javascript
module.exports = {
  // ... other plugins
  'audit-logs': {
    enabled: true,
    config: {
      // Enable or disable audit logging globally
      enabled: true,
      
      // Content types to exclude from logging
      excludeContentTypes: [
        // 'api::article.article',
        // 'api::comment.comment',
      ],
      
      // Number of days to keep logs (optional)
      retentionDays: 90,
    },
  },
};
```

## Configuration

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | Boolean | `true` | Enable or disable audit logging globally |
| `excludeContentTypes` | Array | `[]` | Array of content type UIDs to exclude from logging |
| `retentionDays` | Number | `90` | Number of days to keep audit logs |

### Example Configuration

```javascript
// config/plugins.js
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: true,
      excludeContentTypes: [
        'api::temporary-data.temporary-data',
        'api::cache.cache',
      ],
      retentionDays: 365, // Keep logs for 1 year
    },
  },
};
```

## API Endpoints

### Get Audit Logs

```
GET /api/audit-logs
```

**Query Parameters:**

- `contentType` - Filter by content type UID (e.g., `api::article.article`)
- `userId` - Filter by user ID
- `action` - Filter by action type (`create`, `update`, `delete`)
- `startDate` - Filter by start date (ISO 8601 format)
- `endDate` - Filter by end date (ISO 8601 format)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 25)
- `sort` - Sort field and order (e.g., `createdAt:desc`)

**Example Request:**

```bash
curl -X GET "http://localhost:1337/api/audit-logs?contentType=api::article.article&action=update&page=1&pageSize=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "results": [
    {
      "id": 1,
      "documentId": "abc123",
      "contentType": "api::article.article",
      "recordId": "5",
      "action": "update",
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "changedFields": ["title", "content"],
      "previousData": {
        "title": "Old Title",
        "content": "Old content"
      },
      "newData": {
        "title": "New Title",
        "content": "Updated content"
      },
      "createdAt": "2025-10-25T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "pageCount": 5,
    "total": 120
  }
}
```

### Get Single Audit Log

```
GET /api/audit-logs/:id
```

**Example Request:**

```bash
curl -X GET "http://localhost:1337/api/audit-logs/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cleanup Old Logs

```
POST /api/audit-logs/cleanup
```

**Request Body:**

```json
{
  "daysToKeep": 90
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:1337/api/audit-logs/cleanup" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 90}'
```

## Permissions

The plugin registers the following permissions:

- **Read Audit Logs** (`plugin::audit-logs.read`) - Required to view audit logs
- **Cleanup Audit Logs** (`plugin::audit-logs.cleanup`) - Required to delete old logs

### Granting Permissions

1. Go to **Settings** → **Administration Panel** → **Roles**
2. Select a role (e.g., "Super Admin" or "Editor")
3. Scroll to **Plugins** → **Audit Logs**
4. Check the permissions you want to grant
5. Save

## Data Structure

Each audit log entry contains:

| Field | Type | Description |
|-------|------|-------------|
| `contentType` | String | Content type UID (e.g., `api::article.article`) |
| `recordId` | String | ID of the modified record |
| `action` | Enum | Action type: `create`, `update`, or `delete` |
| `userId` | Integer | ID of the user who performed the action |
| `userName` | String | Name of the user |
| `userEmail` | String | Email of the user |
| `changedFields` | JSON | Array of field names that changed |
| `previousData` | JSON | Previous values of changed fields |
| `newData` | JSON | New values of changed fields |
| `payload` | JSON | Full payload data |
| `createdAt` | DateTime | Timestamp of the action |

## Development

### Building the Plugin

```bash
# From the root of the monorepo
npm run build

# Or build just this plugin
cd packages/plugins/audit-logs
npm run build
```

### Running Tests

```bash
npm run test:unit
```

## How It Works

1. **Lifecycle Hooks**: The plugin registers middleware with Strapi's document service that intercepts all create, update, and delete operations.

2. **Change Detection**: For update operations, it calculates the diff between old and new data to identify changed fields.

3. **Metadata Capture**: It captures user information from the request context, including user ID, name, and email.

4. **Asynchronous Logging**: Audit logs are created asynchronously to avoid impacting the performance of the main operation.

5. **Error Handling**: If logging fails, the error is logged but doesn't affect the main operation.

## Best Practices

1. **Regular Cleanup**: Set up a cron job to regularly clean up old audit logs:

```javascript
// config/cron-tasks.js
module.exports = {
  '0 0 * * 0': async ({ strapi }) => {
    // Run cleanup every Sunday at midnight
    await strapi.plugin('audit-logs').service('audit-log').deleteOldLogs(90);
  },
};
```

2. **Exclude High-Volume Content Types**: If you have content types with very frequent updates (like analytics or sessions), consider excluding them:

```javascript
excludeContentTypes: [
  'api::analytics-event.analytics-event',
  'api::user-session.user-session',
]
```

3. **Index Optimization**: The plugin automatically creates indexes on commonly queried fields (`contentType`, `userId`, `action`, `createdAt`).

4. **Monitor Storage**: Audit logs can grow large over time. Monitor your database size and adjust retention policies accordingly.

## Troubleshooting

### Logs Not Being Created

1. Check if the plugin is enabled in `config/plugins.js`
2. Verify that `config.enabled` is set to `true`
3. Check if the content type is in the `excludeContentTypes` list
4. Look for errors in Strapi logs

### Permission Denied

1. Ensure the user's role has the `plugin::audit-logs.read` permission
2. Check the role configuration in **Settings** → **Roles**

### Performance Issues

1. Reduce the retention period to keep fewer logs
2. Add more content types to `excludeContentTypes`
3. Ensure database indexes are properly created
4. Consider archiving old logs to a separate database

## License

See the LICENSE file in the repository root.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact Strapi support

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

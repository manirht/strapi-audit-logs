# Audit Logs API Reference

Complete API reference for the Strapi Audit Logs plugin.

## Base URL

```
http://localhost:1337/api
```

All endpoints require authentication via Bearer token unless otherwise specified.

---

## Endpoints

### 1. Get Audit Logs

Retrieve audit logs with optional filtering, pagination, and sorting.

**Endpoint:** `GET /audit-logs`

**Authentication:** Required (Bearer token)

**Permission:** `plugin::audit-logs.read`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `contentType` | string | No | - | Filter by content type UID (e.g., `api::article.article`) |
| `userId` | integer | No | - | Filter by user ID who performed the action |
| `action` | string | No | - | Filter by action type: `create`, `update`, or `delete` |
| `startDate` | string | No | - | Filter logs created after this date (ISO 8601 format) |
| `endDate` | string | No | - | Filter logs created before this date (ISO 8601 format) |
| `page` | integer | No | 1 | Page number for pagination |
| `pageSize` | integer | No | 25 | Number of items per page (max: 100) |
| `sort` | string | No | `createdAt:desc` | Sort field and direction (e.g., `createdAt:desc`, `createdAt:asc`) |

#### Request Example

```bash
GET /api/audit-logs?contentType=api::article.article&action=update&page=1&pageSize=25&sort=createdAt:desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Example

```json
{
  "results": [
    {
      "id": 15,
      "documentId": "xyz789",
      "contentType": "api::article.article",
      "recordId": "5",
      "action": "update",
      "userId": 1,
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "changedFields": ["title", "content"],
      "previousData": {
        "title": "Original Title",
        "content": "Original content here..."
      },
      "newData": {
        "title": "Updated Title",
        "content": "Updated content here..."
      },
      "payload": {
        "id": 5,
        "title": "Updated Title",
        "content": "Updated content here...",
        "author": "John Doe",
        "publishedAt": "2025-10-25T10:30:00.000Z"
      },
      "createdAt": "2025-10-25T10:30:15.000Z",
      "updatedAt": "2025-10-25T10:30:15.000Z"
    },
    {
      "id": 14,
      "documentId": "xyz788",
      "contentType": "api::article.article",
      "recordId": "4",
      "action": "create",
      "userId": 2,
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "changedFields": ["title", "content", "author"],
      "previousData": null,
      "newData": {
        "title": "New Article",
        "content": "Fresh content...",
        "author": "Jane Smith"
      },
      "payload": {
        "id": 4,
        "title": "New Article",
        "content": "Fresh content...",
        "author": "Jane Smith",
        "createdAt": "2025-10-25T09:15:00.000Z"
      },
      "createdAt": "2025-10-25T09:15:05.000Z",
      "updatedAt": "2025-10-25T09:15:05.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "pageCount": 3,
    "total": 68
  }
}
```

#### Response Codes

- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have the required permission
- `500 Internal Server Error` - Server error

---

### 2. Get Single Audit Log

Retrieve a specific audit log entry by ID.

**Endpoint:** `GET /audit-logs/:id`

**Authentication:** Required (Bearer token)

**Permission:** `plugin::audit-logs.read`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string/integer | Yes | The ID or document ID of the audit log entry |

#### Request Example

```bash
GET /api/audit-logs/15
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Example

```json
{
  "id": 15,
  "documentId": "xyz789",
  "contentType": "api::article.article",
  "recordId": "5",
  "action": "update",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "changedFields": ["title", "content"],
  "previousData": {
    "title": "Original Title",
    "content": "Original content here..."
  },
  "newData": {
    "title": "Updated Title",
    "content": "Updated content here..."
  },
  "payload": {
    "id": 5,
    "title": "Updated Title",
    "content": "Updated content here...",
    "author": "John Doe",
    "publishedAt": "2025-10-25T10:30:00.000Z"
  },
  "createdAt": "2025-10-25T10:30:15.000Z",
  "updatedAt": "2025-10-25T10:30:15.000Z"
}
```

#### Response Codes

- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have the required permission
- `404 Not Found` - Audit log entry not found
- `500 Internal Server Error` - Server error

---

### 3. Cleanup Old Logs

Delete audit logs older than the specified retention period.

**Endpoint:** `POST /audit-logs/cleanup`

**Authentication:** Required (Bearer token)

**Permission:** `plugin::audit-logs.cleanup`

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `daysToKeep` | integer | No | 90 | Number of days to keep logs (logs older than this will be deleted) |

#### Request Example

```bash
POST /api/audit-logs/cleanup
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "daysToKeep": 30
}
```

#### Response Example

```json
{
  "success": true,
  "deletedCount": 142,
  "message": "Deleted 142 old audit log entries"
}
```

#### Response Codes

- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have the required permission
- `500 Internal Server Error` - Server error

---

## Data Models

### Audit Log Entry

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier for the audit log entry |
| `documentId` | string | Strapi document ID |
| `contentType` | string | Content type UID (e.g., `api::article.article`) |
| `recordId` | string | ID of the record that was modified |
| `action` | enum | Type of action: `create`, `update`, or `delete` |
| `userId` | integer \| null | ID of the user who performed the action |
| `userName` | string \| null | Name of the user who performed the action |
| `userEmail` | string \| null | Email of the user who performed the action |
| `changedFields` | array \| null | List of field names that were changed |
| `previousData` | object \| null | Previous values of changed fields (for update/delete) |
| `newData` | object \| null | New values of changed fields (for create/update) |
| `payload` | object \| null | Full payload data for the operation |
| `createdAt` | datetime | Timestamp when the audit log was created |
| `updatedAt` | datetime | Timestamp when the audit log was last updated |

---

## Error Responses

### 401 Unauthorized

```json
{
  "data": null,
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "Missing or invalid credentials",
    "details": {}
  }
}
```

### 403 Forbidden

```json
{
  "data": null,
  "error": {
    "status": 403,
    "name": "ForbiddenError",
    "message": "Forbidden",
    "details": {}
  }
}
```

### 404 Not Found

```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Audit log not found",
    "details": {}
  }
}
```

### 500 Internal Server Error

```json
{
  "data": null,
  "error": {
    "status": 500,
    "name": "InternalServerError",
    "message": "Internal server error",
    "details": {}
  }
}
```

---

## Query Examples

### Get all logs for a specific content type

```bash
GET /api/audit-logs?contentType=api::article.article
```

### Get all update actions

```bash
GET /api/audit-logs?action=update
```

### Get logs for a specific user

```bash
GET /api/audit-logs?userId=1
```

### Get logs within a date range

```bash
GET /api/audit-logs?startDate=2025-01-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
```

### Get logs with multiple filters

```bash
GET /api/audit-logs?contentType=api::article.article&action=delete&userId=1&startDate=2025-01-01
```

### Get paginated results

```bash
GET /api/audit-logs?page=2&pageSize=50
```

### Get sorted results (oldest first)

```bash
GET /api/audit-logs?sort=createdAt:asc
```

---

## Rate Limiting

The audit logs API respects Strapi's global rate limiting configuration. If rate limiting is enabled, you may receive:

```json
{
  "error": {
    "status": 429,
    "message": "Too Many Requests"
  }
}
```

---

## Best Practices

1. **Use Pagination**: Always use pagination for large result sets to avoid performance issues

2. **Filter Wisely**: Use specific filters to reduce the amount of data returned

3. **Date Ranges**: When querying historical data, always specify a date range

4. **Caching**: Consider caching audit log queries that don't need real-time data

5. **Permissions**: Only grant audit log read access to users who need it

6. **Cleanup**: Regularly clean up old logs to maintain performance

7. **Error Handling**: Always handle potential errors in your client code

---

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:1337/api';
const TOKEN = 'your-bearer-token';

// Get audit logs
async function getAuditLogs(filters = {}) {
  const response = await axios.get(`${API_URL}/audit-logs`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    params: filters,
  });
  return response.data;
}

// Get single audit log
async function getAuditLog(id) {
  const response = await axios.get(`${API_URL}/audit-logs/${id}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
}

// Cleanup old logs
async function cleanupLogs(daysToKeep = 90) {
  const response = await axios.post(
    `${API_URL}/audit-logs/cleanup`,
    { daysToKeep },
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  return response.data;
}

// Usage
(async () => {
  // Get all article updates
  const logs = await getAuditLogs({
    contentType: 'api::article.article',
    action: 'update',
    page: 1,
    pageSize: 25,
  });
  console.log('Found logs:', logs.results.length);

  // Get specific log
  const log = await getAuditLog(15);
  console.log('Log details:', log);

  // Cleanup logs older than 30 days
  const result = await cleanupLogs(30);
  console.log('Cleaned up:', result.deletedCount);
})();
```

### Python

```python
import requests

API_URL = 'http://localhost:1337/api'
TOKEN = 'your-bearer-token'

headers = {'Authorization': f'Bearer {TOKEN}'}

# Get audit logs
def get_audit_logs(filters=None):
    response = requests.get(
        f'{API_URL}/audit-logs',
        headers=headers,
        params=filters or {}
    )
    return response.json()

# Get single audit log
def get_audit_log(log_id):
    response = requests.get(
        f'{API_URL}/audit-logs/{log_id}',
        headers=headers
    )
    return response.json()

# Cleanup old logs
def cleanup_logs(days_to_keep=90):
    response = requests.post(
        f'{API_URL}/audit-logs/cleanup',
        headers=headers,
        json={'daysToKeep': days_to_keep}
    )
    return response.json()

# Usage
if __name__ == '__main__':
    # Get all article updates
    logs = get_audit_logs({
        'contentType': 'api::article.article',
        'action': 'update',
        'page': 1,
        'pageSize': 25
    })
    print(f"Found logs: {len(logs['results'])}")
    
    # Get specific log
    log = get_audit_log(15)
    print(f"Log details: {log}")
    
    # Cleanup logs older than 30 days
    result = cleanup_logs(30)
    print(f"Cleaned up: {result['deletedCount']}")
```

---

## Webhook Integration (Optional)

While not included by default, you can extend the plugin to send webhooks on certain actions:

```javascript
// In your bootstrap.ts or a custom service
strapi.db.lifecycles.subscribe({
  models: ['plugin::audit-logs.audit-log'],
  
  async afterCreate(event) {
    const { result } = event;
    
    // Send webhook on critical actions
    if (result.action === 'delete' && result.contentType === 'api::article.article') {
      await fetch('https://your-webhook-url.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    }
  },
});
```

---

For more information, see the [README.md](./README.md) and [SETUP.md](./SETUP.md) files.



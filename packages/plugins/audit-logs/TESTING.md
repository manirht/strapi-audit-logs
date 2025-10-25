# Testing the Audit Logs Plugin

This guide explains how to test the audit logs plugin functionality.

## Manual Testing

### 1. Setup

First, ensure the plugin is installed and configured:

```javascript
// config/plugins.js
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

Start Strapi:
```bash
npm run develop
```

### 2. Grant Permissions

1. Navigate to **Settings** → **Administration Panel** → **Roles**
2. Select "Super Admin" role
3. Under **Plugins** → **Audit Logs**, check:
   - ✅ Read
   - ✅ Cleanup
4. Save

### 3. Create Test Content

Create a new article (or any content type):

```bash
POST http://localhost:1337/api/articles
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "data": {
    "title": "Test Article",
    "content": "This is test content"
  }
}
```

### 4. Check Audit Logs

Get all audit logs:

```bash
GET http://localhost:1337/api/audit-logs
Authorization: Bearer YOUR_TOKEN
```

Expected response:
```json
{
  "results": [
    {
      "id": 1,
      "contentType": "api::article.article",
      "recordId": "1",
      "action": "create",
      "userId": 1,
      "userName": "Admin User",
      "userEmail": "admin@example.com",
      "changedFields": ["title", "content"],
      "newData": {
        "title": "Test Article",
        "content": "This is test content"
      },
      "createdAt": "2025-10-25T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "pageCount": 1,
    "total": 1
  }
}
```

### 5. Update Test Content

Update the article:

```bash
PUT http://localhost:1337/api/articles/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "data": {
    "title": "Updated Test Article",
    "content": "This is updated content"
  }
}
```

Check audit logs again - you should see an update entry with `previousData` and `newData`.

### 6. Delete Test Content

Delete the article:

```bash
DELETE http://localhost:1337/api/articles/1
Authorization: Bearer YOUR_TOKEN
```

Check audit logs - you should see a delete entry with the deleted data in `previousData`.

## Test Scenarios

### Scenario 1: Test Filtering

```bash
# Filter by content type
GET http://localhost:1337/api/audit-logs?contentType=api::article.article

# Filter by action
GET http://localhost:1337/api/audit-logs?action=update

# Filter by user
GET http://localhost:1337/api/audit-logs?userId=1

# Filter by date range
GET http://localhost:1337/api/audit-logs?startDate=2025-01-01&endDate=2025-12-31

# Combined filters
GET http://localhost:1337/api/audit-logs?contentType=api::article.article&action=update&userId=1
```

### Scenario 2: Test Pagination

```bash
# Page 1 with 10 items
GET http://localhost:1337/api/audit-logs?page=1&pageSize=10

# Page 2
GET http://localhost:1337/api/audit-logs?page=2&pageSize=10
```

### Scenario 3: Test Sorting

```bash
# Sort by created date descending (newest first)
GET http://localhost:1337/api/audit-logs?sort=createdAt:desc

# Sort by created date ascending (oldest first)
GET http://localhost:1337/api/audit-logs?sort=createdAt:asc
```

### Scenario 4: Test Excluded Content Types

Update configuration:
```javascript
// config/plugins.js
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: true,
      excludeContentTypes: ['api::article.article'],
      retentionDays: 90,
    },
  },
};
```

Restart Strapi and try creating/updating/deleting an article - no audit logs should be created.

### Scenario 5: Test Disabled Logging

Update configuration:
```javascript
// config/plugins.js
module.exports = {
  'audit-logs': {
    enabled: true,
    config: {
      enabled: false, // Disable logging
      excludeContentTypes: [],
      retentionDays: 90,
    },
  },
};
```

Restart Strapi and try creating content - no audit logs should be created.

### Scenario 6: Test Cleanup

```bash
POST http://localhost:1337/api/audit-logs/cleanup
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "daysToKeep": 30
}
```

Expected response:
```json
{
  "success": true,
  "deletedCount": 5,
  "message": "Deleted 5 old audit log entries"
}
```

### Scenario 7: Test Single Log Retrieval

```bash
GET http://localhost:1337/api/audit-logs/1
Authorization: Bearer YOUR_TOKEN
```

### Scenario 8: Test Permissions

1. Create a new role with NO audit logs permissions
2. Create a user with that role
3. Try to access audit logs with that user's token
4. Should receive 403 Forbidden

## Automated Testing Checklist

- [ ] Plugin loads successfully
- [ ] Database table is created
- [ ] CREATE operations are logged
- [ ] UPDATE operations are logged with diff
- [ ] DELETE operations are logged
- [ ] User information is captured correctly
- [ ] Filtering works (contentType, userId, action, date)
- [ ] Pagination works
- [ ] Sorting works
- [ ] Excluded content types are not logged
- [ ] Disabled logging prevents log creation
- [ ] Cleanup API works
- [ ] Permissions are enforced
- [ ] Plugin configuration is validated
- [ ] Errors don't break main operations

## Expected Behavior

### For CREATE Operations
- `action` = "create"
- `newData` contains the created data
- `changedFields` lists all fields
- `previousData` is empty/null

### For UPDATE Operations
- `action` = "update"
- `previousData` contains old values
- `newData` contains new values
- `changedFields` lists only changed fields
- No log if nothing changed

### For DELETE Operations
- `action` = "delete"
- `previousData` contains the deleted data
- `newData` is empty/null

### User Information
- `userId` should match authenticated user
- `userName` should be captured if available
- `userEmail` should be captured if available
- Anonymous requests should have null user fields

## Common Issues and Solutions

### Issue: No logs are created

**Solutions:**
1. Check `config.enabled` is `true`
2. Verify content type is not in `excludeContentTypes`
3. Check Strapi logs for errors
4. Ensure operations are going through Content API

### Issue: Permission denied

**Solutions:**
1. Grant `plugin::audit-logs.read` permission to the role
2. Ensure user is authenticated
3. Check token is valid

### Issue: Missing user information

**Solutions:**
1. Ensure requests are authenticated
2. Check `ctx.state.user` is populated
3. Verify authentication middleware is working

### Issue: Diff not calculating correctly

**Solutions:**
1. Check data structure is consistent
2. Verify no circular references
3. Check for special data types (Date, etc.)

## Performance Testing

Test with high volume:

```bash
# Create 1000 records quickly
for i in {1..1000}; do
  curl -X POST http://localhost:1337/api/articles \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{\"data\":{\"title\":\"Article $i\",\"content\":\"Content $i\"}}"
done

# Check audit logs table size
# Query: SELECT COUNT(*) FROM audit_logs;

# Test query performance
time curl "http://localhost:1337/api/audit-logs?page=1&pageSize=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

After manual testing:
1. Write automated unit tests
2. Write integration tests
3. Set up CI/CD testing
4. Test with different databases (SQLite, PostgreSQL, MySQL)
5. Test with different Strapi versions
6. Load test with high volume
7. Test upgrade scenarios

For automated tests, see the test directory (coming soon).

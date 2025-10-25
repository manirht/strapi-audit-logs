# 🧪 Complete Testing Guide for Audit Logs Plugin

## Prerequisites

1. **Build the plugin first:**
   ```bash
   cd packages/plugins/audit-logs
   yarn build
   cd ../../../
   ```

2. **Install dependencies in the example app:**
   ```bash
   cd examples/getstarted
   yarn install
   ```

## Step-by-Step Testing

### Step 1: Start Strapi

```bash
cd examples/getstarted
yarn develop
```

Wait for Strapi to start. You should see:
```
✅ Strapi is running on http://localhost:1337
```

### Step 2: Create Admin User (if first time)

1. Open browser: http://localhost:1337/admin
2. Fill in the admin registration form:
   - First name: Admin
   - Last name: User
   - Email: admin@test.com
   - Password: Test1234! (or your choice)
3. Click "Let's start"

### Step 3: Grant Audit Logs Permissions

1. Go to **Settings** (⚙️ in left sidebar)
2. Click **Administration Panel** → **Roles**
3. Click on **Super Admin** role
4. Scroll down to **Plugins** section
5. Find **Audit Logs** section
6. Check these permissions:
   - ✅ **Read**
   - ✅ **Cleanup**
7. Click **Save** at the top right

### Step 4: Create a Content Type (if none exists)

1. Go to **Content-Type Builder** (🧱 in left sidebar)
2. Click **+ Create new collection type**
3. Display name: **Article**
4. Click **Continue**
5. Add fields:
   - **Text** field named "title" (Short text)
   - **Rich text** field named "content"
6. Click **Save**
7. Click **Finish**
8. Server will restart automatically

### Step 5: Test CREATE Operation

1. Go to **Content Manager** (📝 in left sidebar)
2. Click **Article** in the left menu
3. Click **+ Create new entry**
4. Fill in:
   - Title: "My First Article"
   - Content: "This is a test article"
5. Click **Save** (top right)
6. Click **Publish** (if available)

**Expected Result:** Audit log created for CREATE action

### Step 6: Test UPDATE Operation

1. Stay on the article you just created
2. Change the title to: "My Updated Article"
3. Change content to: "This content has been updated"
4. Click **Save**

**Expected Result:** Audit log created for UPDATE action with diff

### Step 7: Get Your API Token

1. Go to **Settings** → **API Tokens**
2. Click **+ Create new API Token**
3. Name: "Test Token"
4. Token type: **Full access**
5. Click **Save**
6. **Copy the token** (you won't see it again!)

### Step 8: Test the Audit Logs API

Open a new terminal (keep Strapi running) and test these commands:

#### Get All Audit Logs

```bash
curl http://localhost:1337/api/audit-logs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 2,
      "contentType": "api::article.article",
      "recordId": "1",
      "action": "update",
      "userId": 1,
      "userName": "Admin User",
      "userEmail": "admin@test.com",
      "changedFields": ["title", "content"],
      "previousData": {
        "title": "My First Article",
        "content": "This is a test article"
      },
      "newData": {
        "title": "My Updated Article",
        "content": "This content has been updated"
      },
      "createdAt": "2025-10-25T..."
    },
    {
      "id": 1,
      "contentType": "api::article.article",
      "recordId": "1",
      "action": "create",
      "userId": 1,
      "changedFields": ["title", "content"],
      "newData": {
        "title": "My First Article",
        "content": "This is a test article"
      },
      "createdAt": "2025-10-25T..."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "pageCount": 1,
    "total": 2
  }
}
```

#### Filter by Content Type

```bash
curl "http://localhost:1337/api/audit-logs?contentType=api::article.article" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Action

```bash
curl "http://localhost:1337/api/audit-logs?action=update" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by User

```bash
curl "http://localhost:1337/api/audit-logs?userId=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Single Audit Log

```bash
curl http://localhost:1337/api/audit-logs/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 9: Test DELETE Operation

1. Go back to **Content Manager** → **Article**
2. Click on your article
3. Click the **Delete** button (🗑️ top right)
4. Confirm deletion

**Expected Result:** Audit log created for DELETE action

Now check the audit logs again:

```bash
curl "http://localhost:1337/api/audit-logs?action=delete" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

You should see the delete log with the full deleted data in `previousData`.

### Step 10: Test Pagination

Create several more articles, then test:

```bash
curl "http://localhost:1337/api/audit-logs?page=1&pageSize=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 11: Test Sorting

```bash
# Oldest first
curl "http://localhost:1337/api/audit-logs?sort=createdAt:asc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Newest first (default)
curl "http://localhost:1337/api/audit-logs?sort=createdAt:desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 12: Test Date Range Filtering

```bash
curl "http://localhost:1337/api/audit-logs?startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 13: Test Cleanup

```bash
curl -X POST http://localhost:1337/api/audit-logs/cleanup \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 0}'
```

**Expected Response:**
```json
{
  "success": true,
  "deletedCount": 3,
  "message": "Deleted 3 old audit log entries"
}
```

### Step 14: Test Excluded Content Types

1. Stop Strapi (Ctrl+C)
2. Edit `config/plugins.js`:
   ```javascript
   'audit-logs': {
     enabled: true,
     config: {
       enabled: true,
       excludeContentTypes: ['api::article.article'], // Exclude articles
       retentionDays: 90,
     },
   },
   ```
3. Restart: `yarn develop`
4. Create a new article
5. Check audit logs - the new article should NOT be logged

### Step 15: Test Disabled Logging

1. Stop Strapi (Ctrl+C)
2. Edit `config/plugins.js`:
   ```javascript
   'audit-logs': {
     enabled: true,
     config: {
       enabled: false, // Disable logging
       excludeContentTypes: [],
       retentionDays: 90,
     },
   },
   ```
3. Restart: `yarn develop`
4. Make some changes
5. Check audit logs - nothing new should be logged

### Step 16: Check Database Directly

```bash
# If using SQLite (default)
cd examples/getstarted/.tmp
sqlite3 data.db

# Run queries
SELECT COUNT(*) FROM audit_logs;
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
.exit
```

## ✅ Verification Checklist

After testing, verify:

- [ ] CREATE operations are logged with full new data
- [ ] UPDATE operations are logged with diff (changed fields only)
- [ ] DELETE operations are logged with full deleted data
- [ ] User information is captured (ID, name, email)
- [ ] Timestamps are accurate
- [ ] Filtering works (contentType, userId, action, dates)
- [ ] Pagination works correctly
- [ ] Sorting works (asc/desc)
- [ ] Single entry retrieval works
- [ ] Cleanup API works
- [ ] Excluded content types are not logged
- [ ] Disabled logging prevents all logging
- [ ] Permissions are enforced (try with no token = 401 error)
- [ ] Database table has indexes
- [ ] Plugin doesn't break normal operations

## 🚨 Testing Permissions

### Test Without Token (Should Fail)

```bash
curl http://localhost:1337/api/audit-logs
```

**Expected:** 401 Unauthorized

### Test With Invalid Token (Should Fail)

```bash
curl http://localhost:1337/api/audit-logs \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** 401 Unauthorized

### Test Without Permission

1. Create a new role: **Settings** → **Roles** → **+ Add new role**
2. Name: "Viewer"
3. Don't grant any audit logs permissions
4. Create a user with this role
5. Get API token for this user
6. Try to access audit logs

**Expected:** 403 Forbidden

## 📊 Performance Testing

Create many entries quickly:

```bash
# Create 100 articles rapidly
for i in {1..100}; do
  curl -X POST http://localhost:1337/api/articles \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d "{\"data\":{\"title\":\"Article $i\",\"content\":\"Content $i\"}}" &
done
wait

# Check how many logs were created
curl "http://localhost:1337/api/audit-logs?contentType=api::article.article" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Check Strapi logs for any errors.

## 🐛 Common Issues & Solutions

### Issue: Plugin not loading
**Solution:** 
- Make sure you built the plugin: `cd packages/plugins/audit-logs && yarn build`
- Check `config/plugins.js` has the correct configuration
- Restart Strapi

### Issue: No audit logs created
**Solution:**
- Check `config.enabled` is `true`
- Verify content type is not in `excludeContentTypes`
- Check Strapi console for errors
- Look at `.tmp/data.db` directly

### Issue: Permission denied
**Solution:**
- Grant the `plugin::audit-logs.read` permission
- Make sure you're using a valid API token
- Check the role has the permission

### Issue: Database errors
**Solution:**
- Delete `.tmp/data.db` and restart (development only!)
- Check database logs
- Verify Strapi version compatibility

## 📝 Expected Console Output

When Strapi starts with the plugin, you should see:

```
[YYYY-MM-DD HH:mm:ss.SSS] info: Audit log hooks registered successfully
[YYYY-MM-DD HH:mm:ss.SSS] info: Audit Logs plugin initialized
```

When operations occur, you should NOT see audit log errors (they're silent by design to not break operations).

## 🎓 Advanced Testing

### Test with GraphQL (if enabled)

```graphql
mutation CreateArticle {
  createArticle(data: { title: "GraphQL Article", content: "Created via GraphQL" }) {
    data {
      id
      attributes {
        title
      }
    }
  }
}
```

Then check if the audit log was created.

### Test with Different Content Types

Create multiple content types (e.g., Category, Tag, Comment) and test that all are logged.

### Test Concurrent Operations

Make multiple simultaneous changes and verify all are logged correctly.

### Test Long-Running

Leave Strapi running for a while with periodic changes to verify no memory leaks or issues.

## 🎉 Success Criteria

Your audit logs plugin is working correctly if:

1. ✅ All CRUD operations on all content types are logged
2. ✅ User information is captured correctly
3. ✅ Diffs are calculated accurately for updates
4. ✅ API returns correct filtered/paginated results
5. ✅ Permissions are enforced properly
6. ✅ Configuration options work as expected
7. ✅ No errors in Strapi console
8. ✅ Normal Strapi operations are not affected
9. ✅ Database queries are efficient
10. ✅ Cleanup works correctly

---

## 🚀 Quick Test Script

Save this as `test-audit-logs.sh`:

```bash
#!/bin/bash

# Replace with your actual token
TOKEN="YOUR_TOKEN_HERE"
BASE_URL="http://localhost:1337"

echo "🧪 Testing Audit Logs Plugin..."
echo ""

# Test 1: Get all logs
echo "1️⃣ Getting all audit logs..."
curl -s "$BASE_URL/api/audit-logs" \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination.total'
echo ""

# Test 2: Filter by action
echo "2️⃣ Getting create actions..."
curl -s "$BASE_URL/api/audit-logs?action=create" \
  -H "Authorization: Bearer $TOKEN" | jq '.results | length'
echo ""

# Test 3: Get single log
echo "3️⃣ Getting single log (ID: 1)..."
curl -s "$BASE_URL/api/audit-logs/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.action'
echo ""

# Test 4: Test without auth (should fail)
echo "4️⃣ Testing without auth (should fail)..."
curl -s "$BASE_URL/api/audit-logs" | jq '.error.status'
echo ""

echo "✅ Tests complete!"
```

Run it:
```bash
chmod +x test-audit-logs.sh
./test-audit-logs.sh
```

---

**Good luck with testing! 🎉**

If you encounter any issues, check the TESTING.md file in the plugin directory for more troubleshooting tips.

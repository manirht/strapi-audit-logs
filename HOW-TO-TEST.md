# 🚀 QUICK START - Test Audit Logs Plugin

## ⚡ Fast Track (5 minutes)

### Step 1: Build the Plugin
```bash
# Open Git Bash or Command Prompt (not PowerShell)
cd C:/Users/LENOVO/Documents/Projects/frontier-assignment/frontier-assignment

# Build the audit logs plugin
cd packages/plugins/audit-logs
npm run build

# Go back to root
cd ../../../
```

### Step 2: Install Dependencies
```bash
cd examples/getstarted
npm install
```

### Step 3: Start Strapi
```bash
npm run develop
```

Wait for:
```
✅ Strapi is running on http://localhost:1337
```

### Step 4: Setup Admin (First Time Only)
1. Open browser: **http://localhost:1337/admin**
2. Create admin account:
   - Email: admin@test.com
   - Password: Test1234!
3. Click "Let's start"

### Step 5: Grant Permissions (IMPORTANT!)
1. Click **Settings** (⚙️ bottom left)
2. Click **Administration Panel** → **Roles**
3. Click **Super Admin**
4. Scroll to **Plugins** section
5. Find **Audit Logs**
6. Check ✅ **Read** and ✅ **Cleanup**
7. Click **Save** (top right)

### Step 6: Create Test Content
1. Click **Content-Type Builder** (🧱 left sidebar)
2. Click **+ Create new collection type**
3. Display name: **Article**
4. Add fields:
   - Text (Short text): **title**
   - Rich text: **content**
5. Click **Save** → **Finish**
6. Wait for server restart

### Step 7: Make Some Changes
1. Click **Content Manager** (📝 left sidebar)
2. Click **Article**
3. Click **+ Create new entry**
4. Fill in:
   - Title: "Test Article"
   - Content: "Hello World"
5. Click **Save**
6. Edit the article - change title to "Updated Test"
7. Click **Save** again
8. Delete the article

### Step 8: Get API Token
1. Go to **Settings** → **API Tokens**
2. Click **+ Create new API Token**
3. Name: "Test"
4. Token type: **Full access**
5. Click **Save**
6. **COPY THE TOKEN** (you'll need it!)

### Step 9: Test the API

#### Option A: Use Browser (Easy)
Open this URL in your browser (replace YOUR_TOKEN):
```
http://localhost:1337/api/audit-logs
```

You'll need to add the header manually or use a tool like Postman.

#### Option B: Use Command Prompt (Recommended)
Open **Command Prompt** (not PowerShell):

```bash
# Get all audit logs (replace YOUR_TOKEN_HERE)
curl http://localhost:1337/api/audit-logs -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

You should see JSON with your audit logs!

#### Option C: Use Postman/Insomnia (Best)
1. Open Postman/Insomnia
2. Create new request:
   - Method: GET
   - URL: http://localhost:1337/api/audit-logs
   - Header: Authorization: Bearer YOUR_TOKEN_HERE
3. Send request
4. You should see audit logs!

---

## 📸 What You Should See

### After Creating Article:
```json
{
  "results": [
    {
      "id": 1,
      "action": "create",
      "contentType": "api::article.article",
      "recordId": "1",
      "userId": 1,
      "userName": "admin@test.com",
      "changedFields": ["title", "content"],
      "newData": {
        "title": "Test Article",
        "content": "Hello World"
      },
      "createdAt": "2025-10-25T..."
    }
  ]
}
```

### After Updating Article:
You'll see TWO logs - create AND update with diff:
```json
{
  "id": 2,
  "action": "update",
  "changedFields": ["title"],
  "previousData": {
    "title": "Test Article"
  },
  "newData": {
    "title": "Updated Test"
  }
}
```

### After Deleting Article:
You'll see THREE logs - create, update, AND delete:
```json
{
  "id": 3,
  "action": "delete",
  "previousData": {
    "title": "Updated Test",
    "content": "Hello World"
  }
}
```

---

## 🧪 Quick Tests (Command Prompt)

Replace `YOUR_TOKEN_HERE` with your actual token:

```bash
# 1. Get all logs
curl http://localhost:1337/api/audit-logs -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 2. Get only creates
curl "http://localhost:1337/api/audit-logs?action=create" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Get only updates
curl "http://localhost:1337/api/audit-logs?action=update" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Get only deletes
curl "http://localhost:1337/api/audit-logs?action=delete" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 5. Get logs for specific content type
curl "http://localhost:1337/api/audit-logs?contentType=api::article.article" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 6. Get single log (ID 1)
curl http://localhost:1337/api/audit-logs/1 -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 7. Get paginated (5 per page)
curl "http://localhost:1337/api/audit-logs?page=1&pageSize=5" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 8. Get sorted (oldest first)
curl "http://localhost:1337/api/audit-logs?sort=createdAt:asc" -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Success Checklist

After following the steps above, you should have:

- [x] Plugin built successfully
- [x] Strapi running on http://localhost:1337
- [x] Admin account created
- [x] Permissions granted to Super Admin
- [x] Test content type (Article) created
- [x] Created, updated, and deleted an article
- [x] API token generated
- [x] Successfully retrieved audit logs via API
- [x] Saw CREATE, UPDATE, and DELETE logs
- [x] Verified user information is captured
- [x] Verified diff calculation works (previousData vs newData)

---

## 🎯 What to Look For

### ✅ GOOD - Plugin is Working:
- Audit logs appear after content changes
- User email/name is captured
- Timestamps are accurate
- Changed fields are listed
- Diffs show before/after values
- All actions (create/update/delete) are logged

### ❌ BAD - Something's Wrong:
- No logs appear after changes
- 401 Unauthorized errors
- 403 Forbidden errors
- Missing user information
- Empty results
- Errors in Strapi console

---

## 🔧 Troubleshooting

### Problem: "No audit logs appear"
**Solutions:**
1. Check permissions are granted (Step 5)
2. Verify plugin is built: `dir packages\plugins\audit-logs\dist`
3. Check Strapi console for errors
4. Verify config in `examples/getstarted/config/plugins.js`

### Problem: "401 Unauthorized"
**Solutions:**
1. Make sure you copied the full token
2. Check the Authorization header format: `Bearer YOUR_TOKEN`
3. Verify token hasn't expired

### Problem: "403 Forbidden"
**Solutions:**
1. Grant permissions to the role (Step 5)
2. Make sure user has Super Admin role
3. Restart Strapi after granting permissions

### Problem: "Plugin not loading"
**Solutions:**
1. Build the plugin: `cd packages/plugins/audit-logs && npm run build`
2. Install dependencies: `cd examples/getstarted && npm install`
3. Check for errors in Strapi console

### Problem: "PowerShell script errors"
**Solutions:**
Use Command Prompt or Git Bash instead of PowerShell, or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📱 Alternative: Use Postman

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import Collection**: Create new collection "Audit Logs"
3. **Add Requests:**

   **Request 1: Get All Logs**
   - Method: GET
   - URL: `http://localhost:1337/api/audit-logs`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

   **Request 2: Get Creates Only**
   - Method: GET
   - URL: `http://localhost:1337/api/audit-logs?action=create`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

   **Request 3: Get Single Log**
   - Method: GET
   - URL: `http://localhost:1337/api/audit-logs/1`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

   **Request 4: Cleanup**
   - Method: POST
   - URL: `http://localhost:1337/api/audit-logs/cleanup`
   - Headers: `Authorization: Bearer YOUR_TOKEN`, `Content-Type: application/json`
   - Body (raw JSON): `{"daysToKeep": 30}`

---

## 🎉 You're Done!

If you can see audit logs via the API, **the plugin is working perfectly!** 🎊

### What's Happening Behind the Scenes:
1. Every time you create/update/delete content
2. The plugin intercepts the operation
3. Captures all metadata (user, timestamp, changes)
4. Calculates diff for updates
5. Saves to `audit_logs` database table
6. Makes it available via REST API

### Next Steps:
- Try filtering by different parameters
- Test with multiple content types
- Check the database directly (see COMPLETE-TEST-GUIDE.md)
- Set up automated cleanup
- Integrate with your frontend

---

## 💡 Pro Tips

1. **Check Database Directly:**
   ```bash
   cd examples/getstarted/.tmp
   sqlite3 data.db
   SELECT * FROM audit_logs;
   .exit
   ```

2. **Watch Logs in Real-Time:**
   Keep Strapi console open while making changes to see any errors.

3. **Test Different Users:**
   Create multiple users to verify user tracking works correctly.

4. **Performance Test:**
   Create 100+ entries quickly and verify all are logged.

5. **Export Logs:**
   Use the API to export logs to CSV/JSON for reporting.

---

## 📞 Need More Help?

- **Detailed guide:** See `COMPLETE-TEST-GUIDE.md`
- **API reference:** See `API.md`
- **Setup guide:** See `SETUP.md`
- **Troubleshooting:** See `TESTING.md`

---

**Ready? Let's go!** 🚀

Just follow Step 1 through Step 9, and you'll have a fully working audit logs system in 5 minutes!

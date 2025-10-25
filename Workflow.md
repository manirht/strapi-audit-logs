# 🔄 Complete Workflow: Audit Logs Plugin

## 📊 High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

     START
       │
       ▼
┌──────────────────┐
│  yarn install    │ ◄──── Install all dependencies in monorepo
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   yarn build     │ ◄──── Build audit-logs plugin
│   (in plugin)    │       • Clean dist/
└────────┬─────────┘       • Compile TypeScript → JavaScript
         │                 • Generate .d.ts files
         │                 • Bundle with Rollup
         ▼
┌──────────────────┐
│  yarn develop    │ ◄──── Start Strapi in development mode
│ (in getstarted)  │       • Load plugins
└────────┬─────────┘       • Initialize database
         │                 • Register routes
         │                 • Start server on :1337
         ▼
┌──────────────────┐
│ Create Admin     │ ◄──── First-time setup
│    Account       │       • Open http://localhost:1337/admin
└────────┬─────────┘       • Register admin user
         │
         ▼
┌──────────────────┐
│ Grant Plugin     │ ◄──── Enable permissions
│  Permissions     │       • Settings → Roles → Super Admin
└────────┬─────────┘       • Check: Read, Cleanup
         │
         ▼
┌──────────────────┐
│ Create Content   │ ◄──── Generate audit logs
│     Types        │       • Articles, Categories, etc.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Perform CRUD    │ ◄──── Trigger audit logging
│   Operations     │       • CREATE → Log created
└────────┬─────────┘       • UPDATE → Log with diff
         │                 • DELETE → Log with old data
         ▼
┌──────────────────┐
│  Get API Token   │ ◄──── For API testing
│                  │       • Settings → API Tokens
└────────┬─────────┘       • Create Full Access token
         │
         ▼
┌──────────────────┐
│  Test API        │ ◄──── Query audit logs
│   Endpoints      │       • GET /api/audit-logs
└────────┬─────────┘       • Filter, paginate, sort
         │
         ▼
      SUCCESS! 🎉
```

---

## 🔧 Detailed Flow: Build Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUILD PROCESS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  yarn build (in audit-logs plugin)
       │
       ▼
┌──────────────────┐
│   npm run clean  │
└────────┬─────────┘
         │
         ▼
    [Delete dist/]
         │
         ▼
┌──────────────────┐
│ npm run         │
│  build:code      │
└────────┬─────────┘
         │
         ▼
    [Rollup starts]
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────┐                    ┌──────────────────┐
│  Load TypeScript│                    │  Resolve imports │
│     files       │                    │   from node_     │
│  server/src/**  │                    │   modules        │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │◄─────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│   Transpile to   │
│   JavaScript     │
└────────┬─────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────┐      ┌──────────────────┐
│ CommonJS format │      │   ES Module      │
│  index.js       │      │   index.mjs      │
└─────────────────┘      └──────────────────┘
         │                          │
         └──────────────┬───────────┘
                        │
                        ▼
                [dist/server/]
                        │
                        ▼
┌──────────────────┐
│ npm run         │
│  build:types     │
└────────┬─────────┘
         │
         ▼
    [TypeScript compiler]
         │
         ▼
┌──────────────────┐
│  Generate .d.ts  │
│  declaration     │
│     files        │
└────────┬─────────┘
         │
         ▼
   [dist/server/src/]
         │
         ▼
    BUILD COMPLETE ✅
```

---

## 🚀 Detailed Flow: Strapi Initialization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STRAPI INITIALIZATION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  yarn develop
       │
       ▼
┌──────────────────┐
│  Load .env file  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Load config/     │ ◄──── Read plugins.js
│   plugins.js     │       • audit-logs: { enabled: true, resolve: '...' }
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Resolve plugin  │ ◄──── Find plugin at resolved path
│     location     │       • ../../../packages/plugins/audit-logs
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Load plugin    │ ◄──── Require strapi-server.js
│  strapi-server.js│       ↓
└────────┬─────────┘       require('./dist/server/index.js')
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│              PLUGIN REGISTRATION                                 │
│                                                                  │
│  export default {                                                │
│    register({ strapi }) { ... },      ◄── Register phase        │
│    bootstrap({ strapi }) { ... },     ◄── Bootstrap phase       │
│    destroy({ strapi }) { ... },       ◄── Cleanup phase         │
│    config: { ... },                   ◄── Default config        │
│    controllers,                       ◄── API controllers       │
│    routes,                            ◄── API routes            │
│    services,                          ◄── Business logic        │
│    contentTypes,                      ◄── Database schema       │
│    policies,                          ◄── Access control        │
│  }                                                               │
└────────┬─────────────────────────────────────────────────────────┘
         │
         ├────────────────────────────────────────────────────────┐
         │                                                        │
         ▼                                                        │
┌──────────────────┐                                             │
│ REGISTER PHASE   │                                             │
│                  │                                             │
│ • Extend Strapi  │                                             │
│ • Add custom     │                                             │
│   features       │                                             │
└────────┬─────────┘                                             │
         │                                                        │
         ▼                                                        │
┌──────────────────┐                                             │
│ BOOTSTRAP PHASE  │                                             │
│                  │                                             │
│ • Register hooks │ ◄────────────────────────────────────┐     │
│ • Setup services │                                      │     │
└────────┬─────────┘                                      │     │
         │                                                 │     │
         ▼                                                 │     │
┌──────────────────────────────────────────────────────┐  │     │
│     Register Lifecycle Hooks                         │  │     │
│                                                      │  │     │
│  strapi.db.lifecycles.subscribe({                   │  │     │
│    models: ['*'],                                    │  │     │
│    afterCreate: async (event) => {                  │  │     │
│      // Log CREATE operation                        │  │     │
│    },                                                │  │     │
│    afterUpdate: async (event) => {                  │  │     │
│      // Log UPDATE with diff                        │  │     │
│    },                                                │  │     │
│    afterDelete: async (event) => {                  │  │     │
│      // Log DELETE with old data                    │  │     │
│    },                                                │  │     │
│  });                                                 │  │     │
└────────┬─────────────────────────────────────────────┘  │     │
         │                                                 │     │
         ▼                                                 │     │
┌──────────────────┐                                      │     │
│  Initialize DB   │ ◄──── Create plugin_audit_logs      │     │
│   Collection     │       table if not exists           │     │
└────────┬─────────┘                                      │     │
         │                                                 │     │
         ▼                                                 │     │
┌──────────────────┐                                      │     │
│ Register Routes  │                                      │     │
│                  │                                      │     │
│ Admin Routes:    │                                      │     │
│ • GET  /admin/api/audit-logs                          │     │
│ • GET  /admin/api/audit-logs/:id                      │     │
│ • POST /admin/api/audit-logs/cleanup                  │     │
│                  │                                      │     │
│ Content-API:     │                                      │     │
│ • GET  /api/audit-logs                                │     │
│ • GET  /api/audit-logs/:id                            │     │
│ • POST /api/audit-logs/cleanup                        │     │
└────────┬─────────┘                                      │     │
         │                                                 │     │
         ▼                                                 │     │
┌──────────────────┐                                      │     │
│  Apply Policies  │ ◄──── Check permissions             │     │
│  & Middlewares   │                                      │     │
└────────┬─────────┘                                      │     │
         │                                                 │     │
         ▼                                                 │     │
    [Strapi Ready] ✅                                     │     │
         │                                                 │     │
         │                                                 │     │
         └─────────────────────────────────────────────────┘     │
                                                                 │
    ┌────────────────────────────────────────────────────────────┘
    │
    ▼
[Server listening on http://localhost:1337]
```

---

## 📝 Detailed Flow: CRUD Operations with Audit Logging

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CONTENT OPERATION LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────────┘

USER ACTION: Create Article
       │
       ▼
┌──────────────────┐
│   Admin Panel    │
│   or API Call    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  POST /api/      │
│  articles        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Strapi Core      │
│ Controller       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validate Data    │ ◄──── Check required fields
│ & Permissions    │       Check user permissions
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Database Query  │ ◄──── INSERT INTO articles
│  (beforeCreate)  │
└────────┬─────────┘
         │
         ▼
    [Record Created]
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              afterCreate HOOK TRIGGERED                      │
│                                                              │
│  Event object contains:                                      │
│  {                                                           │
│    model: { uid: 'api::article.article' },                  │
│    result: { id: 1, title: 'My Article', ... },            │
│    params: { data: { ... } },                              │
│    state: { user: { id: 1, ... } }                         │
│  }                                                           │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Audit Log       │
│  Service Called  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│           CREATE AUDIT LOG ENTRY                             │
│                                                              │
│  await strapi.plugin('audit-logs')                          │
│    .service('audit-log')                                    │
│    .create({                                                │
│      action: 'create',                                      │
│      contentType: 'api::article.article',                   │
│      recordId: 1,                                           │
│      userId: 1,                                             │
│      userName: 'Admin User',                                │
│      userEmail: 'admin@example.com',                        │
│      changedFields: ['title', 'content', 'author'],         │
│      oldData: null,                                         │
│      newData: {                                             │
│        title: 'My Article',                                 │
│        content: 'Article content...',                       │
│        author: 'John Doe'                                   │
│      }                                                      │
│    });                                                      │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Insert to DB    │ ◄──── INSERT INTO plugin_audit_logs
│  plugin_audit_   │
│  logs table      │
└────────┬─────────┘
         │
         ▼
   [Audit Log Saved] ✅
         │
         ▼
┌──────────────────┐
│  Return Response │ ◄──── Article created successfully
│  to User         │
└──────────────────┘


─────────────────────────────────────────────────────────────


USER ACTION: Update Article
       │
       ▼
┌──────────────────┐
│  PUT /api/       │
│  articles/:id    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ beforeUpdate     │ ◄──── Fetch OLD data
│    Hook          │       • Query current record
└────────┬─────────┘       • Store in memory
         │
         ▼
    [Old Data: { title: 'My Article', content: 'Old content' }]
         │
         ▼
┌──────────────────┐
│  Update Database │ ◄──── UPDATE articles SET ...
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ afterUpdate Hook │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│           CALCULATE DIFF                                     │
│                                                              │
│  OLD: { title: 'My Article', content: 'Old content' }       │
│  NEW: { title: 'My Article', content: 'Updated content' }   │
│                                                              │
│  Changed fields: ['content']                                 │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Create Audit    │ ◄──── Log UPDATE with diff
│  Log Entry       │
└────────┬─────────┘
         │
         ▼
   [Log Saved with changedFields: ['content']] ✅


─────────────────────────────────────────────────────────────


USER ACTION: Delete Article
       │
       ▼
┌──────────────────┐
│ DELETE /api/     │
│ articles/:id     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ beforeDelete     │ ◄──── Fetch data before deletion
│     Hook         │       • Store complete record
└────────┬─────────┘
         │
         ▼
    [Old Data: { id: 1, title: 'My Article', ... }]
         │
         ▼
┌──────────────────┐
│  Delete from DB  │ ◄──── DELETE FROM articles WHERE id = 1
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ afterDelete Hook │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Create Audit    │ ◄──── Log DELETE with old data
│  Log Entry       │       • newData: null
└────────┬─────────┘       • oldData: { full record }
         │
         ▼
   [Log Saved] ✅
```

---

## 🔍 Detailed Flow: API Query

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API QUERY FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  GET /api/audit-logs?action=create&page=1&pageSize=10
       │
       ▼
┌──────────────────┐
│  Strapi Router   │ ◄──── Match route
└────────┬─────────┘       /api/audit-logs → controller.find()
         │
         ▼
┌──────────────────┐
│  Apply Policies  │ ◄──── Check authentication
│                  │       Check permissions
└────────┬─────────┘       • User has 'plugin::audit-logs.read'?
         │
         ├─── NO ──► [403 Forbidden]
         │
         ▼ YES
┌──────────────────┐
│  Controller:     │
│  find()          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Parse Query     │ ◄──── Extract filters
│  Parameters      │       • action = 'create'
└────────┬─────────┘       • page = 1
         │                 • pageSize = 10
         ▼
┌──────────────────┐
│  Service:        │
│  find()          │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│           BUILD DATABASE QUERY                               │
│                                                              │
│  const query = {                                            │
│    where: {                                                 │
│      action: 'create',                                      │
│    },                                                       │
│    orderBy: { createdAt: 'desc' },                         │
│    limit: 10,                                               │
│    offset: 0,                                               │
│  };                                                         │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Execute Query   │ ◄──── SELECT * FROM plugin_audit_logs
│  on Database     │       WHERE action = 'create'
└────────┬─────────┘       ORDER BY createdAt DESC
         │                 LIMIT 10 OFFSET 0
         ▼
    [Database Results]
         │
         ▼
┌──────────────────┐
│  Count Total     │ ◄──── SELECT COUNT(*) FROM plugin_audit_logs
│  Records         │       WHERE action = 'create'
└────────┬─────────┘
         │
         ▼
    [Total: 25 records]
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│           FORMAT RESPONSE                                    │
│                                                              │
│  {                                                           │
│    results: [                                                │
│      {                                                       │
│        id: 1,                                                │
│        action: 'create',                                     │
│        contentType: 'api::article.article',                  │
│        recordId: 1,                                          │
│        userId: 1,                                            │
│        userName: 'Admin User',                               │
│        userEmail: 'admin@example.com',                       │
│        changedFields: ['title', 'content'],                  │
│        oldData: null,                                        │
│        newData: { title: 'My Article', ... },               │
│        createdAt: '2025-10-25T12:00:00.000Z'                │
│      },                                                      │
│      // ... 9 more records                                   │
│    ],                                                        │
│    pagination: {                                             │
│      page: 1,                                                │
│      pageSize: 10,                                           │
│      pageCount: 3,                                           │
│      total: 25                                               │
│    }                                                         │
│  }                                                           │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Send Response   │ ◄──── HTTP 200 OK
│  to Client       │       Content-Type: application/json
└──────────────────┘
```

---

## 🧪 Complete Testing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Build Plugin
  cd packages/plugins/audit-logs
  yarn install
  yarn build
       │
       ▼
  [dist/ folder created with compiled code]
       │
       ▼
Step 2: Start Strapi
  cd examples/getstarted
  yarn develop
       │
       ▼
  [Strapi loads on http://localhost:1337]
       │
       ▼
Step 3: Setup Admin
  • Open http://localhost:1337/admin
  • Register admin account
  • Login
       │
       ▼
Step 4: Grant Permissions
  • Settings → Roles → Super Admin
  • Enable: Read, Cleanup permissions
  • Save
       │
       ▼
Step 5: Create Content Type
  • Content-Type Builder
  • Create "Article" collection
  • Add fields: title, content, author
  • Save (Strapi restarts)
       │
       ▼
Step 6: Create Test Data
  • Content Manager → Article
  • Create new article
       │
       ▼
  [afterCreate hook triggers]
       │
       ▼
  [Audit log entry created]
       │
       ▼
Step 7: Get API Token
  • Settings → API Tokens
  • Create new token (Full Access)
  • Copy token
       │
       ▼
Step 8: Test API Endpoints

  Test 1: Get all logs
    curl "http://localhost:1337/api/audit-logs" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Returns JSON with all audit logs]
       │
       ▼
  Test 2: Filter by action
    curl "http://localhost:1337/api/audit-logs?action=create" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Returns only CREATE logs]
       │
       ▼
  Test 3: Filter by content type
    curl "http://localhost:1337/api/audit-logs?contentType=api::article.article" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Returns only article logs]
       │
       ▼
  Test 4: Pagination
    curl "http://localhost:1337/api/audit-logs?page=1&pageSize=5" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Returns 5 logs with pagination info]
       │
       ▼
  Test 5: Get single log
    curl "http://localhost:1337/api/audit-logs/1" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Returns specific log entry]
       │
       ▼
  Test 6: Cleanup old logs
    curl -X POST "http://localhost:1337/api/audit-logs/cleanup?days=30" \
      -H "Authorization: Bearer TOKEN"
       │
       ▼
    [Deletes logs older than 30 days]
       │
       ▼
Step 9: Verify Results
  • Check response status codes
  • Validate JSON structure
  • Verify data accuracy
  • Test edge cases
       │
       ▼
    ALL TESTS PASS ✅
```

---

## 📦 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL / API                           │
│                                                                     │
│  User performs action:                                              │
│  • Create Article                                                   │
│  • Update Article                                                   │
│  • Delete Article                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STRAPI CORE LAYER                              │
│                                                                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      │
│  │ Controllers  │────►│  Services    │────►│   Models     │      │
│  └──────────────┘     └──────────────┘     └──────────────┘      │
│                                                     │               │
└─────────────────────────────────────────────────────┼───────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │         LIFECYCLE HOOKS INTERCEPT HERE               │          │
│  │                                                      │          │
│  │  beforeCreate  ────►  [DB INSERT]  ────►  afterCreate │          │
│  │  beforeUpdate  ────►  [DB UPDATE]  ────►  afterUpdate │          │
│  │  beforeDelete  ────►  [DB DELETE]  ────►  afterDelete │          │
│  └──────────────────┬───────────────────────────────────┘          │
│                     │                                               │
│  ┌──────────────────▼─────────────────────────────────┐            │
│  │       Main Database Tables                         │            │
│  │  • articles                                         │            │
│  │  • categories                                       │            │
│  │  • users                                            │            │
│  │  • ... (other content types)                       │            │
│  └────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ Lifecycle hooks triggered
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AUDIT LOGS PLUGIN                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │         Lifecycle Hook Handlers                      │          │
│  │                                                      │          │
│  │  1. Extract event data                               │          │
│  │  2. Get user context                                 │          │
│  │  3. Calculate changed fields                         │          │
│  │  4. Create diff (oldData vs newData)                │          │
│  │  5. Call audit log service                          │          │
│  └──────────────────┬───────────────────────────────────┘          │
│                     │                                               │
│                     ▼                                               │
│  ┌──────────────────────────────────────────────────────┐          │
│  │         Audit Log Service                            │          │
│  │                                                      │          │
│  │  • validate data                                     │          │
│  │  • sanitize sensitive fields                         │          │
│  │  • format log entry                                  │          │
│  └──────────────────┬───────────────────────────────────┘          │
│                     │                                               │
│                     ▼                                               │
│  ┌──────────────────────────────────────────────────────┐          │
│  │     plugin_audit_logs Table                          │          │
│  │                                                      │          │
│  │  Columns:                                            │          │
│  │  • id (primary key)                                  │          │
│  │  • action (create/update/delete)                     │          │
│  │  • contentType (api::article.article)                │          │
│  │  • recordId                                          │          │
│  │  • userId                                            │          │
│  │  • userName                                          │          │
│  │  • userEmail                                         │          │
│  │  • changedFields (JSON array)                        │          │
│  │  • oldData (JSON)                                    │          │
│  │  • newData (JSON)                                    │          │
│  │  • createdAt                                         │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ Query via API
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                                  │
│                                                                     │
│  GET  /api/audit-logs           ─────►  List all logs              │
│  GET  /api/audit-logs/:id       ─────►  Get single log             │
│  POST /api/audit-logs/cleanup   ─────►  Delete old logs            │
│                                                                     │
│  Filters:                                                           │
│  • ?action=create                                                   │
│  • ?contentType=api::article.article                                │
│  • ?userId=1                                                        │
│  • ?recordId=5                                                      │
│  • ?page=1&pageSize=10                                              │
│  • ?sort=createdAt:desc                                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    [JSON Response to Client]
```

---

## 🔄 Complete Request-Response Cycle

```
User Action                  System Response
───────────                  ───────────────

Create Article
     │                       
     │                       1. Validate permissions
     ▼                          ↓
POST /api/articles          2. Validate data
     │                          ↓
     │                       3. beforeCreate hook
     ▼                          ↓
[Send JSON data]            4. INSERT into articles table
     │                          ↓
     │                       5. afterCreate hook triggered
     │                          ↓
     │                       6. Audit log service called
     │                          ↓
     │                       7. INSERT into plugin_audit_logs
     │                          ↓
     │                       8. Return article data
     │                          ↓
     ▼                       [HTTP 201 Created]
[Receive response]              ↓
     │                       { "data": { "id": 1, ... } }
     │                          
     │                       
Query Audit Logs
     │                       
     │                       1. Validate API token
     ▼                          ↓
GET /api/audit-logs         2. Check permissions
     │                          ↓
     │                       3. Parse query params
     ▼                          ↓
[With auth header]          4. Build database query
     │                          ↓
     │                       5. Execute SELECT on plugin_audit_logs
     │                          ↓
     │                       6. Count total records
     │                          ↓
     │                       7. Format response with pagination
     │                          ↓
     ▼                       [HTTP 200 OK]
[Receive JSON]                  ↓
     │                       {
     │                         "results": [...],
     │                         "pagination": { ... }
     │                       }
     ▼
[Display/Process data]
```

---

## 📋 Summary: Complete Workflow Steps

### 1. **Development Setup**
```bash
yarn install              # Install dependencies
```

### 2. **Build Plugin**
```bash
cd packages/plugins/audit-logs
yarn build               # Compile TypeScript, generate types
```

### 3. **Start Development Server**
```bash
cd examples/getstarted
yarn develop             # Start Strapi
```

### 4. **Initial Configuration**
- Create admin account
- Grant plugin permissions
- Create content types

### 5. **Usage**
- Perform CRUD operations
- Audit logs automatically created
- Query logs via API

### 6. **Testing**
- Get API token
- Test endpoints with curl
- Verify data accuracy

---

## 🎯 Key Takeaways

1. **Automatic Logging**: All content changes are automatically logged via lifecycle hooks
2. **No Code Changes Required**: Once plugin is installed, it works automatically
3. **Comprehensive Tracking**: Captures who, what, when, and how for every change
4. **Flexible Querying**: Filter, paginate, and sort logs via REST API
5. **Security**: Role-based permissions control access to audit logs
6. **Performance**: Minimal overhead, runs asynchronously
7. **Configurable**: Exclude content types, set retention period

---

## 🔗 Flow Summary

```
Setup → Build → Run → Configure → Use → Query
  ↓       ↓      ↓        ↓        ↓       ↓
yarn   rollup  strapi   admin    CRUD    API
install        develop  panel   ops     calls
```

All operations flow through lifecycle hooks → audit service → database → API endpoints! 🎉
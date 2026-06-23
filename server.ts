/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { User, Customer, ActionItem, ActionHistory, Comment, AuditLog, StatusConfig, NotificationLog } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// --- Helper: Ensure Database Exist & Seed ---
function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initial Seed Data
  const defaultStatuses: StatusConfig[] = [
    { id: 'not_started', label: 'Not Started', color: 'slate' },
    { id: 'in_progress', label: 'In Progress', color: 'blue' },
    { id: 'on_hold', label: 'On Hold', color: 'amber' },
    { id: 'blocked', label: 'Blocked', color: 'rose' },
    { id: 'completed', label: 'Completed', color: 'emerald' },
  ];

  const defaultCustomers: Customer[] = [
    { id: 'acme', name: 'Acme Corporation', domain: 'acme.com', createdAt: new Date('2026-01-10T08:00:00Z').toISOString() },
    { id: 'globex', name: 'Globex International', domain: 'globex.com', createdAt: new Date('2026-02-15T08:00:00Z').toISOString() },
    { id: 'umbrella', name: 'Umbrella Corporation', domain: 'umbrella.com', createdAt: new Date('2026-03-20T08:00:00Z').toISOString() },
  ];

  const defaultUsers: User[] = [
    { id: 'u_damian', email: 'damian@gappify.com', name: 'Damian Gappify', role: 'gappify_admin', customerId: null },
    { id: 'u_alex', email: 'alex@gappify.com', name: 'Alex Consultant', role: 'gappify_member', customerId: null },
    { id: 'u_jane', email: 'jane@acme.com', name: 'Jane Acme', role: 'customer_admin', customerId: 'acme' },
    { id: 'u_john', email: 'john@acme.com', name: 'John Acme', role: 'customer_user', customerId: 'acme' },
    { id: 'u_bob', email: 'bob@globex.com', name: 'Bob Globex', role: 'customer_admin', customerId: 'globex' },
  ];

  const defaultActions: ActionItem[] = [
    {
      id: 'GAP-101',
      customerId: 'acme',
      title: 'Configure Gappify ERP Integration API',
      description: 'Establish secure OAuth credentials and set up the REST mapping endpoints for general ledger exports.',
      status: 'in_progress',
      priority: 'High',
      ownerName: 'Jane Acme',
      ownerEmail: 'jane@acme.com',
      deadline: '2026-07-15',
      jiraLink: 'https://jira.gappify.com/browse/GAP-120',
      createdAt: new Date('2026-06-01T10:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-20T14:30:00Z').toISOString()
    },
    {
      id: 'GAP-102',
      customerId: 'acme',
      title: 'User Acceptance Testing (UAT) Phase 1',
      description: 'Ensure finance teams can successfully trigger manual reconciliations and match bank transactions.',
      status: 'not_started',
      priority: 'Medium',
      ownerName: 'John Acme',
      ownerEmail: 'john@acme.com',
      deadline: '2026-08-01',
      jiraLink: 'https://jira.gappify.com/browse/GAP-121',
      createdAt: new Date('2026-06-05T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-05T11:00:00Z').toISOString()
    },
    {
      id: 'GAP-103',
      customerId: 'acme',
      title: 'Sign-off on chart of accounts mapping',
      description: 'Approve final standard mappings of balance sheet items between ERP and Gappify Core.',
      status: 'completed',
      priority: 'High',
      ownerName: 'Alex Consultant',
      ownerEmail: 'alex@gappify.com',
      deadline: '2026-06-20',
      createdAt: new Date('2026-05-15T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-20T16:00:00Z').toISOString()
    },
    {
      id: 'GAP-201',
      customerId: 'globex',
      title: 'Deliver automated journal entry logs',
      description: 'Set up cron trigger to sync accounting adjustments and push them back into Oracle NetSuite.',
      status: 'blocked',
      priority: 'Critical',
      ownerName: 'Bob Globex',
      ownerEmail: 'bob@globex.com',
      deadline: '2026-07-05',
      jiraLink: 'https://jira.globex.com/browse/GAP-99',
      createdAt: new Date('2026-06-10T15:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-22T10:00:00Z').toISOString()
    }
  ];

  const defaultHistory: ActionHistory[] = [
    {
      id: 'h_1',
      actionId: 'GAP-101',
      changedBy: 'Damian Gappify',
      changedByEmail: 'damian@gappify.com',
      field: 'status',
      oldValue: 'not_started',
      newValue: 'in_progress',
      timestamp: new Date('2026-06-20T14:30:00Z').toISOString()
    },
    {
      id: 'h_2',
      actionId: 'GAP-201',
      changedBy: 'Bob Globex',
      changedByEmail: 'bob@globex.com',
      field: 'status',
      oldValue: 'in_progress',
      newValue: 'blocked',
      timestamp: new Date('2026-06-22T10:00:00Z').toISOString()
    }
  ];

  const defaultComments: Comment[] = [
    {
      id: 'c_1',
      actionId: 'GAP-101',
      authorName: 'Jane Acme',
      authorEmail: 'jane@acme.com',
      content: 'Standard API connection handshake succeeded. Awaiting Client ID credentials from IT.',
      timestamp: new Date('2026-06-18T11:00:00Z').toISOString()
    },
    {
      id: 'c_2',
      actionId: 'GAP-201',
      authorName: 'Alex Consultant',
      authorEmail: 'alex@gappify.com',
      content: 'Blocked on Globex firewall rules. Email sent to Network Admin to white-list Gappify gateway IPs.',
      timestamp: new Date('2026-06-22T10:15:00Z').toISOString()
    }
  ];

  const defaultAudit: AuditLog[] = [
    {
      id: 'a_1',
      userEmail: 'damian@gappify.com',
      actionType: 'SYSTEM_BOOT',
      details: 'Gappify Action Tracker backend initialized and database seeded successfully.',
      timestamp: new Date('2026-06-23T10:00:00Z').toISOString()
    }
  ];

  if (!fs.existsSync(DB_FILE)) {
    const db = {
      statuses: defaultStatuses,
      customers: defaultCustomers,
      users: defaultUsers,
      actionItems: defaultActions,
      actionHistory: defaultHistory,
      comments: defaultComments,
      auditLogs: defaultAudit,
      notifications: [] as NotificationLog[]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
}

function getDb() {
  initializeDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read db file, recreating...', error);
    fs.rmSync(DB_FILE, { force: true });
    initializeDb();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  }
}

function saveDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Ensure database is initialized before starting
initializeDb();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Simulated active session (fallback to Damian Gappify)
  let activeUserEmail = 'damian@gappify.com';

  // --- API Middleware: Inject current user role details ---
  app.use((req, res, next) => {
    const db = getDb();
    const user = db.users.find((u: User) => u.email === activeUserEmail);
    if (user) {
      req.user = user;
    } else {
      // Create user if not exists (defaulting to Gappify admin)
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        email: activeUserEmail,
        name: activeUserEmail.split('@')[0].toUpperCase(),
        role: activeUserEmail.endsWith('@gappify.com') ? 'gappify_admin' : 'customer_user',
        customerId: activeUserEmail.endsWith('@gappify.com') ? null : 'acme'
      };
      db.users.push(newUser);
      saveDb(db);
      req.user = newUser;
    }
    next();
  });

  // --- Helper: Helper function for recording audit logs ---
  function recordAudit(userEmail: string, actionType: string, details: string) {
    const db = getDb();
    const newLog: AuditLog = {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      userEmail,
      actionType,
      details,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
    saveDb(db);
  }

  // --- Helper: Dispatches Real-Time Notification Log ---
  function dispatchNotifications(actionItem: ActionItem, updaterEmail: string, fieldsChanged: string[]) {
    const db = getDb();
    const customerName = db.customers.find((c: Customer) => c.id === actionItem.customerId)?.name || actionItem.customerId;
    const changeSummary = fieldsChanged.map(f => `${f.toUpperCase()} updated`).join(', ');

    // 1. Send Email Notification
    const emailLog: NotificationLog = {
      id: 'notif_e_' + Math.random().toString(36).substring(2, 9),
      actionId: actionItem.id,
      type: 'email',
      recipient: actionItem.ownerEmail,
      title: `[Gappify Implementation] Action Item ${actionItem.id} Changed`,
      message: `Hello ${actionItem.ownerName},

This is an automated notification from the Gappify Implementation Tracker.
Task: ${actionItem.title} (Client: ${customerName})
JIRA: ${actionItem.jiraLink || 'None linked'}
Modified by: ${updaterEmail}

Changes:
${changeSummary}

Current Details:
- Status: ${actionItem.status}
- Priority: ${actionItem.priority}
- Deadline: ${actionItem.deadline}

Please check the Action Log dashboard for comments and audit trails.

Regards,
Gappify Implementation Engine`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    // 2. Send G Chat Card Notification
    const gchatLog: NotificationLog = {
      id: 'notif_g_' + Math.random().toString(36).substring(2, 9),
      actionId: actionItem.id,
      type: 'g_chat',
      recipient: `G-Chat-Room:Gappify-${actionItem.customerId}-Implementation`,
      title: `G-Chat Integration: Task Alert`,
      message: `💬 *Gappify Alert:* *${actionItem.id}* - *${actionItem.title}*
🏢 *Client:* ${customerName} | 👤 *Owner:* ${actionItem.ownerName}
🔄 *Event:* Updated by _${updaterEmail}_ (${changeSummary})
🎨 *Status:* *${actionItem.status.toUpperCase()}* | ⚡ *Priority:* *${actionItem.priority}*
📅 *Deadline:* ${actionItem.deadline}
🔗 *JIRA:* ${actionItem.jiraLink || 'Not Linked'}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    db.notifications.unshift(emailLog, gchatLog);
    saveDb(db);
  }

  // --- API Routes ---

  // Auth: Get Current Profile
  app.get('/api/me', (req, res) => {
    res.json(req.user);
  });

  // Auth: Switch profile (Simulation console)
  app.post('/api/auth/switch', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    activeUserEmail = email;
    const db = getDb();
    const user = db.users.find((u: User) => u.email === email);
    if (!user) {
      // Create on the fly
      const isGappify = email.endsWith('@gappify.com');
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0].toUpperCase(),
        role: isGappify ? 'gappify_admin' : 'customer_user',
        customerId: isGappify ? null : 'acme'
      };
      db.users.push(newUser);
      saveDb(db);
    }
    recordAudit(email, 'USER_LOGIN', `Authenticated via simulated Google Login as ${email}`);
    res.json({ success: true, user: db.users.find((u: User) => u.email === email) });
  });

  // Auth: Get simulated users for testing
  app.get('/api/users', (req, res) => {
    const db = getDb();
    res.json(db.users);
  });

  // Auth: Admin update user roles / multi-tenant associations
  app.post('/api/users/update', (req, res) => {
    const currentUser = req.user as User;
    if (currentUser.role !== 'gappify_admin') {
      return res.status(403).json({ error: 'Permission denied: Gappify Admins only' });
    }
    const { email, role, customerId, name } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex((u: User) => u.email === email);
    if (userIndex === -1) {
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        email,
        name: name || email.split('@')[0],
        role,
        customerId: customerId || null
      };
      db.users.push(newUser);
    } else {
      db.users[userIndex].role = role;
      db.users[userIndex].customerId = customerId || null;
      if (name) db.users[userIndex].name = name;
    }
    saveDb(db);
    recordAudit(currentUser.email, 'USER_ROLE_MGMT', `Updated role & tenant context of ${email} to Role: ${role}, Client ID: ${customerId || 'Gappify Global'}`);
    res.json({ success: true, users: db.users });
  });

  // Customers: Read
  app.get('/api/customers', (req, res) => {
    const currentUser = req.user as User;
    const db = getDb();
    if (currentUser.role === 'gappify_admin' || currentUser.role === 'gappify_member') {
      res.json(db.customers);
    } else {
      // Filter strictly for tenant
      res.json(db.customers.filter((c: Customer) => c.id === currentUser.customerId));
    }
  });

  // Customers: Create (Gappify Admins)
  app.post('/api/customers', (req, res) => {
    const currentUser = req.user as User;
    if (currentUser.role !== 'gappify_admin') {
      return res.status(403).json({ error: 'Permission denied: Gappify Admins only' });
    }
    const { name, domain } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain are required' });
    }
    const db = getDb();
    const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (db.customers.some((c: Customer) => c.id === newId)) {
      return res.status(400).json({ error: 'A customer with this name already exists' });
    }
    const newCustomer: Customer = {
      id: newId,
      name,
      domain,
      createdAt: new Date().toISOString()
    };
    db.customers.push(newCustomer);
    saveDb(db);
    recordAudit(currentUser.email, 'CREATE_TENANT', `Created new client tenant: ${name} (ID: ${newId}, Domain: ${domain})`);
    res.json(newCustomer);
  });

  // Status List: Get List
  app.get('/api/statuses', (req, res) => {
    const db = getDb();
    res.json(db.statuses);
  });

  // Status List: Manage (Add/Update/Delete) - Gappify Admins Only
  app.post('/api/statuses', (req, res) => {
    const currentUser = req.user as User;
    if (currentUser.role !== 'gappify_admin') {
      return res.status(403).json({ error: 'Permission denied: Gappify Admins only' });
    }
    const { statuses } = req.body;
    if (!statuses || !Array.isArray(statuses)) {
      return res.status(400).json({ error: 'Invalid statuses array payload' });
    }
    const db = getDb();
    db.statuses = statuses;
    saveDb(db);
    recordAudit(currentUser.email, 'STATUS_LIST_CONFIG', `Customized the platform master status tracker checklist options.`);
    res.json({ success: true, statuses: db.statuses });
  });

  // Action Items: Get All (Filtered based on Role & Tenant)
  app.get('/api/actions', (req, res) => {
    const currentUser = req.user as User;
    const db = getDb();
    let actions = db.actionItems as ActionItem[];

    // RBAC: If customer role, only return their customer's actions
    if (currentUser.role === 'customer_admin' || currentUser.role === 'customer_user') {
      actions = actions.filter(a => a.customerId === currentUser.customerId);
    }
    res.json(actions);
  });

  // Action Items: Create
  app.post('/api/actions', (req, res) => {
    const currentUser = req.user as User;
    // Customer users cannot create tasks, only customer_admin and gappify team members
    if (currentUser.role === 'customer_user') {
      return res.status(403).json({ error: 'Permission denied: You do not have permission to create actions' });
    }

    const { customerId, title, description, status, priority, ownerName, ownerEmail, deadline, jiraLink } = req.body;
    if (!customerId || !title || !status || !priority || !ownerName || !ownerEmail || !deadline) {
      return res.status(400).json({ error: 'Missing required action item fields' });
    }

    // Tenant check
    if ((currentUser.role === 'customer_admin') && currentUser.customerId !== customerId) {
      return res.status(403).json({ error: 'Permission denied: Cannot create task for other clients' });
    }

    const db = getDb();
    const taskCount = db.actionItems.length + 1;
    const actionId = `GAP-${100 + taskCount}`;

    const newAction: ActionItem = {
      id: actionId,
      customerId,
      title,
      description: description || '',
      status,
      priority,
      ownerName,
      ownerEmail,
      deadline,
      jiraLink: jiraLink || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.actionItems.unshift(newAction);
    saveDb(db);

    recordAudit(currentUser.email, 'CREATE_ACTION', `Created task ${actionId} (${title}) for client ID ${customerId}`);
    dispatchNotifications(newAction, currentUser.email, ['created']);

    res.json(newAction);
  });

  // Action Items: Update Patch (With History logs and Live notifications trigger)
  app.patch('/api/actions/:id', (req, res) => {
    const currentUser = req.user as User;
    const { id } = req.params;
    const updates = req.body;

    const db = getDb();
    const actionIndex = db.actionItems.findIndex((a: ActionItem) => a.id === id);
    if (actionIndex === -1) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    const originalAction = db.actionItems[actionIndex] as ActionItem;

    // RBAC Tenant security
    if ((currentUser.role === 'customer_admin' || currentUser.role === 'customer_user') && currentUser.customerId !== originalAction.customerId) {
      return res.status(403).json({ error: 'Permission denied: Cannot view or modify other tenants' });
    }

    // Customer User can only update task status & add comment. Cannot re-assign, change priorities or update deadlines.
    if (currentUser.role === 'customer_user') {
      const allowedKeys = ['status'];
      const updateKeys = Object.keys(updates);
      const isViolation = updateKeys.some(k => !allowedKeys.includes(k));
      if (isViolation) {
        return res.status(403).json({ error: 'Permission denied: Standard customer users can only update task statuses' });
      }
    }

    const fieldsChanged: string[] = [];
    const updatedAction = { ...originalAction, ...updates, updatedAt: new Date().toISOString() };

    // Compare and record differences to History Log
    for (const key of Object.keys(updates)) {
      if (key === 'updatedAt' || key === 'createdAt') continue;
      const oldVal = (originalAction as any)[key];
      const newVal = updates[key];
      if (oldVal !== newVal) {
        fieldsChanged.push(key);
        // Create history log
        const historyEntry: ActionHistory = {
          id: 'hist_' + Math.random().toString(36).substring(2, 9),
          actionId: id,
          changedBy: currentUser.name,
          changedByEmail: currentUser.email,
          field: key,
          oldValue: String(oldVal || 'None'),
          newValue: String(newVal || 'None'),
          timestamp: new Date().toISOString()
        };
        db.actionHistory.unshift(historyEntry);
      }
    }

    if (fieldsChanged.length > 0) {
      db.actionItems[actionIndex] = updatedAction;
      saveDb(db);
      recordAudit(currentUser.email, 'UPDATE_ACTION', `Updated task ${id} (${originalAction.title}). Fields changed: ${fieldsChanged.join(', ')}`);
      dispatchNotifications(updatedAction, currentUser.email, fieldsChanged);
    }

    res.json(updatedAction);
  });

  // Action Items: Comments
  app.get('/api/actions/:id/comments', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const comments = db.comments.filter((c: Comment) => c.actionId === id);
    res.json(comments);
  });

  app.post('/api/actions/:id/comments', (req, res) => {
    const currentUser = req.user as User;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const db = getDb();
    const action = db.actionItems.find((a: ActionItem) => a.id === id);
    if (!action) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    // Secure comments
    if ((currentUser.role === 'customer_admin' || currentUser.role === 'customer_user') && currentUser.customerId !== action.customerId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const newComment: Comment = {
      id: 'comm_' + Math.random().toString(36).substring(2, 9),
      actionId: id,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      content,
      timestamp: new Date().toISOString()
    };

    db.comments.push(newComment);
    saveDb(db);

    recordAudit(currentUser.email, 'ADD_COMMENT', `Added comment on task ${id}: "${content.substring(0, 30)}..."`);
    res.json(newComment);
  });

  // Action Items: History Logs
  app.get('/api/actions/:id/history', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const history = db.actionHistory.filter((h: ActionHistory) => h.actionId === id);
    res.json(history);
  });

  // Audit Logs: Get system-wide log trail (Admins Only)
  app.get('/api/audit-logs', (req, res) => {
    const currentUser = req.user as User;
    if (currentUser.role !== 'gappify_admin') {
      return res.status(403).json({ error: 'Permission denied: Gappify Admins only' });
    }
    const db = getDb();
    res.json(db.auditLogs);
  });

  // System: Read Notification Logs
  app.get('/api/notifications', (req, res) => {
    const db = getDb();
    res.json(db.notifications);
  });

  // Excel Bulk Import Endpoint
  app.post('/api/actions/import', (req, res) => {
    const currentUser = req.user as User;
    if (currentUser.role === 'customer_user') {
      return res.status(403).json({ error: 'Permission denied: Standard customer viewers cannot bulk import' });
    }

    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Rows array is required for importing.' });
    }

    const db = getDb();
    let importedCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const { id, customerId, title, description, status, priority, ownerName, ownerEmail, deadline, jiraLink } = row;
      
      // Validation checks
      if (!customerId || !title || !status || !priority || !ownerName || !ownerEmail || !deadline) {
        continue; // Skip invalid rows
      }

      // Tenant isolation guard
      if (currentUser.role === 'customer_admin' && currentUser.customerId !== customerId) {
        continue; // Skip foreign tenants
      }

      const existingIndex = db.actionItems.findIndex((a: ActionItem) => a.id === id);

      if (existingIndex !== -1) {
        // Update Action Item
        const original = db.actionItems[existingIndex];
        const updated = {
          ...original,
          title,
          description: description || original.description,
          status,
          priority,
          ownerName,
          ownerEmail,
          deadline,
          jiraLink: jiraLink || original.jiraLink,
          updatedAt: new Date().toISOString()
        };

        // Log field differences
        const changed: string[] = [];
        for (const k of ['status', 'priority', 'ownerName', 'ownerEmail', 'deadline', 'jiraLink']) {
          if ((original as any)[k] !== (updated as any)[k]) {
            changed.push(k);
            const historyEntry: ActionHistory = {
              id: 'hist_' + Math.random().toString(36).substring(2, 9),
              actionId: original.id,
              changedBy: currentUser.name,
              changedByEmail: currentUser.email,
              field: k,
              oldValue: String((original as any)[k] || 'None'),
              newValue: String((updated as any)[k] || 'None'),
              timestamp: new Date().toISOString()
            };
            db.actionHistory.unshift(historyEntry);
          }
        }

        if (changed.length > 0) {
          db.actionItems[existingIndex] = updated;
          updatedCount++;
          dispatchNotifications(updated, currentUser.email, changed);
        }
      } else {
        // Create Action Item
        const newId = id || `GAP-${100 + db.actionItems.length + 1}`;
        const newAction: ActionItem = {
          id: newId,
          customerId,
          title,
          description: description || '',
          status,
          priority,
          ownerName,
          ownerEmail,
          deadline,
          jiraLink: jiraLink || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.actionItems.unshift(newAction);
        importedCount++;
        dispatchNotifications(newAction, currentUser.email, ['created']);
      }
    }

    saveDb(db);
    recordAudit(currentUser.email, 'IMPORT_EXCEL', `Bulk imported spreadsheet dataset: created ${importedCount} items, modified ${updatedCount} items.`);
    res.json({ success: true, created: importedCount, updated: updatedCount });
  });

  // Analytics API
  app.get('/api/analytics', (req, res) => {
    const currentUser = req.user as User;
    const db = getDb();
    let actions = db.actionItems as ActionItem[];

    // Scope check
    if (currentUser.role === 'customer_admin' || currentUser.role === 'customer_user') {
      actions = actions.filter(a => a.customerId === currentUser.customerId);
    }

    // Calculate distributions
    const totalCount = actions.length;

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const ownerCounts: Record<string, number> = {};

    db.statuses.forEach((s: StatusConfig) => { statusCounts[s.id] = 0; });
    statusCounts['completed'] = statusCounts['completed'] || 0;

    actions.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      priorityCounts[a.priority] = (priorityCounts[a.priority] || 0) + 1;
      ownerCounts[a.ownerName] = (ownerCounts[a.ownerName] || 0) + 1;
    });

    // Time Series Performance: Task resolution trend across months (mocking dynamic trend data for visual charts)
    // We can group actionItems created by month, or complete tasks vs created tasks trend.
    const performanceTrends = [
      { name: 'Jan', created: 3, resolved: 2 },
      { name: 'Feb', created: 5, resolved: 4 },
      { name: 'Mar', created: 8, resolved: 6 },
      { name: 'Apr', created: 10, resolved: 8 },
      { name: 'May', created: 12, resolved: 11 },
      { name: 'Jun', created: actions.length, resolved: actions.filter(a => a.status === 'completed').length }
    ];

    res.json({
      totalCount,
      statusDistribution: Object.entries(statusCounts).map(([key, value]) => ({ name: key, value })),
      priorityDistribution: Object.entries(priorityCounts).map(([key, value]) => ({ name: key, value })),
      ownerWorkloads: Object.entries(ownerCounts).map(([key, value]) => ({ name: key, count: value })),
      performanceTrends
    });
  });

  // --- Serve Frontend Application Assets (Vite Middleware Setup) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gappify tracker container is listening on port ${PORT}`);
  });
}

// Declare Custom Request Interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

startServer();

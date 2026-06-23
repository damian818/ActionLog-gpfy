/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Customer, ActionItem, ActionHistory, Comment, AuditLog, StatusConfig, NotificationLog } from './types';

// --- Default Seed Data (matches server.ts exactly) ---

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

// --- Mock DB Storage Helpers ---

function initMockDb() {
  if (!localStorage.getItem('gappify_db')) {
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
    localStorage.setItem('gappify_db', JSON.stringify(db));
  }
}

function getMockDb() {
  initMockDb();
  try {
    return JSON.parse(localStorage.getItem('gappify_db') || '{}');
  } catch (e) {
    localStorage.removeItem('gappify_db');
    initMockDb();
    return JSON.parse(localStorage.getItem('gappify_db') || '{}');
  }
}

function saveMockDb(db: any) {
  localStorage.setItem('gappify_db', JSON.stringify(db));
}

// --- Request Handler ---

function handleMockRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = init?.method?.toUpperCase() || 'GET';
  
  const db = getMockDb();
  let activeEmail = localStorage.getItem('gappify_active_email') || 'damian@gappify.com';
  
  // Ensure active user exists
  let activeUser = db.users.find((u: User) => u.email === activeEmail);
  if (!activeUser) {
    activeUser = {
      id: 'u_' + Math.random().toString(36).substring(2, 9),
      email: activeEmail,
      name: activeEmail.split('@')[0].toUpperCase(),
      role: activeEmail.endsWith('@gappify.com') ? 'gappify_admin' : 'customer_user',
      customerId: activeEmail.endsWith('@gappify.com') ? null : 'acme'
    };
    db.users.push(activeUser);
    saveMockDb(db);
  }

  // Parse body
  let bodyObj: any = {};
  if (init && init.body && typeof init.body === 'string') {
    try {
      bodyObj = JSON.parse(init.body);
    } catch (e) {
      // ignore
    }
  }

  // Helper to record audits
  const recordAudit = (type: string, details: string) => {
    const newLog: AuditLog = {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      userEmail: activeEmail,
      actionType: type,
      details,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
  };

  // Helper to record notifications
  const dispatchNotifications = (action: ActionItem, fields: string[]) => {
    const customer = db.customers.find((c: Customer) => c.id === action.customerId);
    const clientName = customer ? customer.name : action.customerId;
    const changeSummary = fields.map(f => `${f.toUpperCase()} updated`).join(', ');

    const emailLog: NotificationLog = {
      id: 'notif_e_' + Math.random().toString(36).substring(2, 9),
      actionId: action.id,
      type: 'email',
      recipient: action.ownerEmail,
      title: `[Gappify Implementation] Action Item ${action.id} Changed`,
      message: `Hello ${action.ownerName},\n\nTask: ${action.title} (Client: ${clientName})\nModified by: ${activeEmail}\nChanges: ${changeSummary}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    const gchatLog: NotificationLog = {
      id: 'notif_g_' + Math.random().toString(36).substring(2, 9),
      actionId: action.id,
      type: 'g_chat',
      recipient: `G-Chat-Room:Gappify-${action.customerId}-Implementation`,
      title: `G-Chat Integration: Task Alert`,
      message: `💬 *Gappify Alert:* *${action.id}* - *${action.title}*\n🏢 *Client:* ${clientName}\n🔄 *Event:* Updated by _${activeEmail}_ (${changeSummary})`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    db.notifications.unshift(emailLog, gchatLog);
  };

  let responseData: any = null;
  let status = 200;

  // Endpoint routing
  if (path === '/api/me') {
    responseData = activeUser;
  } 
  else if (path === '/api/auth/switch' && method === 'POST') {
    const { email } = bodyObj;
    if (!email) {
      status = 400;
      responseData = { error: 'Email is required' };
    } else {
      localStorage.setItem('gappify_active_email', email);
      activeEmail = email;
      
      let switchedUser = db.users.find((u: User) => u.email === email);
      if (!switchedUser) {
        const isGappify = email.endsWith('@gappify.com');
        switchedUser = {
          id: 'u_' + Math.random().toString(36).substring(2, 9),
          email,
          name: email.split('@')[0].toUpperCase(),
          role: isGappify ? 'gappify_admin' : 'customer_user',
          customerId: isGappify ? null : 'acme'
        };
        db.users.push(switchedUser);
      }
      
      recordAudit('USER_LOGIN', `Authenticated via simulated Google Login as ${email}`);
      saveMockDb(db);
      responseData = { success: true, user: switchedUser };
    }
  } 
  else if (path === '/api/users' && method === 'GET') {
    responseData = db.users;
  } 
  else if (path === '/api/users/update' && method === 'POST') {
    if (activeUser.role !== 'gappify_admin') {
      status = 403;
      responseData = { error: 'Permission denied: Gappify Admins only' };
    } else {
      const { email, role, customerId, name } = bodyObj;
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
      recordAudit('USER_ROLE_MGMT', `Updated role & tenant context of ${email} to Role: ${role}, Client ID: ${customerId || 'Gappify Global'}`);
      saveMockDb(db);
      responseData = { success: true, users: db.users };
    }
  } 
  else if (path === '/api/customers') {
    if (method === 'GET') {
      if (activeUser.role === 'gappify_admin' || activeUser.role === 'gappify_member') {
        responseData = db.customers;
      } else {
        responseData = db.customers.filter((c: Customer) => c.id === activeUser.customerId);
      }
    } else if (method === 'POST') {
      if (activeUser.role !== 'gappify_admin') {
        status = 403;
        responseData = { error: 'Permission denied: Gappify Admins only' };
      } else {
        const { name, domain } = bodyObj;
        if (!name || !domain) {
          status = 400;
          responseData = { error: 'Name and domain are required' };
        } else {
          const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (db.customers.some((c: Customer) => c.id === newId)) {
            status = 400;
            responseData = { error: 'A customer with this name already exists' };
          } else {
            const newCustomer: Customer = {
              id: newId,
              name,
              domain,
              createdAt: new Date().toISOString()
            };
            db.customers.push(newCustomer);
            recordAudit('CREATE_TENANT', `Created client tenant: ${name} (ID: ${newId})`);
            saveMockDb(db);
            responseData = newCustomer;
          }
        }
      }
    }
  } 
  else if (path === '/api/statuses') {
    if (method === 'GET') {
      responseData = db.statuses;
    } else if (method === 'POST') {
      if (activeUser.role !== 'gappify_admin') {
        status = 403;
        responseData = { error: 'Permission denied: Gappify Admins only' };
      } else {
        db.statuses = bodyObj.statuses;
        recordAudit('STATUS_LIST_CONFIG', `Customized the platform master status tracker checklist options`);
        saveMockDb(db);
        responseData = { success: true, statuses: db.statuses };
      }
    }
  } 
  else if (path === '/api/actions') {
    if (method === 'GET') {
      let actions = db.actionItems as ActionItem[];
      if (activeUser.role === 'customer_admin' || activeUser.role === 'customer_user') {
        actions = actions.filter((a: ActionItem) => a.customerId === activeUser.customerId);
      }
      responseData = actions;
    } else if (method === 'POST') {
      if (activeUser.role === 'customer_user') {
        status = 403;
        responseData = { error: 'Permission denied: Standard customer viewers cannot create actions' };
      } else {
        const { customerId, title, description, status: actionStatus, priority, ownerName, ownerEmail, deadline, jiraLink } = bodyObj;
        if (!customerId || !title || !actionStatus || !priority || !ownerName || !ownerEmail || !deadline) {
          status = 400;
          responseData = { error: 'Missing required action item fields' };
        } else if (activeUser.role === 'customer_admin' && activeUser.customerId !== customerId) {
          status = 403;
          responseData = { error: 'Permission denied: Cannot create task for other clients' };
        } else {
          const actionId = `GAP-${100 + db.actionItems.length + 1}`;
          const newAction: ActionItem = {
            id: actionId,
            customerId,
            title,
            description: description || '',
            status: actionStatus,
            priority,
            ownerName,
            ownerEmail,
            deadline,
            jiraLink: jiraLink || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          db.actionItems.unshift(newAction);
          recordAudit('CREATE_ACTION', `Created task ${actionId} (${title}) for client ID ${customerId}`);
          dispatchNotifications(newAction, ['created']);
          saveMockDb(db);
          responseData = newAction;
        }
      }
    }
  } 
  else if (path.startsWith('/api/actions/') && path.endsWith('/comments')) {
    const actionId = path.split('/')[3];
    if (method === 'GET') {
      responseData = db.comments.filter((c: Comment) => c.actionId === actionId);
    } else if (method === 'POST') {
      const { content } = bodyObj;
      if (!content) {
        status = 400;
        responseData = { error: 'Comment body is required' };
      } else {
        const action = db.actionItems.find((a: ActionItem) => a.id === actionId);
        if (!action) {
          status = 404;
          responseData = { error: 'Action item not found' };
        } else if ((activeUser.role === 'customer_admin' || activeUser.role === 'customer_user') && activeUser.customerId !== action.customerId) {
          status = 403;
          responseData = { error: 'Permission denied' };
        } else {
          const newComment: Comment = {
            id: 'comm_' + Math.random().toString(36).substring(2, 9),
            actionId,
            authorName: activeUser.name,
            authorEmail: activeUser.email,
            content,
            timestamp: new Date().toISOString()
          };
          db.comments.push(newComment);
          recordAudit('ADD_COMMENT', `Added comment on task ${actionId}`);
          saveMockDb(db);
          responseData = newComment;
        }
      }
    }
  } 
  else if (path.startsWith('/api/actions/') && path.endsWith('/history')) {
    const actionId = path.split('/')[3];
    responseData = db.actionHistory.filter((h: ActionHistory) => h.actionId === actionId);
  } 
  else if (path.startsWith('/api/actions/') && method === 'PATCH') {
    const actionId = path.split('/')[3];
    const updates = bodyObj;
    const actionIndex = db.actionItems.findIndex((a: ActionItem) => a.id === actionId);
    if (actionIndex === -1) {
      status = 404;
      responseData = { error: 'Action item not found' };
    } else {
      const originalAction = db.actionItems[actionIndex];
      if ((activeUser.role === 'customer_admin' || activeUser.role === 'customer_user') && activeUser.customerId !== originalAction.customerId) {
        status = 403;
        responseData = { error: 'Permission denied' };
      } else if (activeUser.role === 'customer_user' && Object.keys(updates).some(k => k !== 'status')) {
        status = 403;
        responseData = { error: 'Permission denied: Standard customer users can only update task statuses' };
      } else {
        const fieldsChanged: string[] = [];
        const updatedAction = { ...originalAction, ...updates, updatedAt: new Date().toISOString() };
        
        for (const key of Object.keys(updates)) {
          if (key === 'updatedAt' || key === 'createdAt') continue;
          const oldVal = (originalAction as any)[key];
          const newVal = updates[key];
          if (oldVal !== newVal) {
            fieldsChanged.push(key);
            db.actionHistory.unshift({
              id: 'hist_' + Math.random().toString(36).substring(2, 9),
              actionId,
              changedBy: activeUser.name,
              changedByEmail: activeUser.email,
              field: key,
              oldValue: String(oldVal || 'None'),
              newValue: String(newVal || 'None'),
              timestamp: new Date().toISOString()
            });
          }
        }
        
        if (fieldsChanged.length > 0) {
          db.actionItems[actionIndex] = updatedAction;
          recordAudit('UPDATE_ACTION', `Updated task ${actionId} (${originalAction.title}). Fields: ${fieldsChanged.join(', ')}`);
          dispatchNotifications(updatedAction, fieldsChanged);
          saveMockDb(db);
        }
        responseData = updatedAction;
      }
    }
  } 
  else if (path === '/api/actions/import' && method === 'POST') {
    if (activeUser.role === 'customer_user') {
      status = 403;
      responseData = { error: 'Permission denied: Standard customer viewers cannot bulk import' };
    } else {
      const { rows } = bodyObj;
      if (!rows || !Array.isArray(rows)) {
        status = 400;
        responseData = { error: 'Rows array is required' };
      } else {
        let importedCount = 0;
        let updatedCount = 0;
        
        for (const row of rows) {
          const { id, customerId, title, description, status: rowStatus, priority, ownerName, ownerEmail, deadline, jiraLink } = row;
          if (!customerId || !title || !rowStatus || !priority || !ownerName || !ownerEmail || !deadline) continue;
          if (activeUser.role === 'customer_admin' && activeUser.customerId !== customerId) continue;
          
          const existingIndex = db.actionItems.findIndex((a: ActionItem) => a.id === id);
          if (existingIndex !== -1) {
            db.actionItems[existingIndex] = {
              ...db.actionItems[existingIndex],
              title,
              description: description || '',
              status: rowStatus,
              priority,
              ownerName,
              ownerEmail,
              deadline,
              jiraLink: jiraLink || '',
              updatedAt: new Date().toISOString()
            };
            updatedCount++;
          } else {
            const actionId = id || `GAP-${100 + db.actionItems.length + 1}`;
            db.actionItems.unshift({
              id: actionId,
              customerId,
              title,
              description: description || '',
              status: rowStatus,
              priority,
              ownerName,
              ownerEmail,
              deadline,
              jiraLink: jiraLink || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            importedCount++;
          }
        }
        recordAudit('BULK_IMPORT', `Bulk imported spreadsheet tasks. Created: ${importedCount}, Updated: ${updatedCount}`);
        saveMockDb(db);
        responseData = { success: true, importedCount, updatedCount };
      }
    }
  } 
  else if (path === '/api/analytics' && method === 'GET') {
    const actionItems = db.actionItems;
    const statusDist = ['not_started', 'in_progress', 'on_hold', 'blocked', 'completed'].map(s => ({
      name: s,
      value: actionItems.filter((a: ActionItem) => a.status === s).length
    }));
    const priorityDist = ['Low', 'Medium', 'High', 'Critical'].map(p => ({
      name: p,
      value: actionItems.filter((a: ActionItem) => a.priority === p).length
    }));
    
    const workloadMap: Record<string, number> = {};
    actionItems.forEach((a: ActionItem) => {
      workloadMap[a.ownerName] = (workloadMap[a.ownerName] || 0) + 1;
    });
    const ownerWorkloads = Object.keys(workloadMap).map(name => ({
      name,
      count: workloadMap[name]
    })).sort((a, b) => b.count - a.count);

    const performanceTrends = [
      { name: 'Jan 26', created: 3, resolved: 2 },
      { name: 'Feb 26', created: 5, resolved: 4 },
      { name: 'Mar 26', created: 8, resolved: 6 },
      { name: 'Apr 26', created: 12, resolved: 9 },
      { name: 'May 26', created: 15, resolved: 12 },
      { name: 'Jun 26', created: actionItems.length, resolved: actionItems.filter((a: ActionItem) => a.status === 'completed').length }
    ];

    responseData = {
      totalCount: actionItems.length,
      statusDistribution: statusDist,
      priorityDistribution: priorityDist,
      ownerWorkloads,
      performanceTrends
    };
  } 
  else if (path === '/api/audit-logs' && method === 'GET') {
    responseData = db.auditLogs;
  } 
  else if (path === '/api/notifications' && method === 'GET') {
    responseData = db.notifications;
  } 
  else {
    status = 404;
    responseData = { error: 'Not Found' };
  }

  const mockResponse = new Response(JSON.stringify(responseData), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return Promise.resolve(mockResponse);
}

// --- Dynamic Interceptor Loader ---

let mockModeEnabled = false;

const originalFetch = window.fetch;
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));
  
  if (urlStr.includes('/api/')) {
    if (mockModeEnabled) {
      return handleMockRequest(urlStr, init);
    }
    
    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type') || '';
      
      // If server responded with valid JSON, keep using the real server backend
      if (response.ok && contentType.includes('application/json')) {
        return response;
      }
      
      // Otherwise, if we got HTML (Vercel SPA fallback) or 404/500, enable client-side mock
      console.warn('Backend responded with non-JSON. Transitioning to local client database mode.');
      mockModeEnabled = true;
      initMockDb();
      return handleMockRequest(urlStr, init);
    } catch (e) {
      // Network failure (no backend running) -> enable client-side mock
      console.warn('Backend network unreachable. Transitioning to local client database mode:', e);
      mockModeEnabled = true;
      initMockDb();
      return handleMockRequest(urlStr, init);
    }
  }
  
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: customFetch
  });
} catch (e) {
  console.warn('Failed to redefine window.fetch via Object.defineProperty. Trying direct assignment.', e);
  try {
    (window as any).fetch = customFetch;
  } catch (err2) {
    console.error('Could not override window.fetch:', err2);
  }
}

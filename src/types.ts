/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'gappify_admin' | 'gappify_member' | 'customer_admin' | 'customer_user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customerId: string | null; // null for Gappify team members
}

export interface Customer {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
}

export interface ActionItem {
  id: string; // E.g., GAP-101
  customerId: string;
  title: string;
  description: string;
  status: string; // Dynamic statuses
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  ownerName: string;
  ownerEmail: string;
  deadline: string;
  jiraLink?: string; // JIRA issue URL or key
  createdAt: string;
  updatedAt: string;
}

export interface ActionHistory {
  id: string;
  actionId: string;
  changedBy: string;
  changedByEmail: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  actionId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  actionType: string;
  details: string;
  timestamp: string;
}

export interface StatusConfig {
  id: string;
  label: string;
  color: string; // Tailwind color prefix, e.g., 'emerald', 'amber', 'rose'
}

export interface NotificationLog {
  id: string;
  actionId: string | null;
  type: 'email' | 'g_chat';
  recipient: string;
  title: string;
  message: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Plus, CheckCircle, AlertCircle, Building, UserCheck } from 'lucide-react';
import { Customer, User } from '../types';

interface MultiTenancyProps {
  currentUser: any;
  customers: Customer[];
  onRefreshCustomers: () => void;
}

export default function MultiTenancy({
  currentUser,
  customers,
  onRefreshCustomers
}: MultiTenancyProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [custName, setCustName] = useState('');
  const [custDomain, setCustDomain] = useState('');
  
  // Role mapping state
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'gappify_admin' | 'gappify_member' | 'customer_admin' | 'customer_user'>('customer_user');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [userNameInput, setUserNameInput] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to load users:', err));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custDomain) return;

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: custName, domain: custDomain })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: `Successfully registered client tenant: ${data.name}`, type: 'success' });
        setCustName('');
        setCustDomain('');
        onRefreshCustomers();
      } else {
        setMessage({ text: data.error || 'Failed to create customer tenant.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error contacting implementation server.', type: 'error' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail) return;

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUserEmail,
          role: selectedRole,
          customerId: selectedRole.startsWith('gappify') ? null : selectedTenant,
          name: userNameInput
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: `Successfully updated credentials for ${selectedUserEmail}`, type: 'success' });
        setSelectedUserEmail('');
        setUserNameInput('');
        fetchUsers();
      } else {
        setMessage({ text: data.error || 'Failed to map user roles.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error contacting authorization systems.', type: 'error' });
    }
  };

  if (currentUser.role !== 'gappify_admin') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center max-w-lg mx-auto shadow-sm">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-semibold text-gray-900 mt-4">Security Access Denied</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only registered **Gappify Platform Administrators** can access the Multi-Tenancy control panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Multi-Tenant Management Console</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create new customer isolation containers, grant organizational roles, and audit linked domains.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border flex gap-3 text-sm max-w-3xl ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Creation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">1. Register Client Tenant</h3>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Client Company Name</label>
              <input
                type="text"
                placeholder="e.g., Acme Corporation"
                value={custName}
                onChange={e => setCustName(e.target.value)}
                className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Corporate Domain Verification</label>
              <input
                type="text"
                placeholder="e.g., acme.com"
                value={custDomain}
                onChange={e => setCustDomain(e.target.value)}
                className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Provision Customer Container
            </button>
          </form>

          {/* Customer List */}
          <div className="space-y-2 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-50">Configured Client Databases</span>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {customers.map((c: Customer) => (
                <div key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">{c.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Domain: @{c.domain} | ID: {c.id}</span>
                  </div>
                  <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded">
                    Active Tenant
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Role Mapping */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">2. Manage Role Permissions</h3>
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">User Email (Registered or New)</label>
              <input
                type="email"
                placeholder="e.g., user@acme.com"
                value={selectedUserEmail}
                onChange={e => setSelectedUserEmail(e.target.value)}
                className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">User Full Name</label>
              <input
                type="text"
                placeholder="e.g., Jane Smith"
                value={userNameInput}
                onChange={e => setUserNameInput(e.target.value)}
                className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Target Platform Role</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none bg-white transition-all"
                >
                  <option value="gappify_admin">Gappify Admin (Global)</option>
                  <option value="gappify_member">Gappify Consultant (Global)</option>
                  <option value="customer_admin">Customer Admin (Tenant)</option>
                  <option value="customer_user">Customer Viewer (Tenant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Tenant Constraint</label>
                <select
                  value={selectedTenant}
                  onChange={e => setSelectedTenant(e.target.value)}
                  disabled={selectedRole.startsWith('gappify')}
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none bg-white disabled:bg-gray-100 transition-all"
                >
                  <option value="">-- Choose Tenant --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Update Security Credentials
            </button>
          </form>

          {/* User List and mappings */}
          <div className="space-y-2 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-50">Current Registered Users</span>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {users.map((u: User) => {
                const clientName = customers.find(c => c.id === u.customerId)?.name || 'Gappify Global';
                return (
                  <div key={u.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="font-semibold text-xs text-gray-800 block">{u.name} <span className="text-gray-400 font-normal">({u.email})</span></span>
                      <span className="text-[10px] text-gray-400 font-mono">Tenant Link: {clientName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      u.role === 'gappify_admin' 
                        ? 'bg-rose-50 border-rose-100 text-rose-700' 
                        : u.role === 'gappify_member'
                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

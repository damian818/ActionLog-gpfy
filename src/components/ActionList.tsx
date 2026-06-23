/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, AlertCircle, Link, CheckCircle, ExternalLink, HelpCircle, User } from 'lucide-react';
import { ActionItem, Customer, StatusConfig } from '../types';

interface ActionListProps {
  currentUser: any;
  customers: Customer[];
  statuses: StatusConfig[];
  actions: ActionItem[];
  onSelectAction: (action: ActionItem) => void;
  onRefresh: () => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

export default function ActionList({
  currentUser,
  customers,
  statuses,
  actions,
  onSelectAction,
  onRefresh,
  selectedCustomerId,
  setSelectedCustomerId
}: ActionListProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  
  // Create Action State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCustId, setNewCustId] = useState(currentUser.customerId || '');
  const [newStatus, setNewStatus] = useState('not_started');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newJira, setNewJira] = useState('');
  const [creatorError, setCreatorError] = useState('');

  // Helpers
  const isGappifyTeam = currentUser.role === 'gappify_admin' || currentUser.role === 'gappify_member';
  const canCreate = currentUser.role !== 'customer_user';

  const getStatusDotBg = (color: string) => {
    switch (color) {
      case 'slate': return 'bg-slate-500';
      case 'blue': return 'bg-blue-500';
      case 'amber': return 'bg-yellow-500';
      case 'rose': return 'bg-red-500';
      case 'emerald': return 'bg-emerald-500';
      case 'indigo': return 'bg-indigo-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-200 text-red-900 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider';
      case 'High': return 'bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider';
      case 'Low': return 'bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider';
      default: return 'bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded text-[9px]';
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError('');

    if (!newTitle || !newOwnerName || !newOwnerEmail || !newDeadline) {
      setCreatorError('Please complete all mandatory Action fields.');
      return;
    }

    const payload = {
      customerId: isGappifyTeam ? newCustId : currentUser.customerId,
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail,
      deadline: newDeadline,
      jiraLink: newJira
    };

    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setIsCreating(false);
        setNewTitle('');
        setNewDesc('');
        setNewOwnerName('');
        setNewOwnerEmail('');
        setNewDeadline('');
        setNewJira('');
        onRefresh();
      } else {
        setCreatorError(data.error || 'Server error creating action item.');
      }
    } catch (error) {
      setCreatorError('Network failure linking databases.');
    }
  };

  // Filter actions dataset
  const filteredActions = actions.filter(action => {
    // 1. Tenant Filter (Multi-tenant)
    if (selectedCustomerId && action.customerId !== selectedCustomerId) return false;
    
    // 2. Status Filter
    if (selectedStatus && action.status !== selectedStatus) return false;

    // 3. Priority Filter
    if (selectedPriority && action.priority !== selectedPriority) return false;

    // 4. Search Filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        action.id.toLowerCase().includes(s) ||
        action.title.toLowerCase().includes(s) ||
        action.description.toLowerCase().includes(s) ||
        action.ownerName.toLowerCase().includes(s) ||
        action.ownerEmail.toLowerCase().includes(s) ||
        (action.jiraLink && action.jiraLink.toLowerCase().includes(s))
      );
    }

    return true;
  });

  // KPI calculations
  const totalCount = filteredActions.length;
  const openCount = filteredActions.filter(a => a.status !== 'completed').length;
  const completedCount = filteredActions.filter(a => a.status === 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = filteredActions.filter(a => {
    const isOverdue = new Date(a.deadline) < new Date() && a.status !== 'completed';
    return isOverdue;
  }).length;

  return (
    <div className="space-y-4 animate-fade-in text-slate-700">
      
      {/* KPI Cards section (High Density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Open Tasks</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-800">{openCount}</span>
            <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1 py-0.5 rounded">+5 dynamic</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Completion Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-800">{completionRate}%</span>
            <span className="text-[9px] text-green-500 font-bold bg-green-50 px-1 py-0.5 rounded">↑ 2.4%</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Overdue Actions</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-extrabold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{overdueCount}</span>
            <span className="text-[9px] text-slate-400 font-medium">Requires Attention</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Implementation Stage</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-800">Phase 3</span>
            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded">UAT TESTING</span>
          </div>
        </div>
      </div>

      {/* 1. Filter / Tool Bar Header */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search input with search icon overlay */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, owners, JIRA..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded outline-none transition-all"
          />
        </div>

        {/* Dropdown Select Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
          
          {/* Multi-tenancy filter (only seen by Gappify Admins / members) */}
          {isGappifyTeam && (
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="text-[11px] border border-slate-200 bg-white hover:border-slate-300 rounded px-2 py-1.5 outline-none font-medium text-slate-600 transition-colors"
            >
              <option value="">All Clients</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-[11px] border border-slate-200 bg-white hover:border-slate-300 rounded px-2 py-1.5 outline-none font-medium text-slate-600 transition-colors"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="text-[11px] border border-slate-200 bg-white hover:border-slate-300 rounded px-2 py-1.5 outline-none font-medium text-slate-600 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Create Button */}
          {canCreate && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + New Action
            </button>
          )}
        </div>
      </div>

      {/* 2. Tasks Master Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No active tasks found matching the selected filters.</p>
            <p className="text-[11px] text-slate-400">Try loosening your search filters or add a new action item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2.5 px-3 pl-4">Priority</th>
                  <th className="py-2.5 px-3">Action Item</th>
                  {isGappifyTeam && <th className="py-2.5 px-3">Client Tenant</th>}
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3 text-center">JIRA Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredActions.map(action => {
                  const clientName = customers.find(c => c.id === action.customerId)?.name || action.customerId;
                  const statusObj = statuses.find(s => s.id === action.status);
                  
                  // Highlight overdue tasks
                  const isOverdue = new Date(action.deadline) < new Date() && action.status !== 'completed';

                  return (
                    <tr 
                      key={action.id} 
                      onClick={() => onSelectAction(action)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Priority (First column from the layout) */}
                      <td className="py-2 px-3 pl-4">
                        <span className={getPriorityBadge(action.priority)}>
                          {action.priority.substring(0, 3)}
                        </span>
                      </td>

                      {/* Title & description snippet */}
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-800 block text-xs">{action.title}</span>
                        <span className="text-[10px] text-slate-400 block max-w-sm truncate">
                          {action.id} • {action.description || 'No detailed instructions.'}
                        </span>
                      </td>

                      {/* Client (only if admin view) */}
                      {isGappifyTeam && (
                        <td className="py-2 px-3 font-medium text-xs text-slate-600">
                          {clientName}
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotBg(statusObj?.color || 'slate')}`}></div>
                          {statusObj?.label || action.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px] border border-blue-100 uppercase shrink-0">
                            {action.ownerName.slice(0, 2)}
                          </div>
                          <span className="font-medium text-xs text-slate-700 truncate max-w-[120px]" title={action.ownerName}>{action.ownerName}</span>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className={`py-2 px-3 font-mono text-[11px] ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                        <span>{action.deadline}</span>
                      </td>

                      {/* Jira badge link */}
                      <td className="py-2 px-3 text-center" onClick={e => e.stopPropagation()}>
                        {action.jiraLink ? (
                          <a 
                            href={action.jiraLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-[11px]"
                          >
                            {action.jiraLink.split('/').pop() || 'JIRA'}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-mono">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. New Action Modal Pop-up Backdrop */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-2xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-lg text-gray-900">Add Implementation Action Item</h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 text-lg p-1 hover:bg-gray-50 rounded"
              >
                ✕
              </button>
            </div>

            {creatorError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{creatorError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Tenant selector (Gappify Team view only) */}
                {isGappifyTeam ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Client Tenant Mapping *</label>
                    <select
                      value={newCustId}
                      onChange={e => setNewCustId(e.target.value)}
                      className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white"
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Client Tenant</label>
                    <input
                      type="text"
                      value={customers.find(c => c.id === currentUser.customerId)?.name || currentUser.customerId}
                      disabled
                      className="w-full text-sm border border-gray-100 bg-gray-50 rounded-lg p-2.5 outline-none text-gray-400"
                    />
                  </div>
                )}

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Critical Priority Level *</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Implementation Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Set up Salesforce webhook integration"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Detailed Requirements</label>
                <textarea
                  placeholder="Details of setup requirements, credentials, and constraints."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assignee Owner */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Jane Smith"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none"
                    required
                  />
                </div>

                {/* Assignee Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Owner Corporate Email *</label>
                  <input
                    type="email"
                    placeholder="e.g., jane@acme.com"
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Deadline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Target Deadline *</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white"
                    required
                  />
                </div>

                {/* Jira URL Link */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">JIRA Ticket Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g., https://jira.gappify.com/browse/GAP-120"
                    value={newJira}
                    onChange={e => setNewJira(e.target.value)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Create Action Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Send, Calendar, AlertCircle, Link, ShieldAlert, History, User } from 'lucide-react';
import { ActionItem, StatusConfig, Comment, ActionHistory } from '../types';

interface ActionModalProps {
  currentUser: any;
  action: ActionItem;
  statuses: StatusConfig[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function ActionModal({
  currentUser,
  action,
  statuses,
  onClose,
  onRefresh
}: ActionModalProps) {
  const [status, setStatus] = useState(action.status);
  const [priority, setPriority] = useState(action.priority);
  const [ownerName, setOwnerName] = useState(action.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(action.ownerEmail);
  const [deadline, setDeadline] = useState(action.deadline);
  const [jiraLink, setJiraLink] = useState(action.jiraLink || '');
  
  // Lists fetched from APIs
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Message Feedback
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchComments();
    fetchHistory();
  }, [action.id]);

  const fetchComments = () => {
    fetch(`/api/actions/${action.id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error('Failed to load comments:', err));
  };

  const fetchHistory = () => {
    fetch(`/api/actions/${action.id}/history`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error('Failed to load history:', err));
  };

  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Build patches based on role permissions
    let updates: any = { status };

    if (currentUser.role !== 'customer_user') {
      updates = {
        status,
        priority,
        ownerName,
        ownerEmail,
        deadline,
        jiraLink
      };
    }

    try {
      const response = await fetch(`/api/actions/${action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Task parameters updated successfully.', type: 'success' });
        fetchHistory();
        onRefresh();
      } else {
        setMessage({ text: data.error || 'Failed to update action item details.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error contacting tracker server.', type: 'error' });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/actions/${action.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit comment.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isCustomerViewer = currentUser.role === 'customer_user';

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-5xl w-full p-6 space-y-5 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-hidden">
        
        {/* LEFT COLUMN: Main Parameters and Comment Thread */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 md:border-r border-gray-100 md:pr-6">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{action.id} • Implementation Task</span>
              <h3 className="font-bold text-base text-gray-900 leading-snug mt-1">{action.title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg p-1 hover:bg-gray-50 rounded"
            >
              ✕
            </button>
          </div>

          {message && (
            <div className={`p-3 text-xs rounded-lg border flex gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              {message.type === 'success' ? <Clock className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Details Form */}
          <form onSubmit={handleUpdateAction} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Dropdown - Available to everyone */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Workflow Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white font-semibold text-gray-700"
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority - Disabled for Customer Viewers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Critical Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  disabled={isCustomerViewer}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner Name - Disabled for Viewers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  disabled={isCustomerViewer}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>

              {/* Owner Email - Disabled for Viewers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Owner Email</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  disabled={isCustomerViewer}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Deadline - Disabled for Viewers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Target Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  disabled={isCustomerViewer}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>

              {/* JIRA issue Link - Disabled for Viewers */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">JIRA Ticket Integration URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://jira.gappify.com/browse/GAP-102"
                  value={jiraLink}
                  onChange={e => setJiraLink(e.target.value)}
                  disabled={isCustomerViewer}
                  className="w-full text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            {isCustomerViewer && (
              <div className="flex gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Customer viewers are locked to status-updates only. Assignees & priority changes are locked.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Commit Updates
            </button>
          </form>

          {/* Comment Stream */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 pb-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Comment Feed ({comments.length})
            </span>

            {/* Existing Comments list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No timeline logs or collaborative discussions posted.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span className="font-semibold text-gray-700">{c.authorName} ({c.authorEmail})</span>
                      <span>{new Date(c.timestamp).toLocaleTimeString()} ({new Date(c.timestamp).toLocaleDateString()})</span>
                    </div>
                    <p className="text-xs text-gray-600 font-sans leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Post an implementation update or block reason..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Action parameters audit history log */}
        <div className="w-full md:w-80 overflow-y-auto flex flex-col space-y-4 pt-4 md:pt-0">
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <History className="w-4 h-4 text-purple-600 animate-pulse" />
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Parameters Audit Trail</h4>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 flex-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No parameters changed since task generation.</p>
            ) : (
              history.map(h => (
                <div key={h.id} className="relative pl-4 border-l-2 border-purple-200 space-y-1">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="text-[10px] text-gray-400 flex justify-between">
                    <span className="font-semibold text-purple-700">{h.changedBy}</span>
                    <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Modified <span className="font-semibold text-gray-800">{h.field.toUpperCase()}</span>:
                  </p>
                  <div className="text-[10px] bg-gray-50 p-2 border border-gray-100 rounded text-gray-500 font-mono space-y-0.5 max-w-full overflow-x-auto leading-tight">
                    <div>Old: <span className="line-through">{h.oldValue}</span></div>
                    <div>New: <span className="font-semibold text-gray-800">{h.newValue}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

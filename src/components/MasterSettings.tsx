/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Plus, Trash2, CheckCircle, AlertCircle, Palette } from 'lucide-react';
import { StatusConfig } from '../types';

interface MasterSettingsProps {
  currentUser: any;
  statuses: StatusConfig[];
  onRefreshStatuses: () => void;
}

export default function MasterSettings({
  currentUser,
  statuses,
  onRefreshStatuses
}: MasterSettingsProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const colorsList = [
    { name: 'Slate Gray', id: 'slate' },
    { name: 'Brilliant Blue', id: 'blue' },
    { name: 'Golden Amber', id: 'amber' },
    { name: 'Crimson Rose', id: 'rose' },
    { name: 'Emerald Green', id: 'emerald' },
    { name: 'Royal Indigo', id: 'indigo' },
    { name: 'Orchid Purple', id: 'purple' },
  ];

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;

    const newId = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (statuses.some(s => s.id === newId)) {
      setMessage({ text: 'A status configuration with this ID already exists.', type: 'error' });
      return;
    }

    const updatedStatuses = [...statuses, { id: newId, label: newLabel, color: newColor }];

    try {
      const response = await fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statuses: updatedStatuses })
      });
      if (response.ok) {
        setMessage({ text: `Successfully registered new status option: ${newLabel}`, type: 'success' });
        setNewLabel('');
        onRefreshStatuses();
      } else {
        setMessage({ text: 'Failed to update workflow statuses on server.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error dispatching status configurations.', type: 'error' });
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    // Prevent deleting all statuses or mandatory ones
    if (statuses.length <= 2) {
      setMessage({ text: 'Must preserve at least 2 active implementation checklist states.', type: 'error' });
      return;
    }

    const updatedStatuses = statuses.filter(s => s.id !== statusId);

    try {
      const response = await fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statuses: updatedStatuses })
      });
      if (response.ok) {
        setMessage({ text: 'Workflow checklist state removed successfully.', type: 'success' });
        onRefreshStatuses();
      } else {
        setMessage({ text: 'Failed to remove checklist status.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error communicating with configuration server.', type: 'error' });
    }
  };

  if (currentUser.role !== 'gappify_admin') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center max-w-lg mx-auto shadow-sm">
        <Settings className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-semibold text-gray-900 mt-4">Security Access Denied</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only **Gappify Platform Administrators** can access the Master Settings checklist customizer.
        </p>
      </div>
    );
  }

  // Visual helper for badge preview colors
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'slate': return 'bg-slate-50 border-slate-200 text-slate-700';
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'amber': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'rose': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'emerald': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'indigo': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Master Workflow Status Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Define global progress checklist tags that implementation actions can adopt during deployment phases.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border flex gap-3 text-sm ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Customizer list */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Master Status List</h3>
          </div>

          <div className="space-y-3">
            {statuses.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getColorClasses(s.color)}`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {s.id}</span>
                </div>
                
                <button
                  onClick={() => handleDeleteStatus(s.id)}
                  className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Remove State"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Add Custom Status Value</h3>
          </div>

          <form onSubmit={handleAddStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Checklist Label Name</label>
              <input
                type="text"
                placeholder="e.g., In Review"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="w-full text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Visual Color Badge Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {colorsList.map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setNewColor(col.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                      newColor === col.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/15 bg-blue-50/50 font-semibold' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${
                      col.id === 'slate' ? 'bg-slate-400' :
                      col.id === 'blue' ? 'bg-blue-500' :
                      col.id === 'amber' ? 'bg-amber-500' :
                      col.id === 'rose' ? 'bg-rose-500' :
                      col.id === 'emerald' ? 'bg-emerald-500' :
                      col.id === 'indigo' ? 'bg-indigo-500' : 'bg-purple-500'
                    }`}></span>
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-lg">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pre-visualization Badge</span>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border inline-block ${getColorClasses(newColor)}`}>
                {newLabel || 'Preview Text'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Add Workflow Check Option
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

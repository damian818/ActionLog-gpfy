/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, RefreshCw, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { NotificationLog } from '../types';

export default function Communications() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load notifications logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const emails = logs.filter(l => l.type === 'email');
  const gchats = logs.filter(l => l.type === 'g_chat');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Real-Time Notification Queues</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time webhooks dispatch alerts automatically to Corporate Emails and Google Chat Channels on action change, assignment, and priority elevation.
          </p>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload Live Logs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Email Logs Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
            <Mail className="w-5 h-5 text-blue-600 animate-pulse" />
            <h3 className="font-semibold text-gray-800">Email Alerts Queue</h3>
            <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full ml-auto">
              {emails.length} Dispatched
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {emails.length === 0 ? (
              <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-400 text-sm">
                No emails dispatched yet. Try modifying action statuses or assignees!
              </div>
            ) : (
              emails.map(e => (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block leading-tight">{e.title}</span>
                      <span className="text-[10px] text-gray-400 font-medium">To: <span className="font-mono text-gray-600">{e.recipient}</span></span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      DELIVERED
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-sans whitespace-pre-wrap leading-relaxed text-gray-600 max-h-40 overflow-y-auto font-mono">
                    {e.message}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium border-t border-gray-50 pt-2">
                    <span>Protocol: SMTP-TLS | SSL Secure</span>
                    <span>{new Date(e.timestamp).toLocaleTimeString()} ({new Date(e.timestamp).toLocaleDateString()})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* G Chat Webhook JSON Packets Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
            <MessageSquare className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="font-semibold text-gray-800">Google Chat Webhook Dispatches</h3>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full ml-auto">
              {gchats.length} Dispatched
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {gchats.length === 0 ? (
              <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-400 text-sm">
                No G Chat webhook notifications sent. Update any task priority or owner to trigger.
              </div>
            ) : (
              gchats.map(g => (
                <div key={g.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block leading-tight">{g.title}</span>
                      <span className="text-[10px] text-indigo-500 font-semibold font-mono">Channel: {g.recipient}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      HTTP 200 OK
                    </div>
                  </div>

                  {/* Google Chat Style Message Preview Card */}
                  <div className="bg-indigo-950 text-indigo-100 border border-indigo-900 p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-indigo-900 pb-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        G
                      </div>
                      <span className="text-xs font-semibold text-white tracking-wide">Gappify Integration Engine • Bot</span>
                    </div>
                    <div className="text-xs space-y-1 text-gray-200">
                      <p className="whitespace-pre-wrap leading-relaxed">{g.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium border-t border-gray-50 pt-2">
                    <span>Hook: GappifyChatAPI v1.4</span>
                    <span>{new Date(g.timestamp).toLocaleTimeString()} ({new Date(g.timestamp).toLocaleDateString()})</span>
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

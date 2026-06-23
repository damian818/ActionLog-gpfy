/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  FileSpreadsheet,
  BarChart3,
  Building2,
  Settings,
  BellRing,
  Activity,
  User,
  LogOut,
  ChevronDown,
  Building,
  KeyRound,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

import { User as UserType, Customer, ActionItem, StatusConfig } from './types';
import ActionList from './components/ActionList';
import ActionModal from './components/ActionModal';
import ExcelManager from './components/ExcelManager';
import Analytics from './components/Analytics';
import MultiTenancy from './components/MultiTenancy';
import MasterSettings from './components/MasterSettings';
import Communications from './components/Communications';

export default function App() {
  // Session / Session Simulation
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isSimConsoleOpen, setIsSimConsoleOpen] = useState(false);

  // Global Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  
  // Navigation / Filter context
  const [activeTab, setActiveTab] = useState<'actions' | 'excel' | 'analytics' | 'multi_tenant' | 'master_settings' | 'communications'>('actions');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  // Simulated personas list for testing
  const SIMULATED_PERSONAS = [
    { name: 'Damian Gappify', email: 'damian@gappify.com', desc: 'Gappify Admin (Super)', role: 'gappify_admin', tenant: 'Global' },
    { name: 'Alex Consultant', email: 'alex@gappify.com', desc: 'Gappify Member (Consultant)', role: 'gappify_member', tenant: 'Global' },
    { name: 'Jane Acme', email: 'jane@acme.com', desc: 'Acme Corp (Customer Admin)', role: 'customer_admin', tenant: 'Acme Corp' },
    { name: 'John Acme', email: 'john@acme.com', desc: 'Acme Corp (Customer Viewer)', role: 'customer_user', tenant: 'Acme Corp' },
    { name: 'Bob Globex', email: 'bob@globex.com', desc: 'Globex Int (Customer Admin)', role: 'customer_admin', tenant: 'Globex' },
  ];

  // Global fetch triggers
  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGlobalData();
    }
  }, [currentUser]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setCurrentUser(data);
      setSessionLoading(false);
    } catch (error) {
      console.error('Session handshakes failed:', error);
      setSessionLoading(false);
    }
  };

  const loadGlobalData = async () => {
    try {
      // Parallel fetches for extreme speed
      const [customersRes, statusesRes, actionsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/statuses'),
        fetch('/api/actions')
      ]);

      const [customersData, statusesData, actionsData] = await Promise.all([
        customersRes.json(),
        statusesRes.json(),
        actionsRes.json()
      ]);

      setCustomers(customersData);
      setStatuses(statusesData);
      setActions(actionsData);
    } catch (error) {
      console.error('Global data load failed:', error);
    }
  };

  const handleSwitchUser = async (email: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsSimConsoleOpen(false);
        // Reset navigation to safe state
        setActiveTab('actions');
        setSelectedCustomerId('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 gap-3">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-gray-400 tracking-wider">Verifying Gappify OAuth Handshakes...</span>
      </div>
    );
  }

  const isGappifyAdmin = currentUser?.role === 'gappify_admin';
  const isGappifyTeam = currentUser?.role === 'gappify_admin' || currentUser?.role === 'gappify_member';

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans">
      
      {/* 1. Header and navigation branding */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-sm font-bold text-lg">
              G
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 tracking-tight block leading-tight">Gappify Action Log</span>
              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Implementation Portal</span>
            </div>
          </div>

          {/* User Session and Simulator Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimConsoleOpen(!isSimConsoleOpen)}
              className="inline-flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded px-2.5 py-1.5 transition-all cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OAuth Simulator Panel</span>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                {currentUser?.name?.slice(0, 2) || '??'}
              </div>
              <div className="hidden md:block text-left leading-none">
                <span className="font-bold text-xs text-slate-800 block">{currentUser?.name || 'Loading...'}</span>
                <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{currentUser?.email || ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Google OAuth Simulator Console Pop-out drawer */}
        {isSimConsoleOpen && (
          <div className="bg-blue-50 border-b border-blue-100/70 p-4 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Authentication Persona Simulator</span>
                </div>
                <button 
                  onClick={() => setIsSimConsoleOpen(false)}
                  className="text-blue-400 hover:text-blue-600 text-xs font-semibold"
                >
                  Dismiss Console
                </button>
              </div>
              <p className="text-xs text-blue-700 max-w-2xl leading-relaxed">
                We have pre-seeded five realistic Gappify & Client personas below. 
                Switch identities instantly to test real-time email triggers, Google Chat hooks, and Tenant isolation constraints!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
                {SIMULATED_PERSONAS.map((p, i) => {
                  const isActive = currentUser?.email === p.email;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 shadow-xs cursor-pointer ${
                        isActive 
                          ? 'border-blue-600 ring-2 ring-blue-500/15 bg-white' 
                          : 'border-blue-100 hover:border-blue-200 bg-blue-50/50 hover:bg-white'
                      }`}
                    >
                      <div>
                        <span className={`block text-xs font-bold leading-tight ${isActive ? 'text-blue-800' : 'text-gray-700'}`}>{p.name}</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">{p.email}</span>
                      </div>
                      <div className="flex justify-between items-center w-full border-t border-blue-50 pt-1.5 mt-1">
                        <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded uppercase leading-none">{p.tenant}</span>
                        {isActive && <span className="text-[8px] font-bold text-emerald-600">ACTIVE</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Dashboard Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 w-full">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 bg-[#0F172A] text-white rounded-lg p-3.5 space-y-4 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold px-3 py-1.5 block">Management</span>
              
              {/* Actions Tab */}
              <button
                onClick={() => setActiveTab('actions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                  activeTab === 'actions' 
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5 shrink-0" />
                Action Logs
              </button>

              {/* Excel spreadsheet Ops */}
              <button
                onClick={() => setActiveTab('excel')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                  activeTab === 'excel' 
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                Excel Bulk Ops
              </button>

              {/* Realtime Alert logs queue */}
              <button
                onClick={() => setActiveTab('communications')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                  activeTab === 'communications' 
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BellRing className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                Notifications
              </button>
            </div>

            {/* ADMIN STAGE CONTROLS */}
            {isGappifyTeam && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold px-3 py-1.5 block">Consultant Panel</span>

                {/* Analytics */}
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'analytics' 
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  Performance Trends
                </button>

                {/* Multi-Tenancy */}
                {isGappifyAdmin && (
                  <>
                    <button
                      onClick={() => setActiveTab('multi_tenant')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                        activeTab === 'multi_tenant' 
                          ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      Tenant Control
                    </button>

                    {/* Settings */}
                    <button
                      onClick={() => setActiveTab('master_settings')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                        activeTab === 'master_settings' 
                          ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-600' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      Status Customizer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mini active status card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] text-slate-500">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              Tenant Context
            </div>
            <div className="space-y-1 font-sans">
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-semibold text-slate-200 capitalize">{currentUser?.role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Client:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[100px]" title={currentUser?.customerId ? (customers.find(c => c.id === currentUser.customerId)?.name || currentUser.customerId) : 'Gappify Global'}>
                  {currentUser?.customerId 
                    ? (customers.find(c => c.id === currentUser.customerId)?.name || currentUser.customerId) 
                    : 'Global'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Display Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'actions' && (
            <ActionList
              currentUser={currentUser}
              customers={customers}
              statuses={statuses}
              actions={actions}
              onSelectAction={setSelectedAction}
              onRefresh={loadGlobalData}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
            />
          )}

          {activeTab === 'excel' && (
            <ExcelManager
              currentUser={currentUser}
              customers={customers}
              actions={actions}
              onRefresh={loadGlobalData}
              selectedCustomerId={selectedCustomerId}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics statuses={statuses} />
          )}

          {activeTab === 'multi_tenant' && (
            <MultiTenancy
              currentUser={currentUser}
              customers={customers}
              onRefreshCustomers={loadGlobalData}
            />
          )}

          {activeTab === 'master_settings' && (
            <MasterSettings
              currentUser={currentUser}
              statuses={statuses}
              onRefreshStatuses={loadGlobalData}
            />
          )}

          {activeTab === 'communications' && (
            <Communications />
          )}
        </div>
      </main>

      {/* 4. Action details Popup Modal */}
      {selectedAction && (
        <ActionModal
          currentUser={currentUser}
          action={selectedAction}
          statuses={statuses}
          onClose={() => setSelectedAction(null)}
          onRefresh={loadGlobalData}
        />
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, BarChart4, PieChart as PieIcon, Users, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { StatusConfig } from '../types';

interface AnalyticsProps {
  statuses: StatusConfig[];
}

export default function Analytics({ statuses }: AnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-gray-500">Compiling activity metrics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-semibold text-gray-900 mt-4">Failed to load metrics data</h3>
        <p className="text-sm text-gray-500 mt-1">Please try again later.</p>
      </div>
    );
  }

  // Visual Palette Colors
  const STATUS_COLORS: Record<string, string> = {
    not_started: '#94a3b8', // slate-400
    in_progress: '#3b82f6', // blue-500
    on_hold: '#f59e0b', // amber-500
    blocked: '#ef4444', // rose-500
    completed: '#10b981', // emerald-500
  };

  const PRIORITY_COLORS: Record<string, string> = {
    Low: '#94a3b8',
    Medium: '#3b82f6',
    High: '#f59e0b',
    Critical: '#ef4444',
  };

  const statusData = data.statusDistribution.map((item: any) => {
    const config = statuses.find(s => s.id === item.name);
    return {
      name: config?.label || item.name,
      value: item.value,
      color: STATUS_COLORS[item.name] || '#6366f1'
    };
  }).filter((item: any) => item.value > 0);

  const priorityData = data.priorityDistribution.map((item: any) => ({
    name: item.name,
    value: item.value,
    color: PRIORITY_COLORS[item.name] || '#a855f7'
  })).filter((item: any) => item.value > 0);

  const activeTasks = data.totalCount - (data.statusDistribution.find((s: any) => s.name === 'completed')?.value || 0);
  const completedTasks = data.statusDistribution.find((s: any) => s.name === 'completed')?.value || 0;
  const blockedTasks = data.statusDistribution.find((s: any) => s.name === 'blocked')?.value || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Total Tasks</span>
            <span className="block text-2xl font-bold text-gray-900">{data.totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Active Backlog</span>
            <span className="block text-2xl font-bold text-gray-900">{activeTasks}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Completed</span>
            <span className="block text-2xl font-bold text-gray-900">{completedTasks}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Blocked Points</span>
            <span className="block text-2xl font-bold text-gray-900">{blockedTasks}</span>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance & Action Resolution Trend Line */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Monthly Performance Trends</h3>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="created" name="Tasks Created" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolved" name="Tasks Resolved" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Owner Workloads Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Owner Assigned Workloads</h3>
          </div>
          <div className="h-72 w-full text-xs">
            {data.ownerWorkloads.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">No active owners.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ownerWorkloads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" precision={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Action Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={36}>
                    {data.ownerWorkloads.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${260 + index * 15}, 85%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Workflow Status Allocation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">No tasks.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block pb-1">Legend</span>
              {statusData.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                    <span>{s.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{s.value} ({Math.round((s.value / data.totalCount) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Matrix Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <BarChart4 className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-gray-800">Critical Priority Distribution</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              {priorityData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">No tasks.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block pb-1">Legend</span>
              {priorityData.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                    <span>{p.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{p.value} ({Math.round((p.value / data.totalCount) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

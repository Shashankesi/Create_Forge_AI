import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  Zap,
  FileText,
  Heading,
  Image as ImageIcon,
  Layers,
  Server,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, usageRes] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAdminUsers(),
        adminService.getAdminUsage(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data.users || []);
      if (usageRes.success) setUsage(usageRes.data.recentGenerations || []);
    } catch (err) {
      showToast(err.customMessage || 'Failed to load admin analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toolLabels = {
    article: { label: 'Article Generator', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/60' },
    title: { label: 'Blog Title Generator', icon: Heading, color: 'text-purple-400', bg: 'bg-purple-950/60' },
    image: { label: 'Image Generator', icon: ImageIcon, color: 'text-amber-400', bg: 'bg-amber-950/60' },
    'background-removal': { label: 'Background Remover', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-950/60' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-['Outfit']">
              Admin Analytics & System Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 text-xs font-bold">
              Restricted
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Platform-wide usage metrics, registered accounts, and API logs
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Admin Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">
            {stats?.totalUsers ?? users.length}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Platform Generations</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">
            {stats?.totalGenerations ?? 0}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Most Active Tool</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-['Outfit'] uppercase truncate">
            {stats?.mostUsedTool || 'Article'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>System Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-['Outfit']">
            {stats?.systemHealth || 'Optimal'}
          </div>
        </div>
      </div>

      {/* Tool Usage Breakdown Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          Tool Usage Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats?.toolBreakdown || {
            article: 0,
            title: 0,
            image: 0,
            'background-removal': 0,
          }).map(([toolKey, count]) => {
            const info = toolLabels[toolKey] || { label: toolKey, icon: Activity, color: 'text-brand-400', bg: 'bg-slate-900' };
            const Icon = info.icon;
            return (
              <div
                key={toolKey}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${info.bg} ${info.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                      {info.label}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {count}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          Registered Users ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Generations</th>
                <th className="pb-3 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id || u._id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-white">
                    {u.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {u.email}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-semibold">
                    {u.generationsCount ?? 0}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

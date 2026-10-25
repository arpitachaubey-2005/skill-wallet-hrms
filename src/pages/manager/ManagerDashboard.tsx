import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../api/axios.js';
import StatCard from '../../components/common/StatCard.js';
import Button from '../../components/common/Button.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';
import { getStatusBadge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/dashboard/manager');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch manager dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/leaves/${id}/approve`, {
        reviewComment: 'Approved by Team Manager.',
      });
      fetchDashboard();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/api/leaves/${id}/reject`, {
        reviewComment: 'Declined due to team sprint coverage requirements.',
      });
      fetchDashboard();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading manager team workspace..." />
      </div>
    );
  }

  if (!data) return null;

  const { stats, teamMembers, pendingLeaves, trainings, charts } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-purple-100">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Manager Command Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Team Workspace — {user?.name}
          </h2>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Monitor direct reports, review pending leave applications, and cultivate department skills through assigned training modules.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Direct Reports"
          value={stats.totalTeamMembers}
          subtitle={`${stats.teamPresentToday} present today`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />

        <StatCard
          title="Pending Team Leaves"
          value={stats.pendingTeamLeaves}
          subtitle="Awaiting your decision"
          icon={<CalendarCheck className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />

        <StatCard
          title="Team Skill Tracks"
          value={stats.activeTrainings}
          subtitle="Active curriculum programs"
          icon={<GraduationCap className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />

        <StatCard
          title="Skill Completion"
          value={`${stats.trainingCompletionRate}%`}
          subtitle="Overall team completion"
          icon={<UserCheck className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
      </div>

      {/* Team Attendance Chart & Pending Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Attendance Trend */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Team Presence (Past 7 Days)</h3>
              <p className="text-xs text-slate-500">Attendance trend for your direct reports</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="present" name="Present" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Leave Applications */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Pending Reviews</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/manager/leaves')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">
                All team leave applications have been reviewed!
              </p>
            ) : (
              pendingLeaves.map((l: any) => (
                <div
                  key={l._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{l.employeeName}</p>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {l.leaveType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {l.startDate} to {l.endDate} ({l.totalDays} days)
                    </p>
                    <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-2">
                      "{l.reason}"
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(l._id)}
                      icon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(l._id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assigned Team Members</h3>
            <p className="text-xs text-slate-500">Engineers & designers reporting directly to you</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/manager/team')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Manage Team
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teamMembers.map((emp: any) => (
            <div
              key={emp._id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
            >
              <img
                src={emp.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.fullName)}`}
                alt={emp.fullName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{emp.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {emp.skills?.slice(0, 2).map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700"
                    >
                      {s}
                    </span>
                  ))}
                  {emp.skills?.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{emp.skills.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

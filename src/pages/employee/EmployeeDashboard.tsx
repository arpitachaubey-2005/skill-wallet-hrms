import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios.js';
import StatCard from '../../components/common/StatCard.js';
import Button from '../../components/common/Button.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';
import { getStatusBadge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/dashboard/employee');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch employee dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await api.post('/api/attendance/check-in');
      fetchDashboard();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await api.post('/api/attendance/check-out');
      fetchDashboard();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading your Skill Wallet..." />
      </div>
    );
  }

  if (!data) return null;

  const { profile, todayAttendance, stats, trainings, announcements } = data;

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Check In/Out */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Employee Portal & Skill Wallet
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            {profile.designation} • {profile.department} (ID: {profile.employeeId})
          </p>
        </div>

        {/* Live Attendance Action Box */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 shrink-0 text-center">
          <div>
            <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">
              Today's Attendance Status
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-sm font-bold">
                {hasCheckedOut
                  ? 'Checked Out'
                  : hasCheckedIn
                  ? 'Active Shift'
                  : 'Not Checked In'}
              </span>
              {todayAttendance && getStatusBadge(todayAttendance.status)}
            </div>
            {todayAttendance?.checkIn && (
              <p className="text-[11px] text-indigo-200 mt-1">
                In: {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {todayAttendance.checkOut && ` • Out: ${new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!hasCheckedIn ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                isLoading={actionLoading}
                className="bg-white text-indigo-700 hover:bg-slate-100 font-bold"
                icon={<LogIn className="w-4 h-4" />}
              >
                Check In Now
              </Button>
            ) : !hasCheckedOut ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleCheckOut}
                isLoading={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 font-bold"
                icon={<LogOut className="w-4 h-4" />}
              >
                Check Out Shift
              </Button>
            ) : (
              <span className="text-xs bg-emerald-500/20 text-emerald-200 font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                Completed for Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          subtitle="Punctuality & presence"
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />

        <StatCard
          title="Leave Requests"
          value={stats.totalLeaves}
          subtitle={`${stats.pendingLeaves} pending, ${stats.approvedLeaves} approved`}
          icon={<CalendarCheck className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />

        <StatCard
          title="Skill Training"
          value={stats.assignedTrainings}
          subtitle={`${stats.completedTrainings} modules completed`}
          icon={<GraduationCap className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />

        <StatCard
          title="Assigned Manager"
          value={profile.managerName || 'Direct HR'}
          subtitle="Team Supervisor"
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Training Programs & Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Skill Training Programs */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Skill Programs</h3>
                <p className="text-xs text-slate-500">Modules assigned by your manager</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/employee/training')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Modules
              </Button>
            </div>

            <div className="space-y-4">
              {trainings.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No training programs currently assigned.
                </p>
              ) : (
                trainings.slice(0, 3).map((tr: any) => (
                  <div
                    key={tr._id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tr.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tr.duration}</p>
                      </div>
                      {getStatusBadge(tr.myStatus)}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-indigo-600">{tr.myProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${tr.myProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Company Announcements */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Latest Announcements</h3>
              <p className="text-xs text-slate-500">Official company updates and policies</p>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div
                key={ann._id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">{ann.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

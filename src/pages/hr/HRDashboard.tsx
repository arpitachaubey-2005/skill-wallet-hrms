import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  GraduationCap,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../api/axios.js';
import StatCard from '../../components/common/StatCard.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';
import Button from '../../components/common/Button.js';
import { getStatusBadge } from '../../components/common/Badge.js';
import { useNavigate } from 'react-router-dom';

const DEPARTMENT_COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];
const TRAINING_COLORS = ['#10B981', '#4F46E5'];

export const HRDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/dashboard/hr');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.friendlyMessage || 'Failed to load HR dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApproveLeave = async (leaveId: string) => {
    try {
      await api.patch(`/api/leaves/${leaveId}/approve`, {
        reviewComment: 'Approved via HR Quick Action.',
      });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to approve leave');
    }
  };

  const handleQuickRejectLeave = async (leaveId: string) => {
    try {
      await api.patch(`/api/leaves/${leaveId}/reject`, {
        reviewComment: 'Declined via HR Quick Action.',
      });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to reject leave');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Aggregating enterprise HR metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <p className="font-bold">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchDashboardData}>
          Try Again
        </Button>
      </div>
    );
  }

  const { stats, charts, recentActivities } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Enterprise Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, HR Administrator
          </h2>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Here is your daily snapshot of workforce attendance, pending leave approvals, employee headcount, and active skill enhancement programs.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Workforce"
          value={stats.totalEmployees}
          subtitle={`${stats.totalManagers} Department Managers`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />

        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle={`${stats.absentToday} absent or off`}
          icon={<UserCheck className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          trend={{
            value: `${Math.round((stats.presentToday / (stats.totalEmployees || 1)) * 100)}%`,
            isPositive: true,
            label: 'attendance rate',
          }}
        />

        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          subtitle={`${stats.approvedLeaves} approved this cycle`}
          icon={<CalendarCheck className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />

        <StatCard
          title="Active Trainings"
          value={stats.activeTrainings}
          subtitle="Skill enhancement programs"
          icon={<GraduationCap className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Attendance Trend</h3>
              <p className="text-xs text-slate-500">Daily employee presence and check-ins</p>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full">
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
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="present" name="Present" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Department Distribution</h3>
            <p className="text-xs text-slate-500">Staff headcount by department</p>
          </div>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.departmentChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.departmentChart.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leave Breakdown & Training Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Leave Applications by Category</h3>
            <p className="text-xs text-slate-500">Distribution of employee requested leaves</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leaveChart} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Progress Ratio */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Training Completion Status</h3>
            <p className="text-xs text-slate-500">Completed vs In-Progress employee skill tracks</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.trainingParticipation}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {charts.trainingParticipation.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={TRAINING_COLORS[index % TRAINING_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending / Recent Leave Requests */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500">Requires review or latest submissions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/hr/leaves')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.leaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent leave requests.</p>
            ) : (
              recentActivities.leaves.map((leave: any) => (
                <div key={leave._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{leave.employeeName}</p>
                      {getStatusBadge(leave.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {leave.leaveType} • {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">"{leave.reason}"</p>
                  </div>

                  {leave.status === 'Pending' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleQuickApproveLeave(leave._id)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickRejectLeave(leave._id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Added Employees */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recently Onboarded Team</h3>
              <p className="text-xs text-slate-500">New additions to company departments</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/hr/employees')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Directory
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.employees.map((emp: any) => (
              <div key={emp._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.fullName)}`}
                    alt={emp.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{emp.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      {emp.designation} • {emp.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium">Joined {emp.joiningDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

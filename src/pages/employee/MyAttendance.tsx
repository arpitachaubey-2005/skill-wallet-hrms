import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import StatCard from '../../components/common/StatCard.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const MyAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/my');
      if (res.data?.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch my attendance error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    setMessage(null);
    try {
      setActionLoading(true);
      const res = await api.post('/api/attendance/check-in');
      setMessage({ text: res.data?.message || 'Checked in successfully!', type: 'success' });
      fetchAttendance();
    } catch (err: any) {
      setMessage({
        text: err.friendlyMessage || 'Check-in failed',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setMessage(null);
    try {
      setActionLoading(true);
      const res = await api.post('/api/attendance/check-out');
      setMessage({ text: res.data?.message || 'Checked out successfully!', type: 'success' });
      fetchAttendance();
    } catch (err: any) {
      setMessage({
        text: err.friendlyMessage || 'Check-out failed',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const todayRecord = attendanceData?.todayRecord;
  const stats = attendanceData?.stats || {
    totalDays: 0,
    presentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    absentCount: 0,
    attendancePercentage: 100,
  };
  const records = attendanceData?.records || [];

  const hasCheckedIn = Boolean(todayRecord?.checkIn);
  const hasCheckedOut = Boolean(todayRecord?.checkOut);

  const columns: Column<any>[] = [
    {
      header: 'Date',
      render: (r) => (
        <span className="font-semibold text-slate-900 text-xs">{r.attendanceDate}</span>
      ),
    },
    {
      header: 'Check-In Time',
      render: (r) => (
        <span className="font-mono text-xs text-slate-700">
          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Check-Out Time',
      render: (r) => (
        <span className="font-mono text-xs text-slate-700">
          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Logged Hours',
      render: (r) => (
        <span className="font-semibold text-slate-800 text-xs">
          {r.workingHours ? `${r.workingHours} hrs` : '0 hrs'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => getStatusBadge(r.status),
    },
    {
      header: 'Shift Note',
      render: (r) => (
        <span className="text-xs text-slate-400 italic">
          {r.notes || 'Normal work shift'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Daily Attendance & Time Card
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Mark your shift arrival, log end of workday, and review historical attendance records.
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Punch Card Widget */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Real-Time Attendance Clock
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Standard office check-in deadline is 09:30 AM local time. Check-ins after 09:30 AM are flagged as Late.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>
                Check-in:{' '}
                <strong>
                  {todayRecord?.checkIn
                    ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pending'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>
                Check-out:{' '}
                <strong>
                  {todayRecord?.checkOut
                    ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pending'}
                </strong>
              </span>
            </div>
            {todayRecord?.status && (
              <div className="flex items-center gap-1.5">
                <span>Status:</span>
                {getStatusBadge(todayRecord.status)}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {!hasCheckedIn ? (
            <Button
              variant="primary"
              size="lg"
              isLoading={actionLoading}
              onClick={handleCheckIn}
              icon={<LogIn className="w-5 h-5" />}
              className="px-6 py-3.5 shadow-md shadow-indigo-200"
            >
              Punch In (Check In)
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              variant="danger"
              size="lg"
              isLoading={actionLoading}
              onClick={handleCheckOut}
              icon={<LogOut className="w-5 h-5" />}
              className="px-6 py-3.5 shadow-md shadow-rose-200"
            >
              Punch Out (Check Out)
            </Button>
          ) : (
            <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Shift Completed ({todayRecord.workingHours} hrs)</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          subtitle="Punctuality score"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Present Days"
          value={stats.presentCount}
          subtitle="Full work shifts"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
        <StatCard
          title="Late Arrivals"
          value={stats.lateCount}
          subtitle="Recorded past 9:30 AM"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Absences / Off"
          value={stats.absentCount}
          subtitle="Total recorded off days"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Historical Attendance Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No past attendance records found."
      />
    </div>
  );
};

export default MyAttendance;

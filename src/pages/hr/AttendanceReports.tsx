import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import StatCard from '../../components/common/StatCard.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const AttendanceReports: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (deptFilter !== 'All') params.append('department', deptFilter);

      const [recordsRes, reportsRes] = await Promise.all([
        api.get(`/api/attendance?${params.toString()}`),
        api.get('/api/attendance/reports'),
      ]);

      if (recordsRes.data?.success) setRecords(recordsRes.data.data);
      if (reportsRes.data?.success) setReportStats(reportsRes.data.data);
    } catch (err: any) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, deptFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Date',
      'Check In',
      'Check Out',
      'Working Hours',
      'Status',
      'Notes',
    ];

    const rows = records.map((r) => [
      `"${r.employeeCode || ''}"`,
      `"${r.employeeName || ''}"`,
      `"${r.department || ''}"`,
      `"${r.attendanceDate}"`,
      `"${r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}"`,
      `"${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}"`,
      `"${r.workingHours || 0}"`,
      `"${r.status}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.employeeName?.toLowerCase().includes(q) ||
      r.employeeCode?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q)
    );
  });

  const columns: Column<any>[] = [
    {
      header: 'Employee',
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 leading-tight">{r.employeeName}</p>
          <span className="text-[11px] font-mono text-slate-400">{r.employeeCode}</span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Check-In',
      render: (r) => (
        <span className="text-xs font-mono font-medium text-slate-800">
          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Check-Out',
      render: (r) => (
        <span className="text-xs font-mono font-medium text-slate-800">
          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Hours',
      render: (r) => (
        <span className="text-xs font-semibold text-slate-900">
          {r.workingHours ? `${r.workingHours} hrs` : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => getStatusBadge(r.status),
    },
    {
      header: 'Audit Note',
      render: (r) => (
        <span className="text-xs text-slate-400 italic">
          {r.notes || 'Normal workday'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Logs & Audit Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor daily employee check-ins, punctuality records, and export CSV attendance sheets.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          icon={<Download className="w-4 h-4 text-indigo-600" />}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Report Summary Cards */}
      {reportStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered"
            value={reportStats.totalEmployees}
            subtitle="Current headcount"
            icon={<UserCheck className="w-5 h-5" />}
          />
          <StatCard
            title="Present Today"
            value={reportStats.presentToday}
            subtitle="Verified at workstation"
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-emerald-50"
            iconTextColor="text-emerald-600"
          />
          <StatCard
            title="Late Arrivals"
            value={reportStats.lateToday}
            subtitle="Checked in past 9:30 AM"
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-amber-50"
            iconTextColor="text-amber-600"
          />
          <StatCard
            title="Absent / On Leave"
            value={reportStats.absentToday}
            subtitle="Unscheduled or on leave"
            icon={<UserX className="w-5 h-5" />}
            iconBgColor="bg-rose-50"
            iconTextColor="text-rose-600"
          />
        </div>
      )}

      {/* Date & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Attendance Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search employee name or ID..."
        searchTerm={search}
        onSearchChange={setSearch}
        emptyMessage={`No attendance records found for ${selectedDate}.`}
      />
    </div>
  );
};

export default AttendanceReports;

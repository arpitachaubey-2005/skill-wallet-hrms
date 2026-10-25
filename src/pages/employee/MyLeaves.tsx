import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import StatCard from '../../components/common/StatCard.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const MyLeaves: React.FC = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leaves/my');
      if (res.data?.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch my leaves error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleCancelLeave = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      setCancellingId(id);
      await api.patch(`/api/leaves/${id}/cancel`);
      fetchMyLeaves();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to cancel leave request.');
    } finally {
      setCancellingId(null);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const columns: Column<any>[] = [
    {
      header: 'Leave Type',
      render: (l) => (
        <span className="font-bold text-slate-900 text-xs">{l.leaveType}</span>
      ),
    },
    {
      header: 'Schedule',
      render: (l) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">
            {l.startDate} to {l.endDate}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {l.totalDays} day{l.totalDays > 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      render: (l) => (
        <p className="text-xs text-slate-600 max-w-xs line-clamp-2" title={l.reason}>
          {l.reason}
        </p>
      ),
    },
    {
      header: 'Status & Reviewer',
      render: (l) => (
        <div>
          {getStatusBadge(l.status)}
          {l.reviewerName && (
            <p className="text-[10px] text-slate-400 mt-1">
              Reviewed by {l.reviewerName}
            </p>
          )}
          {l.reviewComment && (
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              "{l.reviewComment}"
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (l) => {
        if (l.status === 'Pending') {
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                isLoading={cancellingId === l._id}
                onClick={() => handleCancelLeave(l._id)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Withdraw Request
              </Button>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">
            Completed
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Leave Applications & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track status of submitted leave requests and withdraw pending applications.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/employee/apply-leave')}
          icon={<Plus className="w-4 h-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting manager approval"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Approved Days"
          value={approvedCount}
          subtitle="Confirmed leaves"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Rejected / Withdrawn"
          value={rejectedCount}
          subtitle="Non-active requests"
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        emptyMessage="You have not submitted any leave applications yet."
      />
    </div>
  );
};

export default MyLeaves;

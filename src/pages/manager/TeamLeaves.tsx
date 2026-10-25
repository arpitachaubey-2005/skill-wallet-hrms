import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import StatCard from '../../components/common/StatCard.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const TeamLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal Review State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leaves');
      if (res.data?.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch team leaves error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleOpenReview = (leave: any, reviewAction: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setAction(reviewAction);
    setComment(
      reviewAction === 'approve'
        ? 'Approved by Team Manager.'
        : 'Team staffing schedule conflict.'
    );
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/leaves/${selectedLeave._id}/${action}`, {
        reviewComment: comment,
      });
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      alert(err.friendlyMessage || `Failed to ${action} leave`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = leaves.filter((l) => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.employeeName?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q) ||
        l.leaveType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;

  const columns: Column<any>[] = [
    {
      header: 'Team Member',
      render: (l) => (
        <div>
          <p className="font-bold text-slate-900 leading-tight">{l.employeeName}</p>
          <span className="text-[11px] font-mono text-slate-400">{l.employeeCode}</span>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
    },
    {
      header: 'Duration',
      render: (l) => (
        <div>
          <p className="text-xs font-semibold text-slate-900">
            {l.startDate} to {l.endDate}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{l.totalDays} days</p>
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
      header: 'Status',
      render: (l) => (
        <div>
          {getStatusBadge(l.status)}
          {l.reviewerName && (
            <p className="text-[10px] text-slate-400 mt-1">By {l.reviewerName}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (l) => {
        if (l.status !== 'Pending') {
          return (
            <span className="text-xs text-slate-400 italic">
              {l.reviewComment ? `"${l.reviewComment}"` : 'Decided'}
            </span>
          );
        }
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleOpenReview(l, 'approve')}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleOpenReview(l, 'reject')}
              icon={<X className="w-3.5 h-3.5" />}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Team Leave Approvals
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Approve or decline leave applications submitted exclusively by your direct reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting your manager decision"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Approved This Quarter"
          value={approvedCount}
          subtitle="Team planned time off"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search applicant, reason..."
        searchTerm={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Pending Only', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
            ],
          },
        ]}
        emptyMessage="No leave requests from your team."
      />

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={action === 'approve' ? 'Approve Team Leave' : 'Reject Team Leave'}
        description={`Confirm decision for ${selectedLeave?.employeeName}.`}
        maxWidth="md"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p>
                <strong className="text-slate-800">Leave Type:</strong> {selectedLeave.leaveType}
              </p>
              <p>
                <strong className="text-slate-800">Duration:</strong> {selectedLeave.startDate} to{' '}
                {selectedLeave.endDate} ({selectedLeave.totalDays} Days)
              </p>
              <p>
                <strong className="text-slate-800">Employee Note:</strong> "{selectedLeave.reason}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Manager Review Note
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={action === 'approve' ? 'success' : 'danger'}
                isLoading={submitting}
                onClick={handleConfirm}
              >
                Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamLeaves;

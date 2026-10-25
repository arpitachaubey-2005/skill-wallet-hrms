import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import StatCard from '../../components/common/StatCard.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (deptFilter !== 'All') params.append('department', deptFilter);
      const res = await api.get(`/api/leaves?${params.toString()}`);
      if (res.data?.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch leaves error:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, deptFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleOpenReview = (leave: any, action: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment(
      action === 'approve'
        ? 'Approved as requested.'
        : 'Unable to approve due to team staffing constraints.'
    );
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/leaves/${selectedLeave._id}/${reviewAction}`, {
        reviewComment,
      });
      setIsReviewModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      alert(err.friendlyMessage || `Failed to ${reviewAction} leave`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered by search in memory
  const filteredLeaves = leaves.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.employeeName?.toLowerCase().includes(q) ||
      l.employeeCode?.toLowerCase().includes(q) ||
      l.leaveType?.toLowerCase().includes(q) ||
      l.reason?.toLowerCase().includes(q)
    );
  });

  // Calculate metrics
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const columns: Column<any>[] = [
    {
      header: 'Applicant',
      render: (l) => (
        <div>
          <p className="font-bold text-slate-900 leading-tight">{l.employeeName}</p>
          <span className="text-[11px] font-mono text-slate-400">{l.employeeCode} • {l.department}</span>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (l) => (
        <span className="font-semibold text-slate-800 text-xs">{l.leaveType}</span>
      ),
    },
    {
      header: 'Dates & Duration',
      render: (l) => (
        <div>
          <p className="text-xs font-semibold text-slate-900">
            {l.startDate} to {l.endDate}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{l.totalDays} day{l.totalDays > 1 ? 's' : ''}</p>
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
          {l.reviewedBy && (
            <p className="text-[10px] text-slate-400 mt-1">
              By {l.reviewerName || 'Reviewer'}
            </p>
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
              {l.reviewComment ? `"${l.reviewComment}"` : 'Reviewed'}
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
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Leave Management & Approvals
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review employee time-off requests, manage vacation cycles, and audit leave records.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          subtitle="Awaiting management action"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Approved Leaves"
          value={approvedCount}
          subtitle="Scheduled time off"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Rejected / Cancelled"
          value={rejectedCount}
          subtitle="Declined applications"
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Leave Requests Table */}
      <DataTable
        columns={columns}
        data={filteredLeaves}
        loading={loading}
        searchPlaceholder="Search applicant, reason, leave type..."
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
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
          {
            key: 'department',
            label: 'Department',
            value: deptFilter,
            onChange: setDeptFilter,
            options: [
              { label: 'All Departments', value: 'All' },
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Design', value: 'Design' },
              { label: 'Marketing', value: 'Marketing' },
              { label: 'Operations', value: 'Operations' },
            ],
          },
        ]}
        emptyMessage="No leave applications match the selected criteria."
      />

      {/* Confirmation & Review Comment Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={reviewAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        description={`Confirm your decision for ${selectedLeave?.employeeName}'s application.`}
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
                <strong className="text-slate-800">Reason:</strong> "{selectedLeave.reason}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reviewer Note / Comments
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Optional feedback or rationale for approval/rejection..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'approve' ? 'success' : 'danger'}
                isLoading={submitting}
                onClick={handleConfirmReview}
              >
                Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagement;

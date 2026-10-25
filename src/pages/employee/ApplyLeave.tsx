import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Info,
} from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/common/Button.js';
import Input from '../../components/common/Input.js';

export const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for your leave application.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/leaves', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      if (res.data?.success) {
        setSuccess('Leave application submitted successfully! Redirecting...');
        setTimeout(() => {
          navigate('/employee/leaves');
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.friendlyMessage || err.message || 'Failed to submit leave application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Submit Leave Application
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Request planned time off or report unforeseen medical absences for manager approval.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Leave Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'Casual Leave', desc: 'Short personal off' },
                { type: 'Sick Leave', desc: 'Medical recovery' },
                { type: 'Earned Leave', desc: 'Annual vacation' },
                { type: 'Unpaid Leave', desc: 'Extended absence' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setLeaveType(item.type)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    leaveType === item.type
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{item.type}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Duration Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Calculated Leave Duration:</span>
            </div>
            <span className="font-extrabold text-indigo-700 text-sm">
              {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Justification *
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the purpose of your leave request for your manager's review..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employee/leaves')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              icon={<Send className="w-4 h-4" />}
            >
              Submit Leave Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;

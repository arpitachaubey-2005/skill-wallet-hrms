import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Sliders,
  Award,
} from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import { getStatusBadge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const MyTraining: React.FC = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for updating progress
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/training');
      if (res.data?.success) {
        // Map user's assignment
        const mapped = res.data.data.map((tr: any) => {
          const myAssignment = tr.assignedEmployees.find(
            (ae: any) => ae.employeeId === user?.employeeId
          );
          return {
            ...tr,
            myProgress: myAssignment?.progress || 0,
            myStatus: myAssignment?.status || 'Not Started',
          };
        });
        setTrainings(mapped);
      }
    } catch (err: any) {
      console.error('Fetch my training error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleOpenUpdate = (tr: any) => {
    setSelectedTraining(tr);
    setProgressVal(tr.myProgress || 0);
    setIsModalOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedTraining) return;
    setSubmitting(true);
    try {
      const status = progressVal === 100 ? 'Completed' : progressVal > 0 ? 'In Progress' : 'Not Started';
      await api.patch(`/api/training/${selectedTraining._id}/progress`, {
        progress: progressVal,
        status,
      });
      setIsModalOpen(false);
      fetchTrainings();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to update progress');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          My Skill Wallet & Training Modules
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Curated professional development programs assigned by engineering and management leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainings.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Assigned Training Tracks</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your manager hasn't assigned you to any active programs yet.
            </p>
          </div>
        ) : (
          trainings.map((tr) => (
            <div
              key={tr._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    {tr.category}
                  </span>
                  {getStatusBadge(tr.myStatus)}
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {tr.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {tr.description}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tr.skillsCovered?.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Progress Bar & Slider Action */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-700">My Progress</span>
                    <span className="text-indigo-600">{tr.myProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${tr.myProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{tr.duration}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenUpdate(tr)}
                  icon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Update Progress
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Learning Progress"
        description={`Record your coursework and labs for ${selectedTraining?.title}.`}
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-3xl font-extrabold text-indigo-600">{progressVal}%</span>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {progressVal === 100
                ? 'Course Completed!'
                : progressVal > 0
                ? 'In Active Progress'
                : 'Not Started Yet'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Progress Percentage
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Started)</span>
              <span>50% (Halfway)</span>
              <span>100% (Completed)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={submitting}
              onClick={handleSaveProgress}
            >
              Save Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyTraining;

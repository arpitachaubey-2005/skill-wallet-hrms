import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import Input from '../../components/common/Input.js';
import { getStatusBadge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const TrainingManagement: React.FC = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    category: 'Engineering & DevOps',
    duration: '3 Weeks (15 Hours)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
    skillsCovered: 'Kubernetes, Docker, Helm',
    assignedEmployeeIds: [] as string[],
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trainingsRes, teamRes] = await Promise.all([
        api.get('/api/training'),
        api.get('/api/employees?teamOnly=true'),
      ]);
      if (trainingsRes.data?.success) setTrainings(trainingsRes.data.data);
      if (teamRes.data?.success) setTeamMembers(teamRes.data.data);
    } catch (err: any) {
      console.error('Fetch training data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedProgram(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (program: any) => {
    setIsEditMode(true);
    setSelectedProgram(program);
    setForm({
      title: program.title,
      description: program.description,
      category: program.category,
      duration: program.duration,
      startDate: program.startDate,
      endDate: program.endDate,
      skillsCovered: Array.isArray(program.skillsCovered)
        ? program.skillsCovered.join(', ')
        : '',
      assignedEmployeeIds: program.assignedEmployees.map((ae: any) => ae.employeeId),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skillsArray = form.skillsCovered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        duration: form.duration,
        startDate: form.startDate,
        endDate: form.endDate,
        skillsCovered: skillsArray,
        assignedEmployeeIds: form.assignedEmployeeIds,
      };

      if (isEditMode && selectedProgram) {
        await api.put(`/api/training/${selectedProgram._id}`, payload);
      } else {
        await api.post('/api/training', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to save training program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training program?')) return;
    try {
      await api.delete(`/api/training/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to delete');
    }
  };

  const toggleEmployeeAssignment = (empId: string) => {
    setForm((prev) => {
      const exists = prev.assignedEmployeeIds.includes(empId);
      return {
        ...prev,
        assignedEmployeeIds: exists
          ? prev.assignedEmployeeIds.filter((id) => id !== empId)
          : [...prev.assignedEmployeeIds, empId],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill Wallet & Training Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Design technical learning paths, assign direct reports, and monitor progress.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Create New Program
        </Button>
      </div>

      {/* Training Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainings.map((program) => {
          const totalAssigned = program.assignedEmployees.length;
          const completedCount = program.assignedEmployees.filter(
            (a: any) => a.status === 'Completed'
          ).length;
          const avgProgress = totalAssigned > 0
            ? Math.round(
                program.assignedEmployees.reduce(
                  (acc: number, curr: any) => acc + (curr.progress || 0),
                  0
                ) / totalAssigned
              )
            : 0;

          return (
            <div
              key={program._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold">
                    {program.category}
                  </span>

                  {(user?.role === 'hr' || program.createdBy === user?.id) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(program)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(program._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {program.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {program.description}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {program.skillsCovered?.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Team Completion</span>
                    <span className="font-bold text-indigo-600">{avgProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Team Members list */}
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Enrolled ({totalAssigned} Members)
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {program.assignedEmployees.map((ae: any) => (
                      <div
                        key={ae.employeeId}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{ae.employeeName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-500 text-[11px]">
                            {ae.progress}%
                          </span>
                          {getStatusBadge(ae.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {program.duration}
                </span>
                <span>
                  {program.startDate} to {program.endDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Training Program' : 'Create Training Program'}
        description="Design skills roadmap and assign eligible direct reports."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Program Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Advanced TypeScript & Clean Architecture"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Engineering & Architecture"
            />
            <Input
              label="Estimated Duration"
              required
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 4 Weeks (20 Hours)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Objectives *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline what participants will learn and milestone deliverables..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Input
            label="Skills Covered (Comma-separated)"
            value={form.skillsCovered}
            onChange={(e) => setForm({ ...form, skillsCovered: e.target.value })}
            placeholder="React, Microfrontends, Jest, TDD"
          />

          {/* Direct Team Members Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Assign Eligible Direct Reports
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {teamMembers.map((emp) => {
                const isSelected = form.assignedEmployeeIds.includes(emp._id);
                return (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => toggleEmployeeAssignment(emp._id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? 'border-white bg-indigo-700'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="truncate">{emp.fullName}</span>
                  </button>
                );
              })}
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
            <Button type="submit" variant="primary" isLoading={submitting}>
              {isEditMode ? 'Update Program' : 'Create & Assign Program'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingManagement;

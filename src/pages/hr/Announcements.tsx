import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Clock,
  AlertTriangle,
  User,
} from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import Input from '../../components/common/Input.js';
import { getStatusBadge, Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    visibility: 'all',
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      if (res.data?.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch announcements error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedAnn(null);
    setForm({
      title: '',
      description: '',
      category: 'General',
      priority: 'Medium',
      visibility: 'all',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: any) => {
    setIsEditMode(true);
    setSelectedAnn(ann);
    setForm({
      title: ann.title,
      description: ann.description,
      category: ann.category,
      priority: ann.priority,
      visibility: ann.visibility || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode && selectedAnn) {
        await api.put(`/api/announcements/${selectedAnn._id}`, form);
      } else {
        await api.post('/api/announcements', form);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company announcement?')) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to delete announcement');
    }
  };

  const filtered = announcements.filter((a) =>
    categoryFilter === 'All' ? true : a.category === categoryFilter
  );

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') return <Badge variant="danger" dot>High Priority</Badge>;
    if (priority === 'Medium') return <Badge variant="warning" dot>Medium</Badge>;
    return <Badge variant="neutral">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Bulletins & Announcements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Broadcast official company policies, holiday notices, and milestone announcements.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Publish Announcement
        </Button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'General', 'Important', 'Policy', 'Event', 'Holiday'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((ann) => (
          <div
            key={ann._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    {ann.category}
                  </span>
                  {getPriorityBadge(ann.priority)}
                </div>

                {(user?.role === 'hr' || (user?.role === 'manager' && ann.publishedBy === user.id)) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                {ann.title}
              </h3>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <User className="w-3 h-3 text-slate-400" />
                By {ann.authorName} ({ann.authorRole.toUpperCase()})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(ann.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Announcement' : 'Publish New Announcement'}
        description="Share official notices across the workforce portal."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. End of Year Holiday Closure Schedule"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="General">General</option>
                <option value="Important">Important</option>
                <option value="Policy">Policy</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Body Content *
            </label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide complete details, dates, and instructions for team members..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {isEditMode ? 'Update Announcement' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;

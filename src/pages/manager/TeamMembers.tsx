import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  CheckCircle,
  Eye,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Modal from '../../components/common/Modal.js';
import Button from '../../components/common/Button.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const TeamMembers: React.FC = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/employees?teamOnly=true');
      if (res.data?.success) {
        setTeam(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch team error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenDetails = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const filtered = team.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.employeeId?.toLowerCase().includes(q) ||
      m.designation?.toLowerCase().includes(q)
    );
  });

  const columns: Column<any>[] = [
    {
      header: 'Team Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <img
            src={
              m.profileImage ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.fullName)}`
            }
            alt={m.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900 leading-tight">{m.fullName}</p>
            <p className="text-xs text-slate-400">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (m) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {m.employeeId}
        </span>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
    },
    {
      header: 'Status',
      render: (m) => getStatusBadge(m.employmentStatus),
    },
    {
      header: 'Skill Wallet Tags',
      render: (m) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {m.skills?.slice(0, 3).map((s: string, idx: number) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
            >
              {s}
            </span>
          ))}
          {m.skills?.length > 3 && (
            <span className="text-[10px] text-slate-400">+{m.skills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDetails(m)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Profile
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          My Direct Reports & Team Members
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review credentials, contact information, and skill sets for members assigned to your team.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search team member..."
        searchTerm={search}
        onSearchChange={setSearch}
        emptyMessage="No direct reports currently assigned to you."
      />

      {/* Member Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Team Member Profile"
        maxWidth="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={
                  selectedMember.profileImage ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    selectedMember.fullName
                  )}`
                }
                alt={selectedMember.fullName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedMember.fullName}
                </h4>
                <p className="text-xs text-slate-500">{selectedMember.designation}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                    {selectedMember.employeeId}
                  </span>
                  {getStatusBadge(selectedMember.employmentStatus)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email
                </span>
                <span className="font-semibold text-slate-900">{selectedMember.email}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Phone
                </span>
                <span className="font-semibold text-slate-900">{selectedMember.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joining Date
                </span>
                <span className="font-semibold text-slate-900">{selectedMember.joiningDate}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Core Skill Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamMembers;

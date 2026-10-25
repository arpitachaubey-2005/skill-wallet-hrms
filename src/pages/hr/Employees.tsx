import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  UserX,
  Eye,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/axios.js';
import DataTable, { Column } from '../../components/common/DataTable.js';
import Button from '../../components/common/Button.js';
import Modal from '../../components/common/Modal.js';
import Input from '../../components/common/Input.js';
import { getStatusBadge } from '../../components/common/Badge.js';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Design',
  'Marketing',
  'Operations',
  'Human Resources',
];

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    role: 'employee',
    managerId: '',
    salary: 85000,
    skills: 'React, TypeScript, Node.js',
    street: '',
    city: 'San Francisco',
    state: 'CA',
    emergencyName: '',
    emergencyRelationship: 'Family',
    emergencyPhone: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (roleFilter !== 'All') params.append('role', roleFilter);
      params.append('page', String(page));
      params.append('limit', '8');

      const res = await api.get(`/api/employees?${params.toString()}`);
      if (res.data?.success) {
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error('Fetch employees error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, department, roleFilter, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      joiningDate: emp.joiningDate || '',
      role: emp.role || 'employee',
      managerId: emp.managerId || '',
      salary: emp.salary || 0,
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : '',
      street: emp.address?.street || '',
      city: emp.address?.city || '',
      state: emp.address?.state || '',
      emergencyName: emp.emergencyContact?.name || '',
      emergencyRelationship: emp.emergencyContact?.relationship || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp: any) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleOpenDeactivate = (emp: any) => {
    setSelectedEmployee(emp);
    setIsDeactivateModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/api/employees', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        role: formData.role,
        managerId: formData.managerId || undefined,
        salary: Number(formData.salary),
        skills: skillsArray,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        },
        temporaryPassword: 'Password123!',
      });

      setIsAddModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.friendlyMessage || err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.put(`/api/employees/${selectedEmployee._id}`, {
        fullName: formData.fullName,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        role: formData.role,
        managerId: formData.managerId || undefined,
        salary: Number(formData.salary),
        skills: skillsArray,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        },
      });

      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.friendlyMessage || err.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedEmployee) return;
    setSubmitting(true);
    try {
      await api.delete(`/api/employees/${selectedEmployee._id}`);
      setIsDeactivateModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.friendlyMessage || 'Failed to deactivate employee');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Employee',
      render: (emp) => (
        <div className="flex items-center gap-3">
          <img
            src={emp.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.fullName)}`}
            alt={emp.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900 leading-tight">{emp.fullName}</p>
            <p className="text-xs text-slate-400">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (emp) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {emp.employeeId}
        </span>
      ),
    },
    {
      header: 'Department & Role',
      render: (emp) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{emp.department}</p>
          <p className="text-[11px] text-slate-500">{emp.designation}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (emp) => getStatusBadge(emp.employmentStatus),
    },
    {
      header: 'Compensation',
      render: (emp) => (
        <span className="font-semibold text-slate-900 text-xs">
          {emp.salary ? `$${emp.salary.toLocaleString()}/yr` : 'Confidential'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (emp) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenView(emp)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(emp)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Edit Employee"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {emp.employmentStatus !== 'Inactive' && (
            <button
              onClick={() => handleOpenDeactivate(emp)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Deactivate Account"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory & Accounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage company personnel, assign departments, roles, and configure compensation.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Employee
        </Button>
      </div>

      {/* Employees DataTable */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchPlaceholder="Search by name, email, ID, department..."
        searchTerm={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={[
          {
            key: 'department',
            label: 'Department',
            value: department,
            onChange: (val) => {
              setDepartment(val);
              setPage(1);
            },
            options: DEPARTMENTS.map((d) => ({ label: d === 'All' ? 'All Departments' : d, value: d })),
          },
          {
            key: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: (val) => {
              setRoleFilter(val);
              setPage(1);
            },
            options: [
              { label: 'All Roles', value: 'All' },
              { label: 'Employees', value: 'employee' },
              { label: 'Managers', value: 'manager' },
              { label: 'HR Admin', value: 'hr' },
            ],
          },
        ]}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          pageSize: pagination.limit,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyMessage="No employees found matching the filters."
      />

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        description="Creates an employee profile and generates their system user account."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rachel Adams"
            />
            <Input
              label="Work Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rachel@skillwallet.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Designation"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Software Engineer"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role & Access *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <Input
              label="Annual Salary ($)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              placeholder="85000"
            />

            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
          </div>

          <Input
            label="Technical & Core Skills (Comma-separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="React, TypeScript, GraphQL, AWS"
            helperText="Populates the employee's Skill Wallet profile."
          />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create Employee Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee Information"
        description="Update role, department, compensation, or contact information."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Work Email"
              disabled
              value={formData.email}
              helperText="Email cannot be changed directly."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Designation"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Annual Salary ($ - HR Confidential)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Skills (Comma-separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Profile Dossier"
        maxWidth="lg"
      >
        {selectedEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={
                  selectedEmployee.profileImage ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    selectedEmployee.fullName
                  )}`
                }
                alt={selectedEmployee.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedEmployee.fullName}
                </h4>
                <p className="text-xs text-slate-500">{selectedEmployee.designation}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                    {selectedEmployee.employeeId}
                  </span>
                  {getStatusBadge(selectedEmployee.employmentStatus)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800">{selectedEmployee.department}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Reporting Manager</span>
                <span className="font-bold text-slate-800">
                  {selectedEmployee.managerName || 'Direct to HR'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Work Email</span>
                <span className="font-bold text-slate-800 truncate block">
                  {selectedEmployee.email}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Phone</span>
                <span className="font-bold text-slate-800">
                  {selectedEmployee.phone || '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Joining Date</span>
                <span className="font-bold text-slate-800">{selectedEmployee.joiningDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">Annual Compensation</span>
                <span className="font-bold text-emerald-700">
                  {selectedEmployee.salary
                    ? `$${selectedEmployee.salary.toLocaleString()}/yr`
                    : 'Confidential'}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Skill Wallet Credentials
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployee.skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Confirm Employee Deactivation"
        description="This will disable system login and change employee status to Inactive."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to deactivate{' '}
            <strong className="text-slate-900">{selectedEmployee?.fullName}</strong> (
            {selectedEmployee?.employeeId})? They will immediately lose access to the portal.
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={submitting}
              onClick={handleConfirmDeactivate}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;

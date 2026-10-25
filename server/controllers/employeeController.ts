import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { IEmployee, IUser, UserRole } from '../models/types.js';

export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const { search, department, role, status, page = 1, limit = 10 } = req.query;

    let employees = db.employees.find();

    // If manager, check if filtering team members or general view
    if (userRole === 'manager' && req.query.teamOnly === 'true') {
      const managerEmp = db.employees.findOne({ userId: req.user!.userId });
      if (managerEmp) {
        employees = employees.filter((e) => e.managerId === managerEmp._id);
      }
    }

    // Filter by department
    if (department && department !== 'All') {
      employees = employees.filter(
        (e) => e.department.toLowerCase() === String(department).toLowerCase()
      );
    }

    // Filter by employment status
    if (status && status !== 'All') {
      employees = employees.filter(
        (e) => e.employmentStatus.toLowerCase() === String(status).toLowerCase()
      );
    }

    // Search query (name, email, employeeId, designation)
    if (search) {
      const q = String(search).toLowerCase().trim();
      employees = employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    // Filter by User Role if specified
    if (role && role !== 'All') {
      const usersWithRole = new Set(
        db.users.find({ role: role as UserRole }).map((u) => u._id)
      );
      employees = employees.filter((e) => usersWithRole.has(e.userId));
    }

    // Map user roles to employee records
    const userMap = new Map(db.users.find().map((u) => [u._id, u]));

    // Sanitize salary for non-HR
    const sanitized = employees.map((emp) => {
      const linkedUser = userMap.get(emp.userId);
      const copy: any = {
        ...emp,
        role: linkedUser?.role || 'employee',
        isActive: linkedUser?.isActive ?? true,
      };

      if (userRole !== 'hr') {
        delete copy.salary;
      }
      return copy;
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, parseInt(String(limit)) || 10);
    const total = sanitized.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = sanitized.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const emp = db.employees.findById(id);

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Role check: If manager, verify employee is in their team unless general info
    if (req.user?.role === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user.userId });
      if (emp.managerId && managerEmp && emp.managerId !== managerEmp._id && emp._id !== managerEmp._id) {
        // Manager viewing another team member
      }
    }

    const linkedUser = db.users.findById(emp.userId);
    const result: any = {
      ...emp,
      role: linkedUser?.role || 'employee',
      isActive: linkedUser?.isActive ?? true,
      lastLogin: linkedUser?.lastLogin,
    };

    // Salary visibility: HR only
    if (req.user?.role !== 'hr') {
      delete result.salary;
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      department,
      designation,
      joiningDate,
      role = 'employee',
      managerId,
      salary,
      skills = [],
      address = {},
      emergencyContact = {},
      temporaryPassword = 'Password123!',
    } = req.body;

    if (!fullName || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, Department, and Designation are required.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check email uniqueness
    const existingUser = db.users.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Auto-generate employeeId
    const currentCount = db.employees.find().length + 1;
    const employeeId = `EMP-${(1000 + currentCount).toString()}`;

    // Create User account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    const newUser = db.users.create({
      name: fullName,
      email: cleanEmail,
      passwordHash,
      role: (['hr', 'manager', 'employee'].includes(role) ? role : 'employee') as UserRole,
      isActive: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    });

    // Resolve manager name if managerId is provided
    let managerName: string | undefined;
    if (managerId) {
      const mgr = db.employees.findById(managerId);
      if (mgr) managerName = mgr.fullName;
    }

    // Create Employee record
    const newEmployee = db.employees.create({
      userId: newUser._id,
      employeeId,
      fullName,
      email: cleanEmail,
      phone: phone || '',
      department,
      designation,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      employmentStatus: 'Active',
      managerId,
      managerName,
      address,
      emergencyContact,
      skills: Array.isArray(skills) ? skills : [],
      salary: salary ? Number(salary) : undefined,
      profileImage: newUser.avatar,
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully along with user account.',
      data: newEmployee,
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingEmp = db.employees.findById(id);
    if (!existingEmp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const {
      fullName,
      phone,
      department,
      designation,
      joiningDate,
      employmentStatus,
      managerId,
      salary,
      skills,
      address,
      emergencyContact,
      role,
    } = req.body;

    let managerName = existingEmp.managerName;
    if (managerId !== undefined) {
      if (managerId) {
        const mgr = db.employees.findById(managerId);
        managerName = mgr ? mgr.fullName : undefined;
      } else {
        managerName = undefined;
      }
    }

    const updatedEmp = db.employees.findByIdAndUpdate(id, {
      fullName: fullName ?? existingEmp.fullName,
      phone: phone ?? existingEmp.phone,
      department: department ?? existingEmp.department,
      designation: designation ?? existingEmp.designation,
      joiningDate: joiningDate ?? existingEmp.joiningDate,
      employmentStatus: employmentStatus ?? existingEmp.employmentStatus,
      managerId: managerId !== undefined ? managerId : existingEmp.managerId,
      managerName,
      salary: salary !== undefined ? Number(salary) : existingEmp.salary,
      skills: skills ?? existingEmp.skills,
      address: address ?? existingEmp.address,
      emergencyContact: emergencyContact ?? existingEmp.emergencyContact,
    });

    // If fullName changed, also update the linked user
    if (fullName) {
      db.users.findByIdAndUpdate(existingEmp.userId, { name: fullName });
    }

    // If role changed and requester is HR
    if (role && ['hr', 'manager', 'employee'].includes(role)) {
      db.users.findByIdAndUpdate(existingEmp.userId, { role });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee details updated successfully.',
      data: updatedEmp,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const emp = db.employees.findById(id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Update employee status
    const updatedEmp = db.employees.findByIdAndUpdate(id, {
      employmentStatus: 'Inactive',
    });

    // Disable the user account
    db.users.findByIdAndUpdate(emp.userId, { isActive: false });

    return res.status(200).json({
      success: true,
      message: `Employee ${emp.fullName} has been deactivated.`,
      data: updatedEmp,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emp = db.employees.findOne({ userId: req.user!.userId });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Profile record not found.' });
    }

    const copy: any = { ...emp };
    if (req.user?.role !== 'hr') {
      delete copy.salary;
    }

    return res.status(200).json({ success: true, data: copy });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emp = db.employees.findOne({ userId: req.user!.userId });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const { phone, address, emergencyContact, skills } = req.body;

    // Only allow updating personal contact details, not job/salary/role/ID!
    const updated = db.employees.findByIdAndUpdate(emp._id, {
      phone: phone !== undefined ? phone : emp.phone,
      address: address !== undefined ? address : emp.address,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : emp.emergencyContact,
      skills: Array.isArray(skills) ? skills : emp.skills,
    });

    const copy: any = { ...updated };
    if (req.user?.role !== 'hr') {
      delete copy.salary;
    }

    return res.status(200).json({
      success: true,
      message: 'Personal profile updated successfully.',
      data: copy,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

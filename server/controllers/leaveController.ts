import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ILeaveRequest, LeaveType, LeaveStatus } from '../models/types.js';

export const applyLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    // Find current employee
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee record associated with your account.',
      });
    }

    // Check for overlapping active requests (Pending or Approved)
    const existingLeaves = db.leaveRequests.find(
      (lr) =>
        lr.employeeId === employee._id &&
        (lr.status === 'Pending' || lr.status === 'Approved')
    );

    const hasOverlap = existingLeaves.some((lr) => {
      const lrStart = new Date(lr.startDate);
      const lrEnd = new Date(lr.endDate);
      return start <= lrEnd && end >= lrStart;
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending leave request that overlaps with these dates.',
      });
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = db.leaveRequests.create({
      employeeId: employee._id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeId,
      department: employee.department,
      leaveType: leaveType as LeaveType,
      startDate,
      endDate,
      totalDays,
      reason: String(reason).trim(),
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: newLeave,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const { status, employeeId, department } = req.query;

    let leaves = db.leaveRequests.find();

    // Role scoping:
    // Manager: ONLY see leaves of assigned team members
    if (userRole === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user!.userId });
      if (!managerEmp) {
        return res.status(200).json({ success: true, data: [] });
      }
      const teamEmpIds = new Set(
        db.employees.find({ managerId: managerEmp._id }).map((e) => e._id)
      );
      leaves = leaves.filter((l) => teamEmpIds.has(l.employeeId));
    } else if (userRole === 'employee') {
      // Employees only see their own leaves
      const emp = db.employees.findOne({ userId: req.user!.userId });
      leaves = leaves.filter((l) => l.employeeId === emp?._id);
    }

    // Filter by status
    if (status && status !== 'All') {
      leaves = leaves.filter(
        (l) => l.status.toLowerCase() === String(status).toLowerCase()
      );
    }

    // Filter by specific employee
    if (employeeId && employeeId !== 'All') {
      leaves = leaves.filter((l) => l.employeeId === employeeId);
    }

    // Filter by department
    if (department && department !== 'All') {
      leaves = leaves.filter(
        (l) => l.department?.toLowerCase() === String(department).toLowerCase()
      );
    }

    // Sort descending by creation date
    leaves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    let leaves = db.leaveRequests.find({ employeeId: employee._id });
    leaves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;

    const leave = db.leaveRequests.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve leave request that is already ${leave.status.toLowerCase()}.`,
      });
    }

    // If manager, check if target employee is on their team
    if (req.user?.role === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user.userId });
      const targetEmp = db.employees.findById(leave.employeeId);
      if (!managerEmp || targetEmp?.managerId !== managerEmp._id) {
        return res.status(403).json({
          success: false,
          message: 'You can only approve leaves for employees in your direct team.',
        });
      }
    }

    const updated = db.leaveRequests.findByIdAndUpdate(id, {
      status: 'Approved',
      reviewedBy: req.user!.userId,
      reviewerName: req.user!.name,
      reviewedAt: new Date().toISOString(),
      reviewComment: reviewComment || 'Approved as requested.',
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request approved successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;

    const leave = db.leaveRequests.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject leave request that is already ${leave.status.toLowerCase()}.`,
      });
    }

    // If manager, verify team membership
    if (req.user?.role === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user.userId });
      const targetEmp = db.employees.findById(leave.employeeId);
      if (!managerEmp || targetEmp?.managerId !== managerEmp._id) {
        return res.status(403).json({
          success: false,
          message: 'You can only review leaves for employees in your direct team.',
        });
      }
    }

    const updated = db.leaveRequests.findByIdAndUpdate(id, {
      status: 'Rejected',
      reviewedBy: req.user!.userId,
      reviewerName: req.user!.name,
      reviewedAt: new Date().toISOString(),
      reviewComment: reviewComment || 'Declined due to operational scheduling requirements.',
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leave = db.leaveRequests.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const emp = db.employees.findOne({ userId: req.user!.userId });
    if (leave.employeeId !== emp?._id && req.user?.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pending leave requests.',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled.',
      });
    }

    const updated = db.leaveRequests.findByIdAndUpdate(id, {
      status: 'Cancelled',
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

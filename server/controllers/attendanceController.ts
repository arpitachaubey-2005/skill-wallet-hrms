import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { IAttendance, AttendanceStatus } from '../models/types.js';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee record found for your user account.',
      });
    }

    const todayDate = getTodayDateString();

    // Check duplicate check-in (compound unique constraint on employeeId + attendanceDate)
    const existing = db.attendances.findOne({
      employeeId: employee._id,
      attendanceDate: todayDate,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance has already been marked for today.',
      });
    }

    const now = new Date();
    const checkInTime = now.toISOString();

    // Determine status: Late if check-in is after 9:30 AM local
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status: AttendanceStatus = isLate ? 'Late' : 'Present';

    const newRecord = db.attendances.create({
      employeeId: employee._id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeId,
      department: employee.department,
      attendanceDate: todayDate,
      checkIn: checkInTime,
      status,
      workingHours: 0,
      notes: isLate ? 'Late arrival recorded' : 'On-time check-in',
    });

    return res.status(201).json({
      success: true,
      message: `Checked in successfully as ${status}!`,
      data: newRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee record found for your user account.',
      });
    }

    const todayDate = getTodayDateString();

    const record = db.attendances.findOne({
      employeeId: employee._id,
      attendanceDate: todayDate,
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
      });
    }

    const checkOutDate = new Date();
    const checkInDate = new Date(record.checkIn);
    const diffHours = Math.max(
      0.1,
      parseFloat(
        ((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(2)
      )
    );

    let updatedStatus = record.status;
    if (diffHours < 4 && record.status === 'Present') {
      updatedStatus = 'Half Day';
    }

    const updated = db.attendances.findByIdAndUpdate(record._id, {
      checkOut: checkOutDate.toISOString(),
      workingHours: diffHours,
      status: updatedStatus,
    });

    return res.status(200).json({
      success: true,
      message: `Checked out successfully! Total working hours: ${diffHours} hrs`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const records = db.attendances.find({ employeeId: employee._id });
    records.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const halfDayCount = records.filter((r) => r.status === 'Half Day').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;

    const effectivePresent = presentCount + lateCount + halfDayCount * 0.5;
    const attendancePercentage = totalDays > 0
      ? Math.round((effectivePresent / totalDays) * 100)
      : 100;

    const todayDate = getTodayDateString();
    const todayRecord = records.find((r) => r.attendanceDate === todayDate) || null;

    return res.status(200).json({
      success: true,
      data: {
        todayRecord,
        records,
        stats: {
          totalDays,
          presentCount,
          lateCount,
          halfDayCount,
          absentCount,
          attendancePercentage,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, department, employeeId } = req.query;
    let records = db.attendances.find();

    // If manager, filter to only team members
    if (req.user?.role === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user.userId });
      if (managerEmp) {
        const teamIds = new Set(
          db.employees.find({ managerId: managerEmp._id }).map((e) => e._id)
        );
        records = records.filter((r) => teamIds.has(r.employeeId));
      }
    }

    if (date && date !== 'All') {
      records = records.filter((r) => r.attendanceDate === String(date));
    }

    if (department && department !== 'All') {
      records = records.filter(
        (r) => r.department?.toLowerCase() === String(department).toLowerCase()
      );
    }

    if (employeeId && employeeId !== 'All') {
      records = records.filter((r) => r.employeeId === employeeId);
    }

    records.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const records = db.attendances.find();
    const employees = db.employees.find();

    // Calculate department-wise attendance statistics
    const deptStats: Record<string, { present: number; late: number; absent: number; total: number }> = {};

    for (const r of records) {
      const dept = r.department || 'Other';
      if (!deptStats[dept]) {
        deptStats[dept] = { present: 0, late: 0, absent: 0, total: 0 };
      }
      deptStats[dept].total++;
      if (r.status === 'Present') deptStats[dept].present++;
      else if (r.status === 'Late') deptStats[dept].late++;
      else if (r.status === 'Absent') deptStats[dept].absent++;
    }

    // Today's summary
    const todayDate = getTodayDateString();
    const todayRecords = records.filter((r) => r.attendanceDate === todayDate);

    const totalEmployees = employees.length;
    const presentToday = todayRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const lateToday = todayRecords.filter((r) => r.status === 'Late').length;
    const absentToday = Math.max(0, totalEmployees - presentToday);

    return res.status(200).json({
      success: true,
      data: {
        todayDate,
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
        deptStats,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

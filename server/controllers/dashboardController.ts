import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getHRDashboard = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = db.employees.find();
    const users = db.users.find();
    const leaves = db.leaveRequests.find();
    const attendances = db.attendances.find();
    const trainings = db.trainingPrograms.find();
    const announcements = db.announcements.find();

    const totalEmployees = employees.length;
    const totalManagers = users.filter((u) => u.role === 'manager').length;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAtt = attendances.filter((a) => a.attendanceDate === todayDate);

    const presentToday = todayAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const absentToday = Math.max(0, totalEmployees - presentToday);

    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;
    const activeTrainings = trainings.filter((t) => t.status === 'In Progress').length;

    // Charts Data:
    // 1. Attendance trend past 7 days
    const attendanceChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecords = attendances.filter((a) => a.attendanceDate === dStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      attendanceChart.push({
        date: dStr,
        day: dayName,
        present: dayRecords.filter((a) => a.status === 'Present').length,
        late: dayRecords.filter((a) => a.status === 'Late').length,
        absent: Math.max(0, totalEmployees - dayRecords.length),
      });
    }

    // 2. Department distribution
    const deptMap: Record<string, number> = {};
    for (const e of employees) {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    }
    const departmentChart = Object.entries(deptMap).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Leave Requests by Type
    const leaveTypeMap: Record<string, number> = {
      'Casual Leave': 0,
      'Sick Leave': 0,
      'Earned Leave': 0,
      'Unpaid Leave': 0,
    };
    for (const l of leaves) {
      if (leaveTypeMap[l.leaveType] !== undefined) {
        leaveTypeMap[l.leaveType]++;
      }
    }
    const leaveChart = Object.entries(leaveTypeMap).map(([type, count]) => ({
      type,
      count,
    }));

    // 4. Training participation
    let totalAssignments = 0;
    let completedAssignments = 0;
    let inProgressAssignments = 0;

    for (const t of trainings) {
      for (const a of t.assignedEmployees) {
        totalAssignments++;
        if (a.status === 'Completed') completedAssignments++;
        else inProgressAssignments++;
      }
    }

    // Recent items
    const recentLeaves = [...leaves]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentEmployees = [...employees]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentAnnouncements = [...announcements]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          totalManagers,
          presentToday,
          absentToday,
          pendingLeaves,
          approvedLeaves,
          activeTrainings,
        },
        charts: {
          attendanceChart,
          departmentChart,
          leaveChart,
          trainingParticipation: [
            { name: 'Completed', value: completedAssignments },
            { name: 'In Progress', value: inProgressAssignments },
          ],
        },
        recentActivities: {
          leaves: recentLeaves,
          employees: recentEmployees,
          announcements: recentAnnouncements,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getManagerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const managerEmp = db.employees.findOne({ userId: req.user!.userId });
    if (!managerEmp) {
      return res.status(404).json({ success: false, message: 'Manager employee record not found.' });
    }

    const teamMembers = db.employees.find({ managerId: managerEmp._id });
    const teamEmpIds = new Set(teamMembers.map((e) => e._id));

    const allLeaves = db.leaveRequests.find();
    const teamLeaves = allLeaves.filter((l) => teamEmpIds.has(l.employeeId));

    const pendingTeamLeaves = teamLeaves.filter((l) => l.status === 'Pending');
    const approvedTeamLeaves = teamLeaves.filter((l) => l.status === 'Approved');

    // Trainings created by or involving this manager's team
    const allTrainings = db.trainingPrograms.find();
    const managerTrainings = allTrainings.filter(
      (t) =>
        t.createdBy === req.user!.userId ||
        t.assignedEmployees.some((ae) => teamEmpIds.has(ae.employeeId))
    );

    let teamAssignedCount = 0;
    let teamCompletedCount = 0;
    for (const t of managerTrainings) {
      for (const a of t.assignedEmployees) {
        if (teamEmpIds.has(a.employeeId)) {
          teamAssignedCount++;
          if (a.status === 'Completed') teamCompletedCount++;
        }
      }
    }
    const trainingCompletionRate = teamAssignedCount > 0
      ? Math.round((teamCompletedCount / teamAssignedCount) * 100)
      : 0;

    // Team Attendance Today
    const todayDate = new Date().toISOString().split('T')[0];
    const todayAtt = db.attendances.find((a) => a.attendanceDate === todayDate && teamEmpIds.has(a.employeeId));
    const teamPresentToday = todayAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;

    // Attendance trend for team over past 7 days
    const attendanceChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const records = db.attendances.find((a) => a.attendanceDate === dStr && teamEmpIds.has(a.employeeId));

      attendanceChart.push({
        date: dStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        present: records.filter((r) => r.status === 'Present' || r.status === 'Late').length,
        absent: Math.max(0, teamMembers.length - records.length),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalTeamMembers: teamMembers.length,
          teamPresentToday,
          pendingTeamLeaves: pendingTeamLeaves.length,
          approvedTeamLeaves: approvedTeamLeaves.length,
          activeTrainings: managerTrainings.length,
          trainingCompletionRate,
        },
        teamMembers,
        pendingLeaves: pendingTeamLeaves,
        trainings: managerTrainings,
        charts: {
          attendanceChart,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAtt = db.attendances.findOne({
      employeeId: employee._id,
      attendanceDate: todayDate,
    });

    const myAttendances = db.attendances.find({ employeeId: employee._id });
    const totalDays = myAttendances.length;
    const presentDays = myAttendances.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const myLeaves = db.leaveRequests.find({ employeeId: employee._id });
    const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
    const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved').length;

    // Trainings assigned to this employee
    const allTrainings = db.trainingPrograms.find();
    const assignedTrainings = allTrainings
      .filter((t) => t.assignedEmployees.some((ae) => ae.employeeId === employee._id))
      .map((t) => {
        const assignment = t.assignedEmployees.find((ae) => ae.employeeId === employee._id);
        return {
          ...t,
          myProgress: assignment?.progress || 0,
          myStatus: assignment?.status || 'Not Started',
        };
      });

    const completedTrainings = assignedTrainings.filter((t) => t.myStatus === 'Completed').length;

    // Recent announcements
    const recentAnnouncements = [...db.announcements.find()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          id: employee._id,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          department: employee.department,
          designation: employee.designation,
          managerName: employee.managerName,
          skills: employee.skills,
        },
        todayAttendance: todayAtt,
        stats: {
          attendancePercentage,
          totalLeaves: myLeaves.length,
          pendingLeaves,
          approvedLeaves,
          assignedTrainings: assignedTrainings.length,
          completedTrainings,
        },
        recentAttendances: myAttendances.slice(-7),
        trainings: assignedTrainings,
        announcements: recentAnnouncements,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

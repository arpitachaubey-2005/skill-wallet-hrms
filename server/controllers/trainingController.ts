import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ITrainingProgram, ITrainingAssignment, TrainingStatus } from '../models/types.js';

export const getTrainings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    let list = db.trainingPrograms.find();

    // If employee, only show programs assigned to them
    if (userRole === 'employee') {
      const emp = db.employees.findOne({ userId: req.user!.userId });
      if (!emp) {
        return res.status(200).json({ success: true, data: [] });
      }
      list = list.filter((tp) =>
        tp.assignedEmployees.some((ae) => ae.employeeId === emp._id)
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTraining = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      startDate,
      endDate,
      assignedEmployeeIds = [],
      skillsCovered = [],
    } = req.body;

    if (!title || !description || !category || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and duration are required.',
      });
    }

    const allEmps = db.employees.find();
    const empMap = new Map(allEmps.map((e) => [e._id, e]));

    // If manager, enforce that assigned employees belong to their team
    if (req.user?.role === 'manager') {
      const managerEmp = db.employees.findOne({ userId: req.user.userId });
      if (managerEmp) {
        for (const empId of assignedEmployeeIds) {
          const emp = empMap.get(empId);
          if (emp && emp.managerId !== managerEmp._id) {
            return res.status(403).json({
              success: false,
              message: `You cannot assign ${emp.fullName} because they are not in your team.`,
            });
          }
        }
      }
    }

    const nowIso = new Date().toISOString();
    const assignments: ITrainingAssignment[] = (assignedEmployeeIds as string[]).map((empId) => {
      const emp = empMap.get(empId);
      return {
        employeeId: empId,
        employeeName: emp ? emp.fullName : 'Employee',
        status: 'Not Started',
        progress: 0,
        assignedAt: nowIso,
      };
    });

    const newProgram = db.trainingPrograms.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      duration: String(duration).trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      assignedEmployees: assignments,
      createdBy: req.user!.userId,
      createdByName: req.user!.name,
      status: 'In Progress',
      skillsCovered: Array.isArray(skillsCovered) ? skillsCovered : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Training program created and assigned successfully.',
      data: newProgram,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTraining = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const program = db.trainingPrograms.findById(id);

    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found.' });
    }

    // Role check: HR can update any; manager only if creator or team
    if (req.user?.role === 'manager' && program.createdBy !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update training programs created by you.',
      });
    }

    const {
      title,
      description,
      category,
      duration,
      startDate,
      endDate,
      assignedEmployeeIds,
      skillsCovered,
      status,
    } = req.body;

    let updatedAssignments = program.assignedEmployees;
    if (Array.isArray(assignedEmployeeIds)) {
      const allEmps = db.employees.find();
      const empMap = new Map(allEmps.map((e) => [e._id, e]));

      updatedAssignments = assignedEmployeeIds.map((empId: string) => {
        const existing = program.assignedEmployees.find((ae) => ae.employeeId === empId);
        if (existing) return existing;
        const emp = empMap.get(empId);
        return {
          employeeId: empId,
          employeeName: emp ? emp.fullName : 'Employee',
          status: 'Not Started',
          progress: 0,
          assignedAt: new Date().toISOString(),
        };
      });
    }

    const updated = db.trainingPrograms.findByIdAndUpdate(id, {
      title: title !== undefined ? String(title).trim() : program.title,
      description: description !== undefined ? String(description).trim() : program.description,
      category: category ?? program.category,
      duration: duration ?? program.duration,
      startDate: startDate ?? program.startDate,
      endDate: endDate ?? program.endDate,
      assignedEmployees: updatedAssignments,
      skillsCovered: skillsCovered ?? program.skillsCovered,
      status: status ?? program.status,
    });

    return res.status(200).json({
      success: true,
      message: 'Training program updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTraining = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const program = db.trainingPrograms.findById(id);

    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found.' });
    }

    if (req.user?.role === 'manager' && program.createdBy !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete training programs created by you.',
      });
    }

    db.trainingPrograms.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Training program deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    const program = db.trainingPrograms.findById(id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Training program not found.' });
    }

    const employee = db.employees.findOne({ userId: req.user!.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const assignmentIndex = program.assignedEmployees.findIndex(
      (ae) => ae.employeeId === employee._id
    );

    if (assignmentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this training program.',
      });
    }

    const cleanProgress = Math.min(100, Math.max(0, Number(progress) || 0));
    let newStatus: TrainingStatus = status || (cleanProgress === 100 ? 'Completed' : cleanProgress > 0 ? 'In Progress' : 'Not Started');

    const updatedAssignments = [...program.assignedEmployees];
    updatedAssignments[assignmentIndex] = {
      ...updatedAssignments[assignmentIndex],
      progress: cleanProgress,
      status: newStatus,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined,
    };

    const updated = db.trainingPrograms.findByIdAndUpdate(id, {
      assignedEmployees: updatedAssignments,
    });

    return res.status(200).json({
      success: true,
      message: 'Training progress updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

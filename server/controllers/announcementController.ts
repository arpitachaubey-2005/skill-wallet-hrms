import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { IAnnouncement, AnnouncementCategory, AnnouncementPriority, AnnouncementVisibility } from '../models/types.js';

export const getAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    let list = db.announcements.find();

    // If employee or manager, filter by expiration if set
    const now = new Date();
    list = list.filter((a) => {
      if (!a.expirationDate) return true;
      return new Date(a.expirationDate) >= now;
    });

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

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category = 'General',
      priority = 'Medium',
      visibility = 'all',
      targetDepartment,
      expirationDate,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const newAnnouncement = db.announcements.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: category as AnnouncementCategory,
      priority: priority as AnnouncementPriority,
      publishedBy: req.user!.userId,
      authorName: req.user!.name,
      authorRole: req.user!.role,
      visibility: visibility as AnnouncementVisibility,
      targetDepartment: targetDepartment || undefined,
      expirationDate: expirationDate || undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: newAnnouncement,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ann = db.announcements.findById(id);

    if (!ann) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    // HR can edit any; managers can only edit their own
    if (req.user?.role === 'manager' && ann.publishedBy !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit announcements created by you.',
      });
    }

    const {
      title,
      description,
      category,
      priority,
      visibility,
      targetDepartment,
      expirationDate,
    } = req.body;

    const updated = db.announcements.findByIdAndUpdate(id, {
      title: title !== undefined ? String(title).trim() : ann.title,
      description: description !== undefined ? String(description).trim() : ann.description,
      category: category ?? ann.category,
      priority: priority ?? ann.priority,
      visibility: visibility ?? ann.visibility,
      targetDepartment: targetDepartment !== undefined ? targetDepartment : ann.targetDepartment,
      expirationDate: expirationDate !== undefined ? expirationDate : ann.expirationDate,
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ann = db.announcements.findById(id);

    if (!ann) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    // HR can delete any; managers can only delete their own
    if (req.user?.role === 'manager' && ann.publishedBy !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete announcements created by you.',
      });
    }

    db.announcements.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

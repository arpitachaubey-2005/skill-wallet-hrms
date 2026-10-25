import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/authMiddleware.js';

// In-memory rate limiting map for login attempts
const loginAttempts: Record<string, { count: number; firstAttempt: number }> = {};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const now = Date.now();

    // Check rate limit: max 10 attempts per 5 minutes per IP/email
    const clientKey = `${req.ip || 'ip'}_${cleanEmail}`;
    if (loginAttempts[clientKey]) {
      const record = loginAttempts[clientKey];
      if (now - record.firstAttempt < 5 * 60 * 1000) {
        if (record.count >= 15) {
          return res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please wait 5 minutes before trying again.',
          });
        }
        record.count++;
      } else {
        loginAttempts[clientKey] = { count: 1, firstAttempt: now };
      }
    } else {
      loginAttempts[clientKey] = { count: 1, firstAttempt: now };
    }

    const user = db.users.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Reset rate limiter on successful login
    delete loginAttempts[clientKey];

    // Update lastLogin
    db.users.findByIdAndUpdate(user._id, { lastLogin: new Date().toISOString() });

    // Find linked employee profile if any
    const employee = db.employees.findOne({ userId: user._id });

    // Generate JWT token (valid for 7 days)
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employeeId: employee?._id,
        employeeCode: employee?.employeeId,
        department: employee?.department,
        designation: employee?.designation,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = db.users.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const employee = db.employees.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        employeeId: employee?._id,
        employeeCode: employee?.employeeId,
        department: employee?.department,
        designation: employee?.designation,
        phone: employee?.phone,
        joiningDate: employee?.joiningDate,
        skills: employee?.skills || [],
        managerName: employee?.managerName,
        managerId: employee?.managerId,
        address: employee?.address,
        emergencyContact: employee?.emergencyContact,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = db.users.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.users.findByIdAndUpdate(user._id, { passwordHash: newHash });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

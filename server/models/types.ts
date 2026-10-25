export type UserRole = 'hr' | 'manager' | 'employee';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmploymentStatus = 'Active' | 'Probation' | 'Inactive' | 'On Leave';

export interface IEmployee {
  _id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus: EmploymentStatus;
  managerId?: string; // Reference to another employee who is a manager
  managerName?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  skills: string[];
  salary?: number; // HR-only visible
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface ILeaveRequest {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string; // User ID of HR or Manager
  reviewerName?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';

export interface IAttendance {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  attendanceDate: string; // YYYY-MM-DD
  checkIn?: string; // ISO string
  checkOut?: string; // ISO string
  status: AttendanceStatus;
  workingHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementCategory = 'General' | 'Important' | 'Event' | 'Policy' | 'Holiday';
export type AnnouncementPriority = 'Low' | 'Medium' | 'High';
export type AnnouncementVisibility = 'all' | 'team' | 'department';

export interface IAnnouncement {
  _id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  publishedBy: string; // User ID
  authorName: string;
  authorRole: UserRole;
  visibility: AnnouncementVisibility;
  targetDepartment?: string;
  targetManagerId?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TrainingStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ITrainingAssignment {
  employeeId: string;
  employeeName: string;
  status: TrainingStatus;
  progress: number; // 0 - 100
  assignedAt: string;
  completedAt?: string;
}

export interface ITrainingProgram {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string; // e.g. "4 Weeks", "15 Hours"
  startDate: string;
  endDate: string;
  assignedEmployees: ITrainingAssignment[];
  createdBy: string; // User ID
  createdByName: string;
  status: TrainingStatus;
  skillsCovered: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUserPayload {
  userId: string;
  employeeId?: string;
  name: string;
  email: string;
  role: UserRole;
}

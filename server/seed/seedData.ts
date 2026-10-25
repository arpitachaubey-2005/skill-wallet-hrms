import bcrypt from 'bcryptjs';
import {
  IUser,
  IEmployee,
  ILeaveRequest,
  IAttendance,
  IAnnouncement,
  ITrainingProgram,
} from '../models/types.js';

export async function generateInitialSeed() {
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  const now = new Date();
  const dateStr = (d: Date) => d.toISOString().split('T')[0];

  // 1. Users
  const users: IUser[] = [
    // HR
    {
      _id: 'usr_hr_01',
      name: 'Elena Vance',
      email: 'hr@skillwallet.com',
      passwordHash: commonPasswordHash,
      role: 'hr',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    // Manager 1 (Engineering)
    {
      _id: 'usr_mgr_01',
      name: 'Sarah Jenkins',
      email: 'sarah.manager@skillwallet.com',
      passwordHash: commonPasswordHash,
      role: 'manager',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 5).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-01-15T09:00:00.000Z',
      updatedAt: '2024-01-15T09:00:00.000Z',
    },
    // Manager 2 (Marketing & Design)
    {
      _id: 'usr_mgr_02',
      name: 'David Mercer',
      email: 'david.manager@skillwallet.com',
      passwordHash: commonPasswordHash,
      role: 'manager',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 8).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-02-01T09:30:00.000Z',
      updatedAt: '2024-02-01T09:30:00.000Z',
    },
  ];

  // 10 Employees info
  const rawEmployees = [
    {
      id: 'emp_01',
      userId: 'usr_emp_01',
      code: 'EMP-1001',
      name: 'Alex Chen',
      email: 'alex.chen@skillwallet.com',
      phone: '+1 (555) 234-5678',
      dept: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: '2024-02-15',
      managerId: 'emp_mgr_01',
      managerName: 'Sarah Jenkins',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker'],
      salary: 115000,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      city: 'San Francisco, CA',
    },
    {
      id: 'emp_02',
      userId: 'usr_emp_02',
      code: 'EMP-1002',
      name: 'Maya Patel',
      email: 'maya.patel@skillwallet.com',
      phone: '+1 (555) 345-6789',
      dept: 'Engineering',
      designation: 'Frontend Engineer',
      joiningDate: '2024-03-01',
      managerId: 'emp_mgr_01',
      managerName: 'Sarah Jenkins',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Redux', 'UI/UX'],
      salary: 92000,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'San Jose, CA',
    },
    {
      id: 'emp_03',
      userId: 'usr_emp_03',
      code: 'EMP-1003',
      name: 'James Wilson',
      email: 'james.wilson@skillwallet.com',
      phone: '+1 (555) 456-7890',
      dept: 'Engineering',
      designation: 'Backend Developer',
      joiningDate: '2024-03-15',
      managerId: 'emp_mgr_01',
      managerName: 'Sarah Jenkins',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Microservices'],
      salary: 96000,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      city: 'Oakland, CA',
    },
    {
      id: 'emp_04',
      userId: 'usr_emp_04',
      code: 'EMP-1004',
      name: 'Sophia Rodriguez',
      email: 'sophia.rodriguez@skillwallet.com',
      phone: '+1 (555) 567-8901',
      dept: 'Engineering',
      designation: 'DevOps & Cloud Engineer',
      joiningDate: '2024-04-01',
      managerId: 'emp_mgr_01',
      managerName: 'Sarah Jenkins',
      skills: ['Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'GCP'],
      salary: 108000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Fremont, CA',
    },
    {
      id: 'emp_05',
      userId: 'usr_emp_05',
      code: 'EMP-1005',
      name: 'Marcus Brody',
      email: 'marcus.brody@skillwallet.com',
      phone: '+1 (555) 678-9012',
      dept: 'Design',
      designation: 'Senior Product Designer',
      joiningDate: '2024-02-20',
      managerId: 'emp_mgr_02',
      managerName: 'David Mercer',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      salary: 98000,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      city: 'Seattle, WA',
    },
    {
      id: 'emp_06',
      userId: 'usr_emp_06',
      code: 'EMP-1006',
      name: 'Chloe Kim',
      email: 'chloe.kim@skillwallet.com',
      phone: '+1 (555) 789-0123',
      dept: 'Design',
      designation: 'UI/UX Visual Designer',
      joiningDate: '2024-04-15',
      managerId: 'emp_mgr_02',
      managerName: 'David Mercer',
      skills: ['Figma', 'Illustrator', 'Motion Design', 'Brand Identity'],
      salary: 85000,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      city: 'Portland, OR',
    },
    {
      id: 'emp_07',
      userId: 'usr_emp_07',
      code: 'EMP-1007',
      name: 'Lucas Campbell',
      email: 'lucas.campbell@skillwallet.com',
      phone: '+1 (555) 890-1234',
      dept: 'Marketing',
      designation: 'Growth Marketing Manager',
      joiningDate: '2024-03-10',
      managerId: 'emp_mgr_02',
      managerName: 'David Mercer',
      skills: ['SEO', 'Google Analytics', 'Content Strategy', 'Campaign Ops'],
      salary: 89000,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      city: 'Austin, TX',
    },
    {
      id: 'emp_08',
      userId: 'usr_emp_08',
      code: 'EMP-1008',
      name: 'Amara Okafor',
      email: 'amara.okafor@skillwallet.com',
      phone: '+1 (555) 901-2345',
      dept: 'Marketing',
      designation: 'Digital Marketing Specialist',
      joiningDate: '2024-05-01',
      managerId: 'emp_mgr_02',
      managerName: 'David Mercer',
      skills: ['Social Media', 'Copywriting', 'Email Marketing', 'HubSpot'],
      salary: 76000,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      city: 'Dallas, TX',
    },
    {
      id: 'emp_09',
      userId: 'usr_emp_09',
      code: 'EMP-1009',
      name: 'Ryan Gallagher',
      email: 'ryan.gallagher@skillwallet.com',
      phone: '+1 (555) 012-3456',
      dept: 'Operations',
      designation: 'HR & Operations Specialist',
      joiningDate: '2024-01-20',
      managerId: undefined,
      managerName: 'Elena Vance (HR)',
      skills: ['HRIS', 'Payroll Processing', 'Employee Relations', 'Compliance'],
      salary: 82000,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      city: 'Denver, CO',
    },
    {
      id: 'emp_10',
      userId: 'usr_emp_10',
      code: 'EMP-1010',
      name: 'Zoe Martinez',
      email: 'zoe.martinez@skillwallet.com',
      phone: '+1 (555) 123-4567',
      dept: 'Engineering',
      designation: 'QA Automation Engineer',
      joiningDate: '2024-05-15',
      managerId: 'emp_mgr_01',
      managerName: 'Sarah Jenkins',
      skills: ['Cypress', 'Playwright', 'Jest', 'API Testing', 'Automation'],
      salary: 88000,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      city: 'Phoenix, AZ',
    },
  ];

  // Add 10 employee users
  for (const item of rawEmployees) {
    users.push({
      _id: item.userId,
      name: item.name,
      email: item.email,
      passwordHash: commonPasswordHash,
      role: 'employee',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * Math.floor(Math.random() * 24)).toISOString(),
      avatar: item.avatar,
      createdAt: `${item.joiningDate}T08:00:00.000Z`,
      updatedAt: `${item.joiningDate}T08:00:00.000Z`,
    });
  }

  // 2. Employees table records (including HR and Managers as employee entries)
  const employees: IEmployee[] = [
    // HR employee record
    {
      _id: 'emp_hr_01',
      userId: 'usr_hr_01',
      employeeId: 'EMP-1000',
      fullName: 'Elena Vance',
      email: 'hr@skillwallet.com',
      phone: '+1 (555) 111-2233',
      department: 'Human Resources',
      designation: 'Head of People & Talent',
      joiningDate: '2024-01-10',
      employmentStatus: 'Active',
      address: {
        street: '100 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Robert Vance',
        relationship: 'Spouse',
        phone: '+1 (555) 999-8877',
      },
      skills: ['Talent Acquisition', 'Strategic HR', 'Conflict Resolution', 'Compensation & Benefits'],
      salary: 135000,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-01-10T08:00:00.000Z',
    },
    // Manager 1 record
    {
      _id: 'emp_mgr_01',
      userId: 'usr_mgr_01',
      employeeId: 'MGR-2001',
      fullName: 'Sarah Jenkins',
      email: 'sarah.manager@skillwallet.com',
      phone: '+1 (555) 222-3344',
      department: 'Engineering',
      designation: 'Engineering Manager',
      joiningDate: '2024-01-15',
      employmentStatus: 'Active',
      address: {
        street: '450 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Mark Jenkins',
        relationship: 'Brother',
        phone: '+1 (555) 888-7766',
      },
      skills: ['Engineering Leadership', 'System Architecture', 'Agile/Scrum', 'Mentorship'],
      salary: 145000,
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-01-15T09:00:00.000Z',
      updatedAt: '2024-01-15T09:00:00.000Z',
    },
    // Manager 2 record
    {
      _id: 'emp_mgr_02',
      userId: 'usr_mgr_02',
      employeeId: 'MGR-2002',
      fullName: 'David Mercer',
      email: 'david.manager@skillwallet.com',
      phone: '+1 (555) 333-4455',
      department: 'Marketing & Design',
      designation: 'Marketing & Creative Director',
      joiningDate: '2024-02-01',
      employmentStatus: 'Active',
      address: {
        street: '720 Pine Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94108',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Lisa Mercer',
        relationship: 'Spouse',
        phone: '+1 (555) 777-6655',
      },
      skills: ['Brand Strategy', 'Product Marketing', 'Creative Direction', 'Team Leadership'],
      salary: 130000,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-02-01T09:30:00.000Z',
      updatedAt: '2024-02-01T09:30:00.000Z',
    },
  ];

  // Convert rawEmployees to full IEmployee
  for (const item of rawEmployees) {
    employees.push({
      _id: item.id,
      userId: item.userId,
      employeeId: item.code,
      fullName: item.name,
      email: item.email,
      phone: item.phone,
      department: item.dept,
      designation: item.designation,
      joiningDate: item.joiningDate,
      employmentStatus: 'Active',
      managerId: item.managerId,
      managerName: item.managerName,
      address: {
        street: '42 Main St',
        city: item.city.split(',')[0].trim(),
        state: item.city.split(',')[1]?.trim() || 'CA',
        zipCode: '94102',
        country: 'USA',
      },
      emergencyContact: {
        name: `Contact for ${item.name}`,
        relationship: 'Family',
        phone: '+1 (555) 900-0000',
      },
      skills: item.skills,
      salary: item.salary,
      profileImage: item.avatar,
      createdAt: `${item.joiningDate}T08:00:00.000Z`,
      updatedAt: `${item.joiningDate}T08:00:00.000Z`,
    });
  }

  // 3. Leave Requests
  const leaveRequests: ILeaveRequest[] = [
    {
      _id: 'leave_01',
      employeeId: 'emp_01', // Alex Chen
      employeeName: 'Alex Chen',
      employeeCode: 'EMP-1001',
      department: 'Engineering',
      leaveType: 'Casual Leave',
      startDate: dateStr(new Date(Date.now() + 86400000 * 3)),
      endDate: dateStr(new Date(Date.now() + 86400000 * 5)),
      totalDays: 3,
      reason: 'Attending family reunion event out of town.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      _id: 'leave_02',
      employeeId: 'emp_02', // Maya Patel
      employeeName: 'Maya Patel',
      employeeCode: 'EMP-1002',
      department: 'Engineering',
      leaveType: 'Sick Leave',
      startDate: dateStr(new Date(Date.now() - 86400000 * 4)),
      endDate: dateStr(new Date(Date.now() - 86400000 * 3)),
      totalDays: 2,
      reason: 'Flu recovery and doctor prescribed rest.',
      status: 'Approved',
      reviewedBy: 'usr_mgr_01',
      reviewerName: 'Sarah Jenkins',
      reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewComment: 'Approved. Get well soon Maya!',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'leave_03',
      employeeId: 'emp_05', // Marcus Brody
      employeeName: 'Marcus Brody',
      employeeCode: 'EMP-1005',
      department: 'Design',
      leaveType: 'Earned Leave',
      startDate: dateStr(new Date(Date.now() + 86400000 * 7)),
      endDate: dateStr(new Date(Date.now() + 86400000 * 11)),
      totalDays: 5,
      reason: 'Annual personal vacation trip.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: 'leave_04',
      employeeId: 'emp_07', // Lucas Campbell
      employeeName: 'Lucas Campbell',
      employeeCode: 'EMP-1007',
      department: 'Marketing',
      leaveType: 'Casual Leave',
      startDate: dateStr(new Date(Date.now() - 86400000 * 10)),
      endDate: dateStr(new Date(Date.now() - 86400000 * 9)),
      totalDays: 2,
      reason: 'Apartment moving days.',
      status: 'Approved',
      reviewedBy: 'usr_mgr_02',
      reviewerName: 'David Mercer',
      reviewedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      reviewComment: 'Approved. Hope the move went smoothly!',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      _id: 'leave_05',
      employeeId: 'emp_03', // James Wilson
      employeeName: 'James Wilson',
      employeeCode: 'EMP-1003',
      department: 'Engineering',
      leaveType: 'Unpaid Leave',
      startDate: dateStr(new Date(Date.now() + 86400000 * 14)),
      endDate: dateStr(new Date(Date.now() + 86400000 * 15)),
      totalDays: 2,
      reason: 'Personal legal consultation.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      _id: 'leave_06',
      employeeId: 'emp_10', // Zoe Martinez
      employeeName: 'Zoe Martinez',
      employeeCode: 'EMP-1010',
      department: 'Engineering',
      leaveType: 'Casual Leave',
      startDate: dateStr(new Date(Date.now() - 86400000 * 20)),
      endDate: dateStr(new Date(Date.now() - 86400000 * 19)),
      totalDays: 2,
      reason: 'Emergency travel.',
      status: 'Rejected',
      reviewedBy: 'usr_mgr_01',
      reviewerName: 'Sarah Jenkins',
      reviewedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      reviewComment: 'Critical release sprint deadline that day. Please reschedule if possible.',
      createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
  ];

  // 4. Attendance History for past 14 days for all employees
  const attendances: IAttendance[] = [];
  const today = new Date();

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - dayOffset);
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateFormatted = dateStr(targetDate);
    const isToday = dayOffset === 0;

    for (const emp of employees) {
      // For today: 80% have checked in, rest pending or on leave
      if (isToday) {
        // If emp is emp_04 or emp_08, leave absent/not checked in yet for realism
        if (emp._id === 'emp_04' || emp._id === 'emp_08') continue;

        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMin = Math.floor(Math.random() * 59);
        const checkInTime = new Date(targetDate);
        checkInTime.setHours(checkInHour, checkInMin, 0, 0);

        const isLate = checkInHour >= 9 && checkInMin > 30;

        attendances.push({
          _id: `att_${emp._id}_${dateFormatted}`,
          employeeId: emp._id,
          employeeName: emp.fullName,
          employeeCode: emp.employeeId,
          department: emp.department,
          attendanceDate: dateFormatted,
          checkIn: checkInTime.toISOString(),
          status: isLate ? 'Late' : 'Present',
          workingHours: 4.5,
          notes: isLate ? 'Traffic delay reported' : 'On-time morning check-in',
          createdAt: checkInTime.toISOString(),
          updatedAt: checkInTime.toISOString(),
        });
      } else {
        // Past days: Generate Realistic Past Attendance
        const rand = Math.random();
        let status: 'Present' | 'Absent' | 'Late' | 'Half Day' = 'Present';
        let workingHours = 8;
        let notes = 'Regular workday completed';

        if (rand > 0.94) {
          status = 'Absent';
          workingHours = 0;
          notes = 'Unplanned absence';
        } else if (rand > 0.88) {
          status = 'Late';
          workingHours = 7.5;
          notes = 'Late arrival recorded';
        } else if (rand > 0.82) {
          status = 'Half Day';
          workingHours = 4.0;
          notes = 'Approved half-day shift';
        }

        const checkInTime = new Date(targetDate);
        checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);
        const checkOutTime = new Date(targetDate);
        checkOutTime.setHours(17 + Math.floor(workingHours - 8), Math.floor(Math.random() * 45), 0);

        attendances.push({
          _id: `att_${emp._id}_${dateFormatted}`,
          employeeId: emp._id,
          employeeName: emp.fullName,
          employeeCode: emp.employeeId,
          department: emp.department,
          attendanceDate: dateFormatted,
          checkIn: status !== 'Absent' ? checkInTime.toISOString() : undefined,
          checkOut: status !== 'Absent' ? checkOutTime.toISOString() : undefined,
          status,
          workingHours,
          notes,
          createdAt: checkInTime.toISOString(),
          updatedAt: checkOutTime.toISOString(),
        });
      }
    }
  }

  // 5. Announcements
  const announcements: IAnnouncement[] = [
    {
      _id: 'ann_01',
      title: 'Annual Performance Appraisal Cycle 2026 Launched',
      description: 'The Q4 360-degree performance evaluation cycle is now active. All managers and employees are requested to submit self-assessments and peer reviews before November 15th.',
      category: 'Policy',
      priority: 'High',
      publishedBy: 'usr_hr_01',
      authorName: 'Elena Vance',
      authorRole: 'hr',
      visibility: 'all',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: 'ann_02',
      title: 'Upcoming Tech All-Hands & Product Roadmap Showcase',
      description: 'Join us this Thursday at 3:00 PM PST in Main Auditorium / Zoom for our quarterly engineering demo showcase and AI integration roadmap.',
      category: 'Event',
      priority: 'Medium',
      publishedBy: 'usr_mgr_01',
      authorName: 'Sarah Jenkins',
      authorRole: 'manager',
      visibility: 'all',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      _id: 'ann_03',
      title: 'New Hybrid Workplace Health & Wellness Benefit Package',
      description: 'Skill Wallet is proud to introduce gym membership reimbursements, mental wellness subscriptions, and ergonomic home setup allowances for all full-time members.',
      category: 'Important',
      priority: 'High',
      publishedBy: 'usr_hr_01',
      authorName: 'Elena Vance',
      authorRole: 'hr',
      visibility: 'all',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      _id: 'ann_04',
      title: 'Design Team Sprint Retro & Asset Library Sync',
      description: 'Marketing & Design team members: remember to export the final Figma token specs for the upcoming Q1 marketing refresh.',
      category: 'General',
      priority: 'Low',
      publishedBy: 'usr_mgr_02',
      authorName: 'David Mercer',
      authorRole: 'manager',
      visibility: 'all',
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
  ];

  // 6. Training Programs
  const trainingPrograms: ITrainingProgram[] = [
    {
      _id: 'tr_01',
      title: 'Cloud Native Microservices & Kubernetes Orchestration',
      description: 'Hands-on practical training covering Docker containerization, Kubernetes clusters, service meshes, zero-downtime deployments, and cloud observability.',
      category: 'Engineering & DevOps',
      duration: '4 Weeks (20 Hours)',
      startDate: '2026-10-01',
      endDate: '2026-11-05',
      createdBy: 'usr_mgr_01',
      createdByName: 'Sarah Jenkins',
      status: 'In Progress',
      skillsCovered: ['Docker', 'Kubernetes', 'Helm', 'CI/CD Pipelines', 'Cloud Monitoring'],
      assignedEmployees: [
        {
          employeeId: 'emp_01',
          employeeName: 'Alex Chen',
          status: 'In Progress',
          progress: 75,
          assignedAt: '2026-10-01T09:00:00.000Z',
        },
        {
          employeeId: 'emp_03',
          employeeName: 'James Wilson',
          status: 'In Progress',
          progress: 50,
          assignedAt: '2026-10-01T09:00:00.000Z',
        },
        {
          employeeId: 'emp_04',
          employeeName: 'Sophia Rodriguez',
          status: 'Completed',
          progress: 100,
          assignedAt: '2026-10-01T09:00:00.000Z',
          completedAt: '2026-10-20T16:30:00.000Z',
        },
        {
          employeeId: 'emp_10',
          employeeName: 'Zoe Martinez',
          status: 'In Progress',
          progress: 30,
          assignedAt: '2026-10-01T09:00:00.000Z',
        },
      ],
      createdAt: '2026-09-28T10:00:00.000Z',
      updatedAt: '2026-10-20T16:30:00.000Z',
    },
    {
      _id: 'tr_02',
      title: 'Modern UI/UX Accessibility (WCAG 2.2) & Design Systems',
      description: 'Comprehensive guidelines for designing accessible web applications, color contrast ratios, screen reader support, keyboard navigation, and scalable Figma component libraries.',
      category: 'Design & Accessibility',
      duration: '3 Weeks (15 Hours)',
      startDate: '2026-10-10',
      endDate: '2026-11-15',
      createdBy: 'usr_mgr_02',
      createdByName: 'David Mercer',
      status: 'In Progress',
      skillsCovered: ['WCAG 2.2', 'Figma Variants', 'ARIA Standards', 'Color Theory', 'UX Research'],
      assignedEmployees: [
        {
          employeeId: 'emp_02',
          employeeName: 'Maya Patel',
          status: 'In Progress',
          progress: 60,
          assignedAt: '2026-10-10T10:00:00.000Z',
        },
        {
          employeeId: 'emp_05',
          employeeName: 'Marcus Brody',
          status: 'Completed',
          progress: 100,
          assignedAt: '2026-10-10T10:00:00.000Z',
          completedAt: '2026-10-22T14:00:00.000Z',
        },
        {
          employeeId: 'emp_06',
          employeeName: 'Chloe Kim',
          status: 'In Progress',
          progress: 80,
          assignedAt: '2026-10-10T10:00:00.000Z',
        },
      ],
      createdAt: '2026-10-08T11:00:00.000Z',
      updatedAt: '2026-10-22T14:00:00.000Z',
    },
    {
      _id: 'tr_03',
      title: 'Data-Driven Growth Marketing & Modern B2B Funnels',
      description: 'Mastering conversion funnel optimization, attribution modeling, organic SEO dominance, automated CRM pipelines, and customer retention metrics.',
      category: 'Growth & Marketing',
      duration: '2 Weeks (12 Hours)',
      startDate: '2026-10-15',
      endDate: '2026-11-01',
      createdBy: 'usr_mgr_02',
      createdByName: 'David Mercer',
      status: 'In Progress',
      skillsCovered: ['Google Analytics 4', 'A/B Testing', 'Conversion Optimization', 'Attribution'],
      assignedEmployees: [
        {
          employeeId: 'emp_07',
          employeeName: 'Lucas Campbell',
          status: 'In Progress',
          progress: 45,
          assignedAt: '2026-10-15T09:00:00.000Z',
        },
        {
          employeeId: 'emp_08',
          employeeName: 'Amara Okafor',
          status: 'In Progress',
          progress: 70,
          assignedAt: '2026-10-15T09:00:00.000Z',
        },
      ],
      createdAt: '2026-10-14T10:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z',
    },
  ];

  return {
    users,
    employees,
    leaveRequests,
    attendances,
    announcements,
    trainingPrograms,
  };
}

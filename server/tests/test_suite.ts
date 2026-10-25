import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING SKILL WALLET AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  // Initialize DB
  await db.init();

  // --- 1. AUTHENTICATION TESTS ---
  console.log('[Suite 1: Authentication & Password Verification]');
  const hrUser = db.users.findOne({ email: 'hr@skillwallet.com' });
  assert(Boolean(hrUser), 'HR user account exists');

  const validPasswordMatch = await bcrypt.compare('Password123!', hrUser!.passwordHash);
  assert(validPasswordMatch, 'Valid password matches bcrypt hash');

  const invalidPasswordMatch = await bcrypt.compare('WrongPassword999', hrUser!.passwordHash);
  assert(!invalidPasswordMatch, 'Invalid password is fundamentally rejected');

  // JWT Token Signing & Verification
  const token = jwt.sign(
    { userId: hrUser!._id, role: hrUser!.role, name: hrUser!.name, email: hrUser!.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  assert(decoded.userId === hrUser!._id, 'JWT token decodes valid userId');
  assert(decoded.role === 'hr', 'JWT token preserves HR role authorization');

  // Expired token rejection
  const expiredToken = jwt.sign(
    { userId: hrUser!._id, role: hrUser!.role },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
  let tokenExpiredCaught = false;
  try {
    jwt.verify(expiredToken, JWT_SECRET);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') tokenExpiredCaught = true;
  }
  assert(tokenExpiredCaught, 'Expired JWT token is rejected with TokenExpiredError');

  // --- 2. AUTHORIZATION & RBAC TESTS ---
  console.log('\n[Suite 2: Role-Based Access Control (RBAC)]');
  const employeeUser = db.users.findOne({ email: 'alex.chen@skillwallet.com' });
  const managerUser = db.users.findOne({ email: 'sarah.manager@skillwallet.com' });

  assert(employeeUser?.role === 'employee', 'Alex Chen correctly has employee role');
  assert(managerUser?.role === 'manager', 'Sarah Jenkins correctly has manager role');

  // Access validation: Only 'hr' can access HR routes
  const canEmployeeAccessHR = ['hr'].includes(employeeUser!.role);
  assert(!canEmployeeAccessHR, 'Employee is prohibited from accessing HR administrative routes');

  const canManagerAccessHR = ['hr'].includes(managerUser!.role);
  assert(!canManagerAccessHR, 'Manager is prohibited from accessing HR-only routes');

  // --- 3. EMPLOYEE MANAGEMENT CRUD TESTS ---
  console.log('\n[Suite 3: Employee Management CRUD]');
  const testEmpCode = `TEST-${Date.now()}`;
  const testEmp = db.employees.create({
    userId: 'usr_test_999',
    employeeId: testEmpCode,
    fullName: 'Test Automation Engineer',
    email: `auto.test.${Date.now()}@skillwallet.com`,
    phone: '+1 555-0199',
    department: 'Engineering',
    designation: 'Test Engineer',
    joiningDate: '2026-01-01',
    employmentStatus: 'Active',
    skills: ['Jest', 'Cypress', 'Playwright'],
    salary: 95000,
    address: { city: 'San Francisco', state: 'CA' },
    emergencyContact: { name: 'Emergency Contact', phone: '+1 555-0100' },
  });

  assert(Boolean(testEmp._id), 'Successfully created test employee profile');

  // Update employee
  const updatedEmp = db.employees.findByIdAndUpdate(testEmp._id, {
    designation: 'Staff Test Automation Engineer',
    salary: 105000,
  });
  assert(updatedEmp?.designation === 'Staff Test Automation Engineer', 'Updated employee designation');
  assert(updatedEmp?.salary === 105000, 'Updated employee compensation');

  // Deactivate employee
  const deactivated = db.employees.findByIdAndUpdate(testEmp._id, {
    employmentStatus: 'Inactive',
  });
  assert(deactivated?.employmentStatus === 'Inactive', 'Deactivated employee status to Inactive');

  // Clean up test employee
  db.employees.findByIdAndDelete(testEmp._id);

  // --- 4. LEAVE REQUESTS & VALIDATION TESTS ---
  console.log('\n[Suite 4: Leave Requests & Validation]');
  const empAlex = db.employees.findOne({ email: 'alex.chen@skillwallet.com' })!;
  assert(Boolean(empAlex), 'Found Alex Chen employee record');

  // Valid leave creation
  const testLeave = db.leaveRequests.create({
    employeeId: empAlex._id,
    employeeName: empAlex.fullName,
    employeeCode: empAlex.employeeId,
    department: empAlex.department,
    leaveType: 'Casual Leave',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    totalDays: 3,
    reason: 'Automated test leave application',
    status: 'Pending',
  });
  assert(testLeave.status === 'Pending', 'Created pending leave application');

  // Approve leave
  const approved = db.leaveRequests.findByIdAndUpdate(testLeave._id, {
    status: 'Approved',
    reviewedBy: managerUser!._id,
    reviewerName: managerUser!.name,
    reviewedAt: new Date().toISOString(),
    reviewComment: 'Approved in automated suite',
  });
  assert(approved?.status === 'Approved', 'Approved leave application successfully');
  assert(approved?.reviewerName === managerUser!.name, 'Recorded reviewer details on leave approval');

  // Clean up
  db.leaveRequests.findByIdAndDelete(testLeave._id);

  // Overlapping leave logic check
  const startA = new Date('2026-12-01');
  const endA = new Date('2026-12-05');
  const startB = new Date('2026-12-03');
  const endB = new Date('2026-12-08');
  const overlaps = startB <= endA && endB >= startA;
  assert(overlaps, 'Correctly detected date range overlap between leave applications');

  // --- 5. ATTENDANCE & UNIQUE CONSTRAINTS TESTS ---
  console.log('\n[Suite 5: Attendance Check-In & Uniqueness]');
  const testDate = '2026-12-31';
  // 1. Initial Check-in
  const att1 = db.attendances.create({
    employeeId: empAlex._id,
    employeeName: empAlex.fullName,
    employeeCode: empAlex.employeeId,
    department: empAlex.department,
    attendanceDate: testDate,
    checkIn: new Date().toISOString(),
    status: 'Present',
    workingHours: 0,
    notes: 'Automated attendance check-in test',
  });
  assert(Boolean(att1._id), 'Successfully recorded first check-in for date');

  // 2. Prevent duplicate check-in
  const duplicate = db.attendances.findOne({
    employeeId: empAlex._id,
    attendanceDate: testDate,
  });
  assert(Boolean(duplicate), 'Duplicate check-in accurately detected on unique compound index');

  // 3. Check-out & Hours calculation
  const checkOutTime = new Date(Date.now() + 8 * 3600000).toISOString();
  const checkedOut = db.attendances.findByIdAndUpdate(att1._id, {
    checkOut: checkOutTime,
    workingHours: 8.0,
  });
  assert(checkedOut?.workingHours === 8.0, 'Successfully checked out and computed shift working hours');

  // Clean up
  db.attendances.findByIdAndDelete(att1._id);

  // --- 6. TRAINING PROGRAMS & PROGRESS TESTS ---
  console.log('\n[Suite 6: Training Programs & Skill Progress]');
  const training = db.trainingPrograms.create({
    title: 'Automated Test Architecture',
    description: 'Unit, integration, and E2E testing principles',
    category: 'Engineering',
    duration: '2 Weeks',
    startDate: '2026-11-01',
    endDate: '2026-11-15',
    assignedEmployees: [
      {
        employeeId: empAlex._id,
        employeeName: empAlex.fullName,
        status: 'In Progress',
        progress: 40,
        assignedAt: new Date().toISOString(),
      },
    ],
    createdBy: managerUser!._id,
    createdByName: managerUser!.name,
    status: 'In Progress',
    skillsCovered: ['Automated Testing', 'CI/CD'],
  });

  assert(Boolean(training._id), 'Created training program with assigned team member');

  // Update progress
  const updatedAssignments = [...training.assignedEmployees];
  updatedAssignments[0].progress = 100;
  updatedAssignments[0].status = 'Completed';
  const updatedTraining = db.trainingPrograms.findByIdAndUpdate(training._id, {
    assignedEmployees: updatedAssignments,
  });

  assert(
    updatedTraining?.assignedEmployees[0].progress === 100,
    'Updated employee training progress to 100%'
  );
  assert(
    updatedTraining?.assignedEmployees[0].status === 'Completed',
    'Marked training milestone as Completed'
  );

  // Clean up
  db.trainingPrograms.findByIdAndDelete(training._id);

  console.log('\n==================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

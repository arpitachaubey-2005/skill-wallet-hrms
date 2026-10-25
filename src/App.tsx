import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import ProtectedRoute from './components/common/ProtectedRoute.js';
import DashboardLayout from './components/layout/DashboardLayout.js';

// Auth Pages
import Login from './pages/auth/Login.js';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard.js';
import Employees from './pages/hr/Employees.js';
import LeaveManagement from './pages/hr/LeaveManagement.js';
import AttendanceReports from './pages/hr/AttendanceReports.js';
import Announcements from './pages/hr/Announcements.js';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard.js';
import TeamMembers from './pages/manager/TeamMembers.js';
import TeamLeaves from './pages/manager/TeamLeaves.js';
import TrainingManagement from './pages/manager/TrainingManagement.js';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard.js';
import MyAttendance from './pages/employee/MyAttendance.js';
import ApplyLeave from './pages/employee/ApplyLeave.js';
import MyLeaves from './pages/employee/MyLeaves.js';
import MyTraining from './pages/employee/MyTraining.js';
import MyProfile from './pages/employee/MyProfile.js';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirector */}
          <Route path="/" element={<RootRedirect />} />

          {/* HR Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<Employees />} />
            <Route path="/hr/leaves" element={<LeaveManagement />} />
            <Route path="/hr/attendance" element={<AttendanceReports />} />
            <Route path="/hr/announcements" element={<Announcements />} />
          </Route>

          {/* Manager Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/team" element={<TeamMembers />} />
            <Route path="/manager/leaves" element={<TeamLeaves />} />
            <Route path="/manager/training" element={<TrainingManagement />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager', 'hr']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
            <Route path="/employee/apply-leave" element={<ApplyLeave />} />
            <Route path="/employee/leaves" element={<MyLeaves />} />
            <Route path="/employee/training" element={<MyTraining />} />
            <Route path="/employee/profile" element={<MyProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

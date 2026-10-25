import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';

export const DashboardLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Determine title from route
  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/hr/dashboard')) return 'HR Management Overview';
    if (pathname.includes('/hr/employees')) return 'Employee Directory';
    if (pathname.includes('/hr/leaves')) return 'Leave Requests & Approvals';
    if (pathname.includes('/hr/attendance')) return 'Attendance Tracking & Analytics';
    if (pathname.includes('/hr/announcements')) return 'Company Announcements';

    if (pathname.includes('/manager/dashboard')) return 'Team Management Dashboard';
    if (pathname.includes('/manager/team')) return 'Direct Reports & Team Roster';
    if (pathname.includes('/manager/leaves')) return 'Team Leave Applications';
    if (pathname.includes('/manager/training')) return 'Team Skills & Training';

    if (pathname.includes('/employee/dashboard')) return 'Employee Self-Service Portal';
    if (pathname.includes('/employee/attendance')) return 'Daily Attendance & Check-in';
    if (pathname.includes('/employee/apply-leave')) return 'Submit Leave Request';
    if (pathname.includes('/employee/leaves')) return 'My Leave Applications';
    if (pathname.includes('/employee/training')) return 'Skill Wallet & Training Modules';
    if (pathname.includes('/employee/profile')) return 'My Personal Profile';

    return 'Skill Wallet HRMS';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          title={title}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

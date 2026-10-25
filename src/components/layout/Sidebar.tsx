import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Megaphone,
  GraduationCap,
  FileText,
  UserCheck,
  Shield,
  Briefcase,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'hr') {
      return [
        { label: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
        { label: 'Employee Directory', path: '/hr/employees', icon: Users },
        { label: 'Leave Requests', path: '/hr/leaves', icon: CalendarCheck },
        { label: 'Attendance & Reports', path: '/hr/attendance', icon: Clock },
        { label: 'Announcements', path: '/hr/announcements', icon: Megaphone },
      ];
    } else if (user?.role === 'manager') {
      return [
        { label: 'Manager Overview', path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'My Direct Team', path: '/manager/team', icon: Users },
        { label: 'Team Leave Requests', path: '/manager/leaves', icon: CalendarCheck },
        { label: 'Training Programs', path: '/manager/training', icon: GraduationCap },
      ];
    } else {
      return [
        { label: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
        { label: 'Daily Attendance', path: '/employee/attendance', icon: Clock },
        { label: 'Apply for Leave', path: '/employee/apply-leave', icon: FileText },
        { label: 'My Leave History', path: '/employee/leaves', icon: CalendarCheck },
        { label: 'Skill Training', path: '/employee/training', icon: GraduationCap },
        { label: 'My Profile', path: '/employee/profile', icon: UserCheck },
      ];
    }
  };

  const navLinks = getNavLinks();

  const roleColors = {
    hr: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    manager: 'bg-purple-50 text-purple-700 border-purple-200',
    employee: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const roleLabel = {
    hr: 'HR Administrator',
    manager: 'Team Manager',
    employee: 'Employee',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Skill<span className="text-indigo-600">Wallet</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500">
                  HRMS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Enterprise Suite</p>
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-white"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <span
                className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  roleColors[user?.role || 'employee']
                }`}
              >
                {roleLabel[user?.role || 'employee']}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Quick Info Box */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100/60">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Wallet 2026</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              MERN Full-Stack HR Management Portal with RBAC.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

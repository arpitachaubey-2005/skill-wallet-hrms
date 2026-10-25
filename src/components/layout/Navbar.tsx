import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, title }) => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (email: string) => {
    try {
      setSwitchLoading(true);
      setShowRoleSwitcher(false);
      const switchedUser = await login(email, 'Password123!');
      if (switchedUser.role === 'hr') navigate('/hr/dashboard');
      else if (switchedUser.role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitchLoading(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title || 'Dashboard'}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Role Switcher, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            disabled={switchLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
            title="Switch demo account instantly for testing"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Switch Role</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Switch Demo Account</p>
                <p className="text-[11px] text-slate-500">Instant login for project testing</p>
              </div>

              <div className="p-1.5 space-y-1">
                <button
                  onClick={() => handleQuickSwitch('hr@skillwallet.com')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-indigo-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-slate-900">Elena Vance</p>
                    <p className="text-[10px] text-indigo-600 font-medium">HR Administrator</p>
                  </div>
                  {user?.role === 'hr' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>

                <button
                  onClick={() => handleQuickSwitch('sarah.manager@skillwallet.com')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-slate-900">Sarah Jenkins</p>
                    <p className="text-[10px] text-purple-600 font-medium">Manager (Engineering)</p>
                  </div>
                  {user?.role === 'manager' && user.email === 'sarah.manager@skillwallet.com' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  )}
                </button>

                <button
                  onClick={() => handleQuickSwitch('alex.chen@skillwallet.com')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-slate-900">Alex Chen</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Employee (Full Stack Eng)</p>
                  </div>
                  {user?.role === 'employee' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSwitcher(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-semibold text-slate-800">Q4 Appraisal cycle active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please submit self-assessment by Nov 15.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-semibold text-slate-800">New Training Module Assigned</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cloud Native & Microservices program enrolled.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 day ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-semibold text-slate-800">Attendance marked successfully</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded check-in for today.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Today</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowRoleSwitcher(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/employee/profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Personal Profile</span>
                </button>
              </div>

              <div className="border-t border-slate-100 p-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

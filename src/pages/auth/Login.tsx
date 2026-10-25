import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import Button from '../../components/common/Button.js';
import Input from '../../components/common/Input.js';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'hr') {
        navigate('/hr/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.friendlyMessage || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(demoEmail, 'Password123!');
      if (user.role === 'hr') {
        navigate('/hr/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.friendlyMessage || err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon & Heading */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Skill<span className="text-indigo-600">Wallet</span> HRMS
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enterprise Human Resource Management & Skill Intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@skillwallet.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>One-Click Demo Accounts</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Select a role to instantly test permissions, dashboards, and features:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('hr@skillwallet.com')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                    Elena Vance (HR Admin)
                  </p>
                  <p className="text-[11px] text-slate-500">hr@skillwallet.com</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                  HR Role
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sarah.manager@skillwallet.com')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 text-left transition-all group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-purple-900 group-hover:text-purple-700">
                    Sarah Jenkins (Manager)
                  </p>
                  <p className="text-[11px] text-slate-500">sarah.manager@skillwallet.com</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                  Manager Role
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alex.chen@skillwallet.com')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                    Alex Chen (Senior Engineer)
                  </p>
                  <p className="text-[11px] text-slate-500">alex.chen@skillwallet.com</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  Employee Role
                </span>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Password for all demo accounts: <strong className="text-slate-600">Password123!</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

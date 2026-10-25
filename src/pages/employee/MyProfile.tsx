import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Lock,
} from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/common/Button.js';
import Input from '../../components/common/Input.js';
import { useAuth } from '../../context/AuthContext.js';
import { getStatusBadge } from '../../components/common/Badge.js';

export const MyProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form state
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/employees/me');
        if (res.data?.success) {
          const data = res.data.data;
          setProfile(data);
          setPhone(data.phone || '');
          setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : '');
          setStreet(data.address?.street || '');
          setCity(data.address?.city || '');
          setState(data.address?.state || '');
          setEmergencyName(data.emergencyContact?.name || '');
          setEmergencyPhone(data.emergencyContact?.phone || '');
          setEmergencyRelation(data.emergencyContact?.relationship || '');
        }
      } catch (err: any) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setSaving(true);
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.patch('/api/employees/me', {
        phone,
        skills: skillsArray,
        address: { street, city, state },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelation,
        },
      });

      if (res.data?.success) {
        setProfileMessage({ text: 'Personal details updated successfully!', type: 'success' });
        await refreshUser();
      }
    } catch (err: any) {
      setProfileMessage({
        text: err.friendlyMessage || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        text: 'New password must be at least 6 characters long.',
        type: 'error',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordMessage({ text: 'Password changed successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMessage({
        text: err.friendlyMessage || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Personal Profile & Security Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your contact credentials, home address, emergency contacts, and authentication password.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Personal & Contact Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'password'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security & Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Card with locked fields */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={
                profile?.profileImage ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user?.name || 'User'
                )}`
              }
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                {profile?.employmentStatus && getStatusBadge(profile.employmentStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile?.designation} • {profile?.department}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  ID: {profile?.employeeId}
                </span>
                <span>Manager: {profile?.managerName || 'Direct HR'}</span>
                <span>Joined: {profile?.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {profileMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name (HR Managed)"
                disabled
                value={user?.name || ''}
                helperText="Identity verified by HR."
              />
              <Input
                label="Company Email (HR Managed)"
                disabled
                value={user?.email || ''}
                helperText="Official corporate email handle."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Personal Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="42 High St, Apt 4B"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
              />
              <Input
                label="State / Region"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CA"
              />
            </div>

            {/* Emergency Contact */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Emergency Contact Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
                <Input
                  label="Relationship"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Spouse / Sibling"
                />
                <Input
                  label="Contact Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 999-0000"
                />
              </div>
            </div>

            {/* Skills */}
            <Input
              label="Skill Wallet Competencies (Comma-separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, Cloud Architecture"
              helperText="Updates your skill tags visible on team directories."
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Profile Details
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-md space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
            <p className="text-xs text-slate-500">
              Ensure your account uses a secure password with at least 6 characters.
            </p>

            {passwordMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                leftIcon={<KeyRound className="w-4 h-4" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                leftIcon={<KeyRound className="w-4 h-4" />}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={passwordLoading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

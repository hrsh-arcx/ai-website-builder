import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, KeyRound } from 'lucide-react';
import { useSession, authClient, deleteUser } from '../lib/auth-client';
import { toast } from 'sonner';
import api from '../config/axios';

const Settings = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMessage({ text: '', type: '' });

    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true, 
      });

      if (error) setPwdMessage({ text: error.message || 'Failed to update password.', type: 'error' });
      else {
        setPwdMessage({ text: 'Password successfully updated!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPwdMessage({ text: 'Network error.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const {data} = await api.delete('/api/user/delete');
      await authClient.signOut();
      toast.success(data.message);
      setIsDeleting(false);
      navigate('/');
    } catch (error:any) {
      toast.error(error.response?.data?.message || error.message);
      setIsDeleting(false);
      console.error(error);
    }
  };

  if (!session?.user) return null;

  return (
    // Lightened background mirroring Profile component
    <div className="min-h-screen bg-[#030014] text-white p-8 md:p-16 pt-24 relative">
      {/* Background radial gradient to match profile page */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,40,200,0.2),transparent_50%)]" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-slate-400 mt-2">Manage your security preferences and sensitive data.</p>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Password & Security</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> Current Password
              </label>
              <input 
                type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> New Password
              </label>
              <input 
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>

            {pwdMessage.text && (
              <p className={`text-sm py-3 px-4 rounded-xl border ${pwdMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {pwdMessage.text}
              </p>
            )}

            <button type="submit" disabled={pwdLoading} className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 rounded-3xl p-8 bg-red-500/5 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Once you delete your account, there is no going back. All your projects, data, and settings will be permanently wiped.
          </p>
          
          {!isDeleting ? (
            <button 
              onClick={() => setIsDeleting(true)}
              className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-5 bg-black/20 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-300">Please type <strong className="text-white">DELETE</strong> to confirm.</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500/50 outline-none"
                />
                <button 
                  onClick={handleDeleteAccount}
                  disabled={confirmDeleteText !== 'DELETE'}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
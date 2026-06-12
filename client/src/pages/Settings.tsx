import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, KeyRound } from 'lucide-react';
import {deleteUser } from '../lib/auth-client';
import { useSession, authClient } from '../lib/auth-client';

const Settings = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  // Safety states for deletion
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
    if (confirmDeleteText !== 'DELETE') return;
    
    try {
      // better-auth will destroy the session and delete the user record
      await deleteUser({
        callbackURL: "/", // Redirects them to home after deletion
      });
      navigate('/');
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8 md:p-16 lg:px-32 pt-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
          <p className="text-slate-400 mt-2">Manage your security preferences and sensitive data.</p>
        </div>

        {/* Security Section */}
        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Password & Security</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 ml-1">
                <KeyRound className="h-4 w-4 text-slate-500" /> Current Password
              </label>
              <input 
                type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 ml-1">
                <KeyRound className="h-4 w-4 text-slate-500" /> New Password
              </label>
              <input 
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
              />
            </div>

            {pwdMessage.text && (
              <p className={`text-sm py-3 px-4 rounded-xl border ${pwdMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {pwdMessage.text}
              </p>
            )}

            <div className="pt-2">
              <button type="submit" disabled={pwdLoading} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-70 active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 rounded-3xl p-8 bg-red-500/5 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle red glow in the danger zone */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6 relative z-10">
            Once you delete your account, there is no going back. All your projects, data, and settings will be permanently wiped.
          </p>
          
          {!isDeleting ? (
            <button 
              onClick={() => setIsDeleting(true)}
              className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium active:scale-95 relative z-10"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-5 bg-black/40 border border-red-500/20 rounded-xl relative z-10 animate-in fade-in zoom-in-95">
              <p className="text-sm text-red-300 font-medium">Please type <strong className="text-white bg-red-500/20 px-1.5 py-0.5 rounded">DELETE</strong> to confirm.</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="DELETE"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black border border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 outline-none uppercase"
                />
                <button 
                  onClick={handleDeleteAccount}
                  disabled={confirmDeleteText !== 'DELETE'}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
              <button onClick={() => { setIsDeleting(false); setConfirmDeleteText(''); }} className="text-xs text-slate-400 hover:text-white mt-2 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
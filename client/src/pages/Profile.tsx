import React, { useState, useEffect } from 'react';
import { User, Mail, FolderKanban, Check } from 'lucide-react';
import { useSession, authClient } from '../lib/auth-client';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const Profile = () => {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Placeholder count - you can replace this with an actual API call later
  const projectCount = 3;

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await authClient.updateUser({ 
          name: name 
      });

      if (error) {
        setMessage({ text: error.message || 'Failed to update name.', type: 'error' });
      } else {
        setMessage({ text: 'Name updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Network error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8 md:p-16 pt-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="text-slate-400 mt-2">Manage your account identity.</p>
        </div>

        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8 items-start">
          {/* Identity Section */}
          <div className="flex flex-col items-center space-y-4 w-full md:w-1/3">
            <Avatar className="h-24 w-24 border border-white/10 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-3xl font-semibold">
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between px-2">
              <span className="text-sm font-medium text-slate-300">Projects</span>
              <span className="text-lg font-bold text-indigo-400">{projectCount}</span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-5 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 ml-1">
                <User className="h-4 w-4 text-slate-500" /> Display Name
              </label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 ml-1">
                <Mail className="h-4 w-4 text-slate-500" /> Email Address
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 cursor-not-allowed">
                {session.user.email}
              </div>
            </div>

            {message.text && (
              <div className={`flex items-center gap-2 text-sm py-3 px-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.type === 'success' && <Check className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || name === session.user.name} 
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
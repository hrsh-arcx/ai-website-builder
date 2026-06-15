import React, { useState, useEffect } from 'react';
import { FolderKanban, Loader2 } from 'lucide-react';
import { useSession, authClient } from '../lib/auth-client';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import api from '../config/axios';

const Profile = () => {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchProjectCount = async () => {
    try{
      const {data} = await api.get('/api/project/count');
      setProjectCount(data.count);
    } catch(error:any){
      console.log(error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setInitialName(session.user.name || '');
      fetchProjectCount();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' }); // Clear previous messages
    
    try {
      const { error } = await authClient.updateUser({ name: name });
      if (error) {
        setMessage({ text: error.message || 'Update failed.', type: 'error' });
      } else {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setInitialName(name);
        // Auto-clear success message after 3 seconds
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const isChanged = name !== initialName && name.trim() !== '';

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8 md:p-16 flex flex-col items-center">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,40,200,0.2),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-slate-400">Manage your identity and account settings.</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-32 w-32 border border-white/10 ring-4 ring-white/5">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl text-white font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2 text-indigo-200">
            <FolderKanban className="h-4 w-4" />
            <span className="text-sm font-medium">{projectCount} active Projects</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)} 
              className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-slate-500">
              {session.user.email}
            </div>
          </div>

          {/* Feedback Message Area */}
          {message.text && (
            <div className={`text-sm py-3 px-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
              message.type === 'error' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isChanged || loading}
            className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 
              ${isChanged 
                ? 'bg-white text-black hover:bg-slate-200 cursor-pointer' 
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Name'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
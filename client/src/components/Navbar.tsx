import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import logo from '../assets/logo.svg'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import api from '../config/axios';
import {toast} from 'sonner';

interface NavbarProps {
  onOpenAuth: (view: 'signin' | 'signup') => void;
}

const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // 1. Check for the secure session cookie
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const [credits, setCredits] = useState(0);
  const getCredits = async () => {
    try{
      const {data} = await api.get('/api/user/credits');
      setCredits(data.credits);
    }
    catch(error){
      toast.error('Failed to fetch credits');
      console.log(error);
    }
  }

  useEffect(() => {
    if(session?.user){
      getCredits();
    }
  },[session?.user]);

  return (
    <>
      <nav className="z-50 flex items-center justify-between w-full py-4 px-4 md:px-16 lg:px-24 xl:px-32 backdrop-blur border-b text-white border-slate-800 relative">
        
        {/* LOGO */}
        <Link to='/'>
          <img 
            src={logo} 
            alt="AISiteBuilder Logo" 
            className="h-7 w-auto" 
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 transition duration-500">
          <Link to='/' className="hover:text-slate-300 transition">Home</Link>
          <Link to='/projects' className="hover:text-slate-300 transition">My Projects</Link>
          <Link to='/community' className="hover:text-slate-300 transition">Community</Link>
          <Link to='/pricing' className="hover:text-slate-300 transition">Pricing</Link>
        </div>

        {/* RIGHT ACTIONS (Auth + Mobile Menu Toggle) */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Conditional Auth Button / Avatar Dropdown */}
          {!isPending && (
            session?.user ? (
              <>
              <button className='bg-white/10 px-5 py-1.5 text-xs sm:text-sm border text-gray-200 rounded-full'>
              Credits : <span className='text-indigo-300'>{credits}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all">
                  <Avatar className="h-9 w-9 border border-slate-700">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                    <AvatarFallback className="bg-indigo-900 text-indigo-100 font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={8}
                  className="w-56 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 text-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Header Section with Inline Avatar */}
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/20 shadow-inner">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                          {session.user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5 overflow-hidden">
                        <p className="text-sm font-semibold leading-none truncate text-white">{session.user.name}</p>
                        <p className="text-xs leading-none text-slate-400 truncate mt-1">{session.user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  
                  {/* Menu Items */}
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10 hover:text-white cursor-pointer flex items-center gap-3 focus:bg-white/10 focus:text-white">
                    <Link to="/profile">
                      <User className="h-4 w-4 text-slate-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10 hover:text-white cursor-pointer flex items-center gap-3 focus:bg-white/10 focus:text-white">
                    <Link to="/settings">
                      <SettingsIcon className="h-4 w-4 text-slate-400" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  
                  {/* Destructive Action */}
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-500/15 text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-3 focus:bg-red-500/15 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <button 
                onClick={() => onOpenAuth('signin')} 
                className="px-5 py-2 bg-indigo-600 max-sm:text-sm active:scale-95 hover:bg-indigo-700 transition rounded-md font-medium"
              >
                Get started
              </button>
            )
          )}

          {/* HAMBURGER MENU BUTTON (Visible only on mobile) */}
          <button id="open-menu" className="md:hidden active:scale-90 transition p-1" onClick={() => setMenuOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>
            </svg>
          </button>

        </div>
      </nav>

      {/* MOBILE MENU FULL SCREEN OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 text-white backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300">
          <Link to='/' onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to='/projects' onClick={() => setMenuOpen(false)}>My Projects</Link>
          <Link to='/community' onClick={() => setMenuOpen(false)}>Community</Link>
          <Link to='/pricing' onClick={() => setMenuOpen(false)}>Pricing</Link>
          
          <button className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition text-black rounded-md flex" onClick={() => setMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* BACKGROUND IMAGE */}
      <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png" className="absolute inset-0 -z-10 size-full opacity-100 pointer-events-none" alt="" />
    </>
  );
};

export default Navbar;
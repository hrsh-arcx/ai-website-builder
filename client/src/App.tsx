import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import MyProjects from './pages/MyProjects'
import Projects from './pages/Projects'
import Preview from './pages/Preview'
import Community from './pages/Community'
import View from './pages/View'
import Pricing from './pages/Pricing'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { Toaster } from 'sonner'
import Loading from './pages/Loading'

const App = () => {
  const {pathname} = useLocation();
  const hideNavbar =  (pathname.startsWith('/projects/')&&pathname!=='/projects') || pathname.startsWith('/preview/') || pathname.startsWith('/view/') || pathname.startsWith('/auth/'); 

  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');

  const openAuth = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  return (
    <div>
      {!hideNavbar && <Navbar onOpenAuth={openAuth} />}
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/projects" element={<MyProjects />}/>
        <Route path="/projects/:projectId" element={<Projects />}/>
        <Route path="/preview/:projectId" element={<Preview />}/>
        <Route path="/preview/:projectId/:versionId" element={<Preview />}/>
        <Route path="/pricing" element={<Pricing/>}/>
        <Route path="/community" element={<Community />}/>
        <Route path="/view/:projectId" element={<View />}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultView={authView} 
      />
    </div>
  )
}

export default App
import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import MyProjects from './pages/MyProjects'
import Projects from './pages/Projects'
import Preview from './pages/Preview'
import Community from './pages/Community'
import View from './pages/View'
import Pricing from './pages/Pricing'
import Navbar from './components/Navbar'

const App = () => {
  const {pathname} = useLocation();
  const hideNavbar =  (pathname.startsWith('/projects/')&&pathname!=='/projects') || pathname.startsWith('/preview/') || pathname.startsWith('/view/'); 

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/projects" element={<MyProjects />}/>
        <Route path="/projects/:projectId" element={<Projects />}/>
        <Route path="/preview/:projectId" element={<Preview />}/>
        <Route path="/preview/:projectId/:versionId" element={<Preview />}/>
        <Route path="/pricing" element={<Pricing/>}/>
        <Route path="/community" element={<Community />}/>
        <Route path="/view/:projectId" element={<View />}/>
      </Routes>
    </div>
  )
}

export default App
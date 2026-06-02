import { useEffect, useState } from 'react'
import type { Project } from '../types'
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dummyProjects } from '../assets/assets'
import Footer from '../components/Footer'

const MyProjects = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate();
  
  const fetchProjects = async () => {
    setProjects(dummyProjects)

    setTimeout(()=>{
      setLoading(false)
    },1000)
  }

  const DeleteProject = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  }

  useEffect(()=>{
    fetchProjects();
  },[])

  return (
    <>
      <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
        {loading ? (
          <div className='flex items-center justify-center h-[80vh]'>
            <Loader2Icon className='size-7 animate-spin text-indigo-200'/>
          </div>
        ) : projects.length > 0 ? (
          <div className='py-10 min-h-[80vh]'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-white font-medium text-2xl'>My Projects</h1>
              <button className='flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2 mt-4 hover:scale-105 transition-transform duration-200' onClick={()=>navigate('/')}>
                <PlusIcon size={18} />Create New
              </button>
            </div>

            <div className='flex flex-wrap gap-3.5'>
              {projects.map((project)=>(
                <div key={project.id} onClick={()=>navigate(`/projects/${project.id}`)} className='relative group w-72 max-sm:mx-auto cursor-pointer rounded-lg overflow-hidden bg-gray-900/60 border border-gray-700 group shadow-md flex-col hover:shadow-indigo-700/30 hover:border indigo-800/80 transition-all duration-200'>
                  {/*Desktop Preview*/}
                  <div className='relative w-full h-40 overflow-hidden bg-gray-800 border-b border-gray-700'>
                    {project.current_code ? (
                      <iframe 
                      className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                      srcDoc={project.current_code}
                      sandbox="allow-scripts allow-same-origin"
                      style={{ transform: 'scale(0.25)' }}
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full text-gray-500'>
                        <h2 className='text-sm'>No preview available</h2>
                      </div>
                    )}
                  </div>

                  {/*Project Info*/}
                  <div className='p-4 text-white flex-1 flex flex-col'>
                      <div className='flex items-start justify-between'>
                        <h3 className='text-lg font-medium line-clamp-2'>{project.name}</h3>
                        <button className='px-2.5 py-0.5 mt-1 ml-2 text-sm bg-gray-700 border border-gray-600 rounded-full'>Website</button>
                      </div>
                      <p className='text-gray-400 text-sm mt-2 flex-1'>{project.initial_prompt}</p>
                      
                      <div onClick={(e)=>{e.stopPropagation();}} className='flex items-center justify-between mt-4 py-2 px-3'>
                        <span className='text-white text-xs'>{new Date(project.createdAt).toLocaleDateString()}</span>
                        <div className='flex items-center gap-2'>
                          <button onClick={()=>navigate(`/preview/${project.id}`)} className='px-2.5 py-0.5 text-sm bg-gray-700 border border-gray-600 rounded-lg'>Preview</button>
                          <button onClick={()=>navigate(`/projects/${project.id}`)} className='px-2.5 py-0.5 text-sm bg-gray-700 border border-gray-600 rounded-lg'>Open</button>
                        </div>
                      </div>
                  </div>
                  <div onClick={(e)=>{e.stopPropagation();}} className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                    <TrashIcon onClick={()=>DeleteProject(project.id)} size={20} className='absolute top-2 right-2 text-gray-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200'/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div  className='py-10 min-h-[80vh]'>
            <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
              <h1 className='text-white font-medium text-2xl'>You have no projects yet!</h1>
              <button onClick={()=>navigate('/')}className='flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2 mt-4 hover:scale-105 transition-transform duration-200'>
                <PlusIcon size={18} />Create New
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyProjects
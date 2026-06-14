import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {Project} from '../types';
import { ArrowBigDownDash, EyeIcon, EyeOffIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareIcon, SaveIcon, SmartphoneIcon, TabletIcon, XIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview';
import api from '../config/axios';
import { useSession } from '../lib/auth-client';
import { toast } from 'sonner';

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: session, isPending } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showEditorPanel = true;

  const previewRef = useRef<ProjectPreviewRef>(null);

  const fetchProject = async () => {
    try {
      const {data} = await api.get(`/api/user/project/${projectId}`);
      if(data){
        setProject(data);
        setIsGenerating(data.current_code ? false : true)
        setLoading(false)
      }
    } catch (error:any) {
      toast.error(error.message);
      console.log(error);
    }
  }

  const togglePublish = async () => {
    if(!previewRef.current) return;
    const code = previewRef.current.getCode();
    if(!code){
      toast.error('No code to publish!');
      return;
    };
    try {
      const {data} = await api.get(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message);
      setProject((prev)=> prev?({...prev, isPublished : !prev.isPublished}):null);
      setIsPublishing((prev)=> !prev);
    } catch (error:any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }
  }

  const saveFIle = async () => {
    if(!previewRef.current) return;
    const code = previewRef.current.getCode();
    if(!code){
      toast.error('No code to save!');
      return;
    };
    setIsSaving(true);
    try {
      const {data} = await api.put(`/api/project/save/${project?.id}`,{code : code});
      toast.success(data.message);
    } catch (error:any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }finally{
      setIsSaving(false);
    }
  }

  const downloadFile = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if(!code){
      alert('No code to download!');
      return;
    }

    const blob = new Blob([code], {type: 'text/html'});
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'index.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
  }

  useEffect(() => {
    if(session?.user){
      fetchProject();
    }else if(!isPending && !session?.user){
      navigate('/')
      toast.error('Please sign in to view your projects.');
    }
  },[session?.user])


  useEffect(() => {
    if(project && !project.current_code){
      const intervalId = setInterval(fetchProject,10000);
      return () => clearInterval(intervalId);
    }
    if(project?.isPublished){
      setIsPublishing(true);
    }
    else{
      setIsPublishing(false);
    }
  },[project])

  if(loading){
    return (
      <div className='flex items-center justify-center h-[80vh]'>
        <Loader2Icon className='animate-spin' />
      </div>
    )
  }


  return (
    <>
    {project ? (
      <div className='flex flex-col h-screen w-full bg-gray-900 text-white'>
        {/*Builder Navbar*/}
        <div className='flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar'>
          {/*Left*/}
          <div className='flex items-center gap-2 sm:min-w-90 text-nowrap'>
            <img onClick={() => navigate('/')} src="/public/favicon.svg" alt="Logo" className='h-6 cursor-pointer'/>
            <div className='max-w-64 sm:max-w-xs'>
              <p className='text-sm text-medium capitalize truncate'>{project.name}</p>
              <p className='text-gray-400 text-sm -mt-0.5'>Previewing the latest version</p>
            </div>
            <div className='sm:hidden flex-1 flex justify-end py-0'>
              {isMenuOpen ? <XIcon onClick={() => setIsMenuOpen(false)} className='size-6 cursor-pointer'/>
              : <MessageSquareIcon onClick={() => setIsMenuOpen(true)} className='size-6 cursor-pointer'/> }
            </div>
          </div>
          {/*Middle*/}
          <div className='hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md'>
            <SmartphoneIcon onClick={() => setDevice('mobile')} className={`size-6 p-1 rounded cursor-pointer ${device === 'mobile' ? 'bg-gray-500' : ''}`}/>
            <TabletIcon onClick={() => setDevice('tablet')} className={`size-6 p-1 rounded cursor-pointer ${device === 'tablet' ? 'bg-gray-500' : ''}`}/>
            <LaptopIcon onClick={() => setDevice('desktop')} className={`size-6 p-1 rounded cursor-pointer ${device === 'desktop' ? 'bg-gray-500' : ''}`}/>
          </div>
          {/*Right*/}
          <div className='flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm'>
            <button onClick={saveFIle} disabled={isSaving} className='max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700'>
              {isSaving ? <Loader2Icon className='animate-spin' size={16}/> : <SaveIcon size={16}/>} 
              Save
            </button >
            <Link to={`/preview/${projectId}`} target='_blank' className="flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-gray-500 transition-colors">
              <FullscreenIcon size={16}/>Preview
            </Link>
            <button onClick={downloadFile} className='bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
              <ArrowBigDownDash size={16}/> Download
            </button>
            <button onClick={togglePublish} className='bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
              {isPublishing ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
              {isPublishing ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
        <div className='flex-1 flex overflow-auto'>
          <div>
            <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={setProject} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>
          </div>
          <div className='flex-1 p-2 pl-0'>
            <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device} showEditorPanel={showEditorPanel}/>
          </div>
        </div>
      </div>
    ) : (
      <div className='flex items-center justify-center h-[80vh] flex-col gap-4'>
        <h1 className='text-white text-lg'>Project not found</h1>
      </div>
    )}
    </>
  )
}

export default Projects
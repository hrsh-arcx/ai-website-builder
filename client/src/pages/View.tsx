import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';
import { toast } from 'sonner';
import api from '../config/axios';

const View = () => {

  const {projectId} = useParams();

  const [code,setCode] = useState<string | undefined>('')
  const [loading,setLoading] = useState(true)
  
  const fetchCode = async () => {
    try {
      const {data} = await api.get(`/api/project/published/${projectId}`);
      setCode(data.code);
      setLoading(false);
    } catch (error:any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCode();
  },[projectId])

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200'/>
      </div>
    )
  }

  if(!code){
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Project not found</p>
      </div>
    )
  }

  return (
    <div className='h-screen'>
      {code && 
      <ProjectPreview 
        project={{current_code:code} as Project} 
        isGenerating={false} 
        showEditorPanel={false} 
      />}
    </div>
  )
}

export default View
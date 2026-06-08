import { forwardRef, useRef } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets';

interface ProjectPreviewProps {
    project : Project;
    isGenerating : boolean;
    device? : 'mobile' | 'tablet' | 'desktop';
    showEditorPanel : boolean;
}
export interface ProjectPreviewRef {
    getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({project,isGenerating,device='desktop',showEditorPanel=true},ref) => {

  const iframeRef = useRef<HTMLIFrameElement>(null); 

  const injectPreview = (html:string)=>{
    if(!html) return '';
    if(!showEditorPanel) return html;

    if(html.includes('</body>')) return html.replace('</body>',iframeScript + '</body>');
    else return html + iframeScript;
  }

  const resolutions = (device: 'mobile' | 'tablet' | 'desktop') => {
    if(device === 'mobile') return 'w-[412px]'
    if(device === 'tablet') return 'w-[768px]'
    return 'w-full';
  }

  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ? (
            <>
                <iframe 
                ref={iframeRef}
                srcDoc={injectPreview(project.current_code)}
                className={`h-full ${resolutions(device)} mx-auto transition-all`}
                />
            </>
        ) : (
            <>
                Loading...
            </>
        )}
    </div>
  )
})

export default ProjectPreview
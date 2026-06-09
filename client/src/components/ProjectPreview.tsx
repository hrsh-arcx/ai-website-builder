import { forwardRef, useEffect, useRef, useState } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';

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
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const injectPreview = (html:string)=>{
    if(!html) return '';
    if(!showEditorPanel) return html;

    if(html.includes('</body>')) return html.replace('</body>',iframeScript + '</body>');
    else return html + iframeScript;
  }

  const handleUpdate = (updates: any)=>{
    if(iframeRef.current?.contentWindow){
        iframeRef.current.contentWindow.postMessage({
            type:'UPDATE_ELEMENT',
            payload:updates
        },'*');
    }
  }

  const resolutions = (device: 'mobile' | 'tablet' | 'desktop') => {
    if(device === 'mobile') return 'w-[412px]'
    if(device === 'tablet') return 'w-[768px]'
    return 'w-full';
  }

  useEffect(()=>{
    const handleMessage = (event: MessageEvent)=>{
        if(event.data.type === 'ELEMENT_SELECTED'){
            setSelectedElement(event.data.payload);
        }
        else if(event.data.type === 'CLEAR_SELECTION'){
            setSelectedElement(null);
        }
    }
    window.addEventListener('message',handleMessage);
    return ()=>{
        window.removeEventListener('message',handleMessage);
    }
  },[])

  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ? (
            <>
                <iframe 
                ref={iframeRef}
                srcDoc={injectPreview(project.current_code)}
                className={`h-full ${resolutions(device)} mx-auto transition-all`}
                />
                {showEditorPanel && selectedElement && (
                    <EditorPanel selectedElement={selectedElement}
                        onUpdate={handleUpdate} 
                        onClose={()=>{
                            setSelectedElement(null);
                            if(iframeRef.current?.contentWindow){
                                iframeRef.current.contentWindow.postMessage({
                                    type:'CLEAR_SELECTION_REQUEST'}
                                ,'*');
                            }
                        }}
                    />                
                )}
            </>
        ) : (
            <>
                {isGenerating && (
                    <div>loading</div>
                )}
            </>
        )}
    </div>
  )
})

export default ProjectPreview
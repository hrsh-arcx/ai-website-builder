import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';
import LoaderSteps from './LoaderSteps';

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

    useImperativeHandle(ref, () => ({
        getCode: () => {
            const doc = iframeRef.current?.contentDocument;
            if(!doc) return undefined;

            doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el)=>{
                el.classList.remove('ai-selected-element');
                el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            })

            const previewStyle = doc.getElementById('ai-preview-style');
            const previewScript = doc.getElementById('ai-preview-script');

            if(previewStyle) previewStyle.remove();
            if(previewScript) previewScript.remove();

            let cleanHtml = doc.body.outerHTML;

            if (!cleanHtml.includes('cdn.tailwindcss.com')) {
                const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';
                
                if (cleanHtml.includes('<head>')) {
                    cleanHtml = cleanHtml.replace('<head>', `<head>\n    ${tailwindCDN}`);
                } else if (cleanHtml.includes('<html>')) {
                    cleanHtml = cleanHtml.replace('<html>', `<html>\n<head>\n    ${tailwindCDN}\n</head>`);
                } else {
                    cleanHtml = `<head>\n    ${tailwindCDN}\n</head>\n` + cleanHtml;
                }
            }

            return cleanHtml;
        }
    }))

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
                    <LoaderSteps />
                )}
            </>
        )}
    </div>
  )
})

export default ProjectPreview
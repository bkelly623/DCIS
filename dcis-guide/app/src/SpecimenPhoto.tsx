import {useRef,useState} from 'react';
/** Real photographs only. Native dialog provides focus containment and Escape. */
export function SpecimenPhoto({src,alt}:{src:string;alt:string}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [failed,setFailed]=useState(false);
 const [opened,setOpened]=useState(false);
 if(failed) return <p role="status">Photograph unavailable. Use the written observation or continue to another specimen.</p>;
 return <><button className="photo-open" onClick={()=>{setOpened(true);dialog.current?.showModal();}} aria-label={`Enlarge photograph: ${alt}`}><img src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)}/><span>↗ View photograph</span></button><dialog ref={dialog} className="specimen-lightbox" aria-label={`Photograph: ${alt}`} onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();dialog.current?.querySelector<HTMLButtonElement>('.lightbox-close')?.focus();}}} onClose={()=>setOpened(false)}><button autoFocus className="lightbox-close" onClick={()=>dialog.current?.close()}>Close photograph ×</button>{opened&&<img src={src} alt={alt}/>}<p>{alt}</p></dialog></>;
}

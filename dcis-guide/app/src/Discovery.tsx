import React from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles, Trophy, Compass, ChevronRight, Footprints } from 'lucide-react';
import './discovery.css';

function Crystal({celebrate=false}:{celebrate?:boolean}) {
 return <svg className="crystal-friend" viewBox="0 0 360 290" role="img" aria-label={celebrate?'A happy crystal explorer celebrating your discovery':'A curious crystal explorer with a magnifying glass'}>
  <ellipse cx="180" cy="260" rx="95" ry="13" fill="#242557" opacity=".12"/>
  <g className="crystal-body"><path d="M92 184L105 76 172 27 245 67 265 186 189 249Z" fill="#6d56f4" stroke="#292451" strokeWidth="7" strokeLinejoin="round"/>
  <path d="M105 76L173 94 245 67 212 182 189 249 153 175Z" fill="#9989ff"/>
  <path d="M172 27L173 94 105 76Z" fill="#ded7ff"/><path d="M173 94L212 182 245 67Z" fill="#bbafff"/>
  <ellipse cx="156" cy="136" rx="17" ry="22" fill="white"/><ellipse cx="211" cy="132" rx="17" ry="22" fill="white"/>
  <ellipse cx="161" cy="140" rx="7" ry="11" fill="#242557"/><ellipse cx="215" cy="135" rx="7" ry="11" fill="#242557"/>
  <path d={celebrate?'M161 177Q184 216 210 170Z':'M171 178Q188 191 202 175'} stroke="#242557" strokeWidth="6" fill={celebrate?'white':'none'} strokeLinecap="round"/>
  <path d="M99 181Q62 176 67 150M260 181L285 159" stroke="#292451" strokeWidth="9" fill="none" strokeLinecap="round"/>
  <circle cx="289" cy="129" r="29" fill="#baf8ed" fillOpacity=".7" stroke="#292451" strokeWidth="8"/><path d="M271 151L259 172" stroke="#292451" strokeWidth="10" strokeLinecap="round"/>
  <path d="M154 239L144 258M207 238L220 257" stroke="#292451" strokeWidth="9" strokeLinecap="round"/></g>
  <g fill="#ffb547"><path d="M56 60l6 15 16 5-16 6-6 16-5-16-16-6 16-5z"/><path d="M290 38l4 10 11 4-11 4-4 11-4-11-10-4 10-4z"/></g>
 </svg>;
}
const BADGE='dcis-glow-discovery-v1';
export function Discovery({onMap,onPaths,onOrientation}:{onMap:(id?:string)=>void;onPaths:()=>void;onOrientation:()=>void}) {
 const [step,setStep]=React.useState<'home'|'predict'|'observe'|'reward'>(()=>{try{const resume=sessionStorage.getItem('dcis-glow-resume');sessionStorage.removeItem('dcis-glow-resume');return resume==='predict'||resume==='observe'?resume:'home'}catch{return 'home'}});
 function openMap(){try{sessionStorage.setItem('dcis-glow-resume',step)}catch{}onMap("4")}
 const [prediction,setPrediction]=React.useState(()=>{try{return sessionStorage.getItem('dcis-glow-prediction') ?? ''}catch{return ''}});
 React.useEffect(()=>{try{sessionStorage.setItem('dcis-glow-prediction',prediction);sessionStorage.setItem('dcis-glow-resume',step)}catch{}},[prediction,step]);
 const [collected,setCollected]=React.useState(()=>{try{return localStorage.getItem(BADGE)==='yes'}catch{return false}});
 const title=React.useRef<HTMLHeadingElement>(null);
 React.useEffect(()=>{if(step!=='home')title.current?.focus()},[step]);
 function collect(){setCollected(true);try{localStorage.setItem(BADGE,'yes')}catch{}setStep('reward')}
 return <section className="discovery">
  <div className="discovery-top"><span><Sparkles size={16}/> YOUR MUSEUM. YOUR ADVENTURE.</span><span className="discovery-count"><Trophy size={16}/>{collected?'1':'0'} discovery</span></div>
  {step==='home'?<>
   <div className="arrival-hero"><img src="/assets/mineral-hall/DCIS-WR-000037-uv.webp" alt="Scheelite photographed under ultraviolet illumination"/><div><span className="mini-label">THE COLLECTION, UP CLOSE</span><h1>A closer look.<br/><em>A new discovery.</em></h1><p>Explore real minerals, find your way through the museum, and follow your curiosity.</p><button className="play-button" onClick={()=>onMap("4")}>Explore Mineral Hall <ArrowRight/></button><button className="arrival-map" onClick={onOrientation}><Compass/> Museum map <ArrowRight/></button></div></div>
   <div className="adventure-options"><button onClick={()=>setStep('predict')}><span className="option-icon mint"><Sparkles/></span><span><strong>Find my first discovery</strong><small>Try the Case 4 light activity</small></span><ChevronRight/></button><button onClick={onPaths}><span className="option-icon peach"><Footprints/></span><span><strong>Make a day of it</strong><small>Three self-guided observation walks</small></span><ChevronRight/></button></div>
   {collected&&<div className="saved-discovery"><Trophy/> Glow Detective is in your collection. Ready to look again?</div>}
  </>:<div className="mission-shell">
   <button className="mission-back" onClick={()=>setStep(step==='observe'?'predict':'home')}><ArrowLeft size={18}/> {step==='observe'?'Your prediction':'Explore'}</button>
   <div className="mission-progress" aria-label={`Discovery step ${step==='predict'?1:step==='observe'?2:3} of 3`}>{[1,2,3].map(n=><span key={n} className={n<=(step==='predict'?1:step==='observe'?2:3)?'filled':''}/>)}</div>
   {step==='predict'?<><span className="mini-label">01 / MAKE A GUESS</span><h1 ref={title} tabIndex={-1}>Can a rock<br/><em>steal the spotlight?</em></h1><p>At Case 4, the lighting can make some minerals glow. What do you think happens when a different light is switched on?</p><div className="prediction-choices">{['The same minerals glow.','Different minerals might glow.','No idea. Let’s find out!'].map(a=><button key={a} className={prediction===a?'chosen':''} onClick={()=>setPrediction(a)}>{a}{prediction===a&&<Check/>}</button>)}</div><button className="play-button" disabled={!prediction} onClick={()=>setStep('observe')}>Test my guess <ArrowRight/></button><button className="mission-link" onClick={openMap}><MapPin size={16}/> Find Case 4 on the map</button></>:
   step==='observe'?<><span className="mini-label">02 / LOOK UP. THE MAGIC IS REAL.</span><h1 ref={title} tabIndex={-1}>Meet the<br/><em>glow-getters.</em></h1><div className="glow-scene" aria-hidden="true"><span/><span/><span/></div><p className="scene-caption">Illustration—not a live view of the cabinet</p><ol className="observation-steps"><li>Find the fluorescent minerals in <strong>Case 4</strong>.</li><li>With the normal case lights off, try the first display-light switch.</li><li>Try the other switch. Which additional rocks glow?</li></ol><p className="help-note">If the controls aren’t available, ask a guide for a demonstration.</p><button className="play-button" onClick={collect}>I spotted the glow <Sparkles/></button><button className="mission-link" onClick={()=>setStep('home')}>Not at the case yet? Back to exploring.</button></>:
   <><span className="mini-label">03 / DISCOVERY COLLECTED</span><h1 ref={title} tabIndex={-1}>You’re a<br/><em>Glow Detective.</em></h1><div className="reward-art"><Crystal celebrate/></div><div className="discovery-fact"><strong>Same rock. A different kind of light.</strong><p>Fluorescent minerals absorb energy from light and release some of it as visible light. Different minerals can respond differently to the light used.</p><small>Fluorescence happens during illumination; glowing after the light is off is called phosphorescence.</small></div><p className="help-note">Your discovery is saved on this device.</p><button className="play-button" onClick={openMap}>Browse Mineral Hall <ArrowRight/></button><button className="mission-link" onClick={()=>setStep('home')}>Back to exploring</button></>}
  </div>}
 </section>;
}

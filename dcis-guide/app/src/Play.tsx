import React from 'react';
import './play.css';

const normal = '/assets/mineral-hall/DCIS-WR-000037-normal.webp';
const ultraviolet = '/assets/mineral-hall/DCIS-WR-000037-uv.webp';
function Lens({ excited = false }: { excited?: boolean }) {
  return <g className={`play-lens ${excited ? 'excited' : ''}`}>
    <path d="M294 216q-17 12-18 27M343 215q16 4 19-10" fill="none" stroke="#b85832" strokeWidth="11" strokeLinecap="round"/>
    <path d="M304 258l-8 16m37-16 9 16" stroke="#803e36" strokeWidth="12" strokeLinecap="round"/>
    <rect x="286" y="182" width="64" height="80" rx="27" fill="#ee8650"/>
    <path d="M291 216q27-11 53 1v22q-27 17-53-1" fill="#f6a85e"/>
    <circle cx="318" cy="191" r="41" fill="#cf633d"/><circle cx="318" cy="186" r="36" fill="#ffbd76"/>
    <circle cx="318" cy="186" r="27" fill="#ffefc7"/>
    <path d="M299 172q8-12 20-10" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
    <g className="play-eyes"><ellipse cx="311" cy="185" rx="4" ry={excited ? 8 : 6} fill="#293e4b"/><ellipse cx="328" cy="185" rx="4" ry={excited ? 8 : 6} fill="#293e4b"/></g>
    {excited ? <ellipse cx="319" cy="201" rx="7" ry="8" fill="#803e36"/> : <path d="M314 199q6 6 11-1" fill="none" stroke="#803e36" strokeWidth="3" strokeLinecap="round"/>}
  </g>;
}
function SpecimenArt({ glow = false }: { glow?: boolean }) {
 return <svg className={`play-art ${glow ? 'glowing' : ''}`} viewBox="0 0 400 300" role="img" aria-label={glow ? 'Stylized scheelite illustration with glowing blue patches and a surprised lens companion' : 'Stylized scheelite illustration: pale patches across a dark rough rock, watched by a curious lens companion'}>
 <ellipse cx="194" cy="264" rx="153" ry="17" fill="#dce8de"/>
 <g className="play-rock">
 <path d="M48 106Q38 84 66 75L119 63 154 75 174 53 211 68 238 59Q259 63 270 96L283 151 270 203 238 224 218 247 111 246 87 225 67 215 54 174Z" fill="#394e53"/>
 <path d="M48 106 79 122 87 183 111 211 218 214 270 188 270 203 238 224 218 247 111 246 87 225 67 215 54 174Z" fill="#293d43"/>
 <path d="M69 91 96 80 108 106 96 122 104 149 82 158 68 131ZM124 84 153 86 171 67 183 91 208 81 221 108 207 135 174 140 157 125 146 153 119 136 108 108ZM240 79 259 108 254 133 272 159 252 192 226 197 213 175 228 153 217 123ZM101 216 114 202 130 213 135 239 107 236Z" className="play-patches" fill="#e8d9a9"/>
 <g fill="#f6ebc7" className="play-facets"><path d="m81 98 12-8 7 21-14 8zM133 99l18-6 12 23-25 5zM174 85l12 19 21-12-10 25-20 4zM235 109l14-11 4 27-16 8zM235 157l18-6-6 25-19 2z"/></g>
 <g fill="#52686a"><path d="m114 167 13-12 10 18-17 6zM174 176l19-21 12 20-17 14zM79 185l12 7-5 15zM202 224l17-5-10 16z"/></g>
 </g>
 <g className="play-rays" fill="none" stroke="#5a98ff" strokeWidth="5" strokeLinecap="round"><path d="m51 49-9-14m105-6-1-17m100 26 10-14M25 152H12m273-92 11-8"/></g>
 <Lens excited={glow}/>
 </svg>;
}
type SavedPlay = {choice: 'pale' | 'dark' | null; view: 'normal' | 'uv'; finished: boolean};
const freshPlay = (): SavedPlay => ({choice:null, view:'uv', finished:false});
let playMemory = freshPlay();
function readPlay(): SavedPlay {
 try {
  const value = JSON.parse(localStorage.getItem('dcis-play-v1') || 'null');
  if (value && [null,'pale','dark'].includes(value.choice) && ['normal','uv'].includes(value.view) && typeof value.finished === 'boolean' && (!value.finished || value.choice)) return value;
  return freshPlay();
 } catch { return playMemory; }
}
export function Play() {
 const [initial] = React.useState(readPlay);
 const [choice, setChoice] = React.useState(initial.choice);
 const [view, setView] = React.useState(initial.view);
 const [finished, setFinished] = React.useState(initial.finished);
 const [storageIssue, setStorageIssue] = React.useState(false);
 React.useEffect(()=>{
  playMemory = {choice,view,finished};
  try { localStorage.setItem('dcis-play-v1',JSON.stringify(playMemory)); }
  catch { setStorageIssue(true); }
 },[choice,view,finished]);
 const [help, setHelp] = React.useState(false);
 const [animating, setAnimating] = React.useState(false);
 React.useEffect(()=>{const image = new Image(); image.src = ultraviolet;},[]);
 React.useEffect(()=>{if(!animating)return;const timer=window.setTimeout(()=>setAnimating(false),1100);return()=>window.clearTimeout(timer);},[animating]);
 function predict(answer:'pale'|'dark') {setChoice(answer);setView('uv');setAnimating(true);}
 function replay() {setChoice(null);setFinished(false);setView('uv');setAnimating(false);setHelp(false);}
 return <section className="play-proof" aria-label="Scheelite discovery">
   {storageIssue && <p role="status">Storage is unavailable. Progress lasts in this tab, but may not survive a reload.</p>}
   <div className="play-topline"><a href="#map/minerals/4">Mineral Hall <span> / Map 4</span></a><button onClick={()=>setHelp(!help)} aria-expanded={help} aria-label="About this discovery">?</button></div>
   {help && <aside className="play-help"><strong>Find the fluorescent collection</strong><p>Look for the Scheelite label, at the left of the upper row in the recorded arrangement. You can play using the photographs from anywhere.</p><p>Only a trained docent operates the cabinet lighting. This activity uses recorded photographs; their framing differs.</p><p>Source: DCIS public Scheelite record and recorded normal / UV views. <a href="https://www.handbookofmineralogy.org/pdfs/scheelite.pdf" target="_blank" rel="noreferrer">Scheelite mineral reference ↗</a></p></aside>}
   <div className="play-layout">
    <div className={`play-stage ${choice ? 'revealed' : ''} ${animating ? 'is-revealing' : ''}`}>
      <div className="play-stage-label"><span className="play-dot"/>{choice && !animating ? 'THE REAL SPECIMEN' : 'LOOK TWICE'}</div>
      {!choice || animating ? <><SpecimenArt glow={!!choice}/><span className="play-art-caption">Scheelite · stylized illustration</span></> : <figure className="play-photo"><img key={view} src={view === 'uv' ? ultraviolet : normal} alt={view === 'uv' ? 'Recorded UV photograph: scheelite patches glow bright blue against dark material' : 'Recorded normal-light photograph: pale patches on the dark scheelite specimen'}/><figcaption>Recorded {view === 'uv' ? 'UV' : 'normal-light'} photograph</figcaption></figure>}
      {!choice && <div className="play-specimen-tag">SCHEELITE <span>Not much to look at. Yet.</span></div>}
      {choice && <div className="play-photo-tabs" aria-label="Recorded photographs"><button aria-pressed={view === 'normal'} onClick={()=>{setAnimating(false);setView('normal');}}>Normal light</button><button aria-pressed={view === 'uv'} onClick={()=>{setAnimating(false);setView('uv');}}>UV light</button></div>}
    </div>
    <div className="play-story" aria-live="polite">
      <div className="play-eyebrow">{finished ? 'ONE SECRET, DISCOVERED' : choice ? 'SAME ROCK. DIFFERENT LIGHT.' : 'A LITTLE MUSEUM MYSTERY'}</div>
      <h1>{finished ? <>It was hiding<br/>in the light.</> : choice ? <>Hello, <br/><em>electric blue.</em></> : <>This rock has<br/>a secret.</>}</h1>
      {!choice ? <><p>Under ultraviolet light, part of this rock glows. <strong>Which part would you bet on?</strong></p><div className="play-choices"><button onClick={()=>predict('pale')}><span className="play-chip pale"/>The pale patches<span>↗</span></button><button onClick={()=>predict('dark')}><span className="play-chip dark"/>The dark rock<span>↗</span></button></div><span className="play-micro">Make a guess. See the real reveal.</span></> : finished ? <><p>The pale patches give off <strong>blue light under UV.</strong> That’s fluorescence—not blue paint.</p><div className="play-takeaway">Next time a rock looks ordinary,<br/><strong>ask what a different light might reveal.</strong></div><button className="play-primary" onClick={replay}>↻ Play again</button><a className="play-back" href="#map/minerals/4">Find it in Mineral Hall →</a></> : <><p className="play-feedback">{choice === 'pale' ? 'You called it. The pale patches light up blue!' : 'A good twist: it’s the pale patches, not the dark rock, that light up blue.'}</p><p>They absorb UV energy and release visible light. That’s <strong>fluorescence.</strong></p><button className="play-primary" onClick={()=>{setAnimating(false);setFinished(true);}}>That’s a rock worth a second look <span>→</span></button></>}
    </div>
   </div>
 </section>;
}

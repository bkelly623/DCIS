import React from 'react';
import { mineralMapItems, mineralBrowseDisplays, specimensForDisplay } from './mineralHallKnowledge';
import { MineralSpecimenCard } from './MineralSpecimenCard';
const displays=[...mineralMapItems,...mineralBrowseDisplays];
const records=displays.flatMap(d=>specimensForDisplay(d.displayId)).filter(r=>r.type!=='exhibit identity'&&r.images?.length);
export function Collection({onMap}:{onMap:(id:string)=>void}) {
 const [query,setQuery]=React.useState('');
 const [category,setCategory]=React.useState('');
 const [display,setDisplay]=React.useState('');
 const [focus,setFocus]=React.useState<string|null>(null);
 const selected=records.find(r=>r.id===focus);
 const categories=['Quartz & varieties','Calcite','Two lighting views'];
 const inCategory=(r:typeof records[number])=>!category||(category==='Quartz & varieties'?/quartz|amethyst|chalcedony|agate/i.test(r.name):category==='Calcite'?/calcite/i.test(r.name):(r.images?.length||0)>1);
 const filtered=records.filter(r=>(!display||r.displayId===display)&&inCategory(r)&&`${r.name} ${r.description} ${r.hook} ${r.displayLabel}`.toLowerCase().includes(query.toLowerCase().trim()));
 const location=selected&&displays.find(d=>d.displayId===selected.displayId);
 function open(id:string|null){setFocus(id);window.scrollTo(0,0);}
 return <section className="screen collection-screen">
 {selected?<><button className="text-button" onClick={()=>open(null)}>← Back to collection</button><div className="collection-focus"><MineralSpecimenCard key={selected.id} record={selected}/><aside><p className="kicker">In Mineral Hall</p><h2>{location?.label}</h2><p>{location?.summary}</p><p className="experience-note">Map numbers are guide references, not cabinet sticker numbers.</p><button className="experience-primary" onClick={()=>onMap(location!.id)}>Find on map →</button><p>Use the photograph to match the specimen, then open “Look closer” for a detail to notice.</p></aside></div></>:<><header className="collection-heading"><div><p className="kicker">Mineral Hall / Selected objects</p><h1>A cabinet of curiosities.</h1></div><p>Start with what catches your eye.<br/>Meet the specimen. Find its story.</p></header><div className="collection-filters"><label>Search the collection<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try quartz, shapes or a place"/></label><label>Category<select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Display<select aria-label="Display" value={display} onChange={e=>setDisplay(e.target.value)}><option value="">Every display</option>{displays.filter(d=>records.some(r=>r.displayId===d.displayId)).map(d=><option key={d.id} value={d.displayId}>{d.label}</option>)}</select></label></div><p className="collection-count" aria-live="polite">{filtered.length} of {records.length} selected specimens · Not a complete catalog</p><div className="collection-grid">{filtered.map(r=><button className="collection-tile" key={r.id} data-record-id={r.id} onClick={()=>open(r.id)}><div className="collection-image"><img src={r.images![0].src} alt={r.images![0].alt} loading="lazy"/><span>Explore ↗</span></div><small>{displays.find(d=>d.displayId===r.displayId)?.label}</small><h2>{r.name}</h2><p>{r.hook}</p></button>)}</div>{!filtered.length&&<div className="collection-empty"><h2>No specimens match those filters.</h2><button onClick={()=>{setQuery('');setCategory('');setDisplay('');}}>Show the whole selection</button></div>}</>}
 </section>;
}

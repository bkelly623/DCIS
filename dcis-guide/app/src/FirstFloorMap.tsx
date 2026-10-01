import React from 'react';
import { ArrowLeft, ArrowUpRight, MapPinned } from 'lucide-react';
import './first-floor-map.css';

// Curated public schematic only. No full-building model is imported.
export const publicFloorShapes = {
  hall: 'M195 217.5 H640 V545 H375 V325 H195 Z',
  inner: 'M195 450 H375 V545 H195 Z',
  entrance: 'M195 545 H375 V700 H195 Z',
  amenities: 'M45 545 H195 V700 H45 Z',
  special: 'M375 545 H640 V700 H375 Z',
};
const notes = {
  entrance: ['Front entrance', 'Continue through the inner entrance, then turn right into Mineral Hall.'],
  amenities: ['Stairs & bathroom', 'Stairs to floor 2 and the visitor bathroom are in this area. Ask a guide for the bathroom door.'],
  special: ['Special Exhibit Room', 'Enter from Mineral Hall through the connecting doorway.'],
};
type Place = keyof typeof notes;
export function FirstFloorMap({onBack,onMinerals}:{onBack:()=>void;onMinerals:()=>void}) {
  const [place, setPlace] = React.useState<Place>('entrance');
  const heading = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(()=>{heading.current?.focus()},[]);
  const select = (key:Place) => ({role:'button',tabIndex:0,'aria-pressed':place===key,onClick:()=>setPlace(key),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setPlace(key)}}});
  return <section className="floor-map-screen">
    <button className="floor-back" onClick={onBack}><ArrowLeft size={18}/> Back to exploring</button>
    <div className="floor-heading"><div><span className="floor-eyebrow"><MapPinned size={16}/> YOUR MUSEUM MAP</span><h1 ref={heading} tabIndex={-1}>First floor</h1></div><span className="floor-level">01</span></div>
    <p className="floor-intro">Step inside. Find your next wonder.</p>
    <div className="floor-layout"><div className="floor-plan-card">
      <svg className="public-floor-plan" viewBox="15 185 655 565" role="group" aria-labelledby="floor-title floor-desc">
        <title id="floor-title">First-floor visitor map</title>
        <desc id="floor-desc">Front entrance at bottom center; inner entrance immediately above, with a doorway right into the L-shaped Mineral Hall. Special Exhibit Room is below the hall, connected by a doorway. Stairs and visitor bathroom share the full entrance-side zone on the left. Schematic, not to scale; bathroom symbols indicate an area, not an exact door.</desc>
        <g className="floor-room floor-hall" role="button" tabIndex={0} aria-label="Mineral Hall — open exhibit map" onClick={onMinerals} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onMinerals()}}}>
          <path d={publicFloorShapes.hall}/><g className="floor-label"><text x="418" y="269">Mineral Hall</text><text className="floor-sub" x="418" y="297">Explore 19 displays ↗</text><path className="floor-gem" d="M490 380 L512 361 534 380 512 412 Z M490 380 H534 M512 361 V412"/><text className="floor-sub" x="508" y="449">Main gallery</text></g>
        </g>
        <g {...select('entrance')} className={`floor-room floor-entry ${place==='entrance'?'is-selected':''}`} aria-label="Front and inner entrances">
          <path d={publicFloorShapes.inner}/><path d={publicFloorShapes.entrance}/>
          <g className="floor-label"><text x="285" y="490">Inner</text><text x="285" y="518">entrance</text><text x="285" y="610">Front</text><text x="285" y="639">entrance</text></g>
        </g>
        <g {...select('amenities')} className={`floor-room floor-amenities ${place==='amenities'?'is-selected':''}`} aria-label="Stairs and visitor bathroom area">
          <path d={publicFloorShapes.amenities}/><g className="floor-label"><path className="floor-stair" d="M62 563 H108 M62 571 H108 M62 579 H108 M62 587 H108 M62 595 H108 M62 603 H108"/><text x="150" y="588">WC</text><text className="floor-sub" x="120" y="633">Stairs to floor 2</text><text className="floor-sub" x="120" y="657">Visitor bathroom</text></g>
        </g>
        <g {...select('special')} className={`floor-room floor-special ${place==='special'?'is-selected':''}`} aria-label="Special Exhibit Room">
          <path d={publicFloorShapes.special}/><g className="floor-label"><text x="508" y="610">Special</text><text x="508" y="639">Exhibit Room</text></g>
        </g>
        <g className="floor-door" aria-hidden="true"><path d="M274 700 H301 M274 545 H301 M375 481 V509 M426 545 H454 M195 582 V615"/><path className="floor-door-leaf" d="M274 700 V722 M274 545 V568 M375 481 H397 M426 545 V568"/></g>
        <g className="floor-windows" aria-hidden="true"><path d="M640 332 V382 M640 445 V495 M418 700 H468 M550 700 H600 M640 615 V652"/></g>
        <g className="floor-label" aria-hidden="true"><text className="floor-sub" x="286" y="743">FRONT DOORS</text></g>
      </svg>
      <div className="floor-legend"><span><i/> Public rooms</span><span>Gaps mark doorways</span><span>Not to scale</span></div>
    </div><aside className="floor-companion">
      <button className="floor-detail-link" onClick={onMinerals}><span className="floor-eyebrow">TAKE A CLOSER LOOK</span><strong>Mineral Hall <ArrowUpRight/></strong><span>Open the numbered exhibit map</span></button>
      <div className="floor-selection" aria-live="polite"><span className="floor-eyebrow">AROUND THE FIRST FLOOR</span><h2>{notes[place][0]}</h2><p>{notes[place][1]}</p></div>
      <p className="floor-footnote">Bathroom location is approximate. Ask a guide about step-free access.</p>
      <details className="upper-floor-help"><summary>Visiting the upper floors</summary><p>Ask a guide which areas are open today. The public stairs lead to floor 2. Upper-floor plans are not included here. On floor 3, the two aisles are out-and-back routes: there is no loop at the far end.</p></details>
    </aside></div>
  </section>;
}

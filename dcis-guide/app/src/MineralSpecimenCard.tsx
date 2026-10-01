import { useState } from 'react';
import type { MineralSpecimenRecord } from './mineralHallKnowledge';
import './mineral-cards.css';
import { SpecimenPhoto } from './SpecimenPhoto';
export function MineralSpecimenCard({ record }: { record: MineralSpecimenRecord }) {
  const [view, setView] = useState(0);
  const image = record.images?.[view];
  return <article className="mineral-card" data-record-id={record.id}>
    {image && <SpecimenPhoto src={image.src} alt={image.alt}/>}
    {record.images && record.images.length > 1 && <div aria-label="Photograph views">{record.images.map((item, index) => <button key={item.src} aria-pressed={view === index} onClick={() => setView(index)}>{item.label ?? `View ${index + 1}`}</button>)}</div>}
    <h3>{record.name}</h3>
    {record.hook && <strong>{record.hook}</strong>}
    {record.description && <p>{record.description}</p>}
    {record.observationPrompt && <details><summary>Look closer</summary><p>{record.observationPrompt}</p></details>}
  </article>;
}

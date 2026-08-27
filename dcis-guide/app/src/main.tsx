import React from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  Binoculars,
  Camera,
  ClipboardCheck,
  Compass,
  Database,
  FileSearch,
  Map,
  Mic,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { type ExhibitZone, workflows, zones } from "./data";
import "./styles.css";

type DraftRecord = {
  id: string;
  zoneId: string;
  zoneName: string;
  room: string;
  note: string;
  evidence: string[];
  status: "draft" | "approved" | "private";
  createdAt: string;
};

function App() {
  const [activeZoneId, setActiveZoneId] = React.useState(zones[0].id);
  const [activeView, setActiveView] = React.useState<"visitor" | "builder" | "review" | "map" | "validation">("visitor");
  const [question, setQuestion] = React.useState("");
  const [guideStyle, setGuideStyle] = React.useState("Curious docent");
  const [drafts, setDrafts] = React.useState<DraftRecord[]>(() => {
    const saved = window.localStorage.getItem("dcis-guide-drafts");
    return saved ? JSON.parse(saved) as DraftRecord[] : [];
  });
  const activeZone = zones.find((zone) => zone.id === activeZoneId) ?? zones[0];

  React.useEffect(() => {
    window.localStorage.setItem("dcis-guide-drafts", JSON.stringify(drafts));
  }, [drafts]);

  function createDraft(note: string) {
    const trimmedNote = note.trim();
    const draft: DraftRecord = {
      id: crypto.randomUUID(),
      zoneId: activeZone.id,
      zoneName: activeZone.name,
      room: activeZone.room,
      note: trimmedNote || activeZone.shortGuide,
      evidence: ["Seed museum image", "Staff note", "Map zone context"],
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    setDrafts((current) => [draft, ...current]);
    setActiveView("review");
  }

  function updateDraftStatus(id: string, status: DraftRecord["status"]) {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, status } : draft));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">DC</div>
          <div>
            <h1>DCIS Guide</h1>
            <p>Visitor adventure + staff builder</p>
          </div>
        </div>

        <nav className="view-nav" aria-label="Prototype views">
          <NavButton icon={<Camera />} label="Visitor Guide" active={activeView === "visitor"} onClick={() => setActiveView("visitor")} />
          <NavButton icon={<Mic />} label="Builder Mode" active={activeView === "builder"} onClick={() => setActiveView("builder")} />
          <NavButton icon={<ClipboardCheck />} label="Review Desk" active={activeView === "review"} onClick={() => setActiveView("review")} />
          <NavButton icon={<Map />} label="Map Model" active={activeView === "map"} onClick={() => setActiveView("map")} />
          <NavButton icon={<FileSearch />} label="Validation" active={activeView === "validation"} onClick={() => setActiveView("validation")} />
        </nav>

        <section className="zone-picker">
          <h2>Pilot Stops</h2>
          {zones.map((zone) => (
            <button
              className={zone.id === activeZone.id ? "zone-button active" : "zone-button"}
              key={zone.id}
              onClick={() => setActiveZoneId(zone.id)}
            >
              <span>{zone.name}</span>
              <small>{zone.room}</small>
            </button>
          ))}
        </section>
      </aside>

      <section className="workspace">
        {activeView === "visitor" && (
          <VisitorGuide
            activeZone={activeZone}
            guideStyle={guideStyle}
            setGuideStyle={setGuideStyle}
            question={question}
            setQuestion={setQuestion}
          />
        )}
        {activeView === "builder" && <BuilderMode activeZone={activeZone} draftCount={drafts.length} onCreateDraft={createDraft} />}
        {activeView === "review" && <ReviewDesk drafts={drafts} onUpdateDraftStatus={updateDraftStatus} />}
        {activeView === "map" && <MapModel activeZone={activeZone} setActiveZoneId={setActiveZoneId} />}
        {activeView === "validation" && <ValidationPanel />}
      </section>
    </main>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function VisitorGuide({
  activeZone,
  guideStyle,
  setGuideStyle,
  question,
  setQuestion,
}: {
  activeZone: ExhibitZone;
  guideStyle: string;
  setGuideStyle: (style: string) => void;
  question: string;
  setQuestion: (question: string) => void;
}) {
  return (
    <div className="visitor-layout">
      <section className="camera-stage" aria-label="Look-around view">
        <img src={activeZone.asset} alt={activeZone.name} />
        <div className="camera-overlay">
          <span><Binoculars size={16} /> Looking at</span>
          <strong>{activeZone.name}</strong>
          <small>{activeZone.room} · zone confidence {Math.round(activeZone.confidence * 100)}%</small>
        </div>
      </section>

      <section className="guide-panel">
        <div className="section-kicker"><Sparkles size={16} /> Visitor Guide</div>
        <h2>{activeZone.name}</h2>
        <p className="hook">{activeZone.hook}</p>

        <div className="controls-row">
          {["Curious docent", "Kid explorer", "Dramatic storyteller"].map((style) => (
            <button
              className={style === guideStyle ? "pill active" : "pill"}
              key={style}
              onClick={() => setGuideStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>

        <article className="guide-answer">
          <strong>{guideStyle}</strong>
          <p>{activeZone.shortGuide}</p>
        </article>

        <div className="challenge">
          <Compass size={18} />
          <div>
            <strong>Challenge</strong>
            <p>{activeZone.challenge}</p>
          </div>
        </div>

        <form className="ask-box" onSubmit={(event) => event.preventDefault()}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask the guide something about this stop"
            aria-label="Ask the guide"
          />
          <button title="Send question" type="submit">
            <Send size={18} />
          </button>
        </form>

        <button className="next-stop">
          Next stop: {activeZone.nextStop}
        </button>
      </section>
    </div>
  );
}

function BuilderMode({
  activeZone,
  draftCount,
  onCreateDraft,
}: {
  activeZone: ExhibitZone;
  draftCount: number;
  onCreateDraft: (note: string) => void;
}) {
  const [note, setNote] = React.useState("");

  return (
    <div className="panel-grid">
      <section className="wide-panel">
        <div className="section-kicker"><Mic size={16} /> Builder Mode</div>
        <h2>Capture guide knowledge while walking the museum</h2>
        <p className="muted">{draftCount} local draft records are waiting in this browser.</p>
        <div className="capture-grid">
          <button><Camera /> Capture photo</button>
          <button><Mic /> Record narration</button>
          <button onClick={() => onCreateDraft(note)}><Wand2 /> Create draft record</button>
        </div>
      </section>

      <section className="work-panel">
        <h3>Current Zone</h3>
        <img className="thumb" src={activeZone.asset} alt={activeZone.name} />
        <strong>{activeZone.name}</strong>
        <p>{activeZone.room}</p>
      </section>

      <section className="work-panel">
        <h3>Builder Notes</h3>
        <ul className="plain-list">
          {activeZone.builderNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </section>

      <section className="wide-panel">
        <h3>Draft Record Fields</h3>
        <div className="field-grid">
          <label>Room<input value={activeZone.room} readOnly /></label>
          <label>Zone<input value={activeZone.name} readOnly /></label>
          <label>Public status<input value="Draft until reviewed" readOnly /></label>
          <label>Evidence<input value="Photo, OCR, staff note, map context" readOnly /></label>
        </div>
        <label className="note-field">
          Staff walkthrough note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Type what a guide would say here, or leave blank to draft from the seed guide text."
          />
        </label>
      </section>
    </div>
  );
}

function ReviewDesk({
  drafts,
  onUpdateDraftStatus,
}: {
  drafts: DraftRecord[];
  onUpdateDraftStatus: (id: string, status: DraftRecord["status"]) => void;
}) {
  return (
    <div className="panel-grid">
      <section className="wide-panel">
        <div className="section-kicker"><ClipboardCheck size={16} /> Review Desk</div>
        <h2>Approve knowledge before it becomes public</h2>
        <p className="muted">Builder records land here with sources, confidence, and failure notes before they become public guide content.</p>
      </section>
      {drafts.length > 0 && drafts.map((draft) => (
        <section className="review-row" key={draft.id}>
          <div>
            <strong>{draft.zoneName}</strong>
            <p>{draft.note}</p>
            <small>{draft.room} · {draft.evidence.join(", ")}</small>
          </div>
          <span className={`status ${draft.status}`}>{draft.status}</span>
          <div className="review-actions">
            <button onClick={() => onUpdateDraftStatus(draft.id, "approved")}><BadgeCheck size={16} /> Approve</button>
            <button>Edit</button>
            <button onClick={() => onUpdateDraftStatus(draft.id, "private")}>Keep private</button>
          </div>
        </section>
      ))}
      {zones.map((zone) => (
        <section className="review-row" key={zone.id}>
          <div>
            <strong>{zone.name}</strong>
            <p>{zone.shortGuide}</p>
            <small>Seed record from recovered prototype media</small>
          </div>
          <span className={`status ${zone.status}`}>{zone.status.replace("-", " ")}</span>
          <div className="review-actions">
            <button><BadgeCheck size={16} /> Approve</button>
            <button>Edit</button>
            <button>Keep private</button>
          </div>
        </section>
      ))}
    </div>
  );
}

function MapModel({ activeZone, setActiveZoneId }: { activeZone: ExhibitZone; setActiveZoneId: (id: string) => void }) {
  return (
    <div className="map-layout">
      <section>
        <div className="section-kicker"><Map size={16} /> Museum Map Model</div>
        <h2>Start rough, improve through use</h2>
        <p className="muted">The blueprint model should locate floors, rooms, zones, cases, labels, landmarks, and paths with confidence scores.</p>
        <div className="map-board">
          {zones.map((zone, index) => (
            <button
              key={zone.id}
              className={zone.id === activeZone.id ? "map-zone active" : "map-zone"}
              style={{ gridColumn: `${(index % 2) + 1}`, gridRow: `${Math.floor(index / 2) + 1}` }}
              onClick={() => setActiveZoneId(zone.id)}
            >
              <strong>{zone.room}</strong>
              <span>{zone.name}</span>
              <small>{Math.round(zone.confidence * 100)}%</small>
            </button>
          ))}
        </div>
      </section>
      <section className="work-panel">
        <h3>Selected Zone</h3>
        <strong>{activeZone.name}</strong>
        <p>{activeZone.hook}</p>
        <div className="confidence-meter"><span style={{ width: `${activeZone.confidence * 100}%` }} /></div>
      </section>
    </div>
  );
}

function ValidationPanel() {
  return (
    <div className="panel-grid">
      <section className="wide-panel">
        <div className="section-kicker"><FileSearch size={16} /> Real Validation Harness</div>
        <h2>No fake AI claims</h2>
        <p className="muted">These are the workflows to wire to real OCR, vision, and LLM calls using recovered DCIS media. Until a workflow runs, it is labeled honestly.</p>
      </section>
      {workflows.map((workflow) => (
        <section className="validation-row" key={workflow.name}>
          <Database size={22} />
          <div>
            <strong>{workflow.name}</strong>
            <p><b>Input:</b> {workflow.input}</p>
            <p><b>Target:</b> {workflow.target}</p>
            <small>{workflow.reason}</small>
          </div>
          <span className={`status ${workflow.status}`}>{workflow.status.replace("-", " ")}</span>
        </section>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

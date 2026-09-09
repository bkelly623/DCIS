import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Eye,
  HelpCircle,
  Home,
  MapPinned,
  Medal,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  characters,
  contentGaps,
  paths,
  rooms,
  stops,
  type Character,
  type PathId,
  type Stop,
  type TourPath,
} from "./data";
import "./styles.css";

type Phase = "choose-path" | "setup" | "tour" | "recap" | "staff";

type Progress = {
  teamName: string;
  pathId: PathId;
  characterId: Character["id"];
  stopIndex: number;
  completed: string[];
  answers: Record<string, string>;
  hinted: string[];
};

const STORAGE_KEY = "dcis-expedition-progress-v2";

function App() {
  const [phase, setPhase] = React.useState<Phase>("choose-path");
  const [selectedPathId, setSelectedPathId] = React.useState<PathId>("cabinet");
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<Character["id"]>("naturalist");
  const [teamName, setTeamName] = React.useState("The Field Party");
  const [progress, setProgress] = React.useState<Progress | null>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved) as Progress;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    if (progress) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? paths[0];
  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId) ?? characters[0];

  function startTour() {
    const nextProgress: Progress = {
      teamName: teamName.trim() || "The Field Party",
      pathId: selectedPath.id,
      characterId: selectedCharacter.id,
      stopIndex: 0,
      completed: [],
      answers: {},
      hinted: [],
    };

    setProgress(nextProgress);
    setPhase("tour");
  }

  function continueSaved() {
    if (progress) setPhase(progress.stopIndex >= getPathStops(progress.pathId).length ? "recap" : "tour");
  }

  function resetProgress() {
    window.localStorage.removeItem(STORAGE_KEY);
    setProgress(null);
    setPhase("choose-path");
  }

  return (
    <main className="app">
      <header className="topbar">
        <button className="brand-button" onClick={() => setPhase("choose-path")} aria-label="Home">
          <span className="brand-mark">DC</span>
          <span>
            <strong>DCIS Field Guide</strong>
            <small>Delaware County Institute of Science</small>
          </span>
        </button>
        <nav aria-label="App sections">
          {progress && (
            <button className="ghost-button" onClick={continueSaved}>
              <BookOpen size={18} />
              Continue
            </button>
          )}
          <button className="ghost-button" onClick={() => setPhase("staff")}>
            <ClipboardList size={18} />
            Content
          </button>
        </nav>
      </header>

      {phase === "choose-path" && (
        <PathPicker
          selectedPathId={selectedPathId}
          onSelectPath={(pathId) => {
            setSelectedPathId(pathId);
            setPhase("setup");
          }}
          onContinue={progress ? continueSaved : undefined}
        />
      )}

      {phase === "setup" && (
        <SetupFlow
          path={selectedPath}
          selectedCharacterId={selectedCharacterId}
          teamName={teamName}
          onBack={() => setPhase("choose-path")}
          onTeamName={setTeamName}
          onCharacter={setSelectedCharacterId}
          onStart={startTour}
        />
      )}

      {phase === "tour" && progress && (
        <TourExperience
          progress={progress}
          onProgress={setProgress}
          onFinish={() => setPhase("recap")}
          onReset={resetProgress}
        />
      )}

      {phase === "recap" && progress && (
        <Recap progress={progress} onRestart={resetProgress} onChoosePath={() => setPhase("choose-path")} />
      )}

      {phase === "staff" && <StaffContent onBack={() => setPhase("choose-path")} />}
    </main>
  );
}

function PathPicker({
  selectedPathId,
  onSelectPath,
  onContinue,
}: {
  selectedPathId: PathId;
  onSelectPath: (pathId: PathId) => void;
  onContinue?: () => void;
}) {
  return (
    <section className="screen path-screen">
      <div className="intro-band">
        <div>
          <p className="kicker"><Sparkles size={16} /> Pick an expedition</p>
          <h1>Choose how the Institute should come alive.</h1>
          <p>
            Start in Mineral Hall, climb into the Lecture Hall, and let the third floor become the payoff.
            The front hall stays what it is: a launch point, not fake content.
          </p>
        </div>
        {onContinue && (
          <button className="continue-card" onClick={onContinue}>
            <BookOpen />
            <span>
              <strong>Continue active visit</strong>
              <small>Resume the field notebook saved on this phone.</small>
            </span>
            <ChevronRight />
          </button>
        )}
      </div>

      <div className="path-grid">
        {paths.map((path) => {
          const Icon = path.icon;
          const isSelected = path.id === selectedPathId;
          return (
            <button
              key={path.id}
              className={isSelected ? "path-card selected" : "path-card"}
              style={{ "--accent": path.accent } as React.CSSProperties}
              onClick={() => onSelectPath(path.id)}
            >
              <span className="path-icon"><Icon size={26} /></span>
              <span className="path-meta">{path.time} · {path.difficulty}</span>
              <strong>{path.name}</strong>
              <em>{path.tagline}</em>
              <span>{path.description}</span>
              <small>{path.bestFor}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SetupFlow({
  path,
  selectedCharacterId,
  teamName,
  onBack,
  onTeamName,
  onCharacter,
  onStart,
}: {
  path: TourPath;
  selectedCharacterId: Character["id"];
  teamName: string;
  onBack: () => void;
  onTeamName: (value: string) => void;
  onCharacter: (id: Character["id"]) => void;
  onStart: () => void;
}) {
  return (
    <section className="screen setup-screen">
      <button className="text-button" onClick={onBack}><ArrowLeft size={18} /> Back to paths</button>
      <div className="setup-layout">
        <aside className="mission-card" style={{ "--accent": path.accent } as React.CSSProperties}>
          <span className="kicker"><path.icon size={16} /> {path.name}</span>
          <h2>{path.opening}</h2>
          <div className="mission-stats">
            <span>{path.time}</span>
            <span>{path.stopIds.length} discoveries</span>
            <span>{path.difficulty}</span>
          </div>
        </aside>

        <div className="setup-panel">
          <label className="field-label">
            Name your expedition
            <input value={teamName} onChange={(event) => onTeamName(event.target.value)} />
          </label>

          <div>
            <p className="section-title">Choose your field identity</p>
            <div className="character-grid">
              {characters.map((character) => {
                const Icon = character.icon;
                return (
                  <button
                    key={character.id}
                    className={character.id === selectedCharacterId ? "character-card selected" : "character-card"}
                    onClick={() => onCharacter(character.id)}
                  >
                    <Icon size={24} />
                    <strong>{character.name}</strong>
                    <span>{character.title}</span>
                    <small>{character.flavor}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <button className="primary-action" onClick={onStart}>
            Begin expedition <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

function TourExperience({
  progress,
  onProgress,
  onFinish,
  onReset,
}: {
  progress: Progress;
  onProgress: (progress: Progress) => void;
  onFinish: () => void;
  onReset: () => void;
}) {
  const path = paths.find((candidate) => candidate.id === progress.pathId) ?? paths[0];
  const character = characters.find((candidate) => candidate.id === progress.characterId) ?? characters[0];
  const pathStops = getPathStops(path.id);
  const stop = pathStops[Math.min(progress.stopIndex, pathStops.length - 1)];
  const completedCount = progress.completed.length;
  const hinted = progress.hinted.includes(stop.id);
  const answered = progress.answers[stop.id];

  function showHint() {
    if (hinted) return;
    onProgress({ ...progress, hinted: [...progress.hinted, stop.id] });
  }

  function answer(choice: string) {
    onProgress({
      ...progress,
      answers: { ...progress.answers, [stop.id]: choice },
      completed: progress.completed.includes(stop.id) ? progress.completed : [...progress.completed, stop.id],
    });
  }

  function next() {
    if (progress.stopIndex + 1 >= pathStops.length) {
      onProgress({ ...progress, stopIndex: pathStops.length });
      onFinish();
      return;
    }
    onProgress({ ...progress, stopIndex: progress.stopIndex + 1 });
  }

  function previous() {
    onProgress({ ...progress, stopIndex: Math.max(0, progress.stopIndex - 1) });
  }

  return (
    <section className="tour-screen">
      <div className="tour-header">
        <button className="text-button" onClick={onReset}><RotateCcw size={17} /> Reset</button>
        <div>
          <strong>{path.name}</strong>
          <small>{progress.teamName} · {character.name}</small>
        </div>
        <span className="progress-pill">{completedCount}/{pathStops.length}</span>
      </div>

      <div className="progress-track" aria-label="Tour progress">
        <span style={{ width: `${(completedCount / pathStops.length) * 100}%` }} />
      </div>

      <div className="tour-layout">
        <section className="stop-visual">
          <img src={stop.asset} alt="" />
          <div className="room-overlay">
            <span>{stop.room}</span>
            <strong>{stop.zone}</strong>
            <small>{stop.duration} · {confidenceLabel(stop.confidence)}</small>
          </div>
        </section>

        <section className="stop-panel">
          <div className="stop-count">Discovery {progress.stopIndex + 1} of {pathStops.length}</div>
          <h1>{stop.title}</h1>

          <Instruction icon={<MapPinned />} label="Where to stand" text={stop.stand} />
          <Instruction icon={<Eye />} label="Find" text={stop.find} />

          <div className="choice-panel">
            <p className="section-title">{stop.prompt}</p>
            <div className="choice-grid">
              {stop.choices.map((choice) => (
                <button
                  key={choice}
                  className={answered === choice ? "choice selected" : "choice"}
                  onClick={() => answer(choice)}
                >
                  {answered === choice && <Check size={16} />}
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <div className={hinted ? "hint-card visible" : "hint-card"}>
            <button onClick={showHint}><HelpCircle size={18} /> {hinted ? "Hint revealed" : "Give me a hint"}</button>
            {hinted && <p>{stop.hint}</p>}
          </div>

          {answered && (
            <article className="reveal-card">
              <div>
                <BadgeCheck size={22} />
                <span>Field note unlocked</span>
              </div>
              <h2>{stop.revealTitle}</h2>
              <p>{stop.reveal}</p>
              <strong>{stop.stamp}</strong>
            </article>
          )}

          <div className="tour-actions">
            <button className="secondary-action" onClick={previous} disabled={progress.stopIndex === 0}>
              <ArrowLeft size={18} /> Previous
            </button>
            <button className="primary-action" onClick={next} disabled={!answered}>
              {progress.stopIndex + 1 >= pathStops.length ? "Finish expedition" : "Next discovery"}
              <ArrowRight size={18} />
            </button>
          </div>
          <p className="next-cue">{stop.nextCue}</p>
        </section>

        <Notebook stops={pathStops} progress={progress} />
      </div>
    </section>
  );
}

function Instruction({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="instruction">
      {icon}
      <div>
        <strong>{label}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Notebook({ stops: pathStops, progress }: { stops: Stop[]; progress: Progress }) {
  return (
    <aside className="notebook">
      <div>
        <BookOpen size={20} />
        <strong>Field notebook</strong>
      </div>
      {pathStops.map((stop, index) => {
        const Icon = stop.icon;
        const done = progress.completed.includes(stop.id);
        return (
          <div key={stop.id} className={done ? "notebook-row done" : "notebook-row"}>
            <Icon size={17} />
            <span>{done ? stop.stamp : `Discovery ${index + 1}`}</span>
          </div>
        );
      })}
    </aside>
  );
}

function Recap({ progress, onRestart, onChoosePath }: { progress: Progress; onRestart: () => void; onChoosePath: () => void }) {
  const path = paths.find((candidate) => candidate.id === progress.pathId) ?? paths[0];
  const character = characters.find((candidate) => candidate.id === progress.characterId) ?? characters[0];
  const pathStops = getPathStops(path.id);
  const completedStops = pathStops.filter((stop) => progress.completed.includes(stop.id));
  const title = titleFor(progress.completed.length, path.id);

  return (
    <section className="screen recap-screen">
      <div className="recap-card" style={{ "--accent": path.accent } as React.CSSProperties}>
        <Medal size={44} />
        <p className="kicker">Expedition complete</p>
        <h1>{title}</h1>
        <p>{path.finale}</p>
        <p>{character.recapLine}</p>
        <div className="recap-stats">
          <span><strong>{completedStops.length}</strong> discoveries</span>
          <span><strong>{new Set(completedStops.map((stop) => stop.roomId)).size}</strong> rooms</span>
          <span><strong>{progress.hinted.length}</strong> hints</span>
        </div>
      </div>

      <div className="stamp-grid">
        {completedStops.map((stop) => {
          const Icon = stop.icon;
          return (
            <article key={stop.id} className="stamp-card">
              <Icon size={22} />
              <strong>{stop.stamp}</strong>
              <span>{stop.revealTitle}</span>
            </article>
          );
        })}
      </div>

      <div className="recap-actions">
        <button className="primary-action" onClick={onChoosePath}>Try another path <ArrowRight size={18} /></button>
        <button className="secondary-action" onClick={onRestart}>Clear saved visit</button>
      </div>
    </section>
  );
}

function StaffContent({ onBack }: { onBack: () => void }) {
  const roomCounts = Object.entries(rooms).map(([id, room]) => ({
    id,
    ...room,
    stops: stops.filter((stop) => stop.roomId === id).length,
  }));

  return (
    <section className="screen staff-screen">
      <button className="text-button" onClick={onBack}><Home size={18} /> Back to visitor app</button>
      <div className="intro-band compact">
        <div>
          <p className="kicker"><ClipboardList size={16} /> Content operating model</p>
          <h1>Make the app beautiful now, map the building correctly next.</h1>
          <p>
            The prototype is intentionally content-driven. As Brendan builds the better physical map,
            these stops can be swapped from seed zones to verified cases without redesigning the visitor flow.
          </p>
        </div>
      </div>

      <div className="staff-grid">
        {roomCounts.map((room) => (
          <article className="staff-card" key={room.id}>
            <strong>{room.name}</strong>
            <span>{room.stops} seeded stops</span>
            <p>{room.role}</p>
            <small>{room.note}</small>
          </article>
        ))}
      </div>

      <div className="gap-list">
        {contentGaps.map((gap) => (
          <article className="gap-row" key={gap.area}>
            <strong>{gap.area}</strong>
            <p>{gap.needed}</p>
            <small>{gap.why}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function getPathStops(pathId: PathId) {
  const path = paths.find((candidate) => candidate.id === pathId) ?? paths[0];
  return path.stopIds
    .map((stopId) => stops.find((stop) => stop.id === stopId))
    .filter((stop): stop is Stop => Boolean(stop));
}

function confidenceLabel(confidence: Stop["confidence"]) {
  if (confidence === "ready") return "route verified";
  if (confidence === "seed") return "seed content";
  return "awaiting photo index";
}

function titleFor(completed: number, pathId: PathId) {
  if (pathId === "hidden") return completed >= 5 ? "Institute Decoder" : "Archive Apprentice";
  if (pathId === "safari") return completed >= 6 ? "Specimen Safari Champion" : "Cabinet Scout";
  return completed >= 8 ? "Cabinet Detective" : "Field Observer";
}

createRoot(document.getElementById("root")!).render(<App />);

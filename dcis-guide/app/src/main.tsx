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
  paths,
  stops,
  type Character,
  type PathId,
  type Stop,
  type TourPath,
} from "./data";
import {
  mineralMapItems,
  mineralPublicNotice,
  specimensForDisplay,
} from "./mineralHallKnowledge";
import "./styles.css";
import { Discovery, BuildingOrientation } from "./Discovery";

type Phase = "choose-path" | "setup" | "tour" | "recap" | "map" | "paths" | "orientation";

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
          <button className="ghost-button" onClick={() => setPhase("orientation")}>
            <MapPinned size={18} />
            Map
          </button>
        </nav>
      </header>

      {phase === "choose-path" && <Discovery onMap={() => setPhase("map")} onPaths={() => setPhase("paths")} onOrientation={() => setPhase("orientation")} />}
      {phase === "orientation" && <BuildingOrientation onBack={() => setPhase("choose-path")} onMinerals={() => setPhase("map")} />}
      {phase === "paths" && (
        <PathPicker
          selectedPathId={selectedPathId}
          onOpenMap={() => setPhase("map")}
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

      {phase === "map" && <MineralHallMap onBack={() => setPhase("choose-path")} />}


    </main>
  );
}

function PathPicker({
  selectedPathId,
  onOpenMap,
  onSelectPath,
  onContinue,
}: {
  selectedPathId: PathId;
  onOpenMap: () => void;
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
            Choose a longer adventure, or start with one discovery.
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
        {!onContinue && (
          <button className="continue-card map-launch-card" onClick={onOpenMap}>
            <MapPinned />
            <span>
              <strong>Open Mineral Hall map</strong>
              <small>See the numbered case layout, doors, windows, and island cases.</small>
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
            <small>{stop.duration}</small>
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

function MineralHallMap({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = React.useState("entry");
  const selected = mineralMapItems.find((item) => item.id === selectedId) ?? mineralMapItems[0];
  const selectedSpecimens = specimensForDisplay(selected.displayId);

  return (
    <section className="screen map-screen">
      <button className="text-button" onClick={onBack}><Home size={18} /> Back to visitor app</button>
      <div className="intro-band compact">
        <div>
          <p className="kicker"><MapPinned size={16} /> Mineral Hall map</p>
          <h1>Explore the exhibit records.</h1>
          <p>{mineralPublicNotice}</p>
          <p>
            Select a number to explore its display.
            Paired numbers share a wall bay: 11 and 15 are wall displays; 12 and 14 are below them. Not to scale.
          </p>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-board" aria-label="Mineral Hall numbered exhibit map">
          <svg viewBox="0 160 1000 920" role="img" aria-labelledby="mineral-map-title mineral-map-desc">
            <title id="mineral-map-title">Mineral Hall sketch-based exhibit map</title>
            <desc id="mineral-map-desc">Room outline with a straight entrance-side wall, deeper recess, three doors and three windows. Wall displays 11 and 15 sit above floor displays 12 and 14. Display 17 stays on the window wall.</desc>
            <path d="M70 230 H800 V1000 H400 V480 H180 V410 H70 Z" fill="#eef3ef" />
            <path d="M650 230 H70 V410 H180 V480 H400 V850 M400 935 V1000 H465 M565 1000 H800 V230 H755" fill="none" stroke="#243e35" strokeWidth="7" strokeLinejoin="miter" />
            <path d="M650 230 H755 M400 850 V935 M465 1000 H565" stroke="#a3571e" strokeWidth="3" strokeDasharray="7 6" />
            <text className="map-marker-text" x="702" y="205">Door</text>
            <text className="map-marker-text" x="515" y="1040">Door</text>
            {[{y:285,h:100},{y:535,h:115},{y:805,h:90}].map(w => <g key={w.y}><rect className="map-window" x="788" y={w.y} width="24" height={w.h}/><text className="map-marker-text" x="862" y={w.y+w.h/2+6}>Window</text></g>)}
            <rect className="map-island" x="555" y="380" width="100" height="510" rx="50" />
            <text className="map-island-label" x="605" y="635" transform="rotate(90 605 635)">Island cases</text>
            {mineralMapItems.map((item) => (
              <g
                key={item.id}
                className={`map-item sketch-pin ${item.id === selected.id ? "selected" : ""}`}
                onClick={() => setSelectedId(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelectedId(item.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${item.label}: ${item.summary}`}
              >
                {/^\d+$/.test(item.id) ? <circle cx={item.x} cy={item.y} r="25" /> : <rect x={item.x-52} y={item.y-23} width="104" height="46" />}
                <text x={item.x} y={item.y} className="sketch-pin-number">{item.id === "entry" ? "Entrance" : item.id === "shells" ? "Shells" : item.id}</text>
              </g>
            ))}
          </svg>
        </div>

        <aside className="map-detail">
          <h2>{selected.label}</h2>
          <p>{selected.summary}</p>
          {selectedSpecimens.length > 0 && (
            <div className="map-specimens">
              <strong>Indexed records</strong>
              {selectedSpecimens.map((record) => (
                <article key={record.id}>
                  <h3>{record.name}</h3>
                  <p>{record.description ?? record.type}</p>
                </article>
              ))}
            </div>
          )}
        </aside>
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

function titleFor(completed: number, pathId: PathId) {
  if (pathId === "hidden") return completed >= 5 ? "Institute Decoder" : "Archive Apprentice";
  if (pathId === "safari") return completed >= 6 ? "Specimen Safari Champion" : "Cabinet Scout";
  return completed >= 8 ? "Cabinet Detective" : "Field Observer";
}

createRoot(document.getElementById("root")!).render(<App />);

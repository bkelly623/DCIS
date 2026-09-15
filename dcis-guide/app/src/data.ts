import {
  type LucideIcon,
  Archive,
  Bird,
  Binoculars,
  Brain,
  Bug,
  Clock,
  Compass,
  Eye,
  Gem,
  Landmark,
  Microscope,
  Mountain,
  Shell,
  Sparkles,
  Stars,
  Telescope,
} from "lucide-react";

export type CharacterId =
  | "collector"
  | "naturalist"
  | "time-traveler"
  | "microscopist"
  | "fossil-hunter"
  | "cabinet-keeper";

export type PathId = "cabinet" | "hidden" | "safari";

export type RoomId = "mineral-hall" | "lecture-hall" | "third-floor" | "special-collections";

export type Stop = {
  id: string;
  pathIds: PathId[];
  title: string;
  roomId: RoomId;
  room: string;
  zone: string;
  asset: string;
  icon: LucideIcon;
  duration: string;
  stand: string;
  find: string;
  prompt: string;
  choices: string[];
  hint: string;
  revealTitle: string;
  reveal: string;
  stamp: string;
  nextCue: string;
  tags: string[];
};

export type TourPath = {
  id: PathId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bestFor: string;
  time: string;
  difficulty: string;
  accent: string;
  icon: LucideIcon;
  opening: string;
  finale: string;
  stopIds: string[];
};

export type Character = {
  id: CharacterId;
  name: string;
  title: string;
  icon: LucideIcon;
  flavor: string;
  recapLine: string;
};


export const characters: Character[] = [
  {
    id: "collector",
    name: "The Collector",
    title: "Notices what others pass by",
    icon: Sparkles,
    flavor: "You build meaning by gathering small, specific things.",
    recapLine: "You treated the Institute like a cabinet where every drawer deserved a second look.",
  },
  {
    id: "naturalist",
    name: "The Naturalist",
    title: "Reads patterns in living forms",
    icon: Bird,
    flavor: "You notice shape, adaptation, and the quiet logic of survival.",
    recapLine: "You followed wings, shells, nests, bodies, and bones as evidence of lives once in motion.",
  },
  {
    id: "time-traveler",
    name: "The Time Traveler",
    title: "Looks for the old future",
    icon: Clock,
    flavor: "You pay attention to what a room meant when people first built it.",
    recapLine: "You saw DCIS as a scientific time machine that still has the lights on.",
  },
  {
    id: "microscopist",
    name: "The Microscopist",
    title: "Finds the story in details",
    icon: Microscope,
    flavor: "You do not trust the first glance. Good.",
    recapLine: "You kept zooming in until ordinary surfaces started giving up their secrets.",
  },
  {
    id: "fossil-hunter",
    name: "The Fossil Hunter",
    title: "Thinks in deep time",
    icon: Mountain,
    flavor: "You are comfortable with stories that take millions of years to finish.",
    recapLine: "You moved through the museum with one foot in the present and one in deep time.",
  },
  {
    id: "cabinet-keeper",
    name: "The Cabinet Keeper",
    title: "Protects the strange evidence",
    icon: Landmark,
    flavor: "You understand that saving objects is also a way of saving questions.",
    recapLine: "You understood the real trick: DCIS preserves objects so curiosity can keep restarting.",
  },
];

export const stops: Stop[] = [
  {
    id: "crystal-logic",
    pathIds: ["cabinet", "safari"],
    title: "Crystal Logic",
    roomId: "mineral-hall",
    room: "Mineral Hall",
    zone: "Mineral cases",
    asset: "/assets/mineral-tray.jpg",
    icon: Gem,
    duration: "4 min",
    stand: "Start in Mineral Hall and face a dense case of mineral specimens. Do not worry about naming every object.",
    find: "Find a specimen whose shape looks too deliberate to be accidental.",
    prompt: "What caught your eye first?",
    choices: ["Sharp faces", "Color", "Shine", "Pattern", "It looked impossible"],
    hint: "Look for repeated geometry: flat faces, angles, clusters, or a shape that seems to have rules.",
    revealTitle: "Structure is evidence",
    reveal:
      "A crystal is not just a pretty object. Its shape records chemistry, pressure, temperature, space, and time. The trick is learning to see beauty as data.",
    stamp: "Crystal Logic",
    nextCue: "Stay in Mineral Hall. Shift from individual beauty to comparison.",
    tags: ["minerals", "deep-time", "observation"],
  },
  {
    id: "two-that-disagree",
    pathIds: ["cabinet", "safari"],
    title: "Two That Disagree",
    roomId: "mineral-hall",
    room: "Mineral Hall",
    zone: "Mineral trays",
    asset: "/assets/mineral-tray.jpg",
    icon: Eye,
    duration: "3 min",
    stand: "Choose one case where many specimens are visible at once.",
    find: "Find two objects that look similar at first, then prove they are not the same.",
    prompt: "What difference did you use?",
    choices: ["Texture", "Color", "Edges", "Label", "Weight in my imagination"],
    hint: "Compare dull against glossy, rough against smooth, blocky against needle-like, pale against saturated.",
    revealTitle: "Comparison makes the eye smarter",
    reveal:
      "Collections teach by putting differences near each other. You do not need expert vocabulary to begin. You need a reason to compare.",
    stamp: "Comparative Eye",
    nextCue: "Look for a map, label, or place-reference nearby.",
    tags: ["minerals", "comparison", "family"],
  },
  {
    id: "place-evidence",
    pathIds: ["cabinet", "hidden"],
    title: "Evidence Has An Address",
    roomId: "mineral-hall",
    room: "Mineral Hall",
    zone: "Map or label display",
    asset: "/assets/historic-map.jpg",
    icon: Compass,
    duration: "4 min",
    stand: "Find a map, locality label, or display that ties an object to a place.",
    find: "Find one place name. Local is good. Far away is good. Specific is best.",
    prompt: "Why would a scientific institute care where something came from?",
    choices: ["Proof", "Comparison", "Local pride", "Travel", "A mystery trail"],
    hint: "A specimen without a place is still interesting, but a specimen with a place can become evidence.",
    revealTitle: "Location changes the object",
    reveal:
      "Scientific collections are partly maps in disguise. A place name turns an object into a record: this existed there, at this time, under these conditions.",
    stamp: "Mapped Evidence",
    nextCue: "Prepare to move from objects to the room where people gathered to understand them.",
    tags: ["maps", "place", "history"],
  },
  {
    id: "public-science-room",
    pathIds: ["cabinet", "hidden"],
    title: "The Room Where Science Spoke",
    roomId: "lecture-hall",
    room: "Lecture Hall",
    zone: "Stage and seating",
    asset: "/assets/eagle-globe.jpg",
    icon: Landmark,
    duration: "5 min",
    stand: "Go upstairs one level. Stand where you can see the seating and the stage together.",
    find: "Find one detail that makes this feel like knowledge was meant to be shared out loud.",
    prompt: "Which detail carries the room?",
    choices: ["Stage", "Seating", "Portraits", "Cases", "The whole atmosphere"],
    hint: "Ignore individual objects for a moment. Read the room as a machine for attention.",
    revealTitle: "DCIS is not only storage",
    reveal:
      "Before science was a feed or a slideshow, it was often a person in a room asking others to look carefully. This room makes the Institute social.",
    stamp: "Public Science",
    nextCue: "Stay in the Lecture Hall. Look for evidence of people, memory, and authority.",
    tags: ["lecture-hall", "history", "place"],
  },
  {
    id: "portrait-witnesses",
    pathIds: ["hidden"],
    title: "The Witnesses On The Wall",
    roomId: "lecture-hall",
    room: "Lecture Hall",
    zone: "Portraits and wall displays",
    asset: "/assets/eagle-globe.jpg",
    icon: Telescope,
    duration: "4 min",
    stand: "Look for portraits, framed materials, or older display elements in the Lecture Hall.",
    find: "Find a human trace: a face, name, dedication, old label, or institutional marker.",
    prompt: "What does it make the room ask you to respect?",
    choices: ["People", "Knowledge", "Tradition", "Local effort", "The collection"],
    hint: "Do not only look inside cases. Institutions leave fingerprints on walls, plaques, labels, and furniture.",
    revealTitle: "Collections have authors",
    reveal:
      "Every old scientific collection is also a record of people deciding what deserved attention. That history can be inspiring, messy, local, ambitious, and still unfinished.",
    stamp: "Human Evidence",
    nextCue: "Move toward the stair route upward when ready.",
    tags: ["people", "institution", "history"],
  },
  {
    id: "balcony-reveal",
    pathIds: ["cabinet", "hidden", "safari"],
    title: "The Balcony Reveal",
    roomId: "third-floor",
    room: "Third Floor",
    zone: "Balcony route",
    asset: "/assets/hands-on.jpg",
    icon: Stars,
    duration: "5 min",
    stand: "Go up to the third floor. Pause at the stair arrival before choosing a side.",
    find: "Find the moment when the building stops feeling like rooms and starts feeling like a cabinet opened in every direction.",
    prompt: "What is the first category your eye jumps to?",
    choices: ["Birds", "Insects", "Nests or eggs", "Shells or sea life", "Fossils or rocks"],
    hint: "The third floor is not one loop. Treat it as branching side runs from the stair area.",
    revealTitle: "The payoff is abundance",
    reveal:
      "This level should feel like field notes made physical: wings, shells, nests, bones, cases, drawers, and labels turning the living world into study material.",
    stamp: "Cabinet Opened",
    nextCue: "Choose a side run. You will come back rather than circle continuously.",
    tags: ["third-floor", "orientation", "natural-history"],
  },
  {
    id: "bird-architecture",
    pathIds: ["cabinet", "safari"],
    title: "Bird Architecture",
    roomId: "third-floor",
    room: "Third Floor",
    zone: "Birds, nests, or eggs",
    asset: "/assets/hands-on.jpg",
    icon: Bird,
    duration: "4 min",
    stand: "Find a bird, nest, egg, or bird-related display on the third floor.",
    find: "Find something built for flight, nesting, display, or survival.",
    prompt: "Which problem does it seem built to solve?",
    choices: ["Flying", "Hiding", "Finding food", "Raising young", "Showing off"],
    hint: "Look at beaks, wings, feet, nests, eggs, and posture as design choices made by evolution.",
    revealTitle: "Form is a survival argument",
    reveal:
      "Natural history collections freeze motion so we can study form. A beak, wing, nest, or egg is not just a thing. It is a solution.",
    stamp: "Bird Architecture",
    nextCue: "Look nearby for smaller lives: insects, shells, or compact specimens.",
    tags: ["birds", "adaptation", "third-floor"],
  },
  {
    id: "tiny-monster",
    pathIds: ["cabinet", "safari"],
    title: "The Smallest Scary Thing",
    roomId: "third-floor",
    room: "Third Floor",
    zone: "Insects or small specimens",
    asset: "/assets/hands-on.jpg",
    icon: Bug,
    duration: "3 min",
    stand: "Find the insect or small-specimen area.",
    find: "Find something tiny that would be unsettling if it were suddenly much larger.",
    prompt: "What gives it power?",
    choices: ["Legs", "Eyes", "Wings", "Armor", "General menace"],
    hint: "Small does not mean simple. Look for tools: legs, jaws, wings, shells, armor, symmetry.",
    revealTitle: "Small bodies, serious engineering",
    reveal:
      "The miniature world is not a lesser world. It is packed with engineering: joints, armor, flight surfaces, sensory equipment, and strategies for staying alive.",
    stamp: "Tiny Menace",
    nextCue: "Find something from water, stone, or deep time.",
    tags: ["insects", "fun", "third-floor"],
  },
  {
    id: "sea-in-the-building",
    pathIds: ["cabinet", "safari"],
    title: "The Sea In The Building",
    roomId: "third-floor",
    room: "Third Floor",
    zone: "Marine specimens",
    asset: "/assets/hands-on.jpg",
    icon: Shell,
    duration: "4 min",
    stand: "Look for shells, marine specimens, or objects that clearly came from water.",
    find: "Find something that makes the building feel briefly oceanic.",
    prompt: "What is the strongest clue that it came from water?",
    choices: ["Shell", "Shape", "Label", "Texture", "I just know"],
    hint: "Curves, spirals, chambers, ridges, and worn surfaces can all point toward water-shaped life.",
    revealTitle: "Museums collapse distance",
    reveal:
      "A good cabinet makes faraway environments present. Sea life, stone, birds, insects, and fossils can all meet in one building because collections rearrange the world for attention.",
    stamp: "Indoor Ocean",
    nextCue: "Finish by choosing the strangest thing you saw today.",
    tags: ["marine", "third-floor", "wonder"],
  },
  {
    id: "the-strangest-candidate",
    pathIds: ["cabinet", "hidden", "safari"],
    title: "The Strangest Candidate",
    roomId: "third-floor",
    room: "Third Floor",
    zone: "Any display",
    asset: "/assets/eagle-globe.jpg",
    icon: Brain,
    duration: "4 min",
    stand: "Pick any display you can see from the third-floor route.",
    find: "Choose the object, specimen, case, or label that most deserves the sentence: wait, what?",
    prompt: "Why did it win?",
    choices: ["Beauty", "Age", "Creepiness", "Confusion", "Unexpected dignity"],
    hint: "The best answer is not the rarest object. It is the one that changed your attention fastest.",
    revealTitle: "Wonder is a method",
    reveal:
      "Wonder is not the opposite of science. It is often the beginning of it. The serious move is to turn wait, what? into what is this, where did it come from, and why does it matter?",
    stamp: "Wait, What?",
    nextCue: "Your expedition is ready to close.",
    tags: ["wonder", "recap", "third-floor"],
  },
  {
    id: "special-edge",
    pathIds: ["hidden"],
    title: "The Restricted Edge",
    roomId: "special-collections",
    room: "Special Collections",
    zone: "Entrance-side connection",
    asset: "/assets/historic-map.jpg",
    icon: Archive,
    duration: "3 min",
    stand: "Use this only if Special Collections is visible or open for the visit.",
    find: "Find a sign that some knowledge is preserved differently: closed, shelved, boxed, labeled, or handled carefully.",
    prompt: "What does restricted access protect?",
    choices: ["Fragile things", "Order", "Research value", "Security", "Future questions"],
    hint: "Not everything valuable is displayed like a trophy. Some material matters because it can be studied later.",
    revealTitle: "Preservation is active",
    reveal:
      "A scientific institute is not only what visitors can touch or photograph. It is also the quieter work of keeping fragile evidence available for future questions.",
    stamp: "Careful Keeping",
    nextCue: "Return to the public route and continue toward the Lecture Hall or third floor.",
    tags: ["special-collections", "preservation", "hidden"],
  },
];

export const paths: TourPath[] = [
  {
    id: "cabinet",
    name: "Cabinet of Wonders",
    shortName: "Wonders",
    tagline: "The flagship all-ages discovery hunt",
    description:
      "A polished first visit through minerals, public science, and the third-floor natural history payoff.",
    bestFor: "Families, first-time visitors, curious adults",
    time: "45-70 min",
    difficulty: "Medium",
    accent: "#b8462f",
    icon: Gem,
    opening:
      "You are not here to read every label. You are here to train your attention until the building starts answering back.",
    finale:
      "You followed evidence through minerals, lecture culture, birds, insects, sea life, and the strange human habit of saving the world in drawers and glass cases.",
    stopIds: [
      "crystal-logic",
      "two-that-disagree",
      "place-evidence",
      "public-science-room",
      "balcony-reveal",
      "bird-architecture",
      "tiny-monster",
      "sea-in-the-building",
      "the-strangest-candidate",
    ],
  },
  {
    id: "hidden",
    name: "The Hidden Institute",
    shortName: "Hidden",
    tagline: "A mystery/history route through the living old Institute",
    description:
      "Read rooms, cases, people, labels, and preservation choices as clues to why DCIS still matters.",
    bestFor: "Adults, donors, repeat visitors, local history people",
    time: "35-55 min",
    difficulty: "Thoughtful",
    accent: "#315744",
    icon: Landmark,
    opening:
      "Your job is to reconstruct the logic of the Institute: why this place exists, what it saved, and what it still makes possible.",
    finale:
      "You reconstructed DCIS as a rare civic machine: part collection, part classroom, part memory system, and still available for new questions.",
    stopIds: [
      "place-evidence",
      "special-edge",
      "public-science-room",
      "portrait-witnesses",
      "balcony-reveal",
      "the-strangest-candidate",
    ],
  },
  {
    id: "safari",
    name: "Specimen Safari",
    shortName: "Safari",
    tagline: "Fast, weird, replayable",
    description:
      "A looser card-based challenge for kids, groups, events, and anyone who wants the museum to dare them.",
    bestFor: "Kids, groups, short visits, event nights",
    time: "20-35 min",
    difficulty: "Easy",
    accent: "#d49a35",
    icon: Binoculars,
    opening:
      "The cabinet has issued a challenge. Find the weird, old, tiny, beautiful, suspicious, and sea-adjacent.",
    finale:
      "You moved fast, noticed hard, and proved that a scientific collection can also be a very dignified game of find the strangest thing.",
    stopIds: [
      "crystal-logic",
      "two-that-disagree",
      "balcony-reveal",
      "bird-architecture",
      "tiny-monster",
      "sea-in-the-building",
      "the-strangest-candidate",
    ],
  },
];

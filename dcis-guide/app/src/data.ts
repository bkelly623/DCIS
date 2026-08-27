export type ZoneStatus = "seeded" | "needs-review" | "validated";

export type ExhibitZone = {
  id: string;
  name: string;
  room: string;
  asset: string;
  confidence: number;
  status: ZoneStatus;
  shortGuide: string;
  hook: string;
  challenge: string;
  nextStop: string;
  builderNotes: string[];
};

export type ValidationWorkflow = {
  name: string;
  input: string;
  target: string;
  status: "not-run" | "ready" | "needs-integration";
  reason: string;
};

export const zones: ExhibitZone[] = [
  {
    id: "mineral-tray",
    name: "Mineral Room Trays",
    room: "Mineral Room",
    asset: "/assets/mineral-tray.jpg",
    confidence: 0.62,
    status: "needs-review",
    hook: "Dense trays are hard for fine-grained recognition, but excellent for a case-level guide.",
    shortGuide:
      "Start with the pattern: dozens of specimens are grouped so visitors can compare color, crystal form, texture, and labeling. A human guide would not identify every stone at once; they would teach the eye how to notice differences.",
    challenge: "Find two specimens that look similar at first, then name one feature that separates them.",
    nextStop: "Historic Map Display",
    builderNotes: [
      "Use zone/case recognition before individual specimen recognition.",
      "Prior feasibility note says glare, dense trays, and repeated labels make object-level vision brittle.",
      "Label OCR should be validated on close-ups and crops.",
    ],
  },
  {
    id: "eagle-globe",
    name: "Eagle And Globe",
    room: "Main Gallery",
    asset: "/assets/eagle-globe.jpg",
    confidence: 0.74,
    status: "seeded",
    hook: "A strong first-visit object because it reads visually from across the room.",
    shortGuide:
      "This is the kind of object that can anchor a room. The guide should use it as a landmark, then branch into natural history, collecting culture, local institutional history, and what visitors should inspect nearby.",
    challenge: "Stand back for five seconds, then step closer and find one detail you missed.",
    nextStop: "Bird Display",
    builderNotes: [
      "Good candidate for room-level localization.",
      "Needs verified label text and approved DCIS interpretation.",
      "Likely useful as a navigation landmark.",
    ],
  },
  {
    id: "historic-map",
    name: "Historic Map Display",
    room: "Main Gallery",
    asset: "/assets/historic-map.jpg",
    confidence: 0.68,
    status: "seeded",
    hook: "Maps can connect the museum to place, memory, and local identity.",
    shortGuide:
      "A map display is a natural pause point: it lets the guide connect objects in the room to Delaware County, scientific collecting, and the idea that knowledge is built by locating things carefully.",
    challenge: "Find one place name and ask why it might matter to a scientific institute.",
    nextStop: "Hands-On Exhibit",
    builderNotes: [
      "Validate OCR on map labels separately from exhibit labels.",
      "Useful for a history-heavy guide style.",
      "Can support local visitor personalization.",
    ],
  },
  {
    id: "hands-on",
    name: "Hands-On Discovery",
    room: "Learning Area",
    asset: "/assets/hands-on.jpg",
    confidence: 0.58,
    status: "needs-review",
    hook: "A kid-friendly stop should invite action before explanation.",
    shortGuide:
      "This should behave differently from a label-heavy case. The guide should ask the visitor to try, compare, guess, or observe, then turn that action into a short explanation.",
    challenge: "Touch, test, or compare one thing here, then ask the guide what changed.",
    nextStop: "Mineral Room Trays",
    builderNotes: [
      "Needs interaction-specific prompts.",
      "Good place to test family and student modes.",
      "Capture visitor questions to improve future challenges.",
    ],
  },
];

export const workflows: ValidationWorkflow[] = [
  {
    name: "Image-to-zone recognition",
    input: "Recovered frames and phone photos",
    target: "Likely room/case/zone with confidence",
    status: "ready",
    reason: "Seed assets exist; needs real vision adapter and scored fixture set.",
  },
  {
    name: "Label OCR",
    input: "Labels behind glass, crops, map text",
    target: "Text extraction plus linked candidate",
    status: "ready",
    reason: "Recovered label photos exist; test glare and partial crops first.",
  },
  {
    name: "Guide grounding",
    input: "Map position + OCR + approved records",
    target: "Evidence packet for answer generation",
    status: "needs-integration",
    reason: "Requires approved seed records and source/confidence schema.",
  },
  {
    name: "Guide response",
    input: "Grounded context + visitor profile",
    target: "Short engaging docent-style response",
    status: "needs-integration",
    reason: "Must call a real LLM with approved knowledge, not canned AI claims.",
  },
  {
    name: "Builder capture",
    input: "Walkthrough audio, photos, corrections",
    target: "Draft records for review",
    status: "needs-integration",
    reason: "Needs transcription, record schema, and review queue persistence.",
  },
];

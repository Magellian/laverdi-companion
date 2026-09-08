/** Tutorial step definitions */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  /** If true, the Next button auto-advances. If false, the step waits for an action. */
  autoAdvance?: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to LaVerdi Companion",
    description:
      "In 60 seconds, this AI agent will scan your computer and help you free up space — no configuration needed. Let's go!",
    autoAdvance: true,
  },
  {
    id: "scanning",
    title: "Scanning Your Files",
    description:
      "The agent is walking through your home directory, looking for the biggest space hogs. This usually takes 5-15 seconds.",
    autoAdvance: false, // waits for scan to complete
  },
  {
    id: "results",
    title: "Here's What We Found",
    description:
      "These are your largest files. Check the boxes next to anything you don't need — old downloads, temp files, duplicates. Don't worry, deleted files go to your Trash.",
    autoAdvance: false, // waits for user to select & delete
  },
  {
    id: "cleanup",
    title: "Space Freed!",
    description:
      "Your selected files have been moved to Trash. You can recover them anytime. Want to try something else?",
    autoAdvance: true,
  },
  {
    id: "done",
    title: "That Was Your First Agent Action",
    description:
      "You just used an AI agent running on your own computer. No cloud, no signup, no privacy concerns. This is what makes LaVerdi different.",
    autoAdvance: true,
  },
];

export type TutorialPhase =
  | "welcome"
  | "scanning"
  | "results"
  | "cleanup"
  | "done";

export function nextPhase(current: TutorialPhase): TutorialPhase {
  const order: TutorialPhase[] = [
    "welcome",
    "scanning",
    "results",
    "cleanup",
    "done",
  ];
  const idx = order.indexOf(current);
  if (idx < order.length - 1) return order[idx + 1];
  return "done";
}

export function progressPercent(phase: TutorialPhase): number {
  const order: TutorialPhase[] = [
    "welcome",
    "scanning",
    "results",
    "cleanup",
    "done",
  ];
  const idx = order.indexOf(phase);
  return Math.round((idx / (order.length - 1)) * 100);
}
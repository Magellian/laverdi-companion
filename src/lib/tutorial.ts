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
      "The agent is walking through your directory, looking for the biggest space hogs. This usually takes 5-15 seconds.",
    autoAdvance: false, // waits for scan to complete
  },
  {
    id: "results",
    title: "Here's What We Found",
    description:
      "Check the boxes next to anything you don't need. Deleted files go to your Trash — recoverable anytime.",
    autoAdvance: true, // user clicks Next → overlay dismisses → interact with files
  },
  {
    id: "cleanup",
    title: "Space Freed!",
    description:
      "Your selected files have been moved to Trash. You can recover them anytime. That was your first agent action — running entirely on your own computer. No cloud, no signup, no privacy concerns.",
    autoAdvance: true,
  },
];

export type TutorialPhase =
  | "welcome"
  | "scanning"
  | "results"
  | "cleanup";

export function nextPhase(current: TutorialPhase): TutorialPhase {
  const order: TutorialPhase[] = [
    "welcome",
    "scanning",
    "results",
    "cleanup",
  ];
  const idx = order.indexOf(current);
  if (idx < order.length - 1) return order[idx + 1];
  return "cleanup";
}

export function progressPercent(phase: TutorialPhase): number {
  const order: TutorialPhase[] = [
    "welcome",
    "scanning",
    "results",
    "cleanup",
  ];
  const idx = order.indexOf(phase);
  return Math.round((idx / (order.length - 1)) * 100);
}
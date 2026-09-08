import "./TutorialOverlay.css";
import { TutorialPhase, TUTORIAL_STEPS, progressPercent } from "../lib/tutorial";

interface Props {
  phase: TutorialPhase;
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ phase, onNext, onSkip }: Props) {
  const step = TUTORIAL_STEPS.find((s) => s.id === phase);
  const pct = progressPercent(phase);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-spotlight" />

      <div className="tutorial-card">
        {/* Progress bar */}
        <div className="tutorial-progress">
          <div
            className="tutorial-progress__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="tutorial-progress__label">
          Step {TUTORIAL_STEPS.findIndex((s) => s.id === phase) + 1} of{" "}
          {TUTORIAL_STEPS.length}
        </div>

        {/* Content */}
        <h2 className="tutorial-card__title">
          {step?.title ?? "Let's go"}
        </h2>
        <p className="tutorial-card__desc">
          {step?.description ?? ""}
        </p>

        {/* Actions */}
        <div className="tutorial-card__actions">
          <button className="tutorial-skip" onClick={onSkip}>
            Skip tutorial
          </button>
          {step?.autoAdvance !== false && (
            <button className="tutorial-next" onClick={onNext}>
              {phase === "done" ? "Got it!" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
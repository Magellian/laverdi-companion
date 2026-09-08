import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { TutorialOverlay } from "./components/TutorialOverlay";
import {
  TutorialPhase,
  nextPhase,
} from "./lib/tutorial";
import "./App.css";

interface FileEntry {
  path: string;
  name: string;
  size: number;
  human_size: string;
  extension: string;
  modified: number | null;
}

type View = "home" | "scanning" | "results";

function App() {
  // Tutorial state
  const [tutorial, setTutorial] = useState<{
    active: boolean;
    phase: TutorialPhase;
  }>({ active: false, phase: "welcome" });

  // App state
  const [view, setView] = useState<View>("home");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [freed, setFreed] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // ─── Tutorial navigation ───────────────────────────────────

  function startTutorial() {
    setTutorial({ active: true, phase: "welcome" });
    setView("home");
    setFiles([]);
    setSelected(new Set());
    setFreed(0);
    setError("");
  }

  function handleTutorialNext() {
    const next = nextPhase(tutorial.phase);
    if (next === tutorial.phase) return;

    // When advancing from "welcome" → "scanning", kick off the scan
    if (next === "scanning") {
      startScan();
    }

    setTutorial((t) => ({ ...t, phase: next }));
  }

  function skipTutorial() {
    setTutorial({ active: false, phase: "welcome" });
  }

  // Auto-advance when certain conditions are met
  useEffect(() => {
    if (!tutorial.active) return;
    if (tutorial.phase === "scanning" && view === "results") {
      // Scan completed → advance to results step
      setTutorial((t) => ({ ...t, phase: "results" }));
    }
    if (tutorial.phase === "results" && freed > 0) {
      // Files deleted → advance to cleanup
      setTutorial((t) => ({ ...t, phase: "cleanup" }));
    }
  }, [tutorial.active, tutorial.phase, view, freed]);

  // ─── Scanner ───────────────────────────────────────────────

  async function startScan() {
    setView("scanning");
    setError("");
    setSelected(new Set());
    setFreed(0);

    try {
      const path = await invoke<string>("home_dir");
      const results = await invoke<FileEntry[]>("scan_large_files", {
        path,
        limit: 20,
      });
      setFiles(results);
      setView("results");
    } catch (e: any) {
      setError(typeof e === "string" ? e : e?.message || "Scan failed");
      setView("home");
    }
  }

  function toggleFile(p: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  async function deleteSelected() {
    let totalFreed = 0;
    const toDelete = files.filter((f) => selected.has(f.path));

    for (const f of toDelete) {
      try {
        await invoke("delete_file", { path: f.path });
        totalFreed += f.size;
      } catch {
        // skip files that fail
      }
    }

    setFreed(totalFreed);
    setFiles((prev) => prev.filter((f) => !selected.has(f.path)));
    setSelected(new Set());
  }

  function humanSize(bytes: number) {
    if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
    if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
    return `${bytes} B`;
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <>
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__icon" />
          <span className="app-header__title">LaVerdi Companion</span>
        </div>
        <div className="app-header__controls">
          {view !== "home" && (
            <button
              className="app-header__btn"
              onClick={() => {
                setView("home");
                skipTutorial();
              }}
            >
              ←
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* HOME */}
        {view === "home" && (
          <div className="app-welcome">
            <h1 className="app-welcome__title">
              Your AI Agent. Your Computer.
            </h1>
            <p className="app-welcome__subtitle">
              Do what cloud chatbots can't — clean files, build apps, automate
              your desktop. No signup, runs locally.
            </p>

            <div className="app-actions">
              <button className="app-action-btn" onClick={startTutorial}>
                <span className="app-action-btn__icon">📁</span>
                <span className="app-action-btn__text">
                  <span className="app-action-btn__label">
                    Find Large Files
                  </span>
                  <span className="app-action-btn__desc">
                    Free up space in 60 seconds
                  </span>
                </span>
              </button>

              <button className="app-action-btn" onClick={startScan}>
                <span className="app-action-btn__icon">🧹</span>
                <span className="app-action-btn__text">
                  <span className="app-action-btn__label">
                    Clean Downloads
                  </span>
                  <span className="app-action-btn__desc">
                    Organize and archive old files
                  </span>
                </span>
              </button>

              <button className="app-action-btn" onClick={startScan}>
                <span className="app-action-btn__icon">💬</span>
                <span className="app-action-btn__text">
                  <span className="app-action-btn__label">
                    Ask an Agent
                  </span>
                  <span className="app-action-btn__desc">
                    Plain English, local actions
                  </span>
                </span>
              </button>
            </div>

            {error && <p className="app-error">{error}</p>}
          </div>
        )}

        {/* SCANNING */}
        {view === "scanning" && (
          <div className="app-welcome">
            <div className="scanning-spinner" />
            <h2 className="app-welcome__title">Scanning your files...</h2>
            <p className="app-welcome__subtitle">
              Checking your home directory for large files. This usually takes
              5–15 seconds.
            </p>
          </div>
        )}

        {/* RESULTS */}
        {view === "results" && (
          <div className="results-view">
            <div className="results-header">
              <div>
                <h2 className="results-title">
                  {freed > 0
                    ? `Freed ${humanSize(freed)}`
                    : `Top ${files.length} Largest Files`}
                </h2>
                <p className="results-subtitle">
                  {selected.size} selected · Select files you don't need
                </p>
              </div>
              <div className="results-actions">
                {selected.size > 0 && (
                  <button className="btn-danger" onClick={deleteSelected}>
                    🗑 Delete {selected.size} file{selected.size > 1 ? "s" : ""}
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setSelected(new Set(files.map((f) => f.path)))
                  }
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="file-list">
              {files.map((f) => (
                <label
                  key={f.path}
                  className={`file-card ${selected.has(f.path) ? "selected" : ""}`}
                  onClick={() => toggleFile(f.path)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(f.path)}
                    onChange={() => toggleFile(f.path)}
                  />
                  <span className="file-card__icon">📄</span>
                  <div className="file-card__info">
                    <span className="file-card__name">{f.name}</span>
                    <span className="file-card__path">{f.path}</span>
                  </div>
                  <span className="file-card__size">{f.human_size}</span>
                </label>
              ))}
            </div>

            {files.length === 0 && (
              <p className="app-welcome__subtitle" style={{ textAlign: "center" }}>
                No large files found — your disk is clean!
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="app-status">
        <span>
          <span className="app-status__dot" />
          Agent ready
        </span>
        <span>v0.1.0</span>
      </footer>

      {/* ─── Tutorial Overlay ─────────────────────────────────── */}
      {tutorial.active && (
        <TutorialOverlay
          phase={tutorial.phase}
          onNext={handleTutorialNext}
          onSkip={skipTutorial}
        />
      )}
    </>
  );
}

export default App;
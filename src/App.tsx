import "./App.css";

function App() {
  const agentStatus: "idle" | "ready" = "ready";

  return (
    <>
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__icon" />
          <span className="app-header__title">LaVerdi Companion</span>
        </div>
        <div className="app-header__controls">
          <button className="app-header__btn" title="Minimize">
            —
          </button>
          <button className="app-header__btn" title="Close to tray">
            ✕
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="app-welcome">
          <h1 className="app-welcome__title">Your AI Agent. Your Computer.</h1>
          <p className="app-welcome__subtitle">
            Do what cloud chatbots can't — clean files, build apps, automate
            your desktop. No signup, runs locally.
          </p>

          <div className="app-actions">
            <button className="app-action-btn">
              <span className="app-action-btn__icon">📁</span>
              <span className="app-action-btn__text">
                <span className="app-action-btn__label">Find Large Files</span>
                <span className="app-action-btn__desc">
                  Free up space in 60 seconds
                </span>
              </span>
            </button>

            <button className="app-action-btn">
              <span className="app-action-btn__icon">🧹</span>
              <span className="app-action-btn__text">
                <span className="app-action-btn__label">Clean Downloads</span>
                <span className="app-action-btn__desc">
                  Organize and archive old files
                </span>
              </span>
            </button>

            <button className="app-action-btn">
              <span className="app-action-btn__icon">💬</span>
              <span className="app-action-btn__text">
                <span className="app-action-btn__label">Ask an Agent</span>
                <span className="app-action-btn__desc">
                  Plain English, local actions
                </span>
              </span>
            </button>
          </div>
        </div>
      </main>

      <footer className="app-status">
        <span>
          <span className="app-status__dot" />
          Agent {agentStatus === "ready" ? "ready" : "idle"}
        </span>
        <span>v0.1.0</span>
      </footer>
    </>
  );
}

export default App;
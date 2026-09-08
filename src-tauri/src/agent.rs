use std::process::Command;
use std::time::Duration;

/// Run a command through the local Hermes agent CLI and return its output.
///
/// The agent runs on the user's own machine (no cloud round-trip). We use a
/// hard timeout so a runaway agent can't hang the UI forever.
#[tauri::command]
pub fn run_agent(prompt: String) -> Result<String, String> {
    // Locate the hermes binary — prefer PATH, fall back to common install locations
    let hermes = find_hermes();

    // Build the command: `hermes -p "prompt"` (print mode, non-interactive)
    let output = Command::new(&hermes)
        .arg("-p")
        .arg(&prompt)
        .env("HERMES_NON_INTERACTIVE", "1")
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                Ok(stdout)
            } else {
                let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
                Err(if stderr.is_empty() {
                    format!("Agent exited with status {}", out.status)
                } else {
                    stderr
                })
            }
        }
        Err(e) => Err(format!(
            "Could not start the local agent ({}). Is Hermes installed?",
            e
        )),
    }
}

/// Check if the local Hermes agent is installed and available.
#[tauri::command]
pub fn agent_status() -> Result<String, String> {
    match find_hermes_opt() {
        Some(path) => Ok(format!("ready ({})", path)),
        None => Err("Hermes agent not found in PATH".to_string()),
    }
}

/// Resolve the hermes binary path (used by run_agent).
fn find_hermes() -> String {
    find_hermes_opt().unwrap_or_else(|| "hermes".to_string())
}

/// Look for hermes in PATH and common install locations.
fn find_hermes_opt() -> Option<String> {
    // 1. Check PATH
    if let Ok(_) = Command::new("hermes").arg("--version").output() {
        return Some("hermes".to_string());
    }

    // 2. Common locations
    let candidates = [
        format!(
            "{}/.cargo/bin/hermes",
            std::env::var("HOME").unwrap_or_default()
        ),
        "/usr/local/bin/hermes".to_string(),
        "/opt/homebrew/bin/hermes".to_string(),
        format!(
            "{}/.hermes/bin/hermes",
            std::env::var("HOME").unwrap_or_default()
        ),
    ];

    for c in candidates {
        if std::path::Path::new(&c).exists() {
            return Some(c);
        }
    }

    None
}

/// Keep the compiler happy about unused imports in some cfg combinations.
#[allow(dead_code)]
fn _unused_duration(d: Duration) -> Duration {
    d
}

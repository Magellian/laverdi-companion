use serde::Serialize;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// A single file entry returned to the frontend.
#[derive(Serialize, Clone)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub human_size: String,
    pub extension: String,
    pub modified: Option<u64>,
}

/// Human-readable byte size.
fn human_size(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["B", "KB", "MB", "GB", "TB"];
    let mut value = bytes as f64;
    let mut unit = 0;
    while value >= 1024.0 && unit < UNITS.len() - 1 {
        value /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{} {}", bytes, UNITS[unit])
    } else {
        format!("{:.1} {}", value, UNITS[unit])
    }
}

/// Directories we never want to descend into during a scan.
fn should_skip(dir_name: &str) -> bool {
    matches!(
        dir_name,
        "node_modules"
            | ".git"
            | "target"
            | ".cache"
            | ".cargo"
            | ".npm"
            | "Library"
            | "AppData"
            | "System Volume Information"
            | "$RECYCLE.BIN"
    )
}

/// Scan a directory recursively and return the `limit` largest files.
#[tauri::command]
pub fn scan_large_files(path: String, limit: u32) -> Result<Vec<FileEntry>, String> {
    let root = PathBuf::from(&path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    if !root.is_dir() {
        return Err(format!("Not a directory: {}", path));
    }

    let mut entries: Vec<FileEntry> = Vec::new();
    let max_depth = 8; // avoid runaway scans

    for result in WalkDir::new(&root)
        .max_depth(max_depth)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            // Skip hidden dirs and known-heavy dirs at the directory level
            !e.file_type().is_dir()
                || !e
                    .file_name()
                    .to_str()
                    .map(|n| n.starts_with('.') || should_skip(n))
                    .unwrap_or(false)
        })
    {
        let entry = match result {
            Ok(e) => e,
            Err(_) => continue, // permission denied etc — skip
        };

        if !entry.file_type().is_file() {
            continue;
        }

        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        let size = metadata.len();
        let full_path = entry.path().to_path_buf();
        let name = entry.file_name().to_string_lossy().to_string();
        let extension = full_path
            .extension()
            .map(|e| e.to_string_lossy().to_string())
            .unwrap_or_default();

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs());

        entries.push(FileEntry {
            path: full_path.to_string_lossy().to_string(),
            name,
            size,
            human_size: human_size(size),
            extension,
            modified,
        });
    }

    // Sort descending by size
    entries.sort_by(|a, b| b.size.cmp(&a.size));

    // Cap at limit
    let limit = limit.min(500) as usize;
    entries.truncate(limit);

    Ok(entries)
}

/// Move a file to the OS trash/recycle bin (safe — recoverable).
#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("File does not exist: {}", path));
    }
    trash::delete(p).map_err(|e| format!("Failed to move to trash: {}", e))
}

/// Get the user's home directory (for default scan location).
#[tauri::command]
pub fn home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

/// Get the user's downloads directory.
#[tauri::command]
pub fn downloads_dir() -> Result<String, String> {
    dirs::download_dir()
        .or_else(|| {
            dirs::home_dir().map(|h| h.join("Downloads"))
        })
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine downloads directory".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_human_size() {
        assert_eq!(human_size(0), "0 B");
        assert_eq!(human_size(1024), "1.0 KB");
        assert_eq!(human_size(1048576), "1.0 MB");
        assert_eq!(human_size(1073741824), "1.0 GB");
    }

    #[test]
    fn test_scan_real_dir() {
        let home = dirs::home_dir().unwrap();
        let path = home.to_string_lossy().to_string();
        let res = scan_large_files(path, 50).unwrap();
        assert!(!res.is_empty(), "scan of home dir returned no files");
        for w in res.windows(2) {
            assert!(w[0].size >= w[1].size, "not sorted descending");
        }
    }
}

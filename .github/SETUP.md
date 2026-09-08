# GitHub Actions CI/CD

The `release.yml` workflow builds LaVerdi Companion for Windows, macOS, and Linux.

## Setup required

The GitHub PAT on this machine is **read-only**. To enable CI:

1. Go to GitHub Settings → Developer settings → Fine-grained tokens
2. Generate a new token with `contents: write` and `actions: write` scopes  
3. Or: create the repo manually at **github.com/Magellian/laverdi-companion** (must be empty)

Once the repo has push access, the workflow triggers automatically on every push to master.
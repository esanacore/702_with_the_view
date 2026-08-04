# Workstation Setup

This guide describes how to set up your local environment and run the project for the first time.

## IDE Setup

This project follows Eric's Engineering Constitution. To have it applied
automatically in **Visual Studio**, **VS Code**, or a **JetBrains IDE**, install
an AI coding assistant (GitHub Copilot, Continue.dev, or Cursor) and open the
repository — the assistant reads the instruction files committed here and picks
up the constitution with no extra configuration. After cloning, run
`git submodule update --init --recursive` so the `constitution/` submodule is
present. See `docs/HELP.md`, "Using This Project in Your IDE," for the per-IDE
file mapping and `constitution/INTEGRATION.md` for full details.

## Prerequisites

- `git` (any recent version)
- `bash` (Git Bash on Windows works) — for `tests/test_site.sh`
- A web browser
- Optional: Python 3, only to serve the site locally with `http.server`

There is deliberately no toolchain to pin: the site is static HTML/CSS/JS
with no build step and no dependencies.

## Verify Prerequisites

```bash
git --version && bash --version | head -1
```

## Installation

```bash
git clone --recurse-submodules https://github.com/esanacore/702_with_the_view.git
cd 702_with_the_view
```

(Already cloned without submodules? `git submodule update --init --recursive`.)

## First Run

```bash
python -m http.server 8000 --directory site
```

Then open http://localhost:8000. Or simply double-click `site/index.html`.

## Environment Variables

None — see `docs/ENV_VARS.md`.

# Home

Welcome to the **702 with the View** wiki — the listing website for the 702
with the View apartment rental, live at
[702withtheview.com](https://702withtheview.com). Wiki pages are authored
under `wiki/` in this repository and reviewed through normal pull requests.

## What this project does

Serves the public listing site for an apartment for rent, showcasing its
remodeled kitchen (all-new GE Appliances) and bathroom. The site is
dependency-free static HTML/CSS/JS — no framework, no build step.

## Getting started

Clone with `--recurse-submodules` and open `site/index.html` in a browser, or
serve it locally with `python -m http.server 8000 --directory site`. See
`docs/SETUP.md` for details.

## How it works

Every push to `main` deploys automatically to GitHub Pages at
`702withtheview.com`. The repo name and domain differ deliberately — domain
names cannot contain underscores; see `docs/DOMAIN_SETUP.md`.

## Where things live

- `site/` — the static site (HTML/CSS/JS)
- `docs/` — setup, domain configuration, and governance docs
- `constitution/` — Eric's Engineering Constitution submodule (read-only)

## See also

- `docs/HELP.md` — common questions and troubleshooting
- `docs/DOMAIN_SETUP.md` — why the domain and repo name differ

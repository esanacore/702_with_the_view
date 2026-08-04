# Agent Handoff

This document helps transition work between different AI agent sessions or different agents.

**Before starting your session**, check `docs/SESSION_PLAN.md` for the previous agent's planned work and resumption notes, and `docs/MEMORY.md` to load durable codebase learnings and user preferences. The session plan captures *intent before work*; this handoff captures *state after work*.

## How to Handoff

When you are finishing a task or session, record the state here:

1. **Current Status**: What was achieved?
2. **Next Steps**: What should the next agent do first?
3. **Known Blockers**: What issues were encountered?
4. **Context Hints**: Are there specific files or discussions the next agent should read?

## Handoffs

### Session: 2026-08-03 (repository creation)

- **Accomplishments**: repo bootstrapped with the constitution submodule and
  governance docs; listing site built in `site/` with 8 photo placeholder
  slots; 27-check test suite; GitHub Pages push-to-publish workflow;
  Property Manual skeleton; domain guide for `702withtheview.com`.
- **Pending Work**: everything under TODO.md → "Blocking the Live Listing"
  is owner-provided (domain purchase, DNS, photos, contact email, listing
  details). Property Manual awaits model numbers.
- **Verification Run**: `bash tests/test_site.sh` — 27/27 pass;
  constitution gates (compliance, traceability, architecture, secrets) green
  locally.
- **Instructions for Next Agent**: read `docs/MEMORY.md` first — especially
  the rules about never inventing listing facts and keeping `site/`
  dependency-free. When the owner supplies model numbers, they go in
  `docs/PROPERTY_MANUAL.md`, not page copy.

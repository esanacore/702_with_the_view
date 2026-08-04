# ADR: Record Architecture Decisions

Status: Accepted

Date: 2026-08-03

## Relationships

- Extends: none
- Supersedes: none
- Related: none

## Context

This repository follows Eric's Engineering Constitution, which requires that
major architectural decisions be documented with their context and
consequences (Principle 6), so future maintainers and AI agents understand
why the project is shaped the way it is.

## Decision

Use Architecture Decision Records, stored in `docs/adr/`, numbered
sequentially, following the constitution's ADR template and lifecycle
(`Proposed → Accepted → Superseded | Deprecated`).

## Consequences

Decisions are auditable and survive contributor and agent turnover. The
cost is a small documentation burden on each significant decision.

## Alternatives Considered

Recording decisions only in commit messages or `docs/MEMORY.md` — rejected:
harder to discover, no lifecycle, and memory entries are deliberately terse.

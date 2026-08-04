# Environment & Configuration Contract

This document lists all environment variables required or optionally supported by this project.
It acts as the single source of truth for configuration parameters across development, staging, and production environments.

> [!IMPORTANT]
> If you add a new environment variable to a manifest (like `.env.example` or `docker-compose.yml`), you **must** document it in this file in the same pull request.

## Required Variables

**None.** The site is static with no build step or runtime — nothing reads
an environment variable, and there is no `.env.example`. The deploy
workflow uses only the ambient `GITHUB_TOKEN` GitHub Actions provides;
no secrets are configured on the repository.

| Variable | Description | Example Value |
| :--- | :--- | :--- |

## Optional Variables

None.

| Variable | Description | Default Value | Example Value |
| :--- | :--- | :--- | :--- |

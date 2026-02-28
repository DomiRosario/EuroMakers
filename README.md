# EuroMakers

EuroMakers is a Remix-based directory of European software products.

## Open Source Quick Start

### Prerequisites

- Node.js 20+
- npm

### Setup

```sh
npm install
cp .env.example .env.local
npm run dev
```

### Build and run

```sh
npm run build
npm start
```

### Quality checks

```sh
npm run validate
npm run lint
npm run typecheck
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values.

### Public/runtime

- `MAINTENANCE_MODE`
- `CLOUDFLARE_TURNSTILE_SITE_KEY`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY` (server-side only)

### Email

- `SMTP2GO_USERNAME`
- `SMTP2GO_PASSWORD`
- `SMTP2GO_FROM_EMAIL`
- `CONTACT_EMAIL`
- `SUBMISSION_EMAIL` (optional override for submission notifications)

### GitHub moderation

- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_MODERATION_TOKEN`
- `GITHUB_SUBMISSION_LABEL` (default: `submission`)
- `GITHUB_REPORT_LABEL` (default: `report`)

`GITHUB_MODERATION_TOKEN` should be a fine-grained token with permission to create issues and pull requests in the target repository.

## Sample Data and Assets Policy

This public repository ships with a **curated sample dataset** under `data/software`.

Intentionally not included:

- Production secrets or deployment credentials
- Private infrastructure configuration
- Full production dataset and moderation metadata
- Third-party logo files unless redistribution rights are confirmed

For legal safety, sample entries use `/images/placeholder.svg` by default.

### Trademark and Brand Notice

Product names, logos, and brands referenced by this project are property of their respective owners. Inclusion in this repository does not imply affiliation, endorsement, or ownership transfer.

## Data Model

Software entries are stored as JSON files in:

- `data/software/<category>/<id>.json`

Required fields:

- `id`
- `name`
- `description`
- `country`
- `logo`
- `website`
- `longDescription`
- `features`

## Submission Lifecycle

1. A user submits software via `/submit`.
2. The app validates and sanitizes data, enforces Turnstile, and creates a GitHub issue labeled `submission`.
3. `submission-triage.yml` parses and scores payloads, applies stricter gating (label + payload marker + size limits), and generates a PR when appropriate.
4. Decision rules:
   - `>= 90`: create PR and enable auto-merge.
   - `70-89`: create PR with manual-review labeling.
   - `< 70`: post reasons and close issue.

## Report Lifecycle

1. A user reports an entry via `/update`.
2. The app creates a GitHub issue labeled `report` and a subtype label.
3. Contact emails are redacted in public issue content.

## GitHub Workflows

- `.github/workflows/submission-triage.yml`
  - Trigger: issue activity
  - Purpose: parse + score submission issue, reject malformed/oversized payloads, and create moderation PRs
- `.github/workflows/submission-pr-check.yml`
  - Trigger: pull requests to `main`
  - Purpose: enforce `validate`, `lint`, and `typecheck`
- `.github/workflows/secret-scan.yml`
  - Trigger: pushes and pull requests
  - Purpose: fail CI when secret leaks are detected

## Pre-Publication Security Checklist

1. Rotate all credentials currently used in `.env.local`:
   - Turnstile secret key
   - SMTP credentials
   - GitHub moderation token
2. Run a one-time history scan:

```sh
gitleaks git --redact --verbose
```

3. Verify no secrets are present in tracked files:

```sh
rg -n --hidden --glob '!.git' --glob '!node_modules' '(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE KEY|BEGIN RSA|BEGIN OPENSSH)'
```

## Recommended Repository Settings (GitHub UI)

- Enable Secret Scanning and Push Protection
- Protect `main` branch and require passing checks (`validate`, `lint`, `typecheck`)
- Require reviews for workflow file changes (`.github/workflows/**`)
- Create a release tag only after all checks pass

## Community Files

- `LICENSE` (MIT)
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`

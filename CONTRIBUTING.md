# Contributing

Thanks for contributing to EuroMakers.

## Prerequisites

- Node.js 20+
- npm

## Setup

```sh
npm install
cp .env.example .env.local
```

Fill `.env.local` with valid values for any integrations you use locally.

## Local Development

```sh
npm run dev
```

## Quality Checks

Run all checks before opening a PR:

```sh
npm run validate
npm run lint
npm run typecheck
```

## Pull Request Guidelines

- Keep PRs focused and small when possible.
- Include tests or validation updates for behavior changes.
- Do not commit secrets, API keys, or deployment credentials.
- If you change moderation logic or GitHub workflows, explain abuse/safety implications in the PR description.

## Data Contributions

- Software records live in `data/software/<category>/<id>.json`.
- Use public, verifiable sources in `evidenceUrls`.
- Do not include personal contact data in committed records.
- Keep logos as `/images/placeholder.svg` unless explicit redistribution rights are confirmed.

# Software Data Directory

This directory contains the curated sample software dataset used by EuroMakers.

## File Layout

Each entry is a JSON file stored under:

- `data/software/<category>/<id>.json`

## JSON Structure

```json
{
  "id": "unique-id",
  "name": "Software Name",
  "description": "A short description of the software (1-2 sentences).",
  "country": "Country",
  "logo": "/images/placeholder.svg",
  "website": "https://website-url.com",
  "longDescription": "A detailed description of the software.",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

## Contribution Rules

1. Keep filename equal to the `id` field (for example `nextcloud.json` for `"id": "nextcloud"`).
2. Keep logos as `/images/placeholder.svg` unless redistribution rights are explicitly confirmed.
3. Use only public, verifiable information.
4. Do not commit personal contact information, secrets, or private moderation data.

## Allowed Categories

- `artificial-intelligence`
- `cloud`
- `communication`
- `design`
- `developer-tools`
- `entertainment`
- `finance`
- `marketing`
- `office`
- `personal-finances`
- `productivity`
- `search-engine`
- `security`
- `web-analytics`
- `web-browsers`

## Notes

- The app automatically indexes files from these category folders.
- For additional workflow details, see the repository [README.md](../../README.md).

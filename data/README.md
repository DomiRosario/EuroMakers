# Data Directory

This directory contains structured data files used throughout the EuroMakers website.

## Software Data

The `software` directory contains a curated sample dataset of software products.
Each file is named after the software ID (for example `ecosia.json`).

### Software JSON Structure

Each software JSON file follows this structure:

```json
{
  "id": "software-id",
  "name": "Software Name",
  "description": "A short description of the software",
  "country": "Country of Origin",
  "logo": "/images/placeholder.svg",
  "website": "https://website.com",
  "longDescription": "A detailed multi-paragraph description of the software...",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

### Adding New Software

To add a new software product:

1. Create a new JSON file in `data/software/<category>/` with the software ID as the filename (for example `new-software.json`)
2. Follow the structure above, filling in all required fields
3. Use `/images/placeholder.svg` unless explicit logo redistribution rights are confirmed
4. The software will automatically appear in the listing and detail pages

For automated GitHub issue submissions, a `logoUrl` can be provided (or a small logo file uploaded through `/submit`) and the moderation workflow will try to save it into `/public/images/` automatically.

### Notes

- Do not commit personal emails, access tokens, or private contact data.
- Keep entries limited to verifiable public information.

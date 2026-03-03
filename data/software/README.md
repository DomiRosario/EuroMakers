# Software Data Directory

This directory contains JSON files for all software products displayed on the website. Each file represents a single software product and is automatically included in the website when added to this directory.

## How to Add New Software

To add a new software product to the website, simply create a new JSON file in this directory with the following structure:

```json
{
  "id": "unique-id",
  "name": "Software Name",
  "description": "A short description of the software (1-2 sentences).",
  "category": "Category",
  "country": "Country",
  "logo": "/images/logo-filename.svg",
  "website": "https://website-url.com",
  "longDescription": "A detailed description of the software. You can use \\n\\n to create paragraph breaks.",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]
}
```

## Important Notes

1. The filename should match the `id` field in the JSON file (e.g., `nextcloud.json` for a software with `"id": "nextcloud"`).
2. Make sure to upload the logo image to the `/public/images/` directory.
3. The website will automatically create a dedicated page for the software at `/software/[id]`.
4. The software will automatically appear in the software listing page and relevant category pages.
5. Changes to existing JSON files will be reflected on the website automatically.

## Revalidation

The website uses Incremental Static Regeneration (ISR) to automatically update pages when data changes. By default, pages are revalidated every 60 seconds.

If you need to manually trigger revalidation after adding new software, you can use the revalidation API:

```
GET /api/revalidate?token=your-secret-token&path=/software
```

For more information about revalidation, see the main [README.md](../../README.md).

## Categories

Please use one of the following category IDs:

- ai (Artificial Intelligence)
- cloud
- productivity
- security
- design
- development
- communication
- business
- education
- entertainment
- multimedia
- utilities
- finance
- web-browsers (Web Browsers)

## Countries

For the country field, use the country where the software is primarily developed or where the company is headquartered. For multi-national projects, you can use "Multiple EU Countries".

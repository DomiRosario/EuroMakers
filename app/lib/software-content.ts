export type SoftwareContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

const HTML_ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

const BULLET_PREFIX_PATTERN = /^\s*[•*-]\s*/;
const SHORT_HEADING_PATTERN = /^[A-Z][A-Za-z0-9 &,()/+-]{1,60}:?$/;

export function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&amp;|&quot;|&#39;|&lt;|&gt;/g,
    (entity) => HTML_ENTITY_MAP[entity] ?? entity,
  );
}

export function normalizeInlineText(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([a-z0-9])\.([A-Z])/g, "$1. $2")
    .trim();
}

export function normalizeFeatureText(text: string): string {
  return normalizeInlineText(text)
    .replace(BULLET_PREFIX_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLongDescriptionSource(text: string): string {
  return normalizeInlineText(text)
    .replace(/\s+(Features|Highlights|Benefits)\s+•\s+/g, "\n\n$1\n• ")
    .replace(/\s+•\s+/g, "\n• ");
}

function isBulletLine(line: string): boolean {
  return BULLET_PREFIX_PATTERN.test(line);
}

function isHeadingLine(line: string): boolean {
  return SHORT_HEADING_PATTERN.test(line.trim());
}

function stripBulletPrefix(line: string): string {
  return line.replace(BULLET_PREFIX_PATTERN, "").trim();
}

export function getSoftwareContentBlocks(
  text: string,
): SoftwareContentBlock[] {
  const normalized = normalizeLongDescriptionSource(text);
  const blocks: SoftwareContentBlock[] = [];

  for (const rawBlock of normalized.split(/\n{2,}/)) {
    const lines = rawBlock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let paragraphLines: string[] = [];
    let listItems: string[] = [];

    const flushParagraph = () => {
      if (paragraphLines.length === 0) {
        return;
      }

      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      paragraphLines = [];
    };

    const flushList = () => {
      if (listItems.length === 0) {
        return;
      }

      blocks.push({ type: "list", items: listItems });
      listItems = [];
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const nextLine = lines[index + 1] ?? "";

      if (isHeadingLine(line) && isBulletLine(nextLine)) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", text: line.replace(/:$/, "") });
        continue;
      }

      if (isBulletLine(line)) {
        flushParagraph();
        listItems.push(stripBulletPrefix(line));
        continue;
      }

      flushList();
      paragraphLines.push(line);
    }

    flushParagraph();
    flushList();
  }

  return blocks;
}

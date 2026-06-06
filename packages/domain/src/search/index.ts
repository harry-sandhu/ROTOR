export interface ParsedSearchToken {
  type: "category" | "kv" | "cellCount" | "stackMount" | "propSize" | "freeText";
  value: string;
}

const categoryAliases: Record<string, string> = {
  frame: "FRAME",
  frames: "FRAME",
  motor: "MOTOR",
  motors: "MOTOR",
  esc: "ESC",
  escs: "ESC",
  battery: "BATTERY",
  batteries: "BATTERY",
  prop: "PROPELLER",
  propeller: "PROPELLER",
  propellers: "PROPELLER",
};

export function parseProductSearchTokens(query: string): ParsedSearchToken[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const tokens: ParsedSearchToken[] = [];
  const lower = trimmed.toLowerCase();

  const kvMatch = lower.match(/(\d{3,5})\s*kv/);
  if (kvMatch?.[1]) {
    tokens.push({ type: "kv", value: kvMatch[1] });
  }

  const cellCountMatch = lower.match(/(\d)\s*s\b/);
  if (cellCountMatch?.[1]) {
    tokens.push({ type: "cellCount", value: cellCountMatch[1] });
  }

  const stackMountMatch = lower.match(/\b(20x20|30x30)\b/);
  if (stackMountMatch?.[1]) {
    tokens.push({ type: "stackMount", value: stackMountMatch[1] });
  }

  const propSizeMatch = lower.match(/(\d(?:\.\d)?)\s*(?:inch|in|\")/);
  if (propSizeMatch?.[1]) {
    tokens.push({ type: "propSize", value: propSizeMatch[1] });
  }

  const words = lower.split(/\s+/);
  for (const word of words) {
    const category = categoryAliases[word];
    if (category) {
      tokens.push({ type: "category", value: category });
    }
  }

  tokens.push({ type: "freeText", value: trimmed });

  return tokens;
}

export function deriveSearchMetadata(query: string) {
  const tokens = parseProductSearchTokens(query);
  const category = tokens.find((token) => token.type === "category")?.value;

  return {
    tokens,
    category,
  };
}

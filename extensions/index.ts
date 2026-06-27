import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * usage_ticker — Shows a notification after every turn with:
 *   Tn · price · OUT · HIT · MISS
 *
 * Format:
 *   > T1 · 0.186$ · OUT 7.79K · HIT 1.41M · MISS 79.60K
 */

/**
 * Formats a token count into a readable notation:
 *   <1000 → "850"
 *   <1M   → "7.79K" (2 decimals below 100K, 0 above)
 *   >=1M  → "1.41M"
 */
function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 100_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(2)}K`;
  return String(Math.round(n));
}

/** Shape of the usage read from the assistant message (not typed in pi). */
interface UsageInfo {
  cost?: { total?: number };
  output?: number;
  cacheRead?: number;
  input?: number;
}

export default function (pi: ExtensionAPI) {
  pi.on("turn_end", async (event, ctx) => {
    // Read the usage from the assistant message.
    // `usage` is not declared on the message union type in pi's published
    // types, but it is present at runtime on the assistant message.
    const usage = (event.message as { usage?: UsageInfo } | undefined)?.usage;
    if (!usage) return;

    // Pull the current theme's ANSI codes.
    const thm = ctx.ui.theme;
    const accentAnsi = thm.getFgAnsi("accent");
    const mutedAnsi = thm.getFgAnsi("muted");
    const dimAnsi = thm.getFgAnsi("dim");
    const reset = "\x1b[39m";

    const turnNum = event.turnIndex + 1;

    // Price
    const price = usage.cost?.total ?? 0;

    // Tokens
    const out = usage.output ?? 0;
    const hit = usage.cacheRead ?? 0;
    const miss = usage.input ?? 0;

    // Build the colored segments.
    const segments: string[] = [];

    // Every segment is rendered muted.
    const muted = (s: string) => `${mutedAnsi}${s}${reset}`;

    segments.push(muted(`T${turnNum}`));
    if (price > 0) segments.push(muted(`${price.toFixed(3)}$`));
    if (out > 0) segments.push(muted(`OUT ${formatTokens(out)}`));
    if (hit > 0 || miss > 0) {
      const cacheParts: string[] = [];
      if (hit > 0) cacheParts.push(muted(`HIT ${formatTokens(hit)}`));
      if (miss > 0) cacheParts.push(muted(`MISS ${formatTokens(miss)}`));
      segments.push(cacheParts.join(` ${dimAnsi}·${reset} `));
    }

    if (segments.length === 0) return;

    // Assemble: > accent + muted metrics.
    const body = segments.join(` ${dimAnsi}·${reset} `);
    const line = `${accentAnsi}>${reset} ${body}`;

    ctx.ui.notify(line, "info");
  });
}

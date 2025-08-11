const BAR_LENGTH = 10;

export function generateXpBar(currentHp: number, maxHp: number): string {
  const clampedHp = Math.max(0, Math.min(currentHp, maxHp));

  const filledCount = Math.round((clampedHp / maxHp) * BAR_LENGTH);
  const emptyCount = BAR_LENGTH - filledCount;

  const filled = "<:purple_bar:1103029392478838846>".repeat(filledCount);
  const empty = "<:empty_bar:954579932615442492>".repeat(emptyCount);

  return filled + empty;
}

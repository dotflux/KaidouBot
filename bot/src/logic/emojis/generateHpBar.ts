const BAR_LENGTH = 10;

export function generateHpBar(currentHp: number, maxHp: number): string {
  const clampedHp = Math.max(0, Math.min(currentHp, maxHp));

  const filledCount = Math.round((clampedHp / maxHp) * BAR_LENGTH);
  const emptyCount = BAR_LENGTH - filledCount;

  const filled = "<:red_bar:1115296874019160074>".repeat(filledCount);
  const empty = "<:empty_bar:954579932615442492>".repeat(emptyCount);

  return filled + empty;
}

const BAR_LENGTH = 10;

export function generateDefBar(currentHp: number, maxHp: number): string {
  const clampedHp = Math.max(0, Math.min(currentHp, maxHp));

  const filledCount = Math.round((clampedHp / maxHp) * BAR_LENGTH);
  const emptyCount = BAR_LENGTH - filledCount;

  const filled = "<:cyan_bar:1115296616727973968>".repeat(filledCount);
  const empty = "<:empty_bar:954579932615442492>".repeat(emptyCount);

  return filled + empty;
}

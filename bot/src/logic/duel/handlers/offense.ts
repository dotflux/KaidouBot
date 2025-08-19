import { MoveData, PlayerState } from "../moves";

export function handleOffense(
  user: PlayerState,
  opp: PlayerState,
  move: MoveData
): {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
} {
  const totalAtk = (move.power ?? 0) + (user.buff_offense ?? 0);

  let remainingAtk = totalAtk;
  let newDefBuff = opp.buff_defense ?? 0;
  if (newDefBuff >= remainingAtk) {
    newDefBuff -= remainingAtk;
    remainingAtk = 0;
  } else {
    remainingAtk -= newDefBuff;
    newDefBuff = 0;
  }

  const resistance = typeof opp.resistance === "number" ? opp.resistance : 0;
  const effectiveDamage =
    remainingAtk > 0
      ? Math.floor(remainingAtk / (1 + Math.max(0, resistance)))
      : 0;

  let recoilDamage = 0;
  if (move.recoil && move.recoil > 0) {
    recoilDamage =
      move.recoil <= 1
        ? Math.floor(totalAtk * move.recoil)
        : Math.floor(move.recoil);
  }

  const parts: string[] = [];
  parts.push(
    `⚔️ **${user.username}** attacks for **${totalAtk}**, ${remainingAtk} raw damage got through after defense`
  );

  if (resistance > 0 && remainingAtk > 0) {
    const reducedPct = Math.round(
      (1 - (effectiveDamage / remainingAtk || 0)) * 100
    );
    parts.push(
      `and was reduced to **${effectiveDamage}** by resistance (${reducedPct}% reduction).`
    );
  } else if (remainingAtk > 0) {
    parts.push(`and deals **${effectiveDamage}** damage.`);
  } else {
    parts.push(`and deals **0** damage.`);
  }

  if (recoilDamage > 0) {
    parts.push(`💥 Recoil! ${user.username} took **${recoilDamage}** damage!`);
  }

  return {
    userDelta: recoilDamage > 0 ? { hp: -recoilDamage } : {},
    opponentDelta: {
      buff_defense: newDefBuff,
      ...(effectiveDamage > 0 && { hp: -effectiveDamage }),
    },
    message: parts.join(" "),
  };
}

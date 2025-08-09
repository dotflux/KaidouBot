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
  // compute total attack after offense buffs
  const totalAtk = (move.power ?? 0) + user.buff_offense;

  // eat into defender’s defenseBuff first
  let remainingAtk = totalAtk;
  let newDefBuff = opp.buff_defense;
  if (newDefBuff >= remainingAtk) {
    newDefBuff -= remainingAtk;
    remainingAtk = 0;
  } else {
    remainingAtk -= newDefBuff;
    newDefBuff = 0;
  }

  // handle recoil (optional)
  let recoilDamage = 0;
  if (move.recoil && move.recoil > 0) {
    // recoil can be absolute or % of totalAtk
    recoilDamage =
      move.recoil <= 1 ? Math.floor(totalAtk * move.recoil) : move.recoil;
  }

  return {
    userDelta: recoilDamage > 0 ? { hp: -recoilDamage } : {},
    opponentDelta: {
      buff_defense: newDefBuff,
      ...(remainingAtk > 0 && { hp: -remainingAtk }),
    },
    message:
      `⚔️ **${user.username}** attacks for **${totalAtk}**, ` +
      `${remainingAtk} damage got through after defense!` +
      (recoilDamage > 0
        ? `\n💥 Recoil! You took **${recoilDamage}** damage!`
        : ""),
  };
}

import { MoveData, PlayerState } from "../moves";

export function handleLifesteal(
  user: PlayerState,
  opp: PlayerState,
  move: MoveData
): {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
} {
  const totalAtk = (move.power ?? 0) + user.buff_offense;
  let remainingAtk = totalAtk;
  let newDefBuff = opp.buff_defense;

  if (newDefBuff >= remainingAtk) {
    newDefBuff -= remainingAtk;
    remainingAtk = 0;
  } else {
    remainingAtk -= newDefBuff;
    newDefBuff = 0;
  }

  const damageDealt = remainingAtk;
  const lifePercent = 0.5;
  const healAmount = Math.min(
    Math.round(damageDealt * lifePercent),
    user.maxHp - user.hp
  );

  return {
    userDelta: {
      hp: healAmount, // positive -> applied to user
    },
    opponentDelta: {
      buff_defense: newDefBuff,
      ...(damageDealt > 0 && { hp: -damageDealt }),
    },
    message: `🩸 **${user.username}** strikes for **${totalAtk}** and steals **${healAmount}** HP! (${damageDealt} damage got through)`,
  };
}

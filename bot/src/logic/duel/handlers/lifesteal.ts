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
  const totalAtk = Math.max(0, (move.power ?? 0) + user.buff_offense);

  let remainingAtk = totalAtk;
  let newDefBuff = opp.buff_defense;
  if (newDefBuff >= remainingAtk) {
    newDefBuff -= remainingAtk;
    remainingAtk = 0;
  } else {
    remainingAtk -= newDefBuff;
    newDefBuff = 0;
  }

  const resistance = Math.max(0, opp.resistance ?? 0);
  const damageDealt =
    remainingAtk > 0 ? Math.floor(remainingAtk / (1 + resistance)) : 0;

  const LIFE_PERCENT = 0.5;
  const healAmount = Math.min(
    Math.round(damageDealt * LIFE_PERCENT),
    Math.max(0, user.maxHp - user.hp)
  );

  let recoilDamage = 0;
  if (move.recoil && move.recoil > 0) {
    recoilDamage =
      move.recoil <= 1
        ? Math.floor(totalAtk * move.recoil)
        : Math.floor(move.recoil);
  }

  const netUserHpDelta = healAmount - recoilDamage;

  const userDelta: Partial<PlayerState> = {};
  if (netUserHpDelta !== 0) userDelta.hp = netUserHpDelta;

  const opponentDelta: Partial<PlayerState> = {
    buff_defense: newDefBuff,
  };
  if (damageDealt > 0) opponentDelta.hp = -damageDealt;

  const parts: string[] = [];
  parts.push(
    `🩸 **${user.username}** uses **${move.name}** — Attack: **${totalAtk}**.`
  );
  parts.push(
    `After defense and resistance (${resistance}), **${damageDealt}** damage got through.`
  );
  if (healAmount > 0) parts.push(`Heals **${healAmount}** HP from lifesteal.`);
  if (recoilDamage > 0)
    parts.push(`Recoil: **${recoilDamage}** damage to ${user.username}.`);

  return {
    userDelta,
    opponentDelta,
    message: parts.join(" "),
  };
}

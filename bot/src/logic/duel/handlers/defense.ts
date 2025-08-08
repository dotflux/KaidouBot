import { MoveData, PlayerState } from "../moves";

export function handleDefense(
  user: PlayerState,
  opp: PlayerState,
  move: MoveData
): {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
} {
  const boostedDef = user.buff_defense + move.power;
  const cappedDef = Math.min(boostedDef, user.maxDef);
  const actualGain = cappedDef - user.buff_defense;

  return {
    userDelta: {
      buff_defense: cappedDef,
    },
    opponentDelta: {},
    message:
      actualGain === 0
        ? `🛡️ **${user.username}**'s defense is already maxed out!`
        : `🛡️ **${user.username}** raises defense by **${actualGain}**!`,
  };
}

import { MoveData, PlayerState } from "../moves";

export function handleHeal(
  user: PlayerState,
  _opp: PlayerState,
  move: MoveData
): {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
} {
  const amount = Math.min(move.power ?? 0, user.maxHp - user.hp);
  return {
    userDelta: {
      hp: amount,
    },
    opponentDelta: {},
    message: `✨ **${user.username}** heals **${amount}** HP!`,
  };
}

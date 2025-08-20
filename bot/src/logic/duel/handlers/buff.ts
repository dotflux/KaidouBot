import { MoveData, PlayerState } from "../moves";

export function handleBuff(
  user: PlayerState,
  _opp: PlayerState,
  move: MoveData
): {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
} {
  const bType = move.buffType;
  const bPower = move.buffPower ?? 1.0;

  if (bType === "speed") {
    // buff_speed is multiplied by buffPower
    const newSpeed = Math.round(user.buff_speed * bPower);
    return {
      userDelta: { buff_speed: newSpeed },
      opponentDelta: {},
      message: `💨 **${user.username}** increases speed (x${bPower}) -> ${newSpeed}`,
    };
  } else if (bType === "offense") {
    // If buff_offense is 0, we give a baseline bump proportional to buffPower.
    const baselineAdd = Math.max(1, Math.round(10 * (bPower - 1)));
    const newOff = Math.round((user.buff_offense || 0) + baselineAdd);
    return {
      userDelta: { buff_offense: newOff },
      opponentDelta: {},
      message: `⚡ **${user.username}** increases offense by +${baselineAdd} (total buff_offense: ${newOff})`,
    };
  } else if(bType === "defense"){
    const newResistance = user.resistance + bPower;
     return {
      userDelta: { resistance: newResistance },
      opponentDelta: {},
      message: `🛡 **${user.username}** increases resistance (x${bPower}) -> ${newResistance}`,
    };
  }

  // fallback (no-op)
  return {
    userDelta: {},
    opponentDelta: {},
    message: `⚠️ ${user.username} used a buff but nothing changed.`,
  };
}

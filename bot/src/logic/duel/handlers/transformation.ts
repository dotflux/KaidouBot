// src/duels/handlers/transformation.ts
import { PlayerState, MoveData } from "../moves";

export const transformationHandler = (
  user: PlayerState,
  opponent: PlayerState,
  move: MoveData
) => {
  if (!move.form) {
    return {
      userDelta: {},
      opponentDelta: {},
      message: `${user.username} transformation failed!`,
    };
  }
  if (move.formBuffType === "hp" && move.formBuff) {
    const newMaxHp = (user.maxHp += move.formBuff);
    const newHpAmount = Math.min(move.formBuff / 2, newMaxHp - user.hp);
    return {
      userDelta: {
        form: move.form,
        maxHp: newMaxHp,
        hp: newHpAmount,
      },
      opponentDelta: {},
      message: `${user.username} transformed into ${move.name}! and increased their hp`,
    };
  } else if (move.formBuffType === "defense" && move.formBuff) {
    const newResistance = user.resistance + move.formBuff;
    return {
      userDelta: {
        form: move.form,
        resistance: newResistance,
      },
      opponentDelta: {},
      message: `${user.username} transformed into ${move.name}! and increased their resistance`,
    };
  } else if (move.formBuffType === "speed" && move.formBuff) {
    const newSpeed = Math.round(user.buff_speed * move.formBuff);
    return {
      userDelta: {
        form: move.form,
        buff_speed: newSpeed,
      },
      opponentDelta: {},
      message: `${user.username} transformed into ${move.name}! and increased their speed`,
    };
  } else if (move.formBuffType === "offense" && move.formBuff) {
    const baselineAdd = Math.max(1, Math.round(10 * (move.formBuff - 1)));
    const newOff = Math.round((user.buff_offense || 0) + baselineAdd);
    return {
      userDelta: {
        form: move.form,
        buff_offense: newOff,
      },
      opponentDelta: {},
      message: `${user.username} transformed into ${move.name}! and increased their offense`,
    };
  }

  return {
    userDelta: {
      form: move.form,
    },
    opponentDelta: {},
    message: `${user.username} transformed into ${move.name}!`,
  };
};

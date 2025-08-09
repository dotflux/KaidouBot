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

  return {
    userDelta: {
      form: move.form,
    },
    opponentDelta: {},
    message: `${user.username} transformed into ${move.name}!`,
  };
};

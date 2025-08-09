import { handleOffense } from "./offense";
import { handleDefense } from "./defense";
import { handleLifesteal } from "./lifesteal";
import { handleHeal } from "./heal";
import { handleBuff } from "./buff";
import { transformationHandler } from "./transformation";
import { MoveData, PlayerState } from "../moves";

type HandlerFn = (
  user: PlayerState,
  opp: PlayerState,
  move: MoveData
) => {
  userDelta: Partial<PlayerState>;
  opponentDelta: Partial<PlayerState>;
  message: string;
};

export const moveHandlers: Record<string, HandlerFn> = {
  offense: handleOffense,
  defense: handleDefense,
  lifesteal: handleLifesteal,
  heal: handleHeal,
  buff: handleBuff,
  transformation: transformationHandler,
};

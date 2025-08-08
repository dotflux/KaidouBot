import { handleOffense } from "./offense";
import { handleDefense } from "./defense";
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

export const moveHandlers: Record<MoveData["type"], HandlerFn> = {
  offense: handleOffense,
  defense: handleDefense,
};

export type PlayerState = {
  userId: string;
  username: string;
  hp: number;
  offense: number;
  defense: number;
  speed: number;
  buffs: Record<string, number>;
  debuffs: Record<string, number>;
  buff_offense: number;
  buff_defense: number;
  maxHp: number;
  maxDef: number;
};

export interface MoveData {
  name: string;
  type: "offense" | "defense";
  power: number;
}

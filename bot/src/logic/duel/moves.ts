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
  buff_speed: number;
  buff_defense: number;
  maxHp: number;
  maxDef: number;
  form: string;
};

export type BuffType = "offense" | "speed";

export type MoveType =
  | "offense"
  | "defense"
  | "lifesteal"
  | "heal"
  | "buff"
  | "transformation";

export interface MoveData {
  name: string;
  type: MoveType;
  power?: number;
  buffType?: BuffType;
  buffPower?: number;
  recoil?: number;
  form?: string;
  description?: string;
}

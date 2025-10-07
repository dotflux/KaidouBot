# KaidouBot 🤖

> **An interactive game bot focused around 'One Piece'**, with many BASIC features such as duels, treasure chests, an aresnal of moves and potential of expansion.

## **Slash Commands**

**/register** -> Used to register as a player in the database, requires several choices to be made in the command.

**/profile** -> Used to view the ingame profile of the player, shows various information that is useful.

**/inventory fruits** -> Used to check devil fruits currently in the inventory.

**/inventory swords** -> Used to check swords currently in the inventory.

**/inventory guns** -> Used to check guns currently in the inventory.

**/inventory chests** -> Used to check treasure chests currently in the inventory.

**/equip devil_fruit** -> Can be used to consume a devil fruit from the inventory.

**/equip sword** -> Can be used to equip a sword from the inventory.

**/equip gun** -> Can be used to equip a gun from the inventory.

**/duel** -> Can be used to initiate a duel with an opponent player.

**/chest open** -> Can be used to open a treasure chest.

**/cheat item** -> A cheat command for developers that can be used to obtain an item.

**/cheat move** -> A cheat command for developers that can be used to obtain a move.

**/cheat money** -> A cheat command for developers that can be used to increment belli (money).

**/cheat gems** -> A cheat command for developers that can be used to increment gems (secondary currency).

**/cheat stat** -> A cheat command for developers that can be used to increment stats.

_These are the only commands available for now, however expansion is easy to be done._

## **Duel Moves and It's Types**

#### Moves in Kaidoubot are structured in such way:

```typescript
export type BuffType = "offense" | "speed" | "defense";

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
  formBuffType?: string;
  formBuff?: number;
  description?: string;
}
```

_All moves are stored in fsMoves.json_

## **Environmental Variables Setup**

#### Create an `.env` file in the `bot` directory of the project.

```env
BOT_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
NODE_ENV="development"
MONGO_URI=your_mongodb_url
REDIS_URL=your_redis_url
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
DEV_ID=devid_1,devid_2,devid_3,so_on
```

## **Dev Environment Setup**

```bash
cd bot
npm install
npm run dev
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using cutting-edge technologies for the future.**

import { REST, Routes, Client } from "discord.js";
import * as ping from "./commands/ping";
import * as register from "./commands/register";
import * as profile from "./commands/profile";
import * as dotenv from "dotenv";
import * as duel from "./commands/duel";
import * as inventory from "./commands/inventory";
import * as cheat from "./commands/cheat";
import * as equip from "./commands/equip";
import * as chests from "./commands/chests";

dotenv.config();

const commands = [
  ping.data,
  register.data,
  profile.data,
  duel.data,
  inventory.data,
  cheat.data,
  equip.data,
  chests.data,
];

export async function registerAllCommands(client: Client) {
  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
  try {
    if (process.env.NODE_ENV === "production") {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commands.map((cmd) => cmd.toJSON()),
      });
    } else {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID!,
          process.env.GUILD_ID!
        ),
        {
          body: commands.map((cmd) => cmd.toJSON()),
        }
      );
    }

    console.log("✅ Slash commands registered.");
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
}

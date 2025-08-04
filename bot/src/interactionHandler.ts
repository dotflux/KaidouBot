import { Interaction } from "discord.js";
import * as ping from "./commands/ping";
import * as register from "./commands/register";
import * as profile from "./commands/profile";
import * as factionSelect from "./logic/register/dropdowns/factionSelect";
import * as raceSelect from "./logic/register/dropdowns/raceSelect";

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") return ping.execute(interaction);
    if (interaction.commandName === "register")
      return register.execute(interaction);
    if (interaction.commandName === "profile")
      return profile.execute(interaction);
  }
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith("factionSelect_"))
      return factionSelect.execute(interaction);
    if (interaction.customId.startsWith("raceSelect_"))
      return raceSelect.execute(interaction);
  }

  return;
}

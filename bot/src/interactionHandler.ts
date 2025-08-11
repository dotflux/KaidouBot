import { Interaction } from "discord.js";
import * as ping from "./commands/ping";
import * as register from "./commands/register";
import * as profile from "./commands/profile";
import * as factionSelect from "./logic/register/dropdowns/factionSelect";
import * as raceSelect from "./logic/register/dropdowns/raceSelect";
import * as duel from "./commands/duel";
import * as acceptDuelButton from "./logic/duel/buttons/acceptDuelButton";
import * as rejectDuelButton from "./logic/duel/buttons/rejectDuelButton";
import * as duelActionSelect from "./logic/duel/dropdowns/duelActionCallback";
import * as fsSelect from "./logic/duel/dropdowns/fsSelect";

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") return ping.execute(interaction);
    if (interaction.commandName === "register")
      return register.execute(interaction);
    if (interaction.commandName === "profile")
      return profile.execute(interaction);
    if (interaction.commandName === "duel") return duel.execute(interaction);
  }
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith("factionSelect_"))
      return factionSelect.execute(interaction);
    if (interaction.customId.startsWith("raceSelect_"))
      return raceSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionSelect_"))
      return duelActionSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionFs_"))
      return fsSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionDf_"))
      return fsSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionTf_"))
      return fsSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionRoku_"))
      return fsSelect.execute(interaction);
    if (interaction.customId.startsWith("duelActionWeapon_"))
      return fsSelect.execute(interaction);
  }
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("duelAccept_"))
      return acceptDuelButton.execute(interaction);
    if (interaction.customId.startsWith("duelReject_"))
      return rejectDuelButton.execute(interaction);
  }

  return;
}

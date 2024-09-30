import { Events, type GuildMember, type Interaction, type TextChannel } from "discord.js";
import startVerification from "../features/user-validation/verify-user.js";
import type { ClientWithCommands } from "../types.js";

export default function createEventListeners(client: ClientWithCommands) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!client.commands) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  });

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => startVerification(member));
}

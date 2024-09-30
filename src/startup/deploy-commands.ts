import { Collection, REST, type RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import type { ClientWithCommands, Command } from "../types.js";

export default async function deployCommands(
  client: ClientWithCommands,
  commands: Command[],
): Promise<void> {
  const commandsJSON: RESTPostAPIApplicationCommandsJSONBody[] = [];
  client.commands = new Collection<string, Command>();

  for (const command of commands) {
    client.commands.set(command.data.name, command);
    commandsJSON.push(command.data.toJSON());
  }

  const rest = new REST().setToken(process.env.TOKEN);
  try {
    const data: unknown = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandsJSON },
    );
    console.log(`Successfully deployed ${(data as []).length} application (/) commands.`);
  } catch (error) {
    console.error("ERROR deploying commands", error);
  }
}

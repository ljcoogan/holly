import {
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("d20").setDescription("Roll a d20!"),
  async execute(interaction: ChatInputCommandInteraction) {
    const result = Math.floor(Math.random() * 20);

    if (result === 1) await interaction.reply("Oh no! You rolled a 1!");
    else if (result === 20) await interaction.reply("Hell yeah! You rolled a 20!");
    else await interaction.reply(`You rolled a ${result}.`);
  },
};

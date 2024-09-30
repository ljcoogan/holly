import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("coinflip").setDescription("Flip a coin"),
  async execute(interaction: ChatInputCommandInteraction) {
    const result = Math.random() <= 0.5 ? "heads" : "tails";
    interaction.reply(`The coin flip resulted in ${result}!`);
  },
};

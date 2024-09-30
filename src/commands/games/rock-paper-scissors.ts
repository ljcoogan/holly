import {
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rockpaperscissors")
    .setDescription("Play a game!")
    .addStringOption((option) =>
      option
        .setName("move")
        .setDescription("Enter 'rock', 'paper', or 'scissors'")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("move");
    const answers = ["rock", "paper", "scissors"];

    const response = Math.floor(Math.random() * 3);
    const provided: number = answers.findIndex((answer) => message === answer);

    if (provided === -1) interaction.reply("Hey! This isn't a valid move!");
    else if (response === 0) interaction.reply(`I played ${answers[provided]}. We draw.`);
    else if (response === 1)
      interaction.reply(`I played ${answers[(provided + 1) % 3]}. You lose!`);
    else if (response === 2) interaction.reply(`I played ${answers[(provided + 2) % 3]}. You win!`);
  },
};

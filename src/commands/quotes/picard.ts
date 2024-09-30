import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const QUOTES = [
  "It is possible to commit no mistakes and still lose. That is not weakness, that is life.",
  "That is what it is to be human: To make yourself more than you are.",
  "You cannot explain away a wantonly immoral act because you think that it is connected to some higher purpose.",
  "If we're going to be damned, let's be damned for what we really are.",
  "We have powerful tools: Openness, optimism and the spirit of curiosity.",
  "Someone once told me that time was a predator that stalked us all our lives. I rather believe that time is a companion who goes with us on the journey and reminds us to cherish every moment because it will never come again.",
  "Things are only impossible until they are not.",
  "Make now always the most precious time. Now will never come again.",
  "Fear is the greatest destroyer.",
  "The past is written, but the future is left for us to write.",
  "Buried deep within you, beneath all the years of pain and anger, there is something that has never been nurtured: The potential to be a better man.",
  "The acquisition of wealth is no longer the driving force of our lives. We work to better ourselves and the rest of humanity.",
  "There is a way out of every box, a solution to every puzzle. It's just a matter of finding it.",
  "You have to measure your successes and your failures within, not by anything that I or anyone else might think.",
  "To say you have no choice is a failure of imagination.",
  "Fear is an incompetent teacher.",
  "Sometimes those who shine the brightest feel the sting of fear and melancholy in ways that others can never understand.",
];

export default {
  data: new SlashCommandBuilder().setName("picard").setDescription("Make it so."),
  async execute(interaction: ChatInputCommandInteraction) {
    const result = Math.floor(Math.random() * QUOTES.length);
    interaction.reply(`> ${QUOTES[result]}
\\- *Captain Jean-Luc Picard*`);
  },
};

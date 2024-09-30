import {
  type ChatInputCommandInteraction,
  type GuildMemberRoleManager,
  SlashCommandBuilder,
} from "discord.js";

const QUOTES = [
  "I may not have gone where I intended to go, but I think I have ended up where I needed to be.",
  "I love deadlines. I love the whooshing noise they make as they go by.",
  "The story so far: In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.",
  "For instance, on the planet Earth, man had always assumed that he was more intelligent than dolphins because he had achieved so much—the wheel, New York, wars and so on—whilst all the dolphins had ever done was muck about in the water having a good time. But conversely, the dolphins had always believed that they were far more intelligent than man—for precisely the same reasons.",
  "The Guide says there is an art to flying, or rather a knack. The knack lies in learning how to throw yourself at the ground and miss",
  "Would it save you a lot of time if I just gave up and went mad now?",
  "A learning experience is one of those things that says, 'You know that thing you just did? Don't do that.'",
  "The ships hung in the sky in much the same way that bricks don't.",
  "Space is big. You just won't believe how vastly, hugely, mind-bogglingly big it is. I mean, you may think it's a long way down the road to the chemist's, but that's just peanuts to space.",
  "If there's anything more important than my ego around, I want it caught and shot now.",
  "For a moment, nothing happened. Then, after a second or so, nothing continued to happen.",
  "Ford... you're turning into a penguin. Stop it.",
  "If you try and take a cat apart to see how it works, the first thing you have on your hands is a non-working cat.",
  "Only a child sees things with perfect clarity, because it hasn't developed all those filters which prevent us from seeing things that we don't expect to see.",
  "It is a mistake to think you can solve any major problems just with potatoes.",
  "To summarize the summary of the summary: people are a problem.",
  "First we thought the PC was a calculator. Then we found out how to turn numbers into letters with ASCII — and we thought it was a typewriter. Then we discovered graphics, and we thought it was a television. With the World Wide Web, we've realized it's a brochure.",
  "Perhaps I'm old and tired, but I always think that the chances of finding out what really is going on are so absurdly remote that the only thing to do is to say hang the sense of it and just keep yourself occupied.",
  "See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.",
];

export default {
  data: new SlashCommandBuilder().setName("douglas").setDescription("Forty two."),
  async execute(interaction: ChatInputCommandInteraction) {
    if ((interaction.member.roles as GuildMemberRoleManager).cache.has(process.env.HATED_ROLE_ID)) {
      interaction.reply(
        "You just got banana mellowed! https://www.youtube.com/watch?v=mZjVCHEeSrQ",
      );
    } else {
      const result = Math.floor(Math.random() * QUOTES.length);
      interaction.reply(`> ${QUOTES[result]}
\\- *Douglas Adams*`);
    }
  },
};

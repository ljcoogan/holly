import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import {
  type Channel,
  ChannelType,
  type GuildMember,
  type Message,
  type MessageCollector,
  PermissionsBitField,
  type TextChannel,
} from "discord.js";
import type { VerifiedUser } from "../../types.js";
import { getEmails } from "./google-sheets.js";
import { getVerifiedUsers, saveVerifiedUsers } from "./verified-users.js";

const PRONOUNS_ROLES_PATH = join(process.cwd(), "/secrets/pronouns-roles.json");

export default async function startVerification(member: GuildMember) {
  const channel = await member.guild.channels.create({
    name: `welcome-${member.user.username}`,
    type: ChannelType.GuildText,
    parent: process.env.WELCOME_CATEGORY_ID,
    // Only the new member should be able to view this channel.
    permissionOverwrites: [
      {
        id: member.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: member.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
    ],
  });

  const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  await (welcomeChannel as TextChannel).send(`## Welcome <@${member.user.id}> to the Discord server! :partying_face:
To access the rest of the server, follow the instructions in the <#${channel.id}> channel.
	`);

  await channel.send(`## Society Membership Verification
<@${member.user.id}>, to access the rest of the server, please follow these steps in order:
1. Agree to the **server rules**. Discord should be prompting you to do this right now.
2. Choose your **pronouns** in the <#${process.env.ROLES_CHANNEL_ID}> channel.
3. Change your server **nickname** to your name. You can do this by clicking the drop-down menu at the top left of this server, and choosing *Edit Server Profile*.
4. **Introduce yourself** in the <#${process.env.WELCOME_CHANNEL_ID}> channel! What do you study? What parts of the society interest you?
5. Finally, please enter your **TCD email** in this chat and I'll check if you're on the membership list!
  `);

  const emails = await getEmails();

  const pronouns: string[] = await JSON.parse(readFileSync(PRONOUNS_ROLES_PATH).toString());

  // Filter messages passed to message collector so none of Holly's or Committee's messages are caught.
  const filter = (message: Message) => message.member === member;
  // Create a message collector to allow receiving user's TCD email.
  const collector = channel.createMessageCollector({ filter: filter, time: 604800000 });

  collector.on("collect", async (message: Message) => {
    if (!hasPronounsRole(member, pronouns)) {
      message.reply(
        `Hey, you haven't chosen your pronouns in <#${process.env.ROLES_CHANNEL_ID}>. Please follow all the steps, then come back here and enter your email again!`,
      );
      return;
    }

    if (!(await hasPostedIntroduction(member, welcomeChannel as TextChannel))) {
      message.reply(
        `Hey, you haven't posted an introduction in <#${process.env.WELCOME_CHANNEL_ID}>. Please follow all the steps, then come back here and enter your email again!`,
      );
      return;
    }

    const providedEmail = message.content.trim().toLowerCase();
    if (!emails.includes(providedEmail)) {
      message.reply(
        `Sorry, that's not an email address on our sign-up list. 
-Your message should contain an email address, e.g. 'jcrowley@tcd.ie', and nothing else. 
- If you haven't signed up yet, you can do so here: https://trinitysocietieshub.com/products/science-fiction-and-fantasy-society.
- If you joined today, the signup list might not have updated yet, so you should wait a few hours and try again.
      `,
      );
      return;
    }

    const verifiedUsers: VerifiedUser[] = await getVerifiedUsers();
    const user = verifiedUsers.find((verifiedUser) => verifiedUser.email === providedEmail);
    if (user) {
      if (user.userId !== message.member.user.id) {
        message.reply(
          `Sorry, this email has already been used by someone else! <@&${process.env.COMMITTEE_ROLE_ID}>`,
        );
      } else {
        verifyUser(message, collector);
      }
    } else {
      verifiedUsers.push({
        userId: message.member.user.id,
        email: providedEmail,
      });
      saveVerifiedUsers(verifiedUsers);
      verifyUser(message, collector);
    }
  });

  collector.on("end", async () => closeVerification(channel, member));
}

async function verifyUser(message: Message, collector: MessageCollector) {
  await message.member.roles.add(process.env.MEMBER_ROLE_ID);
  message.reply("Verification successful! I will delete this channel in 10 seconds.");
  await setTimeout(10000);
  collector.stop();
}

async function closeVerification(channel: Channel, member: GuildMember) {
  channel.delete();
  if (!member.roles.cache.has(process.env.MEMBER_ROLE_ID))
    member.kick(
      "You have been a member of the server for one week, and haven't verified your membership yet, so you were kicked automatically. Feel free to rejoin and reverify.",
    );
}

function hasPronounsRole(member: GuildMember, pronouns: string[]) {
  const role = pronouns.find((pronounsRole: string) => member.roles.cache.has(pronounsRole));
  if (role) return true;
  return false;
}

async function hasPostedIntroduction(member: GuildMember, channel: TextChannel) {
  const messages = await channel.messages.fetch({ limit: 200 });
  const introductionMessage = messages.find((message: Message) => message.author.id === member.id);
  if (introductionMessage) return true;
  return false;
}

import {
  type Channel,
  ChannelType,
  type GuildMember,
  type Message,
  type MessageCollector,
  PermissionsBitField,
  type TextChannel,
} from "discord.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { getEmails } from "./read-google-sheet.js";
import { getVerifiedUsers, saveVerifiedUsers } from "./read-verified-users.js";

const PRONOUNS_ROLES_PATH = join(process.cwd(), "/secrets/pronouns-roles.json");

export default async function startVerification(member: GuildMember) {
  // Create a temporary channel for the user to verify in
  const tempChannel = await member.guild.channels.create({
    name: `welcome-${member.user.username}`,
    type: ChannelType.GuildText,
    parent: process.env.WELCOME_CATEGORY_ID,
    // Only the new member should be able to view this channel
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

  // Retrieve welcome channel and send message telling user to go to the temporary channel
  const welcomeChannel = member.guild.channels.cache.get(
    process.env.WELCOME_CHANNEL_ID
  );
  await (welcomeChannel as TextChannel)
    .send(`## Welcome <@${member.user.id}> to the Discord server! :partying_face:
To access the rest of the server, follow the instructions in the <#${tempChannel.id}> channel.
    `);

  // In temporary channel, instruct user how to verify their membership
  await tempChannel.send(`## Society Membership Verification
<@${member.user.id}>, to access the rest of the server, please follow these steps in order:
1. Choose your **pronouns** in the <#${process.env.ROLES_CHANNEL_ID}> channel.
2. Change your server **nickname** to your name. You can do this by clicking the drop-down menu at the top left of this server, and choosing *Edit Server Profile*.
3. **Introduce yourself** in the <#${process.env.WELCOME_CHANNEL_ID}> channel! What do you study? What parts of the society interest you?
4. Finally, please enter your **TCD email** in this chat and I'll check if you're on the membership list!
  `);

  const reminderInterval = setInterval(async () => {
    if (!member.roles.cache.has(process.env.MEMBER_ROLE_ID) && tempChannel) {
      await tempChannel.send(
        `Hey <@${member.user.id}>, just a reminder to complete your verification steps so you can access the rest of the server!`
      );
    } else {
      clearInterval(reminderInterval);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Retrieve user emails from Google Sheet
  const emails = await getEmails();

  // Retrieve pronouns roles from secrets/pronouns-roles.json
  const pronouns: string[] = await JSON.parse(
    readFileSync(PRONOUNS_ROLES_PATH).toString()
  );

  // Filter messages in temporary channel so Holly doesn't read any messages but those of the user being verified
  const filter = (message: Message) => message.member === member;
  // Create a "message collector" in the temporary channel so Holly can read the user's messages
  const collector = tempChannel.createMessageCollector({
    filter: filter,
    time: 10 * 24 * 60 * 60 * 1000, // 7 days
  });

  collector.on("collect", async (message: Message) => {
    // Check if user has selected at least one pronouns role
    if (!hasPronounsRole(member, pronouns)) {
      message.reply(
        `Hey, you haven't chosen your pronouns in <#${process.env.ROLES_CHANNEL_ID}>. Please follow all the steps, then come back here and enter your email again!`
      );
      return;
    }

    // Check if user has posted an introduction in the welcome channel
    if (!(await hasPostedIntroduction(member, welcomeChannel as TextChannel))) {
      message.reply(
        `Hey, you haven't posted an introduction in <#${process.env.WELCOME_CHANNEL_ID}>. Please follow all the steps, then come back here and enter your email again!`
      );
      return;
    }

    // Check if the message is an email address on the sign-up list
    const providedEmail = message.content.trim().toLowerCase();
    if (!emails.includes(providedEmail)) {
      message.reply(
        `Sorry, that's not an email address on our sign-up list.
- Your message should contain an email address, e.g. 'jcrowley@tcd.ie', and nothing else.
- If you haven't signed up yet, you can do so here: https://trinitysocietieshub.com/products/science-fiction-and-fantasy-society.
- If you joined today, the sign-up list might not have updated yet, so you should wait a few hours and try again.
      `
      );
      return;
    }

    // Retrieve list of verified users and determine if user is already verified
    const verifiedUsers = await getVerifiedUsers();
    const user = verifiedUsers.find(
      (verifiedUser) => verifiedUser.email === providedEmail
    );
    if (user) {
      // This happens if somebody else has already verified with the same email
      if (user.userId !== message.member.user.id) {
        message.reply(
          `Sorry, this email has already been used by someone else! <@&${process.env.COMMITTEE_ROLE_ID}>`
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

  // At the end of the 7 days, close the verification process, kicking if unverified
  collector.on("end", async () => closeVerification(tempChannel, member));
}

/**
 * On successful verification, award the member role and delete the temporary channel
 * @param message - The Discord message containing the verified email
 * @param collector - The message collector that will be stopped
 */
async function verifyUser(message: Message, collector: MessageCollector) {
  await message.member.roles.add(process.env.MEMBER_ROLE_ID);
  message.reply(
    "Verification successful! I will delete this channel in 10 seconds."
  );
  await setTimeout(10000);
  collector.stop();
}

/**
 * End the verification process by deleting the temporary channel and kicking the user if unverified
 * @param channel - The temporary channel used for verification
 * @param member - The user being verified
 */
async function closeVerification(channel: Channel, member: GuildMember) {
  channel.delete();
  if (!member.roles.cache.has(process.env.MEMBER_ROLE_ID))
    member.kick(
      "You have been a member of the server for ten days, and haven't verified your membership yet, so you were kicked automatically. Feel free to rejoin using the link in the email!"
    );
}

/**
 * Determine if a user has selected a pronouns role
 * @param member - The user being verified
 * @param pronouns - An array of IDs of Discord roles representing pronouns
 * @returns Whether the user has selected a pronouns role
 */
function hasPronounsRole(member: GuildMember, pronouns: string[]) {
  const role = pronouns.find((pronounsRole: string) =>
    member.roles.cache.has(pronounsRole)
  );
  if (role) return true;
  return false;
}

/**
 * Determines if a user has posted a message in the last 100 messages in the welcome channel
 * @param member - The user being verified
 * @param channel - The temporary channel used for verification
 * @returns
 */
async function hasPostedIntroduction(
  member: GuildMember,
  channel: TextChannel
) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const introductionMessage = messages.find(
    (message: Message) => message.author.id === member.id
  );
  if (introductionMessage) return true;
  return false;
}

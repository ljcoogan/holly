import { exit } from "process";
import client from "./system/client.js";

export default (async () => {
  if (
    !process.env.TOKEN ||
    !process.env.CLIENT_ID ||
    !process.env.GUILD_ID ||
    !process.env.MEMBER_ROLE_ID ||
    !process.env.COMMITTEE_ROLE_ID ||
    !process.env.ERROR_CHANNEL_ID ||
    !process.env.WELCOME_CHANNEL_ID ||
    !process.env.SIGNUP_SHEET_ID ||
    !process.env.SIGNUP_SHEET_RANGE
  ) {
    console.error("index.ts: Missing required environment variables.");
    exit(1);
  }

  client.login(process.env.TOKEN);
})();

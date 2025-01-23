import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { authenticate } from "@google-cloud/local-auth";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = join(process.cwd(), "secrets/google-token.json");
const CREDENTIALS_PATH = join(process.cwd(), "secrets/google-credentials.json");

/**
 * Retrieve email addresses from the Google Sheet, provided the Sheet ID and range are correct,
 * and secrets/google-token.json and secrets/google-credentials.json exist
 *
 * @returns {string[]} - List of emails from the Google Sheet
 */
export async function getEmails(): Promise<string[]> {
  const client = await authorize();

  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SIGNUP_SHEET_ID,
    range: process.env.SIGNUP_SHEET_RANGE,
  });

  if (!res.data.values) throw Error;
  const emails = res.data.values.map((value) => {
    return value[0];
  });

  return emails;
}

/**
 * Use secrets/google-token.json and secrets/google-credentials.json to authenticate with Google,
 * so we can read the spreadsheet
 *
 * @returns {OAuth2Client} - Authenticated client for interacting with Google Sheets
 */
async function authorize(): Promise<OAuth2Client> {
  // Attempt to read credentials from token.json
  try {
    const credentials = await JSON.parse(readFileSync(TOKEN_PATH).toString());
    const authCredentials = google.auth.fromJSON(credentials);
    return authCredentials as OAuth2Client;
    // If this fails, create new token.json
  } catch (_) {
    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

    const key = await JSON.parse(readFileSync(CREDENTIALS_PATH).toString()).web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    writeFileSync(TOKEN_PATH, payload);

    return client;
  }
}

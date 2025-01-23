import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { VerifiedUser } from "../../types";

const USED_EMAILS_PATH = join(process.cwd(), "secrets/verified-users.json");

/**
 * Retrieve list of already verified users in verified-users.json
 *
 * @returns Array of verified users
 */
export async function getVerifiedUsers(): Promise<VerifiedUser[]> {
  return JSON.parse(readFileSync(USED_EMAILS_PATH).toString());
}

/**
 * Save the updated verified users to verified-users.json
 *
 * @param verifiedUsers - Array of verified users
 */
export function saveVerifiedUsers(verifiedUsers: VerifiedUser[]): void {
  writeFileSync(USED_EMAILS_PATH, JSON.stringify(verifiedUsers));
}

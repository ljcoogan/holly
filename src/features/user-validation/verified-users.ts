import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { VerifiedUser } from "../../types";

const USED_EMAILS_PATH = join(process.cwd(), "secrets/verified-users.json");

export async function getVerifiedUsers(): Promise<VerifiedUser[]> {
  return JSON.parse(readFileSync(USED_EMAILS_PATH).toString());
}

export function saveVerifiedUsers(verifiedUsers: VerifiedUser[]): void {
  writeFileSync(USED_EMAILS_PATH, JSON.stringify(verifiedUsers));
}

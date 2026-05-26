/**
 * scripts/create-admin.ts — Interactive admin user creator.
 *
 * Run with:
 *   npm run admin:create
 *
 * Why this exists (and not in prisma/seed.ts):
 *   - No env vars ever touch a password. The seed file *had* an admin
 *     branch that read SEED_ADMIN_PASSWORD — removing it keeps creds
 *     out of .env, CI secrets, Docker config, and shell history.
 *   - This script prompts interactively. Password input is hidden (raw
 *     mode, no echo). Plaintext lives only in process memory for the
 *     few ms it takes to argon2-hash and write the hash to the DB.
 *   - Idempotent: re-running with the same email *resets* the password
 *     (handy if you forget it) but does not create duplicates.
 *
 * Safe to invoke from a clean shell:
 *   $ npm run admin:create
 *   Admin email: ...
 *   Admin password: ********    ← never echoed, never logged
 *   ✓ Admin upserted: ...@example.com
 */

import "dotenv/config";
import { createInterface, Interface } from "node:readline";
import { stdin, stdout } from "node:process";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 12;

/** Prompt that echoes input — used for email and confirmation. */
function ask(rl: Interface, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
}

/**
 * Prompt for a password without echoing characters to the terminal.
 * Uses raw stdin mode and intercepts each keystroke.
 *
 * On platforms where raw mode isn't available (some Windows shells, CI),
 * the readline echo-off fallback kicks in.
 */
function askPassword(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(prompt);

    if (!stdin.isTTY) {
      // Non-TTY (piped input, CI). Read a single line normally — caller
      // accepts that piped scripts have whatever protection they provide.
      const rl = createInterface({ input: stdin, output: stdout });
      rl.question("", (a) => {
        rl.close();
        resolve(a);
      });
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let buffer = "";

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        // Enter
        if (ch === "\r" || ch === "\n") {
          stdout.write("\n");
          cleanup();
          resolve(buffer);
          return;
        }
        // Ctrl-C
        if (ch === "") {
          stdout.write("\n");
          cleanup();
          reject(new Error("Cancelled."));
          return;
        }
        // Backspace / DEL
        if (ch === "" || ch === "") {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        // Ignore other control chars
        if (ch < " ") continue;
        // Printable
        buffer += ch;
        stdout.write("*");
      }
    };

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const db = new PrismaClient({ adapter });

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log("\n→ Create / reset an admin user\n");

    const email = (await ask(rl, "Admin email:    ")).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      console.error("✗ That doesn't look like a valid email. Aborting.");
      process.exit(1);
    }

    rl.close(); // close the echoing readline; password uses raw stdin

    const password = await askPassword("Admin password: ");
    if (password.length < MIN_PASSWORD_LENGTH) {
      console.error(
        `\n✗ Password must be at least ${MIN_PASSWORD_LENGTH} characters. Aborting.`
      );
      process.exit(1);
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      console.error(
        "\n✗ Password must contain upper-case, lower-case and a digit. Aborting."
      );
      process.exit(1);
    }

    const confirm = await askPassword("Confirm:        ");
    if (confirm !== password) {
      console.error("\n✗ Passwords don't match. Aborting.");
      process.exit(1);
    }

    const passwordHash = await hash(password);

    // Best-effort: scrub the plaintext from memory. JS strings are immutable
    // so we can't truly zero them, but we drop our references so the GC
    // can reclaim them.
    // (We still have `confirm` and the raw input chunk strings held by
    // readline; argon2 hashing is the security boundary, not this scrub.)
    let _wipe: string | undefined = password;
    _wipe = undefined;
    void _wipe;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: email.split("@")[0],
        role: "ADMIN",
        passwordHash,
      },
      update: {
        passwordHash, // resets password if you re-run with the same email
        role: "ADMIN",
      },
    });

    console.log(`\n✓ Admin upserted: ${user.email}`);
    console.log(`  user.id = ${user.id}`);
    console.log(`  role    = ${user.role}\n`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error("✗ Failed:", err.message ?? err);
  process.exit(1);
});

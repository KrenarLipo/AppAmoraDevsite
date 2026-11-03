/**
 * Create an admin account, or reset an existing account's password and make it admin.
 *
 *   pnpm admin:create you@example.com
 *
 * Runs against the DATABASE_URL in apps/web/.env.local (or the environment).
 */
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { getDb } from "@appamora/db";
import { hashPassword } from "better-auth/crypto";

const MIN_PASSWORD_LENGTH = 12;

// One reader for the whole run; a muted output stream keeps the typed password off the screen.
let muted = false;
const rl = createInterface({
  input: process.stdin,
  output: new Writable({
    write(chunk, _encoding, done) {
      if (!muted) process.stdout.write(chunk);
      done();
    },
  }),
  terminal: process.stdin.isTTY,
});

// The iterator buffers lines, so piped input works as well as typing.
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string, { hidden = false } = {}): Promise<string> {
  process.stdout.write(question);
  muted = hidden;
  const { value, done } = await lines.next();
  muted = false;
  if (hidden || !process.stdin.isTTY) process.stdout.write("\n");
  if (done) throw new Error("No input received.");
  return String(value).trim();
}

async function main() {
  const email = (process.argv[2] ?? (await ask("Admin email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`"${email}" is not a valid email address.`);

  const db = getDb();
  const existing = await db.user.findUnique({ where: { email } });
  const name = existing?.name ?? ((await ask("Your name: ")) || "Admin");

  const password = await ask(`Password (at least ${MIN_PASSWORD_LENGTH} characters): `, { hidden: true });
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  if ((await ask("Repeat password: ", { hidden: true })) !== password) throw new Error("The passwords don't match.");

  const hash = await hashPassword(password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } })
    : await db.user.create({ data: { id: randomUUID(), email, name, role: "ADMIN", emailVerified: true } });

  // Better Auth stores the password on a "credential" account whose accountId is the user id.
  const credential = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
  if (credential) {
    await db.account.update({ where: { id: credential.id }, data: { password: hash } });
  } else {
    await db.account.create({
      data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: hash },
    });
  }

  console.log(`\n✓ ${existing ? "Updated" : "Created"} admin ${email}. Log in at /en/login`);
  await db.$disconnect();
}

main()
  .catch((error: unknown) => {
    console.error(`\n✗ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());

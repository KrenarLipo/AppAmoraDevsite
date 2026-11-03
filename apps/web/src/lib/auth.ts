import { getDb } from "@appamora/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins/captcha";

/** Google login is offered only once its keys are set in the environment. */
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

function createAuth() {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

  return betterAuth({
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      // No public sign-up yet: the admin is created with `pnpm admin:create`.
      // Client sign-up (with email verification) arrives with the builder in phase 2.
      disableSignUp: true,
      minPasswordLength: 12,
    },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Google can only log in existing users; it links to the account with the same email.
            disableSignUp: true,
          },
        }
      : {},
    account: {
      accountLinking: { enabled: true, trustedProviders: ["google"] },
    },
    user: {
      additionalFields: {
        role: { type: "string", input: false, defaultValue: "USER" },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: { "/sign-in/email": { window: 60, max: 5 } },
    },
    plugins: [
      ...(recaptchaSecret
        ? [
            captcha({
              provider: "google-recaptcha",
              secretKey: recaptchaSecret,
              endpoints: ["/sign-in/email"],
              expectedAction: "login",
              minScore: 0.5,
            }),
          ]
        : []),
      // Must stay last: lets server actions set the session cookie.
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { auth?: Auth };

/** The Better Auth instance, created on first use so builds don't need a database. */
export function getAuth(): Auth {
  globalForAuth.auth ??= createAuth();
  return globalForAuth.auth;
}

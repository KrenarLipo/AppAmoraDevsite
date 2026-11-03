"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    // /admin without a session redirects to the login page in the visitor's language.
    router.replace("/admin");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="h-11 shrink-0 px-2 text-sm font-semibold text-paper hover:text-amora-bright">
      Sign out
    </button>
  );
}

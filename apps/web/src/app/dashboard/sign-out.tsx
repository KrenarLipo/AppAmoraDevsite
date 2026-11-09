"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function DashboardSignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/dashboard");
        router.refresh();
      }}
      className="h-11 shrink-0 px-2 text-sm font-semibold text-paper hover:text-amora-bright"
    >
      Sign out
    </button>
  );
}

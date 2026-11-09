import Link from "next/link";
import { stopViewingAsClient } from "@/app/admin/(panel)/clients/actions";
import { requireClient } from "@/lib/client";
import { DashboardSignOut } from "./sign-out";

/** Top-of-page notices: admin preview, trial days left, trial ended. */
export async function AccountBanner() {
  const ctx = await requireClient();
  return (
    <>
      {ctx.viewingAsAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#2B2F8F] px-4 py-2.5 text-sm text-white sm:px-6 md:px-10">
          <span>
            You&apos;re viewing <strong>{ctx.client.name}</strong>&apos;s dashboard as admin. Changes you save are real.
          </span>
          <form action={stopViewingAsClient}>
            <button type="submit" className="h-9 rounded-lg bg-white/15 px-3 font-semibold hover:bg-white/25">
              Back to admin
            </button>
          </form>
        </div>
      )}
      {ctx.state.kind === "trial" && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF3D6] px-4 py-2.5 text-sm text-[#5C3D00] sm:px-6 md:px-10">
          <span>
            Free trial: <strong>{ctx.state.daysLeft} {ctx.state.daysLeft === 1 ? "day" : "days"} left</strong>. Some features need a paid plan.
          </span>
          <Link href="/dashboard/billing" className="font-semibold underline underline-offset-4">
            Choose a plan
          </Link>
        </div>
      )}
      {ctx.locked && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amora px-4 py-3 text-sm text-white sm:px-6 md:px-10">
          <span>
            <strong>Your free trial has ended.</strong> Your website is offline and you can only change the name and logo. Your work is saved.
          </span>
          <Link href="/dashboard/billing" className="h-9 rounded-lg bg-white px-3 py-2 font-semibold text-amora-dark">
            Choose a plan
          </Link>
        </div>
      )}
    </>
  );
}

export async function CurrentUser() {
  const ctx = await requireClient();
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <span className="truncate text-sm text-mist" title={ctx.user.email}>
        {ctx.viewingAsAdmin ? "Admin view" : ctx.user.email}
      </span>
      <DashboardSignOut />
    </div>
  );
}

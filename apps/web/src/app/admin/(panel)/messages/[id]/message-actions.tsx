"use client";

import type { ContactStatus } from "@appamora/db";
import { useEffect, useTransition } from "react";
import { deleteMessage, markMessageRead, setMessageStatus } from "../actions";

const buttonClass =
  "flex h-11 items-center rounded-[10px] border border-line-strong px-4 font-semibold transition-colors hover:border-ink disabled:opacity-50";

export function MessageActions({ id, status }: { id: string; status: ContactStatus }) {
  const [pending, startTransition] = useTransition();

  // Opening a new message marks it as read (done here, not during render, so prefetching can't).
  useEffect(() => {
    if (status === "NEW") void markMessageRead(id);
  }, [id, status]);

  const run = (action: () => Promise<void>) => startTransition(action);

  return (
    <>
      {status === "ARCHIVED" ? (
        <button type="button" disabled={pending} className={buttonClass} onClick={() => run(() => setMessageStatus(id, "READ"))}>
          Move to inbox
        </button>
      ) : (
        <>
          <button type="button" disabled={pending} className={buttonClass} onClick={() => run(() => setMessageStatus(id, "NEW"))}>
            Mark as unread
          </button>
          <button type="button" disabled={pending} className={buttonClass} onClick={() => run(() => setMessageStatus(id, "ARCHIVED"))}>
            Archive
          </button>
        </>
      )}
      <button
        type="button"
        disabled={pending}
        className={`${buttonClass} text-amora-dark hover:border-amora-dark`}
        onClick={() => {
          if (confirm("Delete this message permanently?")) run(() => deleteMessage(id));
        }}
      >
        Delete
      </button>
    </>
  );
}

"use client";

import { useTransition } from "react";
import { deleteMessage, setMessageRead } from "../actions";

const button = "flex h-10 items-center rounded-[10px] border border-line-strong px-3 text-sm font-semibold hover:border-ink disabled:opacity-50";

export function MessageActions({ id, read, email }: { id: string; read: boolean; email: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`mailto:${email}`} className={`${button} bg-ink text-paper`}>
        Reply by email
      </a>
      <button type="button" disabled={pending} onClick={() => startTransition(() => setMessageRead(id, !read))} className={button}>
        {read ? "Mark as new" : "Mark as read"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this message?")) startTransition(() => deleteMessage(id));
        }}
        className={`${button} text-amora-dark`}
      >
        Delete
      </button>
    </div>
  );
}

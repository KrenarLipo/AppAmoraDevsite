"use client";

import { useTransition } from "react";
import { deleteSubscriber } from "../actions";

export function DeleteSubscriber({ id, email }: { id: string; email: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Remove ${email}`}
      onClick={() => {
        if (confirm(`Remove ${email}?`)) startTransition(() => deleteSubscriber(id));
      }}
      className="flex size-10 items-center justify-center rounded-[10px] border border-line-strong text-sm text-amora-dark hover:border-amora-dark"
    >
      ✕
    </button>
  );
}

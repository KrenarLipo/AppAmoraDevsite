"use client";

import { useTransition } from "react";
import { deletePage, movePage } from "../actions";

const small = "flex size-10 items-center justify-center rounded-[10px] border border-line-strong text-sm font-semibold hover:border-ink disabled:opacity-30";

export function PageRowActions({ id, canMoveUp, canMoveDown, canDelete }: { id: string; canMoveUp: boolean; canMoveDown: boolean; canDelete: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <span className="flex gap-1">
      <button type="button" aria-label="Move up" disabled={!canMoveUp || pending} onClick={() => startTransition(async () => void (await movePage(id, -1)))} className={small}>
        ↑
      </button>
      <button type="button" aria-label="Move down" disabled={!canMoveDown || pending} onClick={() => startTransition(async () => void (await movePage(id, 1)))} className={small}>
        ↓
      </button>
      {canDelete && (
        <button
          type="button"
          aria-label="Delete page"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this page in all languages?")) startTransition(async () => void (await deletePage(id)));
          }}
          className={`${small} text-amora-dark`}
        >
          ✕
        </button>
      )}
    </span>
  );
}

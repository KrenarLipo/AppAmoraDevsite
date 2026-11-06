export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return status === "PUBLISHED" ? (
    <span className="rounded-md bg-[#E3F4EC] px-2 py-0.5 font-mono text-[11px] text-[#0F7A50] uppercase">Published</span>
  ) : (
    <span className="rounded-md bg-sand px-2 py-0.5 font-mono text-[11px] text-muted uppercase">Draft</span>
  );
}

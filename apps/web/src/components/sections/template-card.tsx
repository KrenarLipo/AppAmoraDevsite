import type { templates } from "@/lib/catalog";

type Props = {
  template: (typeof templates)[number];
  name: string;
  description: string;
  defaultBadge: string;
};

/** A template with a small abstract thumbnail drawn in its own colors. */
export function TemplateCard({ template, name, description, defaultBadge }: Props) {
  const { bg, hero, fg, accent } = template.colors;
  return (
    <article className="flex flex-[1_1_340px] flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      <div aria-hidden="true" className="relative flex h-[190px] flex-col gap-2.5 p-[18px]" style={{ background: bg }}>
        <div className="flex items-center justify-between">
          <span className="h-2 w-[54px] rounded" style={{ background: fg }} />
          <span className="flex gap-1.5">
            {[0, 1, 2].map((n) => (
              <span key={n} className="h-1.5 w-[22px] rounded-sm opacity-50" style={{ background: fg }} />
            ))}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 rounded-[10px] p-4" style={{ background: hero }}>
          <span className="h-3 w-3/5 rounded" style={{ background: fg }} />
          <span className="h-2 w-2/5 rounded opacity-55" style={{ background: fg }} />
          <span className="mt-1 h-[18px] w-[70px] rounded-[5px]" style={{ background: accent }} />
        </div>
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 px-5 pt-[18px] pb-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-xl font-semibold text-paper">{name}</h3>
          <p className="text-sm text-mist">{description}</p>
        </div>
        {template.isDefault && (
          <span className="shrink-0 rounded-md bg-amora-bright px-2 py-1 font-mono text-[11px] font-medium text-ink uppercase">
            {defaultBadge}
          </span>
        )}
      </div>
    </article>
  );
}

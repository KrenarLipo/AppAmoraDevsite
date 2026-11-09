import Image from "next/image";
import type { templates } from "@/lib/catalog";
import { nicheDefaults } from "@/lib/sites/niche-defaults";

type Props = {
  template: (typeof templates)[number];
  name: string;
  description: string;
  defaultBadge: string;
};

/** A template with its default photo and a hint of its colors. */
export function TemplateCard({ template, name, description, defaultBadge }: Props) {
  const { bg, accent } = template.colors;
  return (
    <article className="flex flex-[1_1_340px] flex-col overflow-hidden rounded-2xl border border-panel-line bg-panel">
      <div aria-hidden="true" className="group relative h-[200px] overflow-hidden" style={{ background: bg }}>
        <Image
          src={nicheDefaults[template.id].images[0]!.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-[18px] bottom-[18px] flex items-end justify-between gap-3">
          <span className="flex flex-col gap-1.5">
            <span className="h-2.5 w-28 rounded bg-white" />
            <span className="h-2 w-16 rounded bg-white/60" />
          </span>
          <span className="h-[22px] w-[74px] rounded-[5px]" style={{ background: accent }} />
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

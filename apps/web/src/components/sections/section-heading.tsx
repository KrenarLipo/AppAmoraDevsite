import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  body?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "start" | "center";
  /** Use "h1" when the heading opens a page. */
  as?: "h1" | "h2";
};

export function SectionHeading({ eyebrow, title, body, action, tone = "light", align = "start", as: Tag = "h2" }: Props) {
  const centered = align === "center";
  return (
    <div className={`flex flex-wrap items-end gap-6 ${centered ? "justify-center text-center" : "justify-between"}`}>
      <div className={`flex max-w-[660px] flex-col gap-3.5 ${centered ? "items-center" : ""}`}>
        <p className={`eyebrow ${tone === "dark" ? "text-amora-bright" : "text-amora"}`}>{eyebrow}</p>
        <Tag className="font-display text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
          {title}
        </Tag>
        {body && <p className={`text-lg leading-relaxed ${tone === "dark" ? "text-mist" : "text-muted"}`}>{body}</p>}
      </div>
      {action}
    </div>
  );
}

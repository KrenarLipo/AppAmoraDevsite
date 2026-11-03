import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  external: boolean;
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

/** A menu link: client-side navigation for site pages, a new tab for https:// links. */
export function NavLink({ href, external, label, className, onClick, children }: Props) {
  const content = children ?? label;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {content}
      </a>
    );
  }
  if (!href.startsWith("/")) {
    // mailto: and similar
    return (
      <a href={href} className={className} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {content}
    </Link>
  );
}

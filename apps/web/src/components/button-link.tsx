import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-amora text-white hover:bg-amora-dark",
  dark: "bg-ink text-paper hover:bg-panel",
  outline: "border-[1.5px] border-ink text-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-white",
  ghostDark: "border border-[#3A404C] text-paper hover:border-paper",
} as const;

const sizes = {
  md: "h-11 px-5 text-[15px] rounded-[10px]",
  lg: "h-[52px] px-6 text-base rounded-xl",
} as const;

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({ variant = "primary", size = "lg", className = "", ...props }: Props) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2.5 font-semibold whitespace-nowrap transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

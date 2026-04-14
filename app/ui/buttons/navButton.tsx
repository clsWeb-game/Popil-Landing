import Link from "next/link";
import React from "react";

type CommonProps = {
  text?: string;
  /** Applied to the text span (e.g. `sr-only md:not-sr-only` for icon-only on small screens). */
  textClassName?: string;
  icon?: React.ReactNode;
  /**
   * Tailwind (or CSS) class string applied to text/icon color.
   * Example: "text-white" | "text-black" | "text-zinc-500"
   */
  colorClassName?: string;
  className?: string;
};

type NavButtonProps =
  | (CommonProps & {
      href: string;
      onClick?: never;
    })
  | (CommonProps & {
      href?: never;
      onClick: React.MouseEventHandler<HTMLButtonElement>;
    });

function isHrefVariant(
  props: NavButtonProps,
): props is CommonProps & { href: string; onClick?: never } {
  return typeof (props as { href?: unknown }).href === "string";
}

export default function NavButton(props: NavButtonProps) {
  const {
    icon,
    text,
    textClassName = "",
    colorClassName = "text-inherit",
    className = "",
  } = props;

  const content = (
    <span className={`flex items-center justify-center gap-2 ${colorClassName}`}>
      {icon}
      {text ? <span className={textClassName}>{text}</span> : null}
    </span>
  );

  if (isHrefVariant(props)) {
    return (
      <Link href={props.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={className}>
      {content}
    </button>
  );
}
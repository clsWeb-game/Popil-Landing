import { Search } from "lucide-react";
import "@/app/globals.css";

type Props = {
  placeholder?: string;
  defaultCollapsed?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpen?: () => void;
};

export default function ResizeSearchBar({
  placeholder = "search",
  defaultCollapsed = false,
  className,
  value,
  onChange,
  onFocus,
  collapsed,
  onCollapsedChange,
  onOpen,
}: Props) {
  return (
    <div className={["ResizeSearchBar__container", className].filter(Boolean).join(" ")}>
      <input
        {...(typeof collapsed === "boolean"
          ? { checked: collapsed }
          : { defaultChecked: defaultCollapsed })}
        className="ResizeSearchBar__checkbox"
        type="checkbox"
        aria-label="Toggle search"
        onChange={(e) => {
          const nextCollapsed = e.target.checked;
          onCollapsedChange?.(nextCollapsed);
          if (!nextCollapsed) onOpen?.();
        }}
      />
      <div className="ResizeSearchBar__mainbox">
        <div className="ResizeSearchBar__iconContainer" aria-hidden="true">
          <Search className="h-[16px] w-[16px] md:h-[24px] md:w-[24px]" />
        </div>
        <input
          className="ResizeSearchBar__searchInput"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}

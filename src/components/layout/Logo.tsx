import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className="grid size-9 shrink-0 rotate-[-6deg] place-items-center border-2 border-ink bg-primary font-display text-lg text-primary-foreground shadow-brutal-sm">
        M
      </div>
      {!compact && (
        <span className="truncate font-display text-lg uppercase leading-none tracking-tight">
          The Mavericks
        </span>
      )}
    </div>
  );
}

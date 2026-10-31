import { cn } from "@/lib/utils";
import type { Member } from "@/types/member";

const TONES = ["bg-primary", "bg-success", "bg-destructive", "bg-ink"];

export function MemberAvatar({
  member,
  index = 0,
  className,
}: {
  member: Pick<Member, "display_name" | "avatar_url">;
  index?: number;
  className?: string;
}) {
  if (member.avatar_url) {
    return (
      <img
        src={member.avatar_url}
        alt={member.display_name}
        className={cn("size-10 shrink-0 border-2 border-ink object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center border-2 border-ink font-display text-primary-foreground",
        TONES[index % TONES.length],
        className,
      )}
    >
      {member.display_name[0]}
    </div>
  );
}

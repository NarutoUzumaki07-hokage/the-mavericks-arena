import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMembers } from "@/hooks/use-members";
import { authenticateMember } from "@/lib/session";
import { Logo } from "@/components/layout/Logo";
import { MemberAvatar } from "@/components/ui/member-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LoginScreen() {
  const members = useMembers();
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    if (!memberId) return;
    setBusy(true);
    await authenticateMember(memberId);
    navigate({ to: "/learning", replace: true });
  };

  return (
    <div className="grid-paper relative min-h-screen overflow-hidden">
      {/* geometric shapes */}
      <div aria-hidden className="absolute -left-10 top-24 size-40 rotate-12 border-2 border-ink bg-primary shadow-brutal-lg" />
      <div aria-hidden className="absolute -right-8 bottom-20 size-32 rounded-full border-2 border-ink bg-success shadow-brutal-lg" />
      <div aria-hidden className="absolute right-[18%] top-10 hidden size-16 rotate-45 border-2 border-ink bg-destructive shadow-brutal md:block" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo />
          <h1 className="mt-8 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
            Learn daily.
            <br />
            <span className="inline-block -rotate-1 border-2 border-ink bg-primary px-2 text-primary-foreground shadow-brutal">
              Win together.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg">
            Welcome back to the arena. Track your focused hours, keep your streak alive and push the
            whole squad forward.
          </p>
          <div className="mt-6 flex -space-x-2">
            {members.map((m, i) => (
              <MemberAvatar key={m.id} member={m} index={i} className="size-11" />
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 shadow-brutal-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Member check-in</p>
          <h2 className="mt-1 font-display text-2xl uppercase">Who's training today?</h2>

          <label htmlFor="member" className="mt-6 block text-sm font-bold">
            Select your name
          </label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger
              id="member"
              aria-label="Select your name"
              className="mt-2 h-14 rounded-none border-2 border-ink bg-background text-base font-bold shadow-brutal-sm"
            >
              <SelectValue placeholder="Choose a Maverick" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-ink">
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id} className="py-3 text-base font-bold">
                  {m.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={enter}
            disabled={!memberId || busy}
            className="brutal brutal-press mt-6 flex h-14 w-full items-center justify-center gap-2 bg-primary font-display text-lg uppercase text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enter the Arena <ArrowRight className="size-5" />
          </button>
          <p className="mt-4 text-xs text-muted-foreground">Private team space · 4 members only</p>
        </div>
      </div>
    </div>
  );
}

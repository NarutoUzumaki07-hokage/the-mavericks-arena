import { Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useProgressMap, useRoadmap } from "@/hooks/use-learning";
import { useMembers } from "@/hooks/use-members";
import { appDate, dayState } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { Checklist } from "../Checklist";
import { ResourceList } from "../Resources";
import { ProgressBar, StatusBadge } from "../StatusBadge";
import { TimerPanel } from "../TimerPanel";
import { dayLabel } from "../ListView";
import { Notes } from "./Notes";
import { VoiceNotes } from "./VoiceNotes";
import { Attachments } from "./Attachments";

const TABS = ["Overview", "Checklist", "Resources", "My Notes", "Voice Notes", "Attachments"] as const;

export function WorkspacePage({ dayId }: { dayId: string }) {
  const days = useRoadmap();
  const progress = useProgressMap();
  const members = useMembers();
  const index = days.findIndex((d) => d.id === dayId);
  const day = days[index];
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  if (!day) {
    return (
      <div className="brutal bg-card p-8 text-center">
        <p className="font-display text-xl uppercase">Topic not found</p>
        <Link to="/learning" className="mt-3 inline-block font-bold underline">Back to Today's Learning</Link>
      </div>
    );
  }
  const st = dayState(day, progress, appDate());
  const name = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? "—";

  return (
    <>
      <Link to="/learning" className="mb-4 inline-flex items-center gap-1 text-sm font-bold hover:underline"><ArrowLeft className="size-4" /> Today's Learning</Link>
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-ink bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">{dayLabel(index)}</span>
          <StatusBadge state={st} />
        </div>
        <h1 className="mt-2 font-display text-3xl uppercase leading-none sm:text-5xl">{day.title}</h1>
      </div>

      <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" className="flex w-max border-2 border-ink shadow-brutal-sm">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("h-11 whitespace-nowrap border-r-2 border-ink px-4 text-sm font-bold last:border-r-0", tab === t ? "bg-primary text-primary-foreground" : "bg-background")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<p className="text-sm font-bold">Loading…</p>}>
        {tab === "Overview" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="brutal space-y-4 bg-card p-5">
              <p>{day.description || <span className="text-muted-foreground">No description yet.</span>}</p>
              <ProgressBar percent={st.percent} />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs font-bold uppercase text-muted-foreground">Intended date</dt><dd className="font-bold">{day.scheduled_date}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-muted-foreground">Estimate</dt><dd className="font-bold">~{day.estimated_minutes} min</dd></div>
                <div><dt className="text-xs font-bold uppercase text-muted-foreground">My checklist</dt><dd className="font-bold">{st.done}/{st.total}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-muted-foreground">Resources</dt><dd className="font-bold">{day.learning_resources.length}</dd></div>
              </dl>
              <p className="text-[11px] text-muted-foreground">Created by {name(day.created_by)} · last edited by {name(day.updated_by)} {new Date(day.updated_at).toLocaleString()}</p>
            </div>
            <TimerPanel defaultDayId={day.id} compact />
          </div>
        )}
        {tab === "Checklist" && <Checklist day={day} />}
        {tab === "Resources" && <ResourceList day={day} />}
        {tab === "My Notes" && <Notes dayId={day.id} />}
        {tab === "Voice Notes" && <VoiceNotes dayId={day.id} />}
        {tab === "Attachments" && <Attachments dayId={day.id} />}
      </Suspense>
    </>
  );
}

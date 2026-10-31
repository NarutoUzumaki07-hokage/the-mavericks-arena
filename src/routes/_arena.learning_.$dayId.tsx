import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/features/learning/workspace/WorkspacePage";

export const Route = createFileRoute("/_arena/learning_/$dayId")({
  head: () => ({
    meta: [
      { title: "Learning Workspace · The Mavericks" },
      { name: "description", content: "Checklist, resources, notes, voice notes and files for one learning topic." },
      { property: "og:title", content: "Learning Workspace · The Mavericks" },
      { property: "og:description", content: "Checklist, resources, notes, voice notes and files for one learning topic." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { dayId } = Route.useParams();
  return <WorkspacePage key={dayId} dayId={dayId} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { TeamProgressPage } from "@/features/progress/TeamProgressPage";

export const Route = createFileRoute("/_arena/progress")({
  head: () => ({
    meta: [
      { title: "Team Progress · The Mavericks" },
      { name: "description", content: "How every Maverick is tracking on learning and focus." },
      { property: "og:title", content: "Team Progress · The Mavericks" },
      { property: "og:description", content: "How every Maverick is tracking on learning and focus." },
    ],
  }),
  component: TeamProgressPage,
});

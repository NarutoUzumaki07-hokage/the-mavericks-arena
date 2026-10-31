import { createFileRoute } from "@tanstack/react-router";
import { TodayPage } from "@/features/learning/TodayPage";

export const Route = createFileRoute("/_arena/learning")({
  head: () => ({
    meta: [
      { title: "Today's Learning · The Mavericks" },
      { name: "description", content: "Your daily learning tasks and focus sessions." },
      { property: "og:title", content: "Today's Learning · The Mavericks" },
      { property: "og:description", content: "Your daily learning tasks and focus sessions." },
    ],
  }),
  component: TodayPage,
});

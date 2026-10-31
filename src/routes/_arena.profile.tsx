import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/ProfilePage";

export const Route = createFileRoute("/_arena/profile")({
  head: () => ({
    meta: [
      { title: "My Profile · The Mavericks" },
      { name: "description", content: "Your Maverick profile, stats and achievements." },
      { property: "og:title", content: "My Profile · The Mavericks" },
      { property: "og:description", content: "Your Maverick profile, stats and achievements." },
    ],
  }),
  component: ProfilePage,
});

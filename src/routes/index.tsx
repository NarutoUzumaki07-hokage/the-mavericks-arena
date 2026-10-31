import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { membersQuery } from "@/hooks/use-members";
import { readSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "The Mavericks · Enter the Arena" },
      { name: "description", content: "Private learning and accountability arena for the four Mavericks." },
      { property: "og:title", content: "The Mavericks · Enter the Arena" },
      { property: "og:description", content: "Private learning and accountability arena for the four Mavericks." },
    ],
  }),
  beforeLoad: () => {
    if (readSession()) throw redirect({ to: "/learning" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(membersQuery),
  component: LoginScreen,
});

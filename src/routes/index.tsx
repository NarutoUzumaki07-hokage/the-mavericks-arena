import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { membersQuery } from "@/hooks/use-members";
import { supabase } from "@/integrations/supabase/client";

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
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/learning" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(membersQuery),
  component: LoginScreen,
});

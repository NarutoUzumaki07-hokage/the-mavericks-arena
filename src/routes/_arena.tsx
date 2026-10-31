import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { meQuery, membersQuery } from "@/hooks/use-members";
import { myProgressQuery, mySessionsQuery, roadmapQuery } from "@/hooks/use-learning";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_arena")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/" });
    const [me] = await Promise.all([
      context.queryClient.ensureQueryData(meQuery),
      context.queryClient.ensureQueryData(membersQuery),
      context.queryClient.ensureQueryData(roadmapQuery),
      context.queryClient.ensureQueryData(myProgressQuery),
      context.queryClient.ensureQueryData(mySessionsQuery),
    ]);
    if (!me) {
      await supabase.auth.signOut();
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

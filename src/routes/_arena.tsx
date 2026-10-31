import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { membersQuery } from "@/hooks/use-members";
import { clearSession, readSession } from "@/lib/session";

export const Route = createFileRoute("/_arena")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const session = readSession();
    if (!session) throw redirect({ to: "/" });
    const members = await context.queryClient.ensureQueryData(membersQuery);
    if (!members.some((m) => m.id === session.memberId)) {
      clearSession();
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

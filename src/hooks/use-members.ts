import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Member } from "@/types/member";

const COLUMNS = "id, display_name, avatar_url, created_at, updated_at, is_claimed";

export const membersQuery = queryOptions({
  queryKey: ["members"],
  queryFn: async (): Promise<Member[]> => {
    const { data, error } = await supabase.from("profiles").select(COLUMNS).order("display_name");
    if (error) throw error;
    return data as Member[];
  },
  staleTime: 60_000,
});

/** Profile id of the signed-in account, verified by the database. */
export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async (): Promise<string | null> => {
    const { data, error } = await supabase.rpc("current_profile_id");
    if (error) throw error;
    return (data as string | null) ?? null;
  },
  staleTime: Infinity,
});

export function useMembers() {
  return useSuspenseQuery(membersQuery).data;
}

export function useCurrentMember(): Member {
  const members = useMembers();
  const id = useSuspenseQuery(meQuery).data;
  const m = members.find((x) => x.id === id);
  if (!m) throw new Error("No member session");
  return m;
}

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Member } from "@/types/member";
import { readSession } from "@/lib/session";

export const membersQuery = queryOptions({
  queryKey: ["members"],
  queryFn: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export function useMembers() {
  return useSuspenseQuery(membersQuery).data;
}

/** The signed-in member (only valid inside the protected app area). */
export function useCurrentMember(): Member {
  const members = useMembers();
  const id = readSession()?.memberId;
  const m = members.find((x) => x.id === id);
  if (!m) throw new Error("No member session");
  return m;
}

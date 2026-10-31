import type { Tables } from "@/integrations/supabase/types";

/** A real roster row from the database. */
export type Member = Tables<"profiles">;

export const ROSTER = ["Aathitya", "Anusri", "Balaji", "Nithya"] as const;
export type RosterName = (typeof ROSTER)[number];

export interface MemberSession {
  memberId: string;
  signedInAt: string;
}

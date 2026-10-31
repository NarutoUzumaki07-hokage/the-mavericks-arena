import type { Tables } from "@/integrations/supabase/types";

/** A real roster row from the database (private link columns are never read). */
export type Member = Pick<
  Tables<"profiles">,
  "id" | "display_name" | "avatar_url" | "created_at" | "updated_at" | "is_claimed"
>;

export const ROSTER = ["Aathitya", "Anusri", "Balaji", "Nithya"] as const;
export type RosterName = (typeof ROSTER)[number];

import type { Tables } from "@/integrations/supabase/types";

/** A real roster row from the database (private link columns are never read). */
export type Member = Pick<
  Tables<"profiles">,
  "id" | "display_name" | "avatar_url" | "created_at" | "updated_at" | "is_claimed"
>;

export const ROSTER = ["Aathitya", "Anusri", "Balaji", "Nithya"] as const;
export type RosterName = (typeof ROSTER)[number];

export type MemberTheme = {
  name: RosterName;
  colorName: "Electric Blue" | "Green" | "White" | "Crimson Red";
  bgClass: string;
  textClass: string;
  avatarClasses: string;
  badgeClasses: string;
};

export const MEMBER_THEMES: Record<RosterName, MemberTheme> = {
  Balaji: {
    name: "Balaji",
    colorName: "Electric Blue",
    bgClass: "bg-primary",
    textClass: "text-primary-foreground",
    avatarClasses: "bg-primary text-primary-foreground",
    badgeClasses: "bg-primary text-primary-foreground",
  },
  Aathitya: {
    name: "Aathitya",
    colorName: "Green",
    bgClass: "bg-success",
    textClass: "text-success-foreground",
    avatarClasses: "bg-success text-success-foreground",
    badgeClasses: "bg-success text-success-foreground",
  },
  Anusri: {
    name: "Anusri",
    colorName: "White",
    bgClass: "bg-background",
    textClass: "text-foreground",
    avatarClasses: "bg-background text-foreground",
    badgeClasses: "bg-background text-foreground",
  },
  Nithya: {
    name: "Nithya",
    colorName: "Crimson Red",
    bgClass: "bg-destructive",
    textClass: "text-destructive-foreground",
    avatarClasses: "bg-destructive text-destructive-foreground",
    badgeClasses: "bg-destructive text-destructive-foreground",
  },
};

export function getMemberTheme(displayName?: string | null, fallbackIndex = 0): MemberTheme {
  if (!displayName) {
    const list = [MEMBER_THEMES.Aathitya, MEMBER_THEMES.Anusri, MEMBER_THEMES.Balaji, MEMBER_THEMES.Nithya];
    return list[fallbackIndex % list.length];
  }
  const clean = displayName.trim().toLowerCase();
  if (clean.startsWith("bala")) return MEMBER_THEMES.Balaji;
  if (clean.startsWith("aathi")) return MEMBER_THEMES.Aathitya;
  if (clean.startsWith("anu")) return MEMBER_THEMES.Anusri;
  if (clean.startsWith("nith")) return MEMBER_THEMES.Nithya;

  const list = [MEMBER_THEMES.Aathitya, MEMBER_THEMES.Anusri, MEMBER_THEMES.Balaji, MEMBER_THEMES.Nithya];
  return list[fallbackIndex % list.length];
}


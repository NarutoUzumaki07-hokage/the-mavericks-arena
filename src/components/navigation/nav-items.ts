import { BookOpen, BarChart3, UserRound } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/learning", label: "Today's Learning", short: "Today", icon: BookOpen },
  { to: "/progress", label: "Team Progress", short: "Team", icon: BarChart3 },
  { to: "/profile", label: "My Profile", short: "Profile", icon: UserRound },
] as const;

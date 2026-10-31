import { supabase } from "@/integrations/supabase/client";

/** Each roster member signs in with a private 6-digit PIN tied to a real account. */
export function memberEmail(displayName: string) {
  return `${displayName.toLowerCase()}@mavericks.team`;
}

export function isValidPin(pin: string) {
  return /^\d{6}$/.test(pin);
}

export async function authenticateMember(displayName: string, pin: string, firstTime: boolean) {
  const email = memberEmail(displayName);
  if (firstTime) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pin,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message.includes("roster") ? "This member is already set up." : error.message);
    if (!data.session) {
      const res = await supabase.auth.signInWithPassword({ email, password: pin });
      if (res.error) throw res.error;
    }
    return;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
  if (error) throw new Error("Wrong PIN. Try again.");
}

export async function signOutMember() {
  await supabase.auth.signOut();
}

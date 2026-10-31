CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL UNIQUE CHECK (display_name IN ('Aathitya','Anusri','Balaji','Nithya')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roster is readable" ON public.profiles FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.profiles (id, display_name) VALUES
 ('a0000000-0000-4000-8000-000000000001','Aathitya'),
 ('a0000000-0000-4000-8000-000000000002','Anusri'),
 ('a0000000-0000-4000-8000-000000000003','Balaji'),
 ('a0000000-0000-4000-8000-000000000004','Nithya')
ON CONFLICT (display_name) DO NOTHING;
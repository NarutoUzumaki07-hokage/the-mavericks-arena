-- ===== Identity: link roster profiles to real auth accounts =====
ALTER TABLE public.profiles ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN is_claimed boolean GENERATED ALWAYS AS (auth_user_id IS NOT NULL) STORED;
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, display_name, avatar_url, created_at, updated_at, is_claimed) ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.member_email(_name text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(_name) || '@mavericks.team'
$$;

CREATE OR REPLACE FUNCTION public.claim_roster_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid;
BEGIN
  SELECT id INTO pid FROM public.profiles
   WHERE public.member_email(display_name) = lower(NEW.email) AND auth_user_id IS NULL
   FOR UPDATE;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Only unclaimed Mavericks roster members can sign up';
  END IF;
  UPDATE public.profiles SET auth_user_id = NEW.id WHERE id = pid;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_claim AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.claim_roster_profile();

CREATE OR REPLACE FUNCTION public.current_profile_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.is_member() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.current_profile_id() IS NOT NULL
$$;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_editor() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN NEW.created_by := public.current_profile_id(); NEW.created_at := now(); END IF;
  NEW.updated_by := public.current_profile_id();
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- ===== Shared roadmap =====
CREATE TABLE public.learning_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text NOT NULL DEFAULT '',
  estimated_minutes integer NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
  scheduled_date date NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX learning_days_position_idx ON public.learning_days(position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_days TO authenticated;
GRANT ALL ON public.learning_days TO service_role;
ALTER TABLE public.learning_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read days" ON public.learning_days FOR SELECT TO authenticated USING (public.is_member());
CREATE POLICY "members add days" ON public.learning_days FOR INSERT TO authenticated WITH CHECK (public.is_member());
CREATE POLICY "members edit days" ON public.learning_days FOR UPDATE TO authenticated USING (public.is_member()) WITH CHECK (public.is_member());
CREATE POLICY "members delete days" ON public.learning_days FOR DELETE TO authenticated USING (public.is_member());
CREATE TRIGGER learning_days_editor BEFORE INSERT OR UPDATE ON public.learning_days FOR EACH ROW EXECUTE FUNCTION public.set_editor();

CREATE TABLE public.learning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.learning_days(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX learning_tasks_day_idx ON public.learning_tasks(day_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_tasks TO authenticated;
GRANT ALL ON public.learning_tasks TO service_role;
ALTER TABLE public.learning_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tasks" ON public.learning_tasks FOR SELECT TO authenticated USING (public.is_member());
CREATE POLICY "members add tasks" ON public.learning_tasks FOR INSERT TO authenticated WITH CHECK (public.is_member());
CREATE POLICY "members edit tasks" ON public.learning_tasks FOR UPDATE TO authenticated USING (public.is_member()) WITH CHECK (public.is_member());
CREATE POLICY "members delete tasks" ON public.learning_tasks FOR DELETE TO authenticated USING (public.is_member());
CREATE TRIGGER learning_tasks_editor BEFORE INSERT OR UPDATE ON public.learning_tasks FOR EACH ROW EXECUTE FUNCTION public.set_editor();

CREATE TYPE public.resource_type AS ENUM ('youtube', 'website', 'documentation', 'other');
CREATE TABLE public.learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.learning_days(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  url text NOT NULL CHECK (url ~* '^https?://[^\s/$.?#].[^\s]*$'),
  resource_type public.resource_type NOT NULL DEFAULT 'website',
  added_by uuid REFERENCES public.profiles(id) DEFAULT public.current_profile_id(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX learning_resources_day_idx ON public.learning_resources(day_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_resources TO authenticated;
GRANT ALL ON public.learning_resources TO service_role;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read resources" ON public.learning_resources FOR SELECT TO authenticated USING (public.is_member());
CREATE POLICY "members add resources" ON public.learning_resources FOR INSERT TO authenticated WITH CHECK (public.is_member() AND added_by = public.current_profile_id());
CREATE POLICY "members edit resources" ON public.learning_resources FOR UPDATE TO authenticated USING (public.is_member()) WITH CHECK (public.is_member());
CREATE POLICY "members delete resources" ON public.learning_resources FOR DELETE TO authenticated USING (public.is_member());

-- ===== Individual progress =====
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TABLE public.member_task_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT public.current_profile_id(),
  task_id uuid NOT NULL REFERENCES public.learning_tasks(id) ON DELETE CASCADE,
  status public.task_status NOT NULL DEFAULT 'todo',
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_task_progress TO authenticated;
GRANT ALL ON public.member_task_progress TO service_role;
ALTER TABLE public.member_task_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress read" ON public.member_task_progress FOR SELECT TO authenticated USING (member_id = public.current_profile_id());
CREATE POLICY "own progress insert" ON public.member_task_progress FOR INSERT TO authenticated WITH CHECK (member_id = public.current_profile_id());
CREATE POLICY "own progress update" ON public.member_task_progress FOR UPDATE TO authenticated USING (member_id = public.current_profile_id()) WITH CHECK (member_id = public.current_profile_id());
CREATE POLICY "own progress delete" ON public.member_task_progress FOR DELETE TO authenticated USING (member_id = public.current_profile_id());
CREATE OR REPLACE FUNCTION public.progress_stamp() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'completed' THEN
    IF TG_OP = 'INSERT' OR OLD.status <> 'completed' OR NEW.completed_at IS NULL THEN NEW.completed_at := now(); END IF;
  ELSE NEW.completed_at := NULL; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER member_task_progress_stamp BEFORE INSERT OR UPDATE ON public.member_task_progress FOR EACH ROW EXECUTE FUNCTION public.progress_stamp();

-- ===== Focus sessions (written only through functions) =====
CREATE TYPE public.session_status AS ENUM ('running', 'paused', 'stopped', 'completed', 'discarded');
CREATE TABLE public.learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_day_id uuid REFERENCES public.learning_days(id) ON DELETE SET NULL,
  planned_seconds integer NOT NULL CHECK (planned_seconds BETWEEN 60 AND 43200),
  started_at timestamptz NOT NULL DEFAULT now(),
  resumed_at timestamptz,
  accumulated_seconds integer NOT NULL DEFAULT 0,
  ended_at timestamptz,
  focused_seconds integer NOT NULL DEFAULT 0 CHECK (focused_seconds >= 0),
  credited_date date,
  status public.session_status NOT NULL DEFAULT 'running',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_open_session_per_member ON public.learning_sessions(member_id) WHERE status IN ('running', 'paused', 'stopped');
CREATE INDEX learning_sessions_member_date_idx ON public.learning_sessions(member_id, credited_date);
GRANT SELECT ON public.learning_sessions TO authenticated;
GRANT ALL ON public.learning_sessions TO service_role;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions read" ON public.learning_sessions FOR SELECT TO authenticated USING (member_id = public.current_profile_id());

CREATE TABLE public.session_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  previous_seconds integer NOT NULL,
  new_seconds integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_corrections TO authenticated;
GRANT ALL ON public.session_corrections TO service_role;
ALTER TABLE public.session_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own corrections read" ON public.session_corrections FOR SELECT TO authenticated USING (member_id = public.current_profile_id());

CREATE OR REPLACE FUNCTION public.session_elapsed(s public.learning_sessions) RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT s.accumulated_seconds + CASE WHEN s.resumed_at IS NULL THEN 0 ELSE floor(extract(epoch FROM now() - s.resumed_at))::int END
$$;

CREATE OR REPLACE FUNCTION public.start_session(_day_id uuid, _planned_seconds integer) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid := public.current_profile_id(); r public.learning_sessions;
BEGIN
  IF pid IS NULL THEN RAISE EXCEPTION 'Not a Mavericks member'; END IF;
  IF EXISTS (SELECT 1 FROM learning_sessions WHERE member_id = pid AND status IN ('running','paused','stopped')) THEN
    RAISE EXCEPTION 'You already have an open session';
  END IF;
  INSERT INTO learning_sessions(member_id, learning_day_id, planned_seconds, started_at, resumed_at, status)
  VALUES (pid, _day_id, _planned_seconds, now(), now(), 'running') RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.pause_session(_id uuid) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.learning_sessions;
BEGIN
  UPDATE learning_sessions s SET accumulated_seconds = LEAST(public.session_elapsed(s), s.planned_seconds), resumed_at = NULL, status = 'paused', updated_at = now()
   WHERE s.id = _id AND s.member_id = public.current_profile_id() AND s.status = 'running' RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'No running session'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.resume_session(_id uuid) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.learning_sessions;
BEGIN
  UPDATE learning_sessions SET resumed_at = now(), status = 'running', updated_at = now()
   WHERE id = _id AND member_id = public.current_profile_id() AND status = 'paused' RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'No paused session'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.stop_session(_id uuid) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.learning_sessions;
BEGIN
  UPDATE learning_sessions s SET
     focused_seconds = LEAST(public.session_elapsed(s), s.planned_seconds),
     accumulated_seconds = LEAST(public.session_elapsed(s), s.planned_seconds),
     resumed_at = NULL, ended_at = now(), status = 'stopped', updated_at = now()
   WHERE s.id = _id AND s.member_id = public.current_profile_id() AND s.status IN ('running','paused') RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'No active session'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.save_session(_id uuid) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.learning_sessions;
BEGIN
  UPDATE learning_sessions SET status = 'completed', credited_date = (ended_at AT TIME ZONE 'Asia/Kolkata')::date, updated_at = now()
   WHERE id = _id AND member_id = public.current_profile_id() AND status = 'stopped' AND focused_seconds > 0 RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Nothing to save'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.discard_session(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE learning_sessions SET status = 'discarded', resumed_at = NULL, ended_at = COALESCE(ended_at, now()), focused_seconds = 0, updated_at = now()
   WHERE id = _id AND member_id = public.current_profile_id() AND status IN ('running','paused','stopped');
END $$;

CREATE OR REPLACE FUNCTION public.correct_session(_id uuid, _new_seconds integer, _reason text) RETURNS public.learning_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid := public.current_profile_id(); old public.learning_sessions; r public.learning_sessions;
BEGIN
  SELECT * INTO old FROM learning_sessions WHERE id = _id AND member_id = pid AND status = 'completed' FOR UPDATE;
  IF old.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _new_seconds < 0 OR _new_seconds > old.focused_seconds THEN RAISE EXCEPTION 'Corrections can only reduce recorded time'; END IF;
  IF length(trim(coalesce(_reason,''))) < 3 THEN RAISE EXCEPTION 'Please give a reason'; END IF;
  INSERT INTO session_corrections(session_id, member_id, previous_seconds, new_seconds, reason) VALUES (_id, pid, old.focused_seconds, _new_seconds, trim(_reason));
  UPDATE learning_sessions SET focused_seconds = _new_seconds, updated_at = now() WHERE id = _id RETURNING * INTO r;
  RETURN r;
END $$;

REVOKE EXECUTE ON FUNCTION public.start_session(uuid, integer), public.pause_session(uuid), public.resume_session(uuid), public.stop_session(uuid), public.save_session(uuid), public.discard_session(uuid), public.correct_session(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_session(uuid, integer), public.pause_session(uuid), public.resume_session(uuid), public.stop_session(uuid), public.save_session(uuid), public.discard_session(uuid), public.correct_session(uuid, integer, text) TO authenticated;

-- ===== Private workspace =====
CREATE TABLE public.personal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT public.current_profile_id(),
  learning_day_id uuid NOT NULL REFERENCES public.learning_days(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled note',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX personal_notes_member_day_idx ON public.personal_notes(member_id, learning_day_id);
CREATE TRIGGER personal_notes_updated BEFORE UPDATE ON public.personal_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT public.current_profile_id(),
  learning_day_id uuid NOT NULL REFERENCES public.learning_days(id) ON DELETE CASCADE,
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'audio/webm',
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX voice_notes_member_day_idx ON public.voice_notes(member_id, learning_day_id);

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT public.current_profile_id(),
  learning_day_id uuid NOT NULL REFERENCES public.learning_days(id) ON DELETE CASCADE,
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes <= 20971520),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX attachments_member_day_idx ON public.attachments(member_id, learning_day_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_notes, public.voice_notes, public.attachments TO authenticated;
GRANT ALL ON public.personal_notes, public.voice_notes, public.attachments TO service_role;
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.personal_notes FOR ALL TO authenticated USING (member_id = public.current_profile_id()) WITH CHECK (member_id = public.current_profile_id());
CREATE POLICY "own voice notes" ON public.voice_notes FOR ALL TO authenticated USING (member_id = public.current_profile_id()) WITH CHECK (member_id = public.current_profile_id());
CREATE POLICY "own attachments" ON public.attachments FOR ALL TO authenticated USING (member_id = public.current_profile_id()) WITH CHECK (member_id = public.current_profile_id());

-- ===== Storage privacy: files live under <auth uid>/... =====
CREATE POLICY "own voice files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own attachment files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
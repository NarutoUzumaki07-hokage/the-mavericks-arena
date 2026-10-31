<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## The Mavericks
- Identity: each roster profile links to one real auth account (`profiles.auth_user_id`), created on first sign-in with a 6-digit PIN using synthetic email `<name>@mavericks.team`; a trigger on auth.users only allows unclaimed roster names. Why: RLS needs a verified identity; a local name is not proof.
- RLS keys off `public.current_profile_id()`; shared roadmap tables are open to any member, everything personal is scoped to the caller's profile.
- Focus sessions are written ONLY through SQL functions (start/pause/resume/stop/save/discard/correct_session); clients have SELECT only. Why: elapsed time is computed server-side from timestamps, so hours can't be typed in.
- Topic progress (member_task_progress.completed_at vs learning_days.scheduled_date) and daily activity (learning_sessions.credited_date) are separate; pure rules live in `src/lib/learning.ts` with tests.
- Kanban cards are learning days; their column is derived from the member's task progress — never store a separate kanban status.
- Private files live in private buckets under `<auth uid>/<day id>/...`, enforced by storage policies.
- Protected pages live under the `_arena` pathless layout (`ssr: false`).

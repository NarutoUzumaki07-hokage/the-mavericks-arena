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
- Member identity = a row in `public.profiles` (fixed 4-name roster, seeded by migration, CHECK + UNIQUE on display_name); no Supabase Auth yet. Why: private 4-person app, PIN auth comes later via `authenticateMember` in `src/lib/session.ts`.
- Selected member persists in localStorage; protected pages live under the `_arena` pathless layout (`ssr: false`) which validates the session against the roster.
- Placeholder numbers live only in `src/features/sample-data.ts`, never mixed with DB records.
- Future tables (learning_days, learning_tasks, member_task_progress, learning_sessions) must reference `public.profiles(id)`.

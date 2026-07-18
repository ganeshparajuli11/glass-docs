# Skill: Supabase Admin and RLS

Use for admin/auth/configuration.

Procedure:

- create migrations in source control;
- classify public vs private data;
- enable RLS on every exposed table;
- write role policies;
- seed only safe defaults;
- bootstrap owner securely;
- test anon/editor/admin/owner access directly;
- audit configuration writes;
- keep service role server-only;
- ensure public app uses safe fallback when unavailable.

MVP Supabase must never store visitor documents.

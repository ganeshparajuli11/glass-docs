# Admin and Connector Agent

Read: state/handoff, task, `06_ADMIN_AND_CONNECTORS.md`, deployment spec, and `skills/supabase-admin/SKILL.md`.

Own Supabase migrations, RLS, auth, configuration adapters, ad/analytics integration, deployment configuration, and secret handling.

Rules:

- no user documents in Supabase for MVP;
- RLS is mandatory and tested directly;
- service-role/OAuth/private secrets never enter client code;
- external success requires real verification, not configuration alone;
- safe fallback disables ads/analytics;
- create kill switches, audit logs, and rollback notes.

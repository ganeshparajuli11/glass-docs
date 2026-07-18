# Admin Panel and Connector Architecture

## 1. Purpose

The admin panel manages site configuration; it does not process visitor documents. Its first version should be small, secure, and practical.

## 2. Admin capabilities

### Dashboard

- current environment;
- deployment/version identifier;
- enabled tool count;
- ad system status;
- analytics status;
- recent configuration changes;
- links to provider dashboards;
- no fabricated revenue metrics.

### Ads

- global enable/disable;
- publisher/client ID validation;
- per-placement enable/disable;
- slot ID per placement;
- mobile/desktop eligibility;
- minimum reserved height;
- page exclusions;
- preview mode using neutral placeholders only;
- emergency kill switch.

### Site settings

- site name;
- tagline;
- canonical base URL;
- support/contact email;
- social links;
- default locale;
- theme defaults;
- maintenance banner.

### Tool settings

- stable/beta visibility override;
- recommended size limits;
- temporary disable message;
- featured order;
- related-tool override.

Do not allow admin settings to claim an unimplemented capability.

### SEO

- default title template;
- default description;
- per-page title/description override;
- social image reference;
- indexing toggle for experimental routes;
- verification tokens;
- sitemap diagnostics.

### Integrations

- Google AdSense public identifiers and status notes;
- Google Analytics measurement ID;
- Google Search Console verification value;
- Cloudflare Web Analytics token where applicable;
- optional error monitoring DSN;
- future email/contact provider.

## 3. What “connect Google AdSense” means

The first admin version does not need to control the AdSense account through OAuth. It should:

1. accept and validate the public publisher/client ID;
2. accept per-placement ad slot IDs;
3. enable/disable the AdSense script;
4. control which approved placements render;
5. provide an `ads.txt` value/template;
6. show setup instructions and current local configuration status;
7. link the administrator to the provider dashboard.

AdSense account approval, site review, payment, and final ad settings still occur in Google’s own dashboard. Never ask the user to paste their Google password.

## 4. Supabase schema

Suggested migration outline:

```sql
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  placement_key text unique not null,
  enabled boolean not null default false,
  slot_id text,
  allow_mobile boolean not null default true,
  allow_desktop boolean not null default true,
  min_height integer,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor')),
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);
```

Use migrations, not manual dashboard-only changes.

## 5. RLS model

- Public/anon can read only rows explicitly marked public and only the columns required by the public app.
- Authenticated admins can read admin configuration based on `admin_profiles`.
- Only owner/admin can modify ads/integrations.
- Editor may modify content/SEO but not credentials or roles.
- Public cannot insert/update/delete any admin table.
- Audit log insert should be controlled by a trusted database function or secured application path.

Test RLS using anon and authenticated sessions. UI hiding is not security.

## 6. Admin authentication

Recommended:

- Supabase email magic link or one-time password for a very small admin team.
- Restrict admin access to explicit user IDs/roles.
- Consider MFA before real revenue/account settings are managed.
- Rate-limit login attempts through provider capabilities.
- Generic login errors to avoid account enumeration.

For a static client deployment, enforce authorization in database policies. Do not rely only on a client route guard.

## 7. Secret classification

### Safe to expose publicly when needed

- site URL/name;
- AdSense publisher/client ID;
- ad slot IDs;
- analytics measurement ID;
- Supabase anon URL/key;
- Search Console verification token.

### Never expose in client code

- Supabase service-role key;
- OAuth client secret;
- private API key;
- webhook signing secret;
- email provider secret;
- error-monitoring auth token;
- database password.

## 8. Connector agent responsibilities

The connector agent:

- reads official integration documentation;
- lists required user-owned accounts and approvals;
- creates `.env.example` fields;
- implements typed integration adapters;
- validates identifiers without logging secrets;
- creates mock/local modes;
- adds health/status indicators;
- adds rollback/disable controls;
- writes setup and rotation instructions;
- never claims an external connection succeeded without a real verification result.

## 9. Connector catalog

### GitHub

Purpose: repository and CI. Required: user authorization. Agent creates workflow files but cannot assume repository permissions.

### Supabase

Purpose: admin auth/configuration. Required: project URL, anon key, secure role bootstrap. Agent creates migrations and RLS tests.

### Cloudflare

Purpose: production hosting, DNS, optional analytics. Required: user account/domain authorization. Agent prepares build configuration and deployment instructions.

### Vercel

Purpose: preview or server deployment later. Required: user authorization. Confirm plan suitability before commercial production.

### Google AdSense

Purpose: monetization. Required: approved account/site and public IDs. Do not implement ads until policy/legal pages and content quality are ready.

### Google Analytics/Search Console

Purpose: traffic/performance/search data. Required: user-owned property. Respect consent requirements and minimize events.

### Browser/Playwright

Purpose: automated acceptance testing. No external credential required for public flows.

## 10. Config precedence

Use predictable precedence:

```text
safe database override
    > environment variable
        > version-controlled default
```

For a missing or unavailable remote config, use safe defaults:

- ads disabled;
- analytics disabled where consent/status is unknown;
- tools use code-defined stable status;
- public pages remain usable.

## 11. Audit and rollback

Every admin change must record:

- actor;
- timestamp;
- entity;
- before/after values;
- action type.

Provide one-click ad kill switch and configuration rollback for the last known good values.

## 12. Admin UX

- Admin UI can be simpler than public UI.
- Show exact consequences before saving.
- Use test/preview status badges.
- Warn that enabling ads does not mean Google has approved or will serve ads.
- Do not display secret values after initial entry; show masked state and replace action.
- Confirm destructive or global changes.

---

**Next read:** `07_AGENT_SYSTEM.md`

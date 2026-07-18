# Deployment, SEO, Analytics, and AdSense

## 1. Hosting strategy

### Stage A — local development

- Local Node.js LTS and package manager.
- No real ads.
- Mock public configuration.
- Synthetic test files.

### Stage B — preview

- Vercel preview is convenient for testing if current terms permit the use.
- Ads remain disabled.
- Do not index preview domains.
- Protect admin/test data.

### Stage C — free production before meaningful revenue

Prefer a deployment path compatible with commercial use and the current provider terms. The public app is static-first so it can deploy to Cloudflare Pages or another suitable static platform.

Cloudflare Pages/Workers limits and framework support change, so verify official documentation at deployment time. Use the Next.js adapter/static export path that passes all tests; do not force an unsupported runtime.

### Stage D — scale

When traffic/revenue justifies it:

- choose paid hosting based on measured bandwidth, functions, build, logging, and support needs;
- add server compute only for server-required tools;
- keep local tools local.

## 2. Domain setup

Before purchase:

- check trademark conflicts;
- check social handles where relevant;
- avoid names confusingly similar to large PDF brands;
- prefer simple spelling and `.com` if reasonable, but do not overpay before validation.

After purchase:

- configure DNS;
- force HTTPS;
- select one canonical hostname (`www` or apex);
- redirect the other;
- set canonical base URL;
- verify email/contact routing;
- verify Search Console.

## 3. Deployment checklist

- frozen lockfile install;
- full verification passes;
- environment variables validated;
- no secret in client bundle;
- static/server mode matches target;
- custom headers/CSP tested;
- PDF worker asset path works;
- deep routes return correctly;
- sitemap/robots use production URL;
- preview URLs are noindex;
- error pages and 404 work;
- admin route authorization tested;
- ads default disabled;
- rollback build identified.

## 4. SEO foundation

Every stable tool page needs:

- unique title and description;
- one clear H1;
- canonical URL;
- useful introductory copy;
- actual working tool above excessive content;
- processing/privacy explanation;
- unique FAQ based on its behavior;
- internal links to genuinely related tools;
- indexable static content even if the workspace is client-side;
- Open Graph/Twitter metadata;
- structured data only when accurate.

## 5. Structured data

Possible types:

- `WebSite` on homepage;
- `SoftwareApplication` or `WebApplication` where appropriate;
- `BreadcrumbList` on category/tool pages;
- `FAQPage` only when the FAQ is visible and complies with current search guidance;
- `Article` for guides.

Do not add fake ratings, reviews, pricing, or usage counts.

## 6. Sitemap and indexing

Include:

- homepage;
- stable tool pages;
- useful category pages;
- substantial guides;
- legal/about/contact.

Exclude/noindex:

- admin;
- login;
- preview/staging;
- planned/empty tools;
- duplicate parameter URLs;
- internal debug/status routes;
- thin generated pages.

## 7. Content quality

A page exists because it solves a distinct task, not only to create another ad slot. Content must be reviewed against the real feature and tests. Avoid claims such as “best,” “perfect,” “unlimited,” or “secure” without evidence.

## 8. Analytics setup

Start with privacy-conscious aggregate analytics. Events are defined in the architecture document and must not include document data.

Analytics adapter requirements:

- provider-agnostic interface;
- disabled by default locally;
- consent-aware where required;
- safe allowlist of event properties;
- no arbitrary object payloads;
- debug mode showing redacted events.

## 9. AdSense readiness

Before applying/enabling:

- site has a real domain and stable navigation;
- tools work reliably;
- useful original content exists;
- About, Contact, Privacy, Terms, and cookie/privacy choices exist as applicable;
- no copied/spun content;
- no broken or empty pages;
- no misleading buttons;
- mobile UX is complete;
- ads.txt support is ready;
- consent setup is reviewed for target regions;
- hosting plan permits commercial use;
- policy review is completed.

AdSense approval and earnings are never guaranteed.

## 10. AdSense implementation

### Script

- Insert the provider script once.
- Load only when global ads are enabled and environment/config is valid.
- Use the framework’s recommended script-loading mechanism.
- Test CSP and consent behavior.

### Slots

- Each slot has a stable placement key.
- Slot IDs come from safe configuration.
- Do not auto-refresh.
- Avoid layout shift.
- Do not render on excluded routes/states.

### `ads.txt`

- Generate or publish the exact authorized seller line provided by AdSense after account setup.
- Do not invent publisher IDs.
- Admin should show the expected content and deployment status.

## 11. Policy-safe UX rules

- Never encourage ad clicks.
- Never describe ads as tools or downloads.
- Do not place ads where users may click accidentally while operating the app.
- Do not use flashy attention around ads.
- Do not auto-refresh ads.
- Do not use misleading headings above ads.
- If a label is shown, use approved wording such as `Advertisements` or `Sponsored Links`.
- Keep ads out of private admin communications/config screens.

## 12. Recommended launch ad configuration

Start conservatively:

- Homepage content-break: enabled after review.
- Tool post-workflow: enabled only after clear separation.
- Long guide in-content: limited.
- Desktop side rail: optional.
- Mobile anchor: off.
- Vignette: off.
- Ad intent: off inside tool pages.
- Auto ads: either off or carefully configured with tool workspace exclusions.

Measure retention, completion rate, CLS, and support complaints before adding formats.

## 13. Consent and regional compliance

The implementation must support:

- consent status before personalized ad/analytics behavior where required;
- a way to revise choices;
- separation of essential local tool operation from tracking;
- clear privacy policy;
- provider-required CMP or messaging setup for affected regions.

Obtain professional legal advice for the actual business/jurisdictions; generated legal pages are starting drafts, not legal certification.

## 14. Search launch sequence

1. Deploy with ads off.
2. Verify all routes and canonical URLs.
3. Submit sitemap.
4. Monitor indexing/errors.
5. Publish useful tool guides gradually.
6. Collect real performance/error data.
7. Fix UX and content gaps.
8. Apply for AdSense when the site is genuinely useful and policy-ready.
9. Enable conservative placements after approval.

## 15. Rollback

Always retain:

- previous deployment;
- config kill switches;
- ads global disable;
- analytics disable;
- tool visibility override;
- database migration rollback notes;
- last known good package lockfile.

---

**Next read:** `11_ACCEPTANCE_CRITERIA.md`

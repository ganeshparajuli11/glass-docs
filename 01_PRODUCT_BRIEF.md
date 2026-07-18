# Product Brief

## 1. Working product definition

**GlassDocs** is a temporary codename for a privacy-first collection of PDF tools. The differentiator is not “we have every converter.” The differentiator is a trustworthy, delightful experience:

- most common operations happen in the browser;
- no forced account;
- no confusing advertising around action buttons;
- clear explanations of what the tool can and cannot do;
- fast tools with a shared interface;
- strong accessibility and mobile support.

## 2. Target users

### Primary

- Students combining assignments, extracting selected pages, adding page numbers, or turning images into PDFs.
- Office workers handling forms, reports, scans, and attachments.
- Freelancers and small businesses preparing documents without installing software.
- Privacy-conscious users who do not want sensitive files uploaded.

### Secondary

- Teachers preparing handouts.
- Applicants assembling CVs, certificates, and supporting documents.
- Developers needing basic inspection or metadata utilities.

## 3. Jobs to be done

1. “I need to finish this PDF task quickly without learning software.”
2. “I need confidence that my document is not being secretly uploaded.”
3. “I need the result to preserve page order and quality.”
4. “I need this to work on my phone or normal laptop.”
5. “I need a clear error instead of a frozen page.”

## 4. Positioning

### Core proposition

> Everyday PDF tasks, beautifully simple and private by default.

### Supporting promises

- **Processed on your device** for tools marked Local.
- **No signup required** for public tools.
- **Clear limits** before processing.
- **No watermarks added by the service.** User-requested watermarks are different.
- **Designed around the task, not the advertisement.**

Do not make absolute security claims such as “100% secure.” Explain the architecture factually.

## 5. Information architecture

### Main navigation

- Tools
- PDF
- Images
- Learn
- Privacy
- Search
- Theme toggle

Admin is not linked in public navigation.

### Public page groups

- `/` — homepage
- `/tools` — all tools and filters
- `/tools/[slug]` — individual tool page
- `/pdf` — PDF category
- `/image-to-pdf` or canonical tool routes
- `/learn` — educational articles and guides
- `/privacy`, `/terms`, `/cookies`, `/contact`, `/about`
- `/status` — optional service/browser capability information

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/ads`
- `/admin/site`
- `/admin/tools`
- `/admin/seo`
- `/admin/integrations`
- `/admin/audit`

## 6. Individual tool-page anatomy

1. Header and breadcrumb.
2. Clear H1 and one-sentence promise.
3. Privacy/processing badge: `Local`, `Hybrid`, or `Server`.
4. Short explanation and file limits.
5. Tool workspace.
6. Result and download area.
7. Optional ad area only after safe separation.
8. “How it works.”
9. FAQ generated from actual behavior.
10. Related tools.
11. Long-form helpful content where it genuinely adds value.
12. Footer.

## 7. Success metrics

Early product metrics should focus on usefulness, not ad clicks:

- tool completion rate;
- processing error rate by browser and device class;
- median time to first successful result;
- repeat visits;
- search impressions and indexed pages;
- Core Web Vitals;
- download completion rate;
- privacy promise comprehension;
- low support/contact rate caused by misleading claims.

Never track file names, file contents, extracted text, passwords, watermarks, or document metadata.

## 8. Honest capability labels

Every tool record has:

- `processingMode`: local | hybrid | server
- `status`: stable | beta | experimental | planned
- `maxRecommendedSizeMb`
- `supportedInputTypes`
- `supportedOutputTypes`
- `knownLimitations`
- `engine`
- `lastVerifiedAt`

The UI must not list a planned tool as usable.

## 9. Product scope strategy

### Launch strategy

Launch fewer tools that work consistently. Avoid empty category pages and “coming soon” grids that look like spam.

### Growth strategy

Add tools in clusters. A cluster includes the tool, help content, FAQs, tests, related-tool links, schema markup, and analytics events. Do not add 100 thin pages generated from templates with no unique value.

## 10. Revenue strategy

Revenue may later include:

- Google AdSense;
- optional premium batch processing;
- larger file limits on server-backed tools;
- paid API or business workflows;
- relevant, clearly disclosed affiliates.

The free core should remain useful. Do not intentionally degrade local tools to force payment.

## 11. Legal and policy boundary

The product must not market itself as a replacement for legal, compliance, digital-signature, or archival software unless it meets the relevant technical and legal standards. A drawn signature placed on a PDF is not automatically a regulated digital signature.

## 12. Definition of a useful launch

A launch is useful when a real person can discover a tool, understand privacy behavior, upload a valid file, complete the operation, preview or validate the result, download it, and repeat the process without confusion.

---

**Next read:** `02_TECH_SETUP.md`

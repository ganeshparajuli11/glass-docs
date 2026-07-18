# UI, UX, Glassmorphism, and Respectful Ad Placement

## 1. Experience goal

The site should feel modern and enjoyable without making a serious document task feel like a game. Users should always know:

- what file is selected;
- whether it remains local;
- what will happen;
- how long the operation may take;
- how to cancel;
- what result was produced;
- where to download it.

## 2. Visual direction

### Background

- Soft aurora gradients using 2–3 large blurred shapes.
- Very slow ambient movement only on capable devices.
- Static fallback for reduced motion and low-power devices.
- Avoid saturated color directly behind reading text.

### Surfaces

Use three surface levels:

1. `glass-soft` — navigation, category cards, decorative summaries.
2. `glass-strong` — tool workspace container with stronger border/contrast.
3. `solid-reading` — help content, legal content, dialogs, tables, and dense forms.

Glassmorphism requirements:

- sufficient contrast in both themes;
- visible border, not blur alone;
- do not stack multiple translucent layers until text becomes muddy;
- mobile blur can be reduced for performance;
- Firefox/Safari fallbacks must remain attractive.

### Shape and spacing

- Main radius: 20–24px.
- Compact controls: 12–14px.
- Minimum interactive target: approximately 44px.
- Generous page width but constrained reading columns.
- Tool workspace desktop max width around 1100–1200px.

### Typography

- Use a variable sans font with excellent readability.
- Distinct display size for homepage only.
- Tool pages prioritize clarity over decorative typography.
- Avoid long all-caps labels.

## 3. Design tokens

Create CSS variables for:

- background layers;
- foreground/muted text;
- glass backgrounds and borders;
- accent and accent contrast;
- success/warning/error/info;
- focus ring;
- shadows;
- radii;
- spacing rhythm;
- motion durations/easings;
- ad placeholder/background distinction.

Do not hard-code repeated RGB values throughout components.

## 4. Homepage layout

1. Compact header.
2. Hero with value proposition and tool search.
3. Trust strip: local processing, no signup, free core.
4. Popular tools grid.
5. Category exploration.
6. “How local processing works.”
7. Optional safe ad placement.
8. Recently added or guides.
9. Footer.

Avoid a giant hero animation that delays access to tools.

## 5. Tool workspace layout

### Idle state

- Tool title and short purpose.
- Local-processing badge.
- Drop zone with browse button.
- Accepted formats and recommended limits.
- Link to use a sample file where possible.
- No ad inside or immediately attached to the drop zone.

### Files-ready state

- File cards with safe metadata: user-visible name, size, page count after parse.
- Remove and reorder controls.
- Options panel.
- Primary process button.
- Reset option.

### Processing state

- Clear stage label and progress.
- Cancel button.
- Do not show a new interstitial or moving ad.
- Keep page stable; avoid layout jump.

### Success state

- Success summary.
- Output name and size.
- Preview where practical.
- Primary download button.
- Start-over and related-tool actions.
- Keep an obvious neutral buffer before any ad placement.

### Error state

- Plain-language explanation.
- Recovery steps.
- Keep selected files where safe so the user can change options and retry.
- Do not blame the user.

## 6. Page organizer interaction

For reorder/delete/rotate/extract workflows:

- render page thumbnails progressively;
- use virtualized or paginated thumbnail lists for large PDFs;
- support keyboard selection and movement;
- provide select all, clear, odd, even, range selection;
- show page number and rotation state;
- avoid drag-only interactions;
- show a compact list mode on low-memory devices.

## 7. Motion rules

Allowed:

- soft card hover elevation;
- drop-zone feedback;
- progress transitions;
- success check animation;
- small stagger on initial category cards;
- theme transition kept short.

Not allowed:

- scroll hijacking;
- continuous cursor followers;
- large parallax in the tool workspace;
- bouncing download buttons;
- animations directing attention toward ads;
- blocking splash screens.

Respect `prefers-reduced-motion` globally.

## 8. Ad placement philosophy

Ads are secondary content. The site should still look complete when all ads are disabled.

### Safe initial placements

#### A. Homepage content-break slot

Place after users have seen the value proposition and popular tools, before a lower educational section. Do not insert between hero search and search results.

#### B. Tool-page post-workflow slot

Place after the complete workspace/result region and a visually obvious divider. Never put it between the result summary and download button.

#### C. Educational-content slot

Place between substantial sections of a long guide. It must not interrupt a numbered action sequence at a dangerous or confusing point.

#### D. Desktop side rail

Only on sufficiently wide screens. It must sit outside the workspace and disappear rather than squeeze the tool below a usable width.

### Placements disabled at initial launch

- Vignette/interstitial ads.
- Sticky anchor ads over mobile controls.
- Ad intent formats inside tool instructions.
- Automatically injected ads inside the tool workspace.

These can be tested later only after user-experience review.

## 9. Ad component contract

```ts
interface AdSlotProps {
  placement: AdPlacementKey;
  minHeight?: number;
  className?: string;
  allowOnMobile?: boolean;
  context?: "homepage" | "tool" | "article";
}
```

Behavior:

- if globally disabled, render `null`;
- if placement disabled, render `null`;
- if publisher ID/slot ID invalid, render `null` in production and a developer warning locally;
- reserve a bounded responsive area only when enabled;
- label with `Advertisements` when required by the design/policy implementation;
- no clickable wrapper around an ad;
- never place app controls over the ad;
- prevent cumulative layout shift;
- do not auto-refresh ads.

## 10. Separation and visual distinction

- Ads must not use the same icon-and-title card pattern as tools.
- Ads must not sit under headings such as “Recommended tools,” “Download,” or “Next step.”
- Do not point arrows or animated blobs toward them.
- Avoid placing an ad where a fast user may mistake it for the result or a download control.
- The tool’s primary action must remain visually dominant without making the ad unnaturally prominent.

## 11. Consent and privacy UI

- Use a small, accessible consent banner only where required.
- Essential local processing does not require tracking consent.
- Analytics and personalized advertising behavior must follow applicable region and provider requirements.
- Store consent choices, not document data.
- Provide a persistent “Privacy choices” link in the footer.

## 12. Responsive breakpoints

Design content-first rather than device-name-first:

- Small: single-column workspace; bottom actions remain visible without covering content.
- Medium: options and preview can split if space allows.
- Large: workspace and optional informational rail.
- Extra large: optional ad side rail outside the content grid.

Test at narrow widths such as 320px, not only common modern phones.

## 13. Accessibility

- Visible focus ring.
- Drop zone also functions as a standard file input/button.
- Live region for processing status and errors.
- Progress element has textual status.
- Drag sorting has keyboard alternatives.
- Icons have labels or are hidden from assistive technology.
- Color is not the only indicator.
- Dialog focus is trapped and restored.
- Page thumbnails have meaningful labels.

## 14. Empty, loading, and failure details

Create intentional designs for:

- no search results;
- unsupported file;
- encrypted file;
- corrupted PDF;
- memory limit;
- cancelled processing;
- output larger than input;
- no extractable text;
- browser API unavailable;
- ad provider not loaded;
- Supabase unavailable.

## 15. Design review checklist

The design agent must verify:

- can a user identify the primary action within three seconds?
- is the privacy mode visible before upload?
- are ads clearly separate?
- does the page still work and look balanced with ads disabled?
- is text readable over every glass surface?
- can every action be performed by keyboard?
- does reduced-motion mode remove nonessential movement?
- are loading and error states as polished as success?

---

**Next read:** `05_FEATURE_CATALOG_AND_ROADMAP.md`

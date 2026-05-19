# NetworkZ — Roadmap Ideas

> Forward-looking concepts beyond v1. The v1 ships a public directory with magic-link auth,
> members-only contact info, search/filters, admin moderation, and a Docker-based deploy.
> Everything below is **a candidate, not a commitment** — meant to inform prioritisation.

**Reading the tags**

| Tag | Meaning |
|---|---|
| `S` | Small — days |
| `M` | Medium — 1–2 weeks |
| `L` | Large — multi-week initiative |
| `High` | Likely to move reactivation, retention, or growth |
| `Med`  | Quality-of-life; compounds with other features |
| `Low`  | Polish; do once the bigger bets are in |

---

## 1 · Trust & verification

Without verification, the directory's value erodes the moment a non-alum posts. These are the **single highest-leverage** items for credibility.

- **Verified alumni badge** — match against an authoritative list (program export, LinkedIn alum-of, or invite codes per cohort). Display a check on verified profiles. `M · High`
- **Report profile** flow — one-tap report from any card; queued for admin review. `S · High`
- **Email re-verification** when contact email changes — close a low-effort spam vector. `S · Med`
- **Two-factor auth** (TOTP) for admin accounts. `S · Med`

## 2 · Engagement & retention

Currently a member's only reason to return is to edit their profile. These give them a reason to **come back weekly**.

- **"What's new in the network" digest** — weekly email of new alumni, new countries, hiring posts. `M · High`
- **Profile spotlight** — rotating featured alumni on the landing page (auto-picked by completeness + recency). `S · Med`
- **Profile completeness meter** — nudge members to fill optional fields; correlates with discoverability. `S · Med`
- **Profile view count** ("12 alumni viewed your profile this month"). `M · Med`

## 3 · Networking — the actual point of an alumni network

Today members can see each other but can't really *interact*. This is where NetworkZ stops being a directory and starts being a network.

- **Connection / contact-reveal opt-in** — members can request another's contact info; the other side approves. Removes the all-or-nothing visibility decision. `M · High`
- **Direct messaging** — lightweight, in-app, with email fallback. `L · High`
- **Intro requests** — "Ask Ada to intro you to Bola". The social currency of any real network. `M · High`
- **Looking for / Offering** tags on profiles (hiring, fundraising, advising, intros). Drives reasons to browse. `S · High`
- **Mentorship matching** — opt-in pool of mentors with auto-pairing by industry/stage. `L · Med`

## 4 · Discovery

Members find each other today via three filters and a search bar. Discovery is what makes the network feel rich.

- **Map view** — alumni pinned by primary country, clickable. `M · Med`
- **"People you might know"** — recommendations based on cohort overlap, country, industry. `M · Med`
- **Stage filter** — idea / MVP / revenue / raised / exited. Massively useful for investors & operators. `S · High`
- **Saved searches & email alerts** — "Email me when a new fintech founder from Kenya joins." `M · Med`
- **Public profile URLs with custom slugs** (`networkz.dev/@paywave`) — share-worthy, SEO-friendly. `S · Med`

## 5 · Content & community

Profiles plateau. Content keeps the lights on.

- **Job board** — alumni hiring alumni (the highest-converting alumni-network feature on record). `M · High`
- **Funding announcements feed** — auto-pulled from Crunchbase + manual posts. `M · Med`
- **Events** — cohort reunions, regional meetups, virtual office hours. RSVP, calendar export. `L · Med`
- **Resource library** — pitch decks, term-sheet templates, hiring docs the program shares. `M · Low`
- **Discussion threads** — async forum scoped per industry or cohort. Risk: needs moderation muscle. `L · Low`

## 6 · Onboarding & growth

Best way to make the directory feel populated: **make signup feel effortless**.

- **LinkedIn import** on signup — auto-fill founder name, startup, country, links. Single biggest signup-completion lever. `M · High`
- **Bulk import for program organisers** — CSV upload that creates pre-verified placeholder profiles claimable by email. `M · High`
- **Co-founder invite** during onboarding — one signup, two members. `S · Med`
- **Embeddable widget** ("Our alumni" badge for partner sites). `S · Low`
- **Cohort-based onboarding drip** — three short emails over the first week. `S · Med`

## 7 · Admin, analytics & ops

You can't moderate what you can't see.

- **Admin dashboard** with growth, retention, geography, content-quality charts. `M · Med`
- **Automated spam triage** — flag low-completeness or suspicious-domain signups before they hit moderation. `M · Med`
- **Audit log** for admin actions (hide, delete, promote). `S · Med` — also a soft compliance requirement.
- **Email-deliverability monitoring** — bounce/complaint tracking via the SMTP provider. `S · Med`
- **Operational runbook** — backup/restore, secrets rotation, on-call rotation. `S · Med`

## 8 · Compliance, security & privacy

Not glamorous, table stakes once the network has names, emails, and phone numbers of hundreds of founders.

- **GDPR data export + delete** (self-service on /my-profile). `S · High`
- **Rate limiting** on auth + uploads (per-IP + per-user). `S · Med`
- **Audit pen-test** before any public launch. `M · High`
- **Backups + restore drill** at a regular cadence. `S · High`
- **Terms of service & privacy policy** drafted with a real lawyer. `S · High`

## 9 · Internationalisation & accessibility

The Accelerator runs in dozens of countries — the UX shouldn't assume English.

- **i18n** — start with Spanish, Portuguese, French (matches Africa & LATAM cohorts). `M · Med`
- **WCAG 2.1 AA audit** — pragmatic, fix the top 20 issues. `S · Med`
- **RTL support** — Arabic-speaking cohorts (MENA programs). `M · Low`

## 10 · Mobile & integrations

- **PWA / installable shell** — meaningful on mobile, low cost given the existing SPA. `S · Med`
- **Slack / Discord SSO** — community already lives in chat; let alumni sign in with it. `M · Med`
- **Open Graph cards** for shared profile URLs (auto-generated SVG with logo + cohort). `S · Med`
- **Public read-only API** — let the program embed alumni stats on their own site. `S · Low`

---

## Suggested first three sprints

If the team had ~6 weeks of focused build time, the bets that compound the fastest:

1. **Verification badge + report-profile** (trust foundation) — `~1 sprint`
2. **LinkedIn import on signup + completeness meter** (signup quality + reactivation) — `~1 sprint`
3. **Job board + "Looking for / Offering" tags** (the first thing that makes members come back without prompting) — `~1 sprint`

Everything else is a candidate for the quarter after.

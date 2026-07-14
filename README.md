# FieldWindow 🌦️🚜

A spray & harvest **window planner** built on the free tier of the
[WeatherAI](https://weather-ai.co/docs) API. Instead of just showing weather,
FieldWindow turns raw hourly/daily data into the go/no-go decisions a
smallholder farmer actually needs.

Built as a take-home API integration project.

## What it does

- **Spray window timeline** — uses `GET /v1/hourly` to flag which of the next
  ~72 hours are safe to spray. High wind = drift risk; rain now or imminent =
  wash-off risk. Rendered as a colour-coded hour strip (green / amber / red)
  with the longest clear window called out as the headline.
- **Harvest outlook** — uses `GET /v1/daily` to find the longest upcoming
  dry-day streak worth planning a harvest around.
- **Auto-location** — uses `GET /v1/weather-geo?ip=auto`, so it works with
  zero input and no browser permission prompt. Coordinates can be overridden
  manually.
- **Quota panel** — uses `GET /v1/usage` to show requests and AI-summary quota
  remaining this billing period.

## The quota-aware design (why it scales)

The AI-summary quota is the scarce resource on WeatherAI's free tier
(200/month). FieldWindow spends it deliberately:

- `/v1/hourly` and `/v1/daily` are called with **`ai=false`** — the spray and
  harvest logic only needs raw numbers, so no AI credit is burned there.
- AI is spent **once per load**, on the headline "Right now" card
  (`/v1/weather-geo` with `ai=true`).

That means a full page load costs **1 AI credit**, so the free 200/mo AI quota
covers ~200 sessions/month while the decision features stay fully functional.

> Note: in testing, the free-tier key returns `ai_summary: null` from every
> weather endpoint (the AI narrative doesn't populate). The headline card
> handles this gracefully — it simply omits the summary — but the
> quota-conscious call structure (AI requested on exactly one call, `ai=false`
> everywhere else) is the point and remains intact.

## How the decisions are made

All go/no-go logic lives in [`lib/fieldwindow.ts`](lib/fieldwindow.ts) as pure,
framework-free functions (easy to reason about and test).

**What the API actually provides** (worth noting — the docs are loose): each
hour/day carries a numeric WMO `weathercode` and `precipitation` (mm). There is
**no per-hour wind or rain-probability** — wind is only reported for the
*current* moment. The logic adapts to that:

**Spray (per hour):**

| Signal | Rule |
|---|---|
| Measurable precip (≥ 0.1 mm) or a wet weathercode | **Avoid** — wash-off |
| Rain within the next 2h | Caution — wash-off after spraying |
| Otherwise | **Good** — dry window |
| Current wind near the 19 km/h drift limit | Advisory banner (hourly wind isn't available, so drift is flagged as a caveat) |

The spray classifier still contains full wind-drift rules (>19 = avoid, 10–19 =
caution, <2 = inversion); they activate automatically if a data source ever
supplies per-hour wind.

**Harvest (per day):** a day is "dry" when precip ≤ 0.5 mm and the weathercode
isn't a rain/snow/storm code. The longest run of dry days is highlighted as the
harvest window.

Weathercodes are mapped to human labels (`weatherCodeInfo`), and the
normalizers probe several field-name variants so the app degrades gracefully if
the payload shape shifts.

## Why it's built this way

- The WeatherAI API key is a **server-side secret only**. The browser only
  ever calls local Next.js API routes (`/api/weather-geo`, `/api/hourly`,
  `/api/daily`, `/api/usage`), which attach the `Authorization: Bearer` header
  server-side. The key never reaches client JavaScript or the network tab.
- Upstream errors (401 / 403 / 404 / 429 / 503, per the docs' error table) are
  caught in [`lib/weatherClient.ts`](lib/weatherClient.ts) and turned into
  short, human-readable messages.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Pure TS decision logic in `lib/fieldwindow.ts`

## Getting started

### 1. Install

```bash
npm install
```

### 2. Add your WeatherAI key

All FieldWindow features run on the **Free** plan (`/v1/weather-geo`,
`/v1/hourly`, `/v1/daily`, `/v1/usage` are all available on every plan).

```bash
cp .env.example .env.local
```

```
WEATHER_AI_API_KEY=wai_your_real_key
```

### 3. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx                 # marketing landing
  app/
    page.tsx               # planner dashboard (/app)
  api/
    weather-geo/route.ts   # GET /v1/weather-geo?ip=auto  (ai=true)
    hourly/route.ts        # GET /v1/hourly   (ai=false)
    daily/route.ts         # GET /v1/daily    (ai=false)
    usage/route.ts         # GET /v1/usage
components/
  LocationBar.tsx          # auto-detect + Kenya farm-region presets
  HeadlineCard.tsx
  SprayTimeline.tsx
  HarvestOutlook.tsx
  QuotaPanel.tsx
lib/
  weatherClient.ts
  fieldwindow.ts
public/
  landing-hero-orchard.png
```

Open [http://localhost:3000](http://localhost:3000) for the landing, then **Open planner** → `/app`.

## Endpoints used (all Free tier)

| Endpoint | Used for |
|---|---|
| `GET /v1/weather-geo` | auto-location + current conditions + AI summary |
| `GET /v1/hourly` | spray window timeline (ai=false) |
| `GET /v1/daily` | harvest dry-streak outlook (ai=false) |
| `GET /v1/usage` | quota panel |

## Possible next steps

- Cache the current-conditions AI summary for a few minutes to spend even less
  AI quota on repeat loads.
- Add a "notify me when the next spray window opens" flow (would use
  `/v1/webhooks` — Pro plan).
- Let users save named plots and compare spray windows across locations.

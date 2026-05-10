# oneroam

Instant travel eSIM. No signup, no cart — tap, pay, go.

**https://oneroam.app**

## Architecture

```
User → Cloudflare Workers (Next.js) → esimaccess.com API (live inventory + provisioning)
                                   → Stripe (Apple Pay / Google Pay)
                                   → D1 (SQLite — order tracking)
                                   → Resend (transactional email)
```

- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS, shadcn/ui
- **Runtime**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Database**: Cloudflare D1 (SQLite) — lightweight order tracking
- **Payments**: Stripe PaymentIntents + Payment Request Button (Apple Pay / Google Pay)
- **eSIM Provider**: esimaccess.com REST API — real-time inventory, provisioning, topups, usage
- **Email**: Resend REST API — branded HTML delivery emails
- **Deploy**: Git push → Cloudflare auto-deploys

## How it works

### Purchase flow

1. Homepage fetches live inventory from esimaccess.com (cached 5 min)
2. Plans filtered to 10–30GB, 30+ day validity, deduplicated by country + data amount
3. User taps a plan → modal opens with price, specs, network operators
4. Apple Pay / Google Pay button rendered directly in the modal (Stripe Payment Request)
5. Payment creates a Stripe PaymentIntent + pre-saves order in D1
6. `/api/provision-esim` verifies payment via Stripe, calls esimaccess to buy the eSIM
7. QR code + activation code returned and displayed
8. Resend sends a branded email with QR code, activation code, ICCID, install instructions, and a topup link

### Topup flow

1. User visits `/topup`, enters their ICCID (from the order email)
2. Usage data fetched from esimaccess — shown as a green/amber/red progress bar
3. Available topup plans listed — same tap-to-buy modal with Apple Pay

### Key API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/plans` | Live inventory from esimaccess (cached, 25% markup) |
| `POST /api/create-payment-intent` | Creates Stripe PaymentIntent + pre-saves D1 order |
| `POST /api/provision-esim` | Verifies payment, buys eSIM from esimaccess, returns QR |
| `POST /api/webhooks/stripe` | Backup fulfillment (catches missed payments) |
| `POST /api/topup/options` | Lists topup plans for an ICCID |
| `POST /api/topup/purchase` | Buys a topup via esimaccess |
| `POST /api/usage` | Queries data usage for an ICCID |

### Directory structure

```
src/
  app/
    page.tsx                          # Homepage — plans grid + search
    layout.tsx                        # Root layout
    checkout/success/                 # Post-payment — QR code display
    topup/page.tsx                    # Topup — ICCID lookup + usage + plans
    api/
      plans/route.ts                  # Live inventory from esimaccess
      create-payment-intent/route.ts  # Stripe PaymentIntent creation
      provision-esim/route.ts         # eSIM purchase + email delivery
      webhooks/stripe/route.ts        # Stripe webhook (backup)
      topup/options/route.ts          # Topup plan listing
      topup/purchase/route.ts         # Topup purchase
      usage/route.ts                  # Data usage query
      orders/by-payment/route.ts      # Order lookup by payment intent
  lib/
    esimaccess/
      client.ts                       # REST API client (auth, fetch)
      catalog.ts                      # Plan fetching + 25% markup + dedup
      order.ts                        # eSIM purchase + query
      topup.ts                        # Topup listing + purchase
      usage.ts                        # Data usage query
    d1/client.ts                      # D1 query helpers
    email.ts                          # Resend email delivery
    stripe/server.ts                  # Stripe SDK (fetch-based for Workers)
    types.ts                          # Shared TypeScript types
    utils.ts                          # formatPrice, formatDataAmount, cn
  components/
    landing/hero-section.tsx          # Hero banner
    plans/plan-card.tsx               # Plan card in grid
    plans/plan-detail-modal.tsx       # Detail modal with embedded Apple Pay
  wrangler.jsonc                      # Cloudflare Workers + D1 config
  open-next.config.ts                 # @opennextjs/cloudflare adapter
```

## Environment variables

Set in `.env.local` for local dev and as Cloudflare Worker secrets for production.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL (https://oneroam.app) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (for D1 REST API in local dev) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `RESEND_API_KEY` | Resend API key for email delivery |

## Local development

```bash
npm install
npm run dev        # Next.js dev server on port 3000
```

Local dev uses the D1 REST API (via `CLOUDFLARE_API_TOKEN`) to reach the production D1 database. Plans come from the live esimaccess API.

```bash
npm run deploy     # Build + deploy to Cloudflare Workers
npm run preview    # Build + run locally in Workers runtime (workerd)
```

## Deployment

Git push to `main` triggers auto-deploy via Cloudflare's GitHub integration. No manual steps.

To deploy manually:
```bash
CLOUDFLARE_API_TOKEN=... npm run deploy
```

## Secrets management

Worker secrets are set via `wrangler`:
```bash
npx wrangler secret put SECRET_NAME --name oneroam
```

Currently configured: `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Pricing

Plans are fetched from esimaccess.com at wholesale prices (micro-units / 10,000 = USD). A 25% markup is applied. Tax is included in the displayed price. The markup is configured in `src/lib/esimaccess/catalog.ts` (`MARKUP` constant).

## Plan filtering

Plans shown to users are filtered in `src/app/page.tsx`:
- **Data**: 10–30GB (`MIN_GB` / `MAX_GB`)
- **Validity**: 30+ days (`MIN_DAYS`)
- **Dedup**: One plan per country + data amount combination (lowest price kept)
- **Search**: Client-side filter by country name, region, or plan name

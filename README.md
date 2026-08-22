# InvoicePH — Free BIR-Compliant Invoice Generator (PH Freelancers)

**Live:** https://makavelimachiavelli.github.io/invoiceph/

## What it is
A free, no-signup, 100% client-side invoice generator that produces BIR/EOPT-Act-compliant invoice layouts for Philippine freelancers and small businesses. Since RR 11-2024 (April 27, 2024), PH freelancers must issue **invoices** instead of official receipts — fresh, ongoing regulatory pain with weak free tooling.

**Free tier:** unlimited invoice creation, VAT / VAT-exclusive / VAT-inclusive / NON-VAT modes, live preview, print-to-PDF, draft autosave, works offline.
**PRO (₱199 one-time, GCash):** saved client directory, automatic invoice numbering, BIR-style sales book with CSV export.

## Buyer persona
- **Who:** Filipino freelancers (VA, devs, designers, writers) billing local PH clients; small non-VAT service businesses.
- **Pain:** EOPT Act forced the OR→invoice switch; existing tools are either generic (Refrens/QuickDocs, not BIR-aware), paid SaaS (Refrens paid tiers, QuickBooks PH, Taxumo, JuanTax), or Excel templates.
- **Why pay ₱199:** one-time vs ₱2,500+/yr Taxumo or ~$25/mo Refrens; sales-book CSV feeds directly into books-of-accounts prep for quarterly filing.
- **Where they hang out:** r/taxPH, r/Philippines, PH freelancer Facebook groups (OFW/freelancer communities), Linkedin PH freelancer circles.

## Demand evidence (per REVENUE GATES)
- Paid competitors: Refrens (paid tiers, PH-localized page), QuickBooks PH (paid product), Taxumo (paid plans), JuanTax (paid plans) = 4+ paid.
- Community demand: r/taxPH threads on EOPT invoice requirements; a dev-built EOPT invoice tool was received with heavy interest.
- Regulatory tailwind: EOPT Act / RR 11-2024 (effective 2024-04-27) — every PH freelancer must now issue invoices.

## Monetization
GCash QR + unlock code (see `PAYMENTS.md`). One-time ₱199. Software is complete; only merchant assets (QR image + codes) need Allen's 5-minute setup.

## Tech
Pure static: HTML/CSS/vanilla JS. No build step, no backend, no dependencies, no tracking. All data in `localStorage`. Print CSS → browser save-as-PDF.

## Deploy (GitHub Pages)
```bash
git init && git add -A && git commit -m "InvoicePH v1"
gh repo create invoiceph --public --source=. --push
gh api -X POST repos/MakaveliMachiavelli/invoiceph/pages -f "source[branch]=main" -f "source[path]=/"
# live at https://makavelimachiavelli.github.io/invoiceph/ within ~1 min
```

## Owner TODO (Allen, ~5 min)
1. Replace `assets/gcash-qr.svg` with your real GCash merchant/personal QR (screenshot → crop → save as svg/png, keep filename).
2. Change `PRO_CODES` in `app.js` to codes you'll message buyers after payment.
3. Optional: create a LemonSqueezy/Gumroad product for global buyers and link it in the modal.
4. Growth lever (this is the real one): post the link in 2-3 PH freelancer Facebook groups / r/taxPH when it's polished.

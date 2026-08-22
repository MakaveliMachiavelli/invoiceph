# PAYMENTS.md — InvoicePH monetization setup (Allen's 5-minute step)

The software side of payments is **done and working**: pay modal → GCash QR → unlock code → PRO features activate instantly (stored in the buyer's browser). Only merchant assets are needed from you.

## 1. GCash QR (2 min)
1. In GCash: Profile → **My QR code** (or a Merchant QR if you have a GCash business account).
2. Screenshot → crop → save over `assets/gcash-qr.svg` (or save as `assets/gcash-qr.png` and update the `<img src>` in `index.html`).
3. Commit + push:
   ```bash
   git add assets && git commit -m "swap in real GCash QR" && git push
   ```

## 2. Unlock codes (2 min)
Edit `app.js` line ~10:
```js
const PRO_CODES = ['INVOICEPH-PRO-199', 'IPH-DEMO'];   // ← your codes
```
Any code in the list works forever for any buyer (treat codes as semi-secret; rotate if leaked). Simple scheme that works: `IPH-<something>`; message it to the buyer after you receive their ₱199 + reference number.

## 3. Optional global rails (5 min, do once, reuse for all zinvent products)
- **LemonSqueezy / Gumroad / Payhip**: sign up (email), create product "InvoicePH PRO — ₱199/$4", paste the unlock code as the purchase-download content, add the checkout link next to the GCash box in the modal (`index.html`, `payModal` section).
- These give you card payments + automatic code delivery with zero infra.

## 4. Pricing rationale
₱199 one-time ≈ 4 cups of coffee vs Taxumo ₱2,500+/yr, Refrens ~$25/mo, QuickBooks ~₱1,000+/mo. For a freelancer who just needs compliant invoices + a sales book, one-time wins. Raise to ₱299–₱499 once there's social proof.

## 5. Fulfilment flow (manual, ~1 min per sale)
GCash notification → send code via Messenger/SMS → done. At volume (>20/mo), switch to LemonSqueezy auto-delivery (step 3).

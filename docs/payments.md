# Payments (Razorpay)

Checkout takes payment through **Razorpay Standard Checkout**, Razorpay's own payment window
(UPI, cards, net banking, wallets). The site never sees card or bank details, and it never
handles the Razorpay **key secret**: that lives only on the backend.

## How a payment works

```
/checkout ──"pay ₹…"──▶ POST /orders ──▶ order (pending_payment) + Razorpay session
          ──▶ Razorpay window ──paid──▶ POST /orders/:id/payment (backend verifies the signature)
          ──▶ order paid, bag emptied ──▶ /order-confirmation?id=AUR-…
Razorpay ──webhook──▶ backend marks the order paid even if the visitor closed the tab
```

1. The visitor fills in the delivery address and presses **pay ₹…**.
2. `POST /orders` creates the order as `pending_payment` and a matching Razorpay order, and
   returns a `payment` session (public key id, Razorpay order id, amount in paise). The bag is
   kept.
3. The site opens Razorpay's window, pre-filled with the visitor's name, email and mobile.
4. When the payment succeeds, Razorpay hands back the payment id, order id and a signature. The
   site sends them to `POST /orders/:id/payment`; the backend checks the signature with the key
   secret, marks the order `paid`, empties the bag and returns the order.
5. The site shows the order confirmation.

If the visitor closes the window, the site says the payment wasn't completed and keeps the bag;
pressing pay again starts a fresh attempt. If a payment fails inside the window, Razorpay offers
a retry there, and the reason is shown if they close it. If the payment went through but the
confirmation call fails, the site tells the visitor not to pay again: the webhook confirms it.

The backend's side (endpoints, signature checks, webhook) is in `backend-handoff.md`.

| Piece                                                          | File                      |
| -------------------------------------------------------------- | ------------------------- |
| Loads Razorpay's script and opens the window                   | `src/lib/razorpay.ts`     |
| The pay button, its states and messages                        | `src/routes/checkout.tsx` |
| `placeOrder` and `confirmPayment` calls                        | `src/lib/api/index.ts`    |
| `usePlaceOrder`, `useConfirmPayment` (empty the bag when paid) | `src/lib/api/hooks.ts`    |
| Shapes: `PaymentSession`, `PlacedOrder`, `PaymentResult`       | `src/lib/api/types.ts`    |
| The stand-in for testing without a backend                     | `src/lib/api/mock.ts`     |

## Three modes

| Setup                                  | What checkout does                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| No backend, no `VITE_RAZORPAY_KEY_ID`  | Demonstration checkout: "place order" records the order in the browser. No payment.                                                                   |
| No backend, `VITE_RAZORPAY_KEY_ID` set | Opens the real Razorpay window in **test mode**, without a Razorpay order. Use netbanking or test cards; no money moves. The signature isn't checked. |
| Backend connected (`VITE_API_URL` set) | The full, secure flow above. The backend decides test or live by which keys it uses; `VITE_RAZORPAY_KEY_ID` is ignored.                               |

## Set up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com/). You can use **Test Mode** straight away;
   live payments need the business KYC to be approved.
2. In the Dashboard, switch to **Test Mode** (the toggle at the top), then go to **Account &
   Settings → API Keys → Generate Key**. You get a **Key Id** (`rzp_test_…`) and a **Key
   Secret**.
   - The **Key Id** is public. For local testing without a backend, put it in `.env.local` as
     `VITE_RAZORPAY_KEY_ID=rzp_test_…` and restart `npm run dev`.
   - The **Key Secret** goes only to the backend developer, through a private channel. Never
     put it in this repo, a `.env` file here, or a chat.
3. Before going live, the backend developer also needs a **webhook** (Dashboard → Webhooks):
   URL `https://<api domain>/webhooks/razorpay`, events `payment.captured` and `order.paid`,
   and a webhook secret they choose.
4. Payments should be **captured automatically** (Account & Settings → Payment capture), so
   a successful payment is final without a manual step.
5. For launch: complete KYC, generate **Live** keys, give them to the backend developer, and
   repeat the webhook in Live mode.

## Testing in test mode

Tested on 2026-10-03 with the mock and a test key: the window opens with the total, name and
email filled in; a failed payment shows Razorpay's reason and keeps the bag; a successful one
marks the order paid, empties the bag and shows the confirmation.

- **Easiest:** choose **Netbanking**, pick any bank, and Razorpay opens a test page (in a
  pop-up, so allow pop-ups for the site) with **Success** and **Failure** buttons.
- **Cards:** use the test card numbers from Razorpay's docs ("Test cards"), any future expiry
  and any CVV.
- **UPI** is switched off on the Razorpay account itself, not by the site: on 2026-10-03
  Razorpay reported the account as not yet activated, with UPI disabled. It should appear once
  KYC is approved and the account is activated; if not, ask Razorpay support to enable UPI. On
  phones UPI shows as "pay with an app"; on computers as a QR code or UPI id.
- **Mobile number:** Razorpay rejects obviously made-up numbers such as 9876543210 (it then
  leaves the field empty). Its own example, 9000090000, works.
- Claude Code's built-in preview browser blocks the bank pop-up, so finish a payment in a normal
  browser.

## Not covered yet

- **Refunds and cancellations:** done from the Razorpay Dashboard for now.
- **Paying for an unpaid order later** (e.g. from the account page): unpaid orders are hidden
  from the account, and the next checkout replaces them.
- **Cash on delivery:** not offered.

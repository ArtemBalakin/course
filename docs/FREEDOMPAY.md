# Freedom Pay integration plan (Kazakhstan)

## Onboarding
Official application: https://freedompay.kz/largebusiness/anketa
FAQ: https://freedompay.kz/largebusiness/faq
Merchant API: https://freedompay.kz/docs/merchant-api/pay
New docs: https://docs.freedompay.kz/

Freedom Pay's onboarding checklist requires:
- Real courses and actual prices in KZT (no demo data).
- Full legal entity/individual entrepreneur seller identity and company contacts.
- Public offer / user terms, refund policy, privacy policy.
- Clear delivery/access and payment process.
- Visa and Mastercard logos.
- KZT bank account and signed contract, and requested IE/KYC documentation.

Ask your manager whether Cloudflare Pages' free subdomain/hosting is acceptable; Freedom Pay's blog mentions paid domain and hosting.

## Integration (do not use React to store secrets)
1. Customer selects a course in React or Telegram bot.
2. Backend creates a unique order with trusted course price, currency KZT, customer/Telegram identity and source tag.
3. Backend signs a server-to-server call to `https://api.freedompay.kz/init_payment.php` with Merchant ID, secret Merchant Key, `pg_order_id`, `pg_amount`, `pg_currency=KZT`, description, salt, and `pg_sig`.
4. Backend responds to frontend/bot with the returned `pg_redirect_url`.
5. Customer is redirected to Freedom Pay's payment page.
6. Freedom Pay calls the publicly reachable `pg_result_url` (webhook). Verify `pg_sig`, merchant order ID, amount, currency, final status and test flag, persist transaction and prevent duplicate fulfillment.
7. Mark order paid and grant lesson access via bot only after verified server callback (not based on browser success URL). Record callback, respond as required by official protocol.
8. Support payment reconciliation, retry handling, refunds, audit logs and receipt/fiscalization requirements.

## Required configuration
Server secrets: FREEDOMPAY_MERCHANT_ID, FREEDOMPAY_MERCHANT_KEY, callback URLs.
Never expose these in `VITE_*` variables, browser JavaScript, git or client logs.

## Development approach
During development, mock the payment provider interface; replace with test credentials and sandbox mode only after merchant account access is issued. Run end-to-end tests: success, failure, duplicate webhook, missing webhook, signature mismatch, order amount mismatch, refund and retries.

## Seller identity
Decide who is legally selling the lessons: Sabina or the IP owner. That entity must match the payment contract, public offer, receiving bank account and taxes.

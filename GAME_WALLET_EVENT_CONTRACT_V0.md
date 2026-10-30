# QuRa — контракт «кошелёк → игра» v0.1

**Статус:** инженерное предложение, проверить с реальной кодовой базой QuRa и владельцами платежных событий. Документ не утверждает, что такие поля/события уже реализованы.

## 1. Разделение ответственности

Финансовая система — источник истины по деньгам, статусу операции, возвратам, фактической услуге и начислению финансовых GE. Игра получает только минимальные подтверждённые события; не вычисляет статус оплаты по UI и не изменяет финансовый ledger. GE принадлежат общей бонусной системе. Никаких данных карты, паспортных данных и приватных ключей в game event payload.

## 2. Envelope

```json
{
 "event_id":"uuid",
 "event_type":"payment.settled",
 "event_version":1,
 "occurred_at":"2026-10-30T10:00:00Z",
 "account_id":"opaque-account-id",
 "operation_id":"opaque-operation-id",
 "provider_code":"provider-id",
 "service_category":"QR_PAYMENT",
 "country_code":"RU",
 "amount_minor":10000,
 "currency":"RUB",
 "status":"SETTLED",
 "correlation_id":"opaque-correlation-id",
 "idempotency_key":"unique-event-source-key"
}
```

No PII / wallet address / device fingerprint in this event. Security matching for abuse is delegated to restricted anti-fraud APIs. Delivery: at-least-once, consumer idempotent; signed trusted transport, authenticated origin, bounded retry, dead-letter queue, schema versioning.

## 3. Event list

| Event | Use in game | Important |
|---|---|---|
| `payment.settled` | qualified action XP/feed | only final eligible settlement |
| `payment.reversed` | reverse provisional game rewards or debit recovery | linked original operation |
| `service.first_qualified_use` | one-time milestone XP | unique by account + stable taxonomy version |
| `wallet.kyc_completed` | first-time QuRa Journey | only normalized boolean/state, no document data |
| `wallet.service_enabled` | journey discovery | no payment XP |
| `bonus.ge_credited` | read-only display after bonus ledger credit | **never mint same GE again** |
| `bonus.ge_reversed` | read-only bonus correction | central bonus policy applies |

Category mapping versioned server-side: `QR_PAYMENT`, `MOBILE_TOPUP`, `UTILITIES_PAYMENT`, `LUKOIL`, `CRYPTO_ONRAMP`, `OTHER_ELIGIBLE`, `UNKNOWN`. Provider/source code maps to category via admin-controlled approved taxonomy. `UNKNOWN` does not grant tailored feed or category-first XP. `CRYPTO_ONRAMP` requires explicit eligibility/compliance check, not automatically a payment. MoonPay is a provider route, not evidence of a service payment. No self-generated circular top-ups for XP farming.

## 4. New service criterion

`first_use` requires settled qualifying operation after category-specific minimum threshold, same account, unique stable service key and no earlier qualifying settled operation. If operation is rolled back in holding period, its first-use claim is released or placed pending; replay never duplicates. Distinguish first-ever use and first-use-per-category (different quest keys). Idempotency key: `account:service_category:taxonomy_version:milestone`.

## 5. Reversal/returns

- During configured settlement holding window, XP/feed and quest progression can be `PENDING`; show «Ожидает подтверждения», no unavailable rewards.
- `payment.reversed` references original ID, status `FULL/PARTIAL`, reversed amount and reason code (no sensitive user reason).
- If not yet delivered: cancel pending reward.
- If delivered: append compensating XP/GE ledger entry governed by respective program policy; **never mutate financial payment status from the game**.
- XP should not silently go below floor for the user's current level, nor delete items/characters unexpectedly: record debt/recovery or fraud review, explicit UI notice if relevant; rules for negative XP are OPEN.
- GE reversal only through central bonus ledger; no double recovery. Partial refunds prorate only if source policy allows.
- Out-of-order events stored and reconciled with original; dead-letter anomalies alert operators.

## 6. Admin controls and tests

Versioned taxonomy, eligibility thresholds, per-source XP caps, holding periods, feed mapping, anti-fraud risk gates, routing by country/provider, reconciliation dashboard. Tests: duplicate callback, refund before settlement, partial refund, out-of-order reversal, two providers same category, linked-account farming, timezone boundaries, replay after deploy, concurrent first-use race.

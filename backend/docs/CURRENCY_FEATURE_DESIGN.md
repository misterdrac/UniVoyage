# Currency & exchange rates — design reference

This document captures agreed architecture for trip currency / FX in UniVoyage. It is kept in sync with the implementation.

## Principles

1. **Currency metadata lives on `countries`, not on `destinations`.**  
   One ISO country → one primary ISO 4217 currency. Destinations reference a country via `country_iso_code` → `countries.iso_code`.

2. **Exchange-rate provider: [ExchangeRate-API](https://www.exchangerate-api.com/)**  
   v6 pair endpoint; configure `EXCHANGE_RATE_API_KEY` (see `application.yml` → `app.currency.exchangerate-api`).

3. **Returned rate: user home currency → trip destination currency.**  
   Home currency comes from the user’s `country_of_origin_code` → `countries.currency_code`. If the user has no home currency, **base defaults to EUR**. If the destination has no country or the country has no `currency_code`, the API returns **422** (`UnprocessableEntityException`) so admins can fix data.

4. **Caching**  
   `CachedExchangeRateService` uses `@Cacheable` on `fxRates` (Caffeine, 12h TTL) to limit external API calls.

5. **Edge cases**  
   - Primary currency per country only (ISO 4217).  
   - Multi-destination / multi-country trips could later return multiple currency blocks; current model is one destination per trip.

## Database (implemented)

Flyway **`V5__create_destinations_table.sql`** + **`V10__seed_destinations.sql`**:

- `destinations.country_iso_code` → `NOT NULL`, FK to `countries(iso_code)`; seed rows include ISO codes per `location` (incl. Hong Kong `HK` in `countries` via **`V12__currency_and_destination_country.sql`** if missing).

Flyway **`V12__currency_and_destination_country.sql`** (currency metadata only):

- `countries.currency_code`, `countries.currency_name`, index on `currency_code`

## Code layout

| Area | Package / artifact |
|------|---------------------|
| HTTP client + API DTO | `com.univoyage.currency.client` |
| Trip response DTO | `com.univoyage.trip.dto` (`TripCurrencyResponse`) |
| Config (`ExchangeRateApiProperties`, `RestClient` bean) | `com.univoyage.currency.config` |
| `TripCurrencyService`, `CachedExchangeRateService` | `com.univoyage.currency.service` |
| `Country` entity | `com.univoyage.reference.country.model` |
| `DestinationEntity.country` | `com.univoyage.destination.model` |
| Route | `TripController` → `GET /api/trips/{tripId}/currency` |

## API

`GET /api/trips/{tripId}/currency` (authenticated, trip owner only).  
Wrapped in `ApiResponse` as `data.currency`:

```json
{
  "destinationCurrencyCode": "JPY",
  "destinationCurrencyName": "Japanese yen",
  "exchangeRate": 169.42,
  "baseCurrencyCode": "EUR"
}
```

Errors: **404** if trip not found / not owned; **422** if destination country or currency missing; **502** if ExchangeRate-API fails (`ExternalServiceException`).

## Local configuration

See **`backend/.env.example`**: `EXCHANGE_RATE_API_KEY`, optional `EXCHANGE_RATE_API_URL`.

---

*Last updated: 2026-03-19 (implementation complete).*

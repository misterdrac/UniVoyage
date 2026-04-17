# Traveller reviews and ratings — frontend integration

This document describes how the web app can **submit** trip ratings, **show moderation state** to the user, **load published reviews** on destination pages, and how **admin** moderates text. All JSON uses the shared `ApiResponse` envelope unless noted.

## Response envelope (`ApiResponse`)

Most endpoints return:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

On failure:

```json
{
  "success": false,
  "data": null,
  "error": "Human-readable message"
}
```

Validation errors (`400`) may return `data` as a map of field names to messages (see your existing global handler behaviour).

## Authentication and cookies

- **User endpoints** (`/api/trips/...`) require a valid session: **access JWT** in the `auth_token` HttpOnly cookie (and the usual **CSRF** cookie/header pairing if your app already sends CSRF on mutating requests).
- Use **`credentials: 'include'`** (or equivalent) on `fetch`/axios so cookies are sent for same-site API calls.
- **Public** destination endpoints do not require login.

---

## Destination list cards: rating fields

`GET /api/destinations` and `GET /api/destinations/search?query=...` return each destination with:

| Field | Type | Meaning |
|--------|------|--------|
| `averageRating` | `number \| null` | Curated/editorial score (0–5, one decimal). |
| `travellerRatingAverage` | `number \| null` | Average of **approved** star ratings from travellers; `null` if none. |
| `travellerRatingCount` | `number` | Count of **approved** traveller ratings (stars) for aggregates. |

These are independent: you can show both or prioritise one in the UI.

---

## Submit or update the current user’s rating (per trip)

**`POST /api/trips/{tripId}/rating`**

- **Auth:** required.
- **Body (JSON):**

```json
{
  "stars": 4,
  "comment": "Optional text, max 2000 chars"
}
```

- `stars`: integer **1–5** (required).
- `comment`: optional string; whitespace-only is treated as **no comment**.

**Success (`200`):**

```json
{
  "success": true,
  "data": {
    "rating": {
      "stars": 4,
      "comment": "Great week",
      "updatedAt": "2026-04-11T12:34:56.789Z",
      "moderationStatus": "PENDING"
    }
  },
  "error": null
}
```

**`moderationStatus`** is a string enum:

| Value | Meaning |
|--------|--------|
| `APPROVED` | Visible for aggregates and (if there is text) on the public reviews list. |
| `PENDING` | A **non-empty comment** is waiting for staff review. Stars may still be stored; aggregates use only **approved** rows. |
| `REJECTED` | Staff rejected the text; user can edit and resubmit (typically goes back to `PENDING` if they change the comment). |

**Rules (product logic):**

- User can only rate when the trip **has ended** (return date ≤ today) **or** status is `completed` (see backend message if not eligible).
- **Stars only** (no real comment after trim) → **`APPROVED` immediately** and counts toward `travellerRatingAverage` / `travellerRatingCount`.
- **Any non-empty comment** on create or on edit → **`PENDING`** until an admin approves (unless the user only changes stars and leaves the **same** comment as an already-approved review — then it can stay `APPROVED`).

**`GET /api/trips/{tripId}/rating`** (auth required) returns the same `data.rating` shape, or `data.rating: null` if the user has not submitted anything yet.

**Typical errors:**

- `400` — validation (`stars` out of range, comment too long) or not eligible to rate.
- `404` — trip not found or not owned by the user.
- `429` — rate limit (see below).

---

## Rate limiting on submit

`POST /api/trips/{tripId}/rating` is limited **per client IP** and **per authenticated user** (fixed time windows, in-memory on each server).

- When limited, the API returns **`429 Too Many Requests`** with header **`Retry-After`** (seconds, integer string) and `success: false` plus an `error` message (network vs account wording differs).

**Default limits** (configurable in backend `application.yml` under `app.trip.rating`):

- IP: **40** requests per **1 minute**
- User: **30** requests per **1 minute**

The UI should show a short “try again later” message and optionally read `Retry-After` for a countdown.

**Note:** `GET /api/trips/{tripId}/rating` is **not** rate-limited by this mechanism.

---

## Public reviews list (destination page)

**`GET /api/destinations/{destinationId}/reviews`**

- **Auth:** not required.
- **Pagination:** standard Spring query params: `page` (0-based), `size` (default **10** on the server).

Example: `/api/destinations/42/reviews?page=0&size=10`

**Success (`200`):**

```json
{
  "success": true,
  "data": {
    "reviews": {
      "content": [
        {
          "id": 101,
          "stars": 5,
          "comment": "Wonderful place",
          "reviewerDisplayName": "Alex K.",
          "submittedAt": "2026-04-10T08:00:00Z"
        }
      ],
      "totalElements": 24,
      "totalPages": 3,
      "size": 10,
      "number": 0
    }
  },
  "error": null
}
```

**Semantics:**

- Only **`APPROVED`** reviews appear.
- Only rows with a **non-blank** comment appear (star-only ratings do not show here; they still affect `travellerRatingAverage` on the destination).
- `reviewerDisplayName` is privacy-safe (e.g. first name + surname initial).
- `submittedAt` is the review row’s `updatedAt` (last change time).

**`404`** if `destinationId` does not exist.

---

## Admin: moderation queue (staff only)

Requires an **admin** session (`ADMIN` or `HEAD_ADMIN` role). Paths are under `/api/admin/reviews`.

### List pending text reviews

**`GET /api/admin/reviews/pending?page=0&size=20`**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "ratingId": 101,
        "tripId": 55,
        "destinationId": 42,
        "destinationName": "Lisbon",
        "userEmail": "user@example.com",
        "stars": 5,
        "comment": "…",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "size": 20,
    "number": 0
  },
  "error": null
}
```

Oldest pending items first (FIFO).

### Approve

**`POST /api/admin/reviews/{ratingId}/approve`**

- **`200`** — success; `data` may be `null`.
- Recomputes destination traveller aggregates so the review counts toward averages and can appear in the public list (if it has text).

### Reject

**`POST /api/admin/reviews/{ratingId}/reject`**

- **`200`** — success; `data` may be `null`.
- Review will not appear publicly; aggregates updated.

**`400`** if the row is not in `PENDING` (e.g. approve/reject wrong state). **`404`** if `ratingId` unknown.

---

## Suggested UI flows

1. **Trip detail / past trip:** call `GET .../rating` to prefill a form; `POST .../rating` on save; if `moderationStatus === 'PENDING'`, show “Your review is awaiting approval.”
2. **Destination page:** show `travellerRatingAverage` / `travellerRatingCount` from the destination payload; load `GET .../destinations/{id}/reviews` for quoted reviews with infinite scroll or “Load more” using `page`.
3. **429 on submit:** message + optional timer from `Retry-After`.

---

## Quick reference

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/trips/{tripId}/rating` | User |
| `POST` | `/api/trips/{tripId}/rating` | User |
| `GET` | `/api/destinations/{destinationId}/reviews` | Public |
| `GET` | `/api/admin/reviews/pending` | Admin |
| `POST` | `/api/admin/reviews/{ratingId}/approve` | Admin |
| `POST` | `/api/admin/reviews/{ratingId}/reject` | Admin |

For cookie-based auth and refresh behaviour, see [auth-session-management.md](./auth-session-management.md).

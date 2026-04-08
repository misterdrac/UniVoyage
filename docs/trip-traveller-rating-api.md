# Trip traveller rating API

Authenticated endpoints (cookie JWT + CSRF for `POST`). Wrapper: `{ "success", "data", "error" }`.

## `GET /api/trips/{tripId}/rating`

**200 — has rating**

```json
{
  "success": true,
  "data": {
    "rating": {
      "stars": 4,
      "comment": "Great trip",
      "updatedAt": "2026-04-08T20:15:30.123456789Z"
    }
  },
  "error": null
}
```

**200 — no rating yet**

```json
{
  "success": true,
  "data": { "rating": null },
  "error": null
}
```

**404 — trip missing or not owned**

```json
{
  "success": false,
  "data": null,
  "error": "Trip not found"
}
```

## `POST /api/trips/{tripId}/rating`

**Body:** `{ "stars": 1-5, "comment"?: string }` — `comment` optional, max 2000 chars; whitespace-only stored as null.

**200 — created/updated**

```json
{
  "success": true,
  "data": {
    "rating": {
      "stars": 4,
      "comment": "Great trip",
      "updatedAt": "2026-04-08T20:15:30.123456789Z"
    }
  },
  "error": null
}
```

**400 — not eligible to rate**

```json
{
  "success": false,
  "data": null,
  "error": "You can rate this trip only after it has ended (return date has passed or status is completed)."
}
```

**400 — validation** (`data` has field → message; example)

```json
{
  "success": false,
  "data": { "stars": "must be greater than or equal to 1" },
  "error": "Validation failed for the request payload."
}
```

**404 — unknown trip or not owned**

```json
{
  "success": false,
  "data": null,
  "error": "Trip not found"
}
```

# Refresh Tokens and Session Management

This document describes how authentication sessions work in UniVoyage using access tokens and refresh tokens.

## Overview

The backend uses a dual-token model:

- Access token (`auth_token` cookie): short-lived JWT used for authenticated API access.
- CSRF token (`csrf_token` cookie): paired with the access token for CSRF validation.
- Refresh token (`refresh_token` cookie): long-lived, HttpOnly token used only to renew session.

Refresh tokens are persisted in the database as hashes, not plaintext values.

## Components

- `AuthController`: login/register, refresh, logout session flows.
- `RefreshTokenService`: issue, rotate, and revoke refresh tokens.
- `AuthCookieWriter`: sets and clears auth cookies consistently.
- `RefreshIpRateLimiter`: per-IP protection for `/api/auth/refresh`.
- `refresh_tokens` table: stores hashed refresh tokens with expiry.

## Login and Register

On successful `POST /api/auth/login` and `POST /api/auth/register`:

1. Backend issues access JWT + CSRF token.
2. Backend creates a refresh token via `RefreshTokenService.issueRefreshToken(...)`.
3. Backend stores SHA-256 hash of the refresh token in `refresh_tokens`.
4. Backend writes cookies:
   - `auth_token` (HttpOnly)
   - `csrf_token` (readable by client)
   - `refresh_token` (HttpOnly)

## Refresh Flow

Endpoint: `POST /api/auth/refresh`

1. Request is checked by `RefreshIpRateLimiter`.
2. Backend reads `refresh_token` cookie.
3. `RefreshTokenService.rotate(rawToken)` validates token hash and expiry.
4. If valid:
   - old refresh token row is deleted (single-use rotation),
   - new access JWT + CSRF are issued,
   - new refresh token is generated and stored,
   - cookies are updated.
5. If invalid/expired:
   - auth cookies are cleared,
   - response is `401 Unauthorized`.

## Logout and Invalidation

Endpoint: `POST /api/auth/logout`

On logout:

1. If user is authenticated, all refresh tokens for that user are revoked.
2. Presented refresh token cookie is revoked directly (defensive path).
3. Auth cookies are cleared.

Result: old refresh tokens cannot be used to mint new access tokens.

## Storage Model

Refresh token persistence:

- Token value is random and returned only to client cookie.
- Database stores only `token_hash` (SHA-256), `user_id`, `expires_at`, `created_at`.
- Table: `refresh_tokens` (migration `V15__create_refresh_tokens.sql`).

## Security Properties

- Refresh token rotation limits replay of previously used tokens.
- Hash-at-rest protects token secrecy in case of DB leakage.
- HttpOnly refresh cookie reduces token exposure to JavaScript.
- Separate refresh endpoint allows tighter controls (rate limiting and explicit handling).
- Centralized cookie writing ensures consistent secure/samesite/domain behavior.

## Endpoints Summary

- `POST /api/auth/login`: issues access + csrf + refresh cookies.
- `POST /api/auth/register`: issues access + csrf + refresh cookies.
- `POST /api/auth/refresh`: rotates refresh and renews access session.
- `POST /api/auth/logout`: revokes refresh token(s) and clears cookies.

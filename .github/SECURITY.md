# Security Policy

Midday Madness is a public, static website for IU's midday sports talk show on WIUX 99.1 FM. Only the latest `main` is supported.

## Reporting a vulnerability

Please **do not** open a public issue. Use GitHub's private reporting instead:
**Security tab → Report a vulnerability** on this repository.

Include what you found, steps to reproduce, the potential impact, and a suggested fix if you have one. Reports are acknowledged on a best-effort basis, typically within a few days.

## Scope

In scope:
- The live page and producer console (`live.html`, `producer.html`, `live-shared.js`)
- The **Ask the Hosts** form and its spam protections (length caps, executable-link and shortener blocking, flood and duplicate guards)
- The Supabase row-level security policies and RPCs in [`supabase/`](../supabase)

Out of scope: third-party services (Vercel, GitHub, Supabase, the WIUX stream) and anything that needs physical access to a host's device.

## Practices

- The Supabase **anon key** is public by design (it ships in `live-shared.js`); access is limited by row-level security. A service-role or secret key must never be committed — CI blocks it.
- Public writes go through RPCs with server-side validation, not open table policies.
- Secrets live in the host's environment settings, never in the repo.

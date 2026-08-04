# Getting 702withtheview.com live

> **Status: COMPLETE (2026-08-03).** Domain purchased on Cloudflare
> Registrar, all five DNS records live (grey-cloud/DNS-only), custom domain
> set on GitHub Pages, certificate issued (valid to 2026-11-02,
> auto-renewed by GitHub), and Enforce HTTPS on. `http://` and `www`
> both 301 to `https://702withtheview.com`. Note: certificate issuance
> stalled ~50 minutes because the domain was attached to Pages before the
> DNS records existed — removing and re-adding the custom domain
> retriggered issuance, which then completed in minutes. The steps below
> are kept for reference and re-setup.

## The name, first

The repo is `702_with_the_view`, but **domain names cannot contain
underscores** — that's a DNS rule, not a registrar policy. The closest legal
options:

- **`702withtheview.com`** ← recommended: cleanest to say, type, and print
- `702-with-the-view.com` — legal, but hyphens are easy to forget out loud

Everything below assumes `702withtheview.com`; substitute if you pick
differently.

## Step 1 — Buy the domain (you)

Same registrar as gentletable.com, so it lives in the same dashboard:

1. Go to **https://dash.cloudflare.com** and sign in.
2. In the left sidebar: **Domain Registration → Register Domains**.
3. Search `702withtheview.com`, add it to the cart, and check out.
   - Cloudflare sells at wholesale cost — a `.com` is roughly **$10–11/year**,
     no markup, and WHOIS privacy redaction is included free.
   - Leave **auto-renew on** so the listing site never silently expires.
4. That's it — because Cloudflare is both registrar and DNS host, there are
   no nameservers to change.

## Step 2 — Tell GitHub Pages about the domain

After the purchase, tell me it's done and I'll run these; or run them
yourself from the repo:

```bash
gh api repos/esanacore/702_with_the_view/pages -X PUT -f cname=702withtheview.com
```

(Equivalent UI: repo **Settings → Pages → Custom domain** →
`702withtheview.com` → Save.)

## Step 3 — Add the DNS records (you, ~2 minutes)

In the Cloudflare dashboard, click **702withtheview.com → DNS → Records**,
then add **five** records:

Four `A` records for the apex — GitHub Pages uses four addresses for
redundancy, and you add all of them:

| Type | Name | IPv4 address | Proxy status |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | **DNS only** (grey cloud) |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |

And one `CNAME` so `www.702withtheview.com` works too:

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `www` | `esanacore.github.io` | **DNS only** |

### Why the grey cloud (again)

Same story as gentletable.com: Cloudflare creates records **Proxied**
(orange) by default, which intercepts the check GitHub uses to issue your
HTTPS certificate. Grey cloud = "DNS only" = GitHub can see the real
traffic and issue the cert. You can experiment with turning the proxy on
*after* the certificate exists, but grey is the configuration that always
works.

## Step 4 — Enforce HTTPS

Once DNS resolves (minutes on Cloudflare), GitHub provisions a certificate
automatically — usually within 15 minutes, occasionally up to a day. Then:

repo **Settings → Pages → check "Enforce HTTPS"** (or tell me and I'll flip
it via the API).

## If something looks wrong

- **"Domain does not resolve" in Pages settings** — records still
  propagating, or a record is orange-clouded. Grey them and wait a few
  minutes.
- **Certificate warning** — GitHub hasn't finished issuing; give it up to
  24 h before digging further.
- **Apex works but www doesn't (or vice versa)** — one of the five records
  is missing; recheck the tables above.
- Verify from any terminal:

```bash
dig 702withtheview.com +short
```

should print the four `185.199.x.153` addresses.

## Costs, complete

| Item | Cost |
| --- | --- |
| Domain (Cloudflare Registrar) | ~$10–11/year |
| Hosting (GitHub Pages, public repo) | $0 |
| TLS certificate (GitHub-managed) | $0 |

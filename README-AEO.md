# AEO setup for anupbk.com.np

AI search (ChatGPT Search, Perplexity, Claude, Copilot, Google AI Overviews) answers from
**extractable facts**, not from keywords. Your site already does the hard part — static HTML,
semantic headings, canonical, OG tags, Person/WebSite/ProfilePage schema, sitemap, clean
robots.txt. The files here close the remaining gaps.

## What's in this folder

| File | Drop it at | What it changes |
|---|---|---|
| `llms.txt` | `/llms.txt` (site root) | The index AI agents read first. Currently 404. |
| `robots.txt` | `/robots.txt` | Names AI crawlers and allows them explicitly. |
| `sitemap.xml` | `/sitemap.xml` | Adds `lastmod` + the llms.txt entry. |
| `faq-section.html` | inside `<main>`, before Contact | 7 Q&A blocks in real HTML — the single biggest win. |
| `jsonld-head.html` | replaces the existing `ld+json` in `<head>` | Adds `sameAs`, `email`, `hasOccupation`, `dateModified`, `FAQPage`. |

## What you must fill in first (4 things)

Search for `TODO` in both `faq-section.html` and `jsonld-head.html`:

1. **Email** — currently no email anywhere on your site. An answer engine cannot cite a contact
   route it cannot read. Add a real address (plain `mailto:` in HTML + `email` in JSON-LD).
2. **GitHub URL** — `sameAs` is how Google and ChatGPT confirm which "Avi Vishwakarma" this is.
   Without it your identity stays ambiguous.
3. **LinkedIn URL** — same reason.
4. **City** — `addressLocality`. "Nepal" alone is thin for local-intent queries.

If you have a Stack Overflow, X/Twitter, Kaggle, Google Scholar or Dev.to profile, add it to
`sameAs` as well. Every one of them strengthens entity resolution.

Then run these two substitutions across the folder:

```bash
grep -rl 'TODO' . | xargs sed -i \
  -e 's/TODO@example.com/you@yourdomain.com/g' \
  -e 's|TODO: https://github.com/USERNAME|https://github.com/yourhandle|g' \
  -e 's|TODO: https://www.linkedin.com/in/USERNAME|https://www.linkedin.com/in/yourhandle|g' \
  -e 's/TODO_CITY/Kathmandu/g'
```

## Deploy order

1. Add the files, fill the TODOs.
2. Bump `<meta name="robots">` — already fine, leave as is.
3. Push. GitHub Pages rebuilds; Cloudflare cache is `max-age=600`, so wait ~10 minutes.
4. Verify each URL returns 200:
   `curl -I https://anupbk.com.np/llms.txt`

## Validate before and after

- **FAQ/JSON-LD syntax:** https://validator.schema.org/ — paste the URL
- **Google rich results:** https://search.google.com/test/rich-results
- **Google Search Console:** resubmit `sitemap.xml` after the change

## Weekly habit that moves the needle more than any tag

Ask ChatGPT, Perplexity and Gemini: *"Who is Avi Vishwakarma?"* and *"Avi Vishwakarma network
engineer Nepal"*. Keep a log. The first time those engines answer correctly from your site, the
entity is established. Before that, they will either say nothing or confabulate — and that gap is
exactly what these files close.

## What I deliberately did NOT claim

The llms.txt and FAQ do not state employers, clients, years of experience, or pricing. Those
are not on your site, and an AI that invents them is worse than one that says "not published".
If you want them answered, publish them first, then I'll add them.

# Avi Vishwakarma — Portfolio

A responsive, framework-free personal portfolio designed from the supplied visual references. It is ready to publish as a static GitHub Pages site.

## Files

- `index.html` — semantic page structure, SEO metadata, Open Graph/Twitter metadata, and JSON-LD profile data
- `styles.css` — responsive dark-blue design, accessible focus states, light theme, and reduced-motion support
- `script.js` — mobile navigation, theme toggle, project filters, and scroll reveal behavior
- `assets/` — optimized portrait assets, social-preview artwork, favicon, and local project thumbnails
- `robots.txt` and `sitemap.xml` — basic discovery files
- `CNAME` — configured for `anupbk.com.np`

## Publish to GitHub Pages

1. Upload the contents of this folder to the root of the repository used for the portfolio site. Keep the `assets/` folder at the same level as `index.html`.
2. In the repository, open **Settings → Pages** and publish from the intended branch and root folder (usually `main` / `/root`).
3. Keep the `CNAME` file in the published root. In your domain provider's DNS, point the domain to GitHub Pages using the current records shown in GitHub's Pages settings. Enable HTTPS when GitHub offers it.
4. After deployment, confirm that `https://anupbk.com.np/`, `/robots.txt`, `/sitemap.xml`, and `/assets/og-image.jpg` load correctly.
5. Submit `https://anupbk.com.np/sitemap.xml` in Google Search Console and verify the domain. Structured data and metadata improve machine readability, but do not guarantee indexing or ranking.

## Before publishing

- The project cards are based on the project themes in the supplied references. Replace the cards' `href="#contact"` destinations with real repository or demo URLs once available.
- No email address or social profiles were supplied, so none have been invented. Add verified contact links to the Contact section when ready.
- Review the factual profile description and technical-stack list before publishing. Remove any technology that does not accurately represent your current experience.

## Local preview

Open `index.html` directly in a browser, or run a static server from this folder, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. No build step, package installation, or backend is required.

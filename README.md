# Anup Kumar BK - Portfolio

A static portfolio website built with HTML, CSS, and JavaScript. The existing pages and assets stay in the repository root and are published without a build step.

## Project layout

```text
.
|-- index.html
|-- projects.html
|-- tools.html
|-- favicon.svg
|-- llms.txt
|-- robots.txt
|-- sitemap.xml
|-- assets/                 Site CSS, JavaScript, and image files
`-- .github/workflows/      GitHub Pages deployment workflow
```

## Preview locally

Open `index.html` in a browser, or use a local static-file server from the project root. For example, with Python installed:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push this project to a GitHub repository on the `main` or `master` branch.
2. In the repository, open **Settings > Pages** and set the publishing source to **GitHub Actions**.
3. The workflow at `.github/workflows/deploy-pages.yml` publishes the site on each push to either branch. It can also be started manually from the repository's **Actions** tab.
4. The site uses `anupbk.com.np` as its custom domain, matching the canonical URLs already present in the pages. Configure the domain's DNS for GitHub Pages and verify it under **Settings > Pages** before relying on the custom domain.

The workflow publishes only the website pages and required assets. It leaves repository documentation and editor settings out of the published site.

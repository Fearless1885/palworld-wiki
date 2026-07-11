# Palworld Wiki (Jekyll edition)

An unofficial, fan-made Palworld wiki built as a Jekyll site for GitHub Pages — free hosting, automatic builds, and content you edit as Markdown.

**Pages:**

- **Wiki** (`/`) — the interactive app: 115 passive skills with tier/category filters, and 62 Pals with recommended 4-slot passive builds.
- **Tips & Guide** (`/guide/`) — seven guide sections, each a Markdown file in `_guides/`.
- **Patch Notes** (`/patch-notes/`) — a blog-style changelog built from `_posts/`.

## Deploy (free, ~5 minutes)

1. Create a GitHub repository named **`palworld-wiki`** and upload everything in this folder (keep the structure intact).
   - If you use a *different* repo name, edit `baseurl` in `_config.yml` to match: `baseurl: "/your-repo-name"`.
2. **Settings → Pages → Build and deployment** → Source: *Deploy from a branch* → branch `main`, folder `/ (root)` → Save.
3. Your site goes live at `https://<username>.github.io/palworld-wiki/`. GitHub runs Jekyll for you on every push — no Ruby, no build tools, nothing to install.

## How it's organised

```
index.html                  Wiki app page (two client-side tabs)
data/skills.js              Passive skill data  ← edit after patches
data/pals.js                Pal data + builds   ← edit after patches
assets/js/wiki.js           App logic (rarely needs touching)
assets/css/style.css        All styling
_layouts/default.html       Shared shell: nav, footer, fonts
_layouts/post.html          Patch-note article layout
_guides/*.md                Guide sections (Markdown — add/edit freely)
guide/index.html            Renders all _guides sorted by `num`
_posts/YYYY-MM-DD-title.md  Patch notes (Markdown)
patch-notes/index.html      Lists all posts, newest first
_config.yml                 Site settings (title, baseurl)
```

## Everyday maintenance

**Game patch changed a number?** Edit the value in `data/skills.js` or `data/pals.js`, then add a Markdown file to `_posts/` describing the change (copy the existing post as a template — filename must start with the date). Push; the site rebuilds itself.

**Add a guide section?** Drop a new file in `_guides/` with front matter:

```markdown
---
num: "08"
eyebrow: Short kicker text
title: Section Title
---
- Your **Markdown** tips here.
```

It appears on the guide page automatically, sorted by `num`. Add `wide: true` to span the full page width.

**Data formats** for `skills.js` / `pals.js` (tiers, categories, roles, effect codes) are documented in comments at the top of each file and match the on-page filters one-to-one.

## Local preview (optional)

```bash
gem install bundler
bundle install
bundle exec jekyll serve
# → http://localhost:4000/palworld-wiki/
```

Not required for deployment — GitHub builds the site for you.

## Disclaimer

Fan-made reference, not affiliated with or endorsed by Pocketpair, Inc. Values are community-sourced and may lag behind balance patches — in-game tooltips are always authoritative.

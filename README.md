# Ocean Mallik - Personal Website

Personal portfolio website for [oceanmallik.com](https://www.oceanmallik.com/), built with plain HTML, CSS, and vanilla JavaScript.

## Live Website

- Main site: [https://www.oceanmallik.com/](https://www.oceanmallik.com/)
- Blog: [https://blog.oceanmallik.com/](https://blog.oceanmallik.com/)
- Link: [https://link.oceanmallik.com/](https://link.oceanmallik.com/)

## Overview

This repository contains a multi-page personal website with:

- A responsive layout for desktop and mobile
- A reusable navigation system across pages
- A 5-theme switcher with persistence using `localStorage`
- Sections for activities, achievements/certificates, about, and support
- Custom domain support via `CNAME`

No frameworks, no build step, and no dependencies to install.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- [Font Awesome](https://cdnjs.com/libraries/font-awesome) (CDN)
- Google Fonts (via CSS `@import`)

## Project Structure

```text
.
├── CNAME
├── index.html
├── style.css
├── README.md
└── pages/
    ├── about.html
    ├── activities.html
    ├── achievements/
    │   └── index.html
    └── support/
        ├── index.html
        └── payment.html
```

## Main Pages

- `/index.html`: Home page with hero, featured activities, achievements preview, and support section
- `/pages/activities.html`: Full activities/projects listing with status indicators
- `/pages/achievements/index.html`: Certificate showcase with accordion layout
- `/pages/about.html`: About page with education and profile details
- `/pages/support/index.html`: Social/support links and donation options
- `/pages/support/payment.html`: QR and payment details page

## Features

### Theme System

- Built-in themes:
  - Cyberpunk
  - White
  - Soft
  - Aurora
  - Black
- Theme state is saved in `localStorage` so user preference is kept across pages.

### Responsive Navigation

- Desktop nav + mobile menu button
- Consistent navigation design shared by all pages

### Content Modules

- Activity cards with status labels (`Actively Working`, `Finished`, `Not Active/Not Sure`)
- Achievements accordion for certificate previews and verification links
- Support flows with external links + internal payment page

## Run Locally

Because this is a static website, you can run it directly.

### Option 1: Open in Browser

Open `index.html` directly in your browser.

### Option 2: Use a Local Server (Recommended)

If you have Python installed:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deployment

This project is suitable for static hosting platforms such as:

- GitHub Pages
- Netlify
- Vercel (static)
- Cloudflare Pages

The `CNAME` file is included for custom domain mapping.

## Customization Guide

- Update personal text/content in page HTML files under `/` and `/pages`
- Edit theme colors, typography, and layout tokens in `style.css`
- Add/remove activity cards in `pages/activities.html`
- Add/remove certificates in `pages/achievements/index.html`
- Update support/payment links in `pages/support/index.html` and `pages/support/payment.html`

## Notes

- Keep relative paths consistent when adding new pages or moving assets
- If adding new pages, mirror navbar links and theme script logic for consistency

## License

This repository currently has no explicit license file.

If you want open-source usage permissions, add a `LICENSE` (for example, MIT).

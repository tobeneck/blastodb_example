# BlastoDB — GitHub Pages Site

The open hub for *Blastocystis* research.

## Structure

```
blastodb/
├── index.html          ← Homepage with news/newsletter
├── about.html          ← About BlastoDB
├── publications.html   ← Publications database
├── subtypes.html       ← Subtype reference
├── genomes.html        ← Genome / Transcriptomes
├── protocols.html      ← Lab Protocols
├── labs.html           ← Research Labs directory
├── gallery.html        ← Image gallery
├── contact.html        ← Contact page (Prof. Tsaousis, UKent)
├── css/
│   └── style.css       ← Shared stylesheet
├── js/
│   └── shared.js       ← Shared nav + footer injection
├── .nojekyll           ← Disable Jekyll on GitHub Pages
└── README.md
```

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `blastodb`)
2. Push these files to the `main` branch
3. Go to **Settings → Pages** → set source to `main` branch, root `/`
4. Your site will be live at `https://<your-org>.github.io/blastodb/`

## Customising

- Update the news items in `index.html`
- Replace placeholder content in each page as data becomes available
- The contact form in `contact.html` currently alerts users to email directly — wire it up to [Formspree](https://formspree.io) or similar for real form submissions without a backend

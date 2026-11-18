# ezzarghani.org

Static rebuild of **ezzarghani.org**, the portfolio of Mustapha Ezzarghani: writer, peace advocate and photographer.
The original site runs on WordPress + Elementor Pro. This version is plain HTML, CSS and JavaScript. There is no build step, no framework and no dependencies, so it is hosted as a plain static site on **Vercel**, deployed from this GitHub repository.

## Pages

| URL | File | Content |
|---|---|---|
| `/` | `index.html` | Splash page: name (links to Bio) and email |
| `/bio/` | `bio/index.html` | Portrait and biography |
| `/artist-statement/` | `artist-statement/index.html` | Photo and artist statement |
| `/collection/` | `collection/index.html` | 14-photo masonry gallery with a lightbox |
| `/contact/` | `contact/index.html` | Contact details, social links and contact form |
| any missing URL | `404.html` | Not-found page |

The URLs are the same as on the WordPress site, so existing links and search results keep working after the domain moves.

## Structure

```
assets/
  css/style.css    all styles (design tokens at the top)
  js/main.js       mobile menu, masonry gallery, lightbox, contact form, footer year
  img/*.webp       photographs (downloaded from the original site)
  favicon.webp     dove logo
vercel.json        trailing-slash URLs (like WordPress), image caching, security headers
sitemap.xml, robots.txt
```

## Design specs (measured from the live site)

- **Fonts:** Poppins (headings, nav, footer), Figtree (contact text and the home email), Helvetica (home name and long-form body text)
- **Colors:** primary `#1A1A1A`, secondary `#333`, black `#000`, muted link `#6C6C6C`, form panel `#F6F6F6`
- **Header:** 66px tall with a 1px black bottom border and 1300px content width. The site title is Poppins 500 20px. The nav is Poppins 300 18px with 0.6px letter-spacing, 1px × 18px dividers and a grow-on-hover effect. Below 1025px it switches to a burger menu.
- **Bio / Statement:** image column 29.3% and text column 64.2%. The title is Poppins 600 20px; the body is Helvetica 14px/21px.
- **Collection:** masonry with 4 / 2 / 1 columns (desktop / tablet / mobile) and a 7px gap. Photos go into the shortest column, which is the same algorithm Elementor uses, so every photo sits where it does on the original.
- **Footer:** 1px top border, centered Poppins 300 16px text. The year updates automatically.

## Preview locally

```powershell
python -m http.server 8080
```

Then open <http://localhost:8080>. Opening the HTML files straight from disk works too, but folder links such as `bio/` will show a file listing.

## Deployment (Vercel)

The Vercel project is linked to this GitHub repository:

- Every push to `main` deploys to production.
- Every other branch or pull request gets its own preview URL.

There is nothing to build. Vercel serves the files as they are (framework preset **Other**, no build command, output directory = repository root).

### Moving the custom domain over (do this when you're ready to retire WordPress)

1. In the Vercel project, open **Settings → Domains** and add `ezzarghani.org` and `www.ezzarghani.org`. Make one of them redirect to the other.
2. At the DNS provider, set the records Vercel shows. Usually these are:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com`
3. Vercel issues the HTTPS certificate automatically once DNS resolves.
4. Check whether the email (`contact@ezzarghani.org`) is hosted with the same DNS provider. If it is, keep the existing `MX` (and SPF/DKIM `TXT`) records unchanged.

## Contact form

The site is purely static, with no server code to send email. The form therefore works in two ways:

- **As shipped:** pressing *Submit* opens the visitor's email app with the message already addressed to `contact@ezzarghani.org`.
- **Recommended:** create a free form endpoint at [Formspree](https://formspree.io) (or Web3Forms). Then put its URL in `contact/index.html`:
  ```html
  <form id="contact-form" ... data-endpoint="https://formspree.io/f/XXXXXXXX">
  ```
  Messages are then delivered by email with no mail app needed, and the visitor sees an inline "Thank you" message. The hidden `_gotcha` field is Formspree's honeypot for catching spam bots.

## Editing content

- **Text:** edit the `<p>` blocks in the page's `index.html`.
- **Add a gallery photo:** add the `.webp` to `assets/img/`, then copy one `<a class="gallery__item">` line in `collection/index.html`. Set `width` and `height` to the real pixel size, because the masonry layout uses them.
- **Header, nav and footer** are repeated in each page. If you change them, update all five pages and `404.html`.
- **Analytics:** each page loads the same Google tag as the WordPress site (`GT-TXBQ7848`). Remove those two `<script>` lines if you don't want it.

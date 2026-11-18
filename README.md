# ezzarghani.org

Static rebuild of **ezzarghani.org**, the portfolio of Mustapha Ezzarghani: writer, peace advocate and photographer.
The original site runs on WordPress + Elementor Pro. This version is plain HTML, CSS and JavaScript. There is no build step, no framework and no dependencies, so it can be hosted free on **GitHub Pages**.

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
sitemap.xml, robots.txt, .nojekyll
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

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`.
3. The site goes live at `https://<user>.github.io/<repo>/`. All page links are relative, so they work at that sub-path. The 404 page uses root paths, so it only looks right on the custom domain.

### Moving the custom domain over (do this when you're ready to retire WordPress)

1. In **Settings → Pages → Custom domain**, enter `ezzarghani.org`. This creates a `CNAME` file in the repository.
2. At the DNS provider, point the apex domain to GitHub Pages:
   - `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record: `www` → `<user>.github.io`
3. Once the certificate has been issued, tick **Enforce HTTPS**.
4. Check whether the email (`contact@ezzarghani.org`) is hosted with the same provider. If it is, keep the existing `MX` records unchanged.

## Contact form

GitHub Pages cannot run server code. The form therefore works in two ways:

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

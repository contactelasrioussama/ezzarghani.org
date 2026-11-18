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
api/contact.js     Vercel function that emails contact-form messages (SMTP)
package.json       its single dependency (nodemailer)
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

The pages are served as static files. The only server code is `api/contact.js`; Vercel installs its one dependency (`nodemailer`) from `package.json`. There is no build command.

### Domain and DNS

The domain is registered at Namecheap (paid until Nov 2027). Its DNS is **Namecheap BasicDNS**: Domain List → `ezzarghani.org` → **Advanced DNS**. The Namecheap web hosting was cancelled on 2026-11-18.

`ezzarghani.org` is the primary domain, and `www.ezzarghani.org` 308-redirects to it.

| Host record | Value |
|---|---|
| `A` `@` | `216.198.79.1` |
| `A` `@` | `64.29.17.1` |
| `CNAME` `www` | `3e5e02b76a578d10.vercel-dns-017.com.` |

Mail settings use Namecheap **Email Forwarding**: `contact@ezzarghani.org` → `ezzarghani@gmail.com`. To change it, go to Domain tab → **Redirect Email**. This is forwarding only: there is no mailbox, and you can't send *as* contact@ from Gmail with this setup. The old cPanel mailbox was deleted along with the hosting; a full backup (196 messages) was saved on 2026-11-18.

Other records in Advanced DNS belong to Resend (contact-form sending) and must stay:
- `TXT resend._domainkey`
- `CNAME rsend`
- `CNAME send`
- `TXT _dmarc`

## Contact form

The form posts to **`/api/contact/`** (`api/contact.js`, a Vercel function). The function emails each message to **`ezzarghani@gmail.com`** through [Resend](https://resend.com), sent as `noreply@ezzarghani.org`. **Reply** in Gmail goes straight to the visitor.

- **Settings:** Vercel → Project `ezzarghani` → Settings → Environment Variables:
  - `SMTP_HOST=smtp.resend.com`
  - `SMTP_PORT=465`
  - `SMTP_USER=resend`
  - `MAIL_FROM=noreply@ezzarghani.org`
  - `MAIL_TO=ezzarghani@gmail.com`
  - **`SMTP_PASS`** = a Resend API key (`re_…`), stored as *Sensitive* for Production and Preview. Redeploy after changing it.
- **Resend account:** the free plan allows 3,000 emails a month. The domain `ezzarghani.org` is verified there with DNS records in Namecheap Advanced DNS: a DKIM `TXT` on `resend._domainkey`, plus SPF/MX records on the `send` subdomain. Don't delete those records, or sending stops.
- **To change where messages go:** edit `MAIL_TO` and redeploy. No code change is needed.
- **Spam protection:**
  - a hidden honeypot field
  - submissions faster than 3 seconds are rejected
  - a limit of 5 messages per IP per 10 minutes
  - only requests from the site's own domains are accepted
- **Fallback:** if `data-endpoint` is emptied in `contact/index.html`, *Submit* opens the visitor's email app instead.
- **Logs:** Vercel → Project → Logs, filtered on `/api/contact`.

## Editing content

- **Text:** edit the `<p>` blocks in the page's `index.html`.
- **Add a gallery photo:** add the `.webp` to `assets/img/`, then copy one `<a class="gallery__item">` line in `collection/index.html`. Set `width` and `height` to the real pixel size, because the masonry layout uses them.
- **Header, nav and footer** are repeated in each page. If you change them, update all five pages and `404.html`.
- **Analytics:** each page loads the same Google tag as the WordPress site (`GT-TXBQ7848`). Remove those two `<script>` lines if you don't want it.

# Birthday Wish Maker 💌

A static HTML/CSS/JavaScript birthday-card website designed to be hosted on **GitHub Pages** and shared with one person.

## How the sharing works

1. Open `index.html`.
2. Create the birthday card.
3. Choose a **User ID** and **password**.
4. Optionally add your WhatsApp number so the recipient can send their feedback back to you.
5. Click **Create their private birthday link**.
6. Share the generated link **together with the User ID and password**.
7. The recipient opens the link, enters the credentials, and sees the birthday story.
8. On the second-last page, the recipient can leave feedback and send it back through WhatsApp/share.

## Privacy model

The card is encrypted in the browser with Web Crypto (PBKDF2 + AES-GCM). The generated card is stored inside the URL hash, so GitHub Pages does not need a database or server. The password is not written into the card payload.

**Important:** this is client-side privacy, not a server-side account system. Anyone who has the complete generated link and password can unlock that card. Do not put highly sensitive information in a birthday card.

## GitHub Pages deployment

1. Create a new **public** GitHub repository, for example `birthday-wish-maker`.
2. Upload the contents of this folder (not the ZIP itself).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to deploy.
7. Open the published site and create a test card.

Your site will normally be available at:

`https://YOUR-USERNAME.github.io/birthday-wish-maker/`

## Sharing tip

For the safest experience, send three things in one private message:

- the birthday link
- the User ID
- the password

For cards with uploaded photos, the link can become very long because the images are embedded in the encrypted URL. Public image URLs are more reliable for large cards.

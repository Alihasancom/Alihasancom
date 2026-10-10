MOONPETAL STUDIO — PREMIUM BIRTHDAY WISH MAKER

NEW PRIVATE-CARD FEATURES
- The wisher creates a User ID and password.
- The complete birthday card is encrypted in the browser with AES-GCM using a password-derived key (PBKDF2/SHA-256).
- The recipient must enter the exact User ID and password before the card can be opened.
- The password is not stored as plain text in the URL.
- Optional WhatsApp number lets the recipient send feedback back to the wisher.
- The creator form has its own scroll bar so all creation fields stay inside the actual website panel.
- A feedback/response page is the second-last step of the birthday experience, before the final letter.

FILES
- index.html: creator studio with private access fields and scrollable creation panel
- wish.html: recipient birthday experience, password gate and feedback page
- style.css: premium romantic/dreamy design, creator scrollbar, lock and feedback UI
- creator.js: form, photo compression, encryption, URL generation, copy and WhatsApp sharing
- wish.js: password verification/decryption, page story, gift, feedback response, letter and music

RUN IN VS CODE
1. Extract the ZIP.
2. Open VS Code → File → Open Folder → choose birthday-wish-maker-premium.
3. Install the Live Server extension.
4. Right-click index.html → Open with Live Server.
5. Fill in the form, create the User ID and password, and create the private birthday link.
6. Share the link + User ID + password with the birthday person.

IMPORTANT
- A localhost URL such as http://127.0.0.1:5500 works only on your computer. To share with another person, publish the project on GitHub Pages, Netlify, Vercel, or another static HTTPS host.
- This project still has no database. The encrypted card is carried in the URL fragment.
- The User ID is visible in the URL; the password and card contents are encrypted.
- If the recipient forgets the password, there is no server-side password reset. The wisher must create a new card.

FEEDBACK
The recipient reaches a feedback page immediately after opening the gift. They can select a feeling, write a message, choose their favourite part, and send the response through the wisher's optional WhatsApp number. If no number was provided, the site falls back to the device share sheet or copying the response text.

PHOTO / VIDEO URL LIMITS
- Uploaded photos are resized and compressed before encryption. Large photos make the share URL much longer.
- Public HTTPS photo URLs are more reliable for sharing.
- Video/audio use public direct URLs and are not embedded in the encrypted payload.
- Music is user-initiated with a play button because browsers often block autoplay.

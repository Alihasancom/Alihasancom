const $ = s => document.querySelector(s);
let uploaded = [];

function updatePreview() {
  $("#previewName").textContent = $("#name").value.trim() || "someone lovely";
  $("#previewNote").textContent = $("#note").value.trim() || "Your favourite human deserves a little magic.";
  $("#preview").className = "preview theme-" + $('input[name="theme"]:checked').value;
}
["#name", "#note"].forEach(s => $(s).addEventListener("input", updatePreview));
document.querySelectorAll('input[name="theme"]').forEach(x => x.addEventListener("change", updatePreview));

function compress(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = e => {
      const im = new Image();
      im.onerror = reject;
      im.onload = () => {
        const scale = Math.min(1, 420 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(im.width * scale));
        c.height = Math.max(1, Math.round(im.height * scale));
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", .48));
      };
      im.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
}

$("#photos").addEventListener("change", async e => {
  uploaded = [];
  $("#photoPreview").innerHTML = "";
  for (const f of Array.from(e.target.files).slice(0, 2)) {
    try {
      const src = await compress(f);
      uploaded.push(src);
      const im = document.createElement("img");
      im.src = src;
      im.alt = "Selected memory";
      $("#photoPreview").append(im);
    } catch {
      $("#photoPreview").textContent = "Could not read one of those photos.";
    }
  }
  if (e.target.files.length > 2) $("#photoPreview").insertAdjacentHTML("beforeend", "<small> Only the first 2 photos will be used.</small>");
});

const enc = new TextEncoder();
function bytesToB64(bytes) {
  let s = "";
  bytes.forEach(b => s += String.fromCharCode(b));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function randomBytes(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}
async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}
async function encryptPayload(payload, password) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(payload)));
  return { s: bytesToB64(salt), i: bytesToB64(iv), d: bytesToB64(new Uint8Array(cipher)) };
}
function validUrl(s) {
  try { return ["https:", "http:"].includes(new URL(s).protocol); } catch { return false; }
}
function urls(s) {
  return s.split(/\n+/).map(x => x.trim()).filter(x => validUrl(x)).slice(0, 3);
}
function cleanWhatsApp(s) { return s.replace(/[^0-9]/g, ""); }

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const n = $("#name").value.trim();
  const w = $("#wish").value.trim();
  const userId = $("#userId").value.trim();
  const password = $("#password").value;
  const replyTo = cleanWhatsApp($("#replyTo").value);
  const video = $("#video").value.trim();
  const music = $("#musicUrl").value.trim();
  if (!n || !w || !userId || !password) return;
  if (userId.length < 3) { alert("User ID should be at least 3 characters."); return; }
  if (password.length < 6) { alert("Password should be at least 6 characters."); return; }
  if (video && !validUrl(video)) { alert("Enter a public video URL starting with https:// or http://"); return; }
  if (music && !validUrl(music)) { alert("Enter a public audio URL starting with https:// or http://"); return; }
  if (replyTo && replyTo.length < 8) { alert("Enter a valid WhatsApp number with country code, e.g. 919876543210."); return; }

  const d = {
    v: 2,
    n,
    r: $("#note").value.trim(),
    w,
    b: $("#blessings").value.trim() || "May your days be filled with peace, good health, beautiful surprises and people who love you.",
    f: $("#letter").value.trim() || `Happy Birthday, ${n}. May this new chapter be gentle, bright and full of reasons to smile. ♡`,
    t: $('input[name="theme"]:checked').value,
    p: [...urls($("#photoUrls").value), ...uploaded].slice(0, 3),
    video,
    music,
    a: $("#auto").checked,
    replyTo
  };

  try {
    $("#createBtn").disabled = true;
    $("#createBtn").innerHTML = "Locking your birthday world… <span>✦</span>";
    const encrypted = await encryptPayload(d, password);
    const link = new URL("wish.html", location.href).href + `#v=2&u=${encodeURIComponent(userId)}&s=${encrypted.s}&i=${encrypted.i}&d=${encrypted.d}`;
    $("#link").value = link;
    $("#previewLink").href = link;
    $("#wa").href = "https://wa.me/?text=" + encodeURIComponent("I made a private birthday world just for you ♡\n\nUser ID: " + userId + "\nPassword: " + password + "\n\n" + link);
    const warn = $("#warning");
    warn.classList.add("hidden");
    warn.textContent = "";
    if (link.length > 7000) {
      warn.textContent = `This link is ${link.length.toLocaleString()} characters long. Some apps may truncate or reject it. Remove uploaded photos and use public photo URLs instead for safer sharing.`;
      warn.classList.remove("hidden");
    } else if (link.length > 3500) {
      warn.textContent = `This link is ${link.length.toLocaleString()} characters. Some apps may handle long links poorly; public photo URLs are more reliable.`;
      warn.classList.remove("hidden");
    }
    $("#result").classList.remove("hidden");
    $("#result").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    console.error(err);
    alert("Could not secure the birthday card in this browser. Please use a current version of Chrome, Edge, Firefox or Safari.");
  } finally {
    $("#createBtn").disabled = false;
    $("#createBtn").innerHTML = "Create their private birthday link <span>↗</span>";
  }
});

$("#copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#link").value);
    $("#copied").textContent = "Copied — ready to share ♡";
  } catch {
    $("#link").select();
    $("#copied").textContent = document.execCommand("copy") ? "Copied — ready to share ♡" : "Select and copy the link above.";
  }
});

$("#share").addEventListener("click", async () => {
  const link = $("#link").value;
  const shareData = {
    title: "A private birthday surprise ♡",
    text: "I made a private birthday world just for you. Use the User ID and password I sent you to unlock it.",
    url: link
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      $("#copied").textContent = "Share sheet opened ♡";
    } else {
      await navigator.clipboard.writeText(link);
      $("#copied").textContent = "Link copied — paste it into WhatsApp, Instagram, Telegram, etc. ♡";
    }
  } catch (err) {
    if (err?.name !== "AbortError") $("#copied").textContent = "Copy the link and share it with the birthday person ♡";
  }
});

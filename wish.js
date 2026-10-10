(()=>{
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const dec=new TextDecoder();
  function b64ToBytes(v){
    v=v.replace(/-/g,"+").replace(/_/g,"/");
    v+="=".repeat((4-v.length%4)%4);
    const bin=atob(v); return Uint8Array.from(bin,c=>c.charCodeAt(0));
  }
  function parseSecureHash(){
    const raw=location.hash.slice(1); if(!raw)return null;
    const p=new URLSearchParams(raw); if(p.get("v")!=="2"||!p.get("u")||!p.get("s")||!p.get("i")||!p.get("d"))return null;
    return {v:2,u:p.get("u"),s:p.get("s"),i:p.get("i"),d:p.get("d")};
  }
  async function deriveKey(password,salt){
    const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);
    return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["decrypt"]);
  }
  async function decryptPayload(info,password){
    const key=await deriveKey(password,b64ToBytes(info.s));
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64ToBytes(info.i)},key,b64ToBytes(info.d));
    return JSON.parse(dec.decode(plain));
  }
  function safeUrl(s){
    if(typeof s!=="string")return false;
    if(s.startsWith("data:image/jpeg;base64,"))return true;
    try{return ["https:","http:"].includes(new URL(s).protocol)}catch{return false}
  }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  const secure=parseSecureHash();
  if(!secure){$("#auth").classList.add("hidden");$("#invalid").classList.remove("hidden");$("#story").classList.add("hidden");return}

  let d=null, current=0, timer=null, countTimer=null, opened=false, selectedFeeling="";
  const pages=$$(".page"); const duration=5000;

  function setupStory(){
    document.title=`A birthday world for ${d.n} ♡`;
    document.body.classList.add("theme-"+(["rose","lavender","peach"].includes(d.t)?d.t:"rose"));
    $("#person").textContent=d.n; $("#finalName").textContent=d.n;
    $("#personNote").textContent=d.r?`A little world made for ${d.r}.`:"This little world was made just for you.";
    $("#wishText").textContent=d.w; $("#finalText").textContent=d.f||`Happy Birthday, ${d.n}. ♡`;
    $("#blessingList").innerHTML=String(d.b||"").split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,8).map((x,i)=>`<div class="blessing" style="animation-delay:${i*100}ms"><span>✧</span>${esc(x)}</div>`).join("");
    const photos=(Array.isArray(d.p)?d.p:[]).filter(safeUrl).slice(0,3);
    photos.forEach((src,i)=>{const f=document.createElement("figure");f.className="photo-frame";f.style.setProperty("--tilt",[-4,3,-2][i]+"deg");const im=document.createElement("img");im.src=src;im.alt=`Memory ${i+1}`;const cap=document.createElement("figcaption");cap.textContent=["a moment to keep","one for the heart","little forever"][i];f.append(im,cap);$("#gallery").append(f)});
    if(!photos.length)$("#noPhotos").classList.remove("hidden");
    if(d.video&&safeUrl(d.video)){$("#videoPlayer").src=d.video;$("#videoWrap").classList.remove("hidden")}
    if(d.music&&safeUrl(d.music)){$("#audio").src=d.music;$("#music").classList.remove("hidden")}
    pages.forEach((p,i)=>{const b=document.createElement("button");b.className="dot"+(!i?" active":"");b.setAttribute("aria-label",`Go to page ${i+1}`);b.onclick=()=>go(i,true);$("#dots").append(b)});
    setupInteractions(); countdown(); schedule();
  }
  function wave(){const el=document.createElement("div");el.className="wave";el.innerHTML='<svg viewBox="0 0 1440 900" preserveAspectRatio="none"><path d="M0 0H1440V500Q1080 650 720 500T0 500Z"/><path d="M0 0H1440V390Q1080 540 720 390T0 390Z"/></svg>';document.body.append(el);requestAnimationFrame(()=>el.classList.add("go"));setTimeout(()=>el.remove(),1000)}
  function progress(){const p=$("#progress");p.style.transition="none";p.style.width="0";if(d.a===false||current!==0)return;requestAnimationFrame(()=>{p.style.transition=`width ${duration}ms linear`;p.style.width="100%"})}
  function schedule(){clearTimeout(timer);clearInterval(countTimer);progress();if(d.a===false||current!==0)return;timer=setTimeout(()=>go(1),duration)}
  function go(n,user=false){if(n<0)n=pages.length-1;if(n>=pages.length)n=0;if(n===current)return;clearTimeout(timer);clearInterval(countTimer);const old=current;pages[old].classList.remove("active");pages[old].classList.add("leaving");setTimeout(()=>pages[old].classList.remove("leaving"),900);current=n;pages[current].classList.add("active");$$('.dot').forEach((x,i)=>x.classList.toggle('active',i===current));wave();schedule()}
  function countdown(){let n=5;$("#count").textContent=n;clearInterval(countTimer);countTimer=setInterval(()=>{n--;$("#count").textContent=Math.max(0,n);if(n<=0)clearInterval(countTimer)},1000)}
  function setupInteractions(){
    $("#prev").onclick=()=>go(current-1,true); $("#next").onclick=()=>go(current+1,true);
    $("#gift").onclick=()=>{if(opened){go(5,true);return}opened=true;$("#gift").classList.add("opened");$("#giftText").textContent="surprise! now tell them how it made you feel ♡";setTimeout(()=>go(5,true),950)};
    $("#openLetter").onclick=()=>{$("#finalCard").classList.remove("hidden");$("#openLetter").classList.add("hidden");clearTimeout(timer);$("#progress").style.width="0"};
    $("#replay").onclick=()=>{$("#finalCard").classList.add("hidden");$("#openLetter").classList.remove("hidden");$("#gift").classList.remove("opened");opened=false;go(0,true)};
    $("#music").onclick=async()=>{try{if($("#audio").paused){await $("#audio").play();$("#music").innerHTML="♫ <span>Pause music</span>"}else{$("#audio").pause();$("#music").innerHTML="♫ <span>Play music</span>"}}catch{$("#music").innerHTML="♫ <span>Tap to retry</span>"}};
    document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")go(current+1,true);if(e.key==="ArrowLeft")go(current-1,true)});
    $$("#feelings button").forEach(btn=>btn.onclick=()=>{$$("#feelings button").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");selectedFeeling=btn.dataset.feeling});
    $("#sendFeedback").onclick=sendFeedback;
    const petals=["✿","❀","·","♡"];for(let i=0;i<18;i++){const p=document.createElement("span");p.className="petal";p.textContent=petals[i%petals.length];p.style.left=Math.random()*100+"%";p.style.animationDuration=11+Math.random()*13+"s";p.style.animationDelay=-Math.random()*20+"s";$("#petals").append(p)}
  }
  function sendFeedback(){
    const msg=$("#feedbackText").value.trim(); const fav=$("#feedbackFavorite").value;
    if(!selectedFeeling && !msg && !fav){$("#feedbackStatus").textContent="Pick a feeling or write a little message first ♡";return}
    const text=`Birthday card response for ${d.n} ♡\n\nFeeling: ${selectedFeeling||"Not selected"}\nFavourite part: ${fav||"Not selected"}\nMessage: ${msg||"(no written message)"}`;
    if(d.replyTo){
      const url="https://wa.me/"+d.replyTo+"?text="+encodeURIComponent(text);
      window.open(url,"_blank","noopener");
      $("#feedbackStatus").textContent="Your response is ready in WhatsApp — tap send to deliver it ♡";
    }else if(navigator.share){
      navigator.share({title:"Birthday card response",text}).then(()=>{$("#feedbackStatus").textContent="Response shared ♡"}).catch(()=>{});
    }else{
      navigator.clipboard?.writeText(text).then(()=>{$("#feedbackStatus").textContent="Response copied. Send it to the person who made your card ♡"}).catch(()=>{$("#feedbackStatus").textContent=text});
    }
  }
  $("#authForm").addEventListener("submit",async e=>{
    e.preventDefault(); const uid=$("#authUser").value.trim(); const pass=$("#authPass").value;
    $("#authError").textContent="Unlocking…";
    try{
      if(uid!==secure.u){throw new Error("wrong")}
      d=await decryptPayload(secure,pass);
      if(!d||!d.n||!d.w)throw new Error("wrong");
      $("#auth").classList.add("hidden"); setupStory();
    }catch(err){console.error(err);$("#authError").textContent="That user ID or password is not correct. Ask the sender for the exact details.";$("#authPass").value="";}
  });
})();

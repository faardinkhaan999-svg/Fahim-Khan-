// poster.js — প্রিমিয়াম পেওয়াল: পোস্টার (স্কিপ করা যায় না) → বিকাশ পেমেন্ট পেজ → ১০ মিনিটের অপেক্ষা → লক
// শুধু index.html-এর শেষে এই লাইনটা থাকলেই চলবে:  <script type="module" src="poster.js"></script>
import{initializeApp,getApps}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{getFirestore,doc,setDoc,onSnapshot}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig={
  apiKey:"AIzaSyA5xbN9TkQnEj2Ec2OVxCrG46H_1kvbK4I",
  authDomain:"faheem-khan-7f94f.firebaseapp.com",
  projectId:"faheem-khan-7f94f",
  storageBucket:"faheem-khan-7f94f.firebasestorage.app",
  messagingSenderId:"934253739357",
  appId:"1:934253739357:web:2e3126885b652cbc5efcb4"
};
const app=getApps()[0]||initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);

const PAY_NUM="01845907321";   // বিকাশ নাম্বার
const AMOUNT=120;              // টাকা
const WAIT=600;                // অপেক্ষার সময় (সেকেন্ড) = ১০ মিনিট
const PINK="#E2136E";
const CARE="https://wa.me/8801845907321?text="+encodeURIComponent("আসসালামু আলাইকুম ভাই, আমি অ্যাপের পেমেন্ট নিয়ে একটু কথা বলতে চাই।");

let user=null,started=false,unsubs=[];
let cfgOn=false,imgUrl="",acc=null,pay=null,got={a:false,p:false,c:false};
let stage="poster",ov=null,tm=null,lastState="",lastKey="",trapped=false,probed=false,imgBad=false;

const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mm=s=>{const m=Math.floor(s/60),r=s%60;return(m<10?"0":"")+m+":"+(r<10?"0":"")+r};

function probe(u){return new Promise(r=>{const i=new Image();i.onload=()=>r(true);i.onerror=()=>r(false);i.src=u})}
async function folderPoster(){
  for(const ext of["jpg","jpeg","png","webp"]){const u="poster1."+ext;if(await probe(u))return u}
  return"";
}
function waitApp(){
  return new Promise(res=>{
    let t=0;
    const iv=setInterval(()=>{
      const a=document.getElementById("app");
      if(a&&a.style.display==="flex"){clearInterval(iv);res(true)}
      else if((t+=200)>10000){clearInterval(iv);res(false)}
    },200);
  });
}

/* ---------- স্টাইল ---------- */
function addStyle(){
  if(document.getElementById("pz-st"))return;
  const s=document.createElement("style");s.id="pz-st";
  s.textContent=
  ".pz-ov{position:fixed;inset:0;z-index:300;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;font-family:system-ui,-apple-system,'Noto Sans Bengali',sans-serif;animation:pzf .2s ease-out}"+
  "@keyframes pzf{from{opacity:0}to{opacity:1}}"+
  "@keyframes pzb{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}"+
  ".pz-pg{min-height:100%;padding:calc(env(safe-area-inset-top,0px) + 20px) 18px calc(env(safe-area-inset-bottom,0px) + 22px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}"+
  ".pz-dark{background:#0b0b0b;color:#fff}"+
  ".pz-card{width:100%;max-width:300px;border-radius:24px;background:linear-gradient(160deg,#F0328A,"+PINK+" 55%,#9B0A4B);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:26px 20px;box-shadow:0 10px 40px rgba(226,19,110,.45);cursor:pointer;color:#fff}"+
  ".pz-price{background:#fff;color:"+PINK+";border-radius:18px;padding:10px 26px;font-size:40px;font-weight:800;line-height:1.1}"+
  ".pz-price small{display:block;font-size:13px;font-weight:600;color:#64748B}"+
  ".pz-btn{background:#FFD60A;color:#1a1a1a;border-radius:999px;padding:12px 26px;font-size:16px;font-weight:800;animation:pzb 1.4s ease-in-out infinite}"+
  ".pz-img{display:block;max-width:100%;max-height:74vh;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.6);cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}"+
  ".pz-pill{display:inline-block;border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:999px;padding:9px 18px;font-size:13px;text-decoration:none}"+
  ".pz-pk{background:#fff;color:#0F172A;text-align:left;padding:0}"+
  ".pz-hd{background:"+PINK+";padding:calc(env(safe-area-inset-top,0px) + 18px) 16px 20px;text-align:center;color:#fff}"+
  ".pz-body{padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 24px);max-width:460px;margin:0 auto}"+
  ".pz-no{display:flex;align-items:center;justify-content:space-between;margin:4px 0 14px}"+
  ".pz-no b{font-size:23px;letter-spacing:.6px;color:"+PINK+"}"+
  ".pz-cp{border:1px solid "+PINK+";color:"+PINK+";background:#fff;border-radius:8px;padding:6px 12px;font-size:13px}"+
  ".pz-st{background:#FDF2F8;border:1px solid #F9C6DD;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.9}"+
  ".pz-w{font-size:13px;color:#B42318;margin:12px 0 6px}"+
  "#pz-trx{width:100%;height:50px;padding:0 14px;border:1px solid #CBD5E1;border-radius:12px;background:#F8FAFC;color:#0F172A;font-size:16px;letter-spacing:1px;text-transform:uppercase;-webkit-user-select:text;user-select:text}"+
  "#pz-trx:focus{outline:2px solid "+PINK+";outline-offset:1px;background:#fff}"+
  "#pz-msg{min-height:18px;font-size:13px;color:#B42318;margin-top:8px}"+
  ".pz-sub{width:100%;height:50px;border:0;border-radius:12px;background:"+PINK+";color:#fff;font-size:16px;font-weight:700;margin-top:10px}"+
  ".pz-sub:active{opacity:.88}.pz-sub:disabled{opacity:.6}"+
  ".pz-note{font-size:12px;color:#64748B;text-align:center;line-height:1.7;margin-top:10px}"+
  ".pz-care{display:block;text-align:center;margin-top:12px;font-size:13px;color:#0F6E56;text-decoration:underline}"+
  ".pz-rej{background:#FEF3F2;border:1px solid #FECDCA;color:#B42318;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.6;margin-bottom:12px}"+
  ".pz-dim{background:rgba(0,0,0,.72)}"+
  ".pz-pop{background:#fff;color:#0F172A;border-radius:22px;padding:24px 20px;width:100%;max-width:290px}"+
  ".pz-tm{font-size:44px;font-weight:700;color:"+PINK+";margin:6px 0;font-variant-numeric:tabular-nums}"+
  ".pz-lk{background:#0F172A;color:#fff}"+
  ".pz-wa{display:inline-block;background:#25D366;color:#fff;border-radius:12px;padding:12px 22px;font-size:15px;font-weight:700;text-decoration:none;margin-top:6px}"+
  ".pz-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 80px);transform:translateX(-50%);z-index:400;background:#0F6E56;color:#fff;border-radius:999px;padding:10px 18px;font-size:14px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.3);animation:pzf .2s ease-out}";
  document.head.appendChild(s);
}

const LOGO='<span style="display:inline-flex;align-items:center;gap:6px;background:#fff;border-radius:12px;padding:6px 14px"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 4l9 3.5L21 4l-3 9-6 7-6-7z" fill="'+PINK+'"/><path d="M12 7.5L8.5 13 12 17l3.5-4z" fill="#fff" opacity=".35"/></svg><b style="color:'+PINK+';font-size:20px;font-style:italic;letter-spacing:.3px">bKash</b></span>';

/* ---------- পেজ ---------- */
function pgPoster(){
  const card=(imgUrl&&!imgBad)
    ?'<img class="pz-img" data-a="pay" alt="" src="'+esc(imgUrl)+'">'
    :'<div class="pz-card" data-a="pay">'+LOGO+
      '<div style="font-size:21px;font-weight:700;line-height:1.5">প্রিমিয়াম ফিচার আনলক করুন</div>'+
      '<div class="pz-price">৳'+AMOUNT+'<small>শুধু একবার পেমেন্ট</small></div>'+
      '<div style="font-size:14px;line-height:1.8;opacity:.95">✔ সব নাম্বার দেখুন<br>✔ কোনো বিজ্ঞাপন নেই<br>✔ বিকাশ সেন্ড মানিতে পেমেন্ট</div>'+
      '<div class="pz-btn">পেমেন্ট করুন ▸</div></div>';
  return'<div class="pz-pg pz-dark">'+card+'<a class="pz-pill" href="'+CARE+'" target="_blank" rel="noopener">🎧 পেমেন্ট করতে না চাইলে কাস্টমার কেয়ার</a></div>';
}
function pgPay(){
  const rej=(pay&&pay.status==="rejected")?'<div class="pz-rej">আপনার আগের পেমেন্ট যাচাই করা যায়নি, আইডি ভুল হতে পারে। সঠিক আইডি দিয়ে আবার সাবমিট করুন।</div>':"";
  return'<div class="pz-pg pz-pk"><div class="pz-hd" style="width:100%">'+LOGO+'<div style="font-size:16px;margin-top:12px;line-height:1.6">এই অ্যাপের ফিচার পেতে হলে আপনাকে <b>'+AMOUNT+' টাকা</b> পেমেন্ট করতে হবে</div></div>'+
  '<div class="pz-body" style="width:100%">'+rej+
  '<div style="font-size:12px;color:#64748B">বিকাশ নাম্বার (সেন্ড মানি)</div>'+
  '<div class="pz-no"><b>'+PAY_NUM+'</b><button class="pz-cp" type="button" data-a="copy">কপি</button></div>'+
  '<div class="pz-st">① বিকাশ অ্যাপ খুলুন বা <b>*247#</b> ডায়াল করুন<br>② <b>Send Money</b> বেছে নিন<br>③ উপরের নাম্বারে <b>'+AMOUNT+' টাকা</b> পাঠান<br>④ ট্রানজ্যাকশন আইডি নিচে লিখুন</div>'+
  '<div class="pz-w">⚠ ভুল ট্রানজ্যাকশন আইডি দেবেন না</div>'+
  '<input id="pz-trx" type="text" placeholder="ট্রানজ্যাকশন আইডি (TrxID)" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14">'+
  '<div id="pz-msg"></div>'+
  '<button class="pz-sub" type="button" data-a="submit">সাবমিট</button>'+
  '<div class="pz-note">সাবমিট করে ১০ মিনিট অপেক্ষা করুন। অ্যাডমিন আপনাকে জানাবে।</div>'+
  '<a class="pz-care" href="'+CARE+'" target="_blank" rel="noopener">সাহায্য লাগলে কাস্টমার কেয়ার</a></div></div>';
}
function pgWait(){
  return'<div class="pz-pg pz-dim"><div class="pz-pop"><div style="font-size:36px">⏳</div><div style="font-size:17px;font-weight:700;margin:6px 0 2px">পেমেন্ট যাচাই হচ্ছে</div><div class="pz-tm" id="pz-t">'+mm(WAIT)+'</div><div style="font-size:13px;color:#64748B;line-height:1.7">অ্যাডমিন যাচাই করে জানাবে। অপেক্ষা করুন, অ্যাপ বন্ধ করবেন না।</div><div style="font-size:12px;color:#94A3B8;margin-top:10px">ট্রানজ্যাকশন আইডি: '+esc(pay&&pay.trxId)+'</div></div></div>';
}
function pgLock(){
  return'<div class="pz-pg pz-lk"><div style="font-size:56px">🔒</div><div style="font-size:19px;font-weight:700">অ্যাপ লক করা আছে</div><div style="color:#94A3B8;font-size:14px;line-height:1.8;max-width:270px">অ্যাডমিন আপনার পেমেন্ট অ্যাপ্রুভ না করা পর্যন্ত অ্যাপে ঢুকতে পারবেন না। অ্যাপ্রুভ হলেই নিজে থেকে খুলে যাবে।</div><a class="pz-wa" href="'+CARE+'" target="_blank" rel="noopener">🎧 কাস্টমার কেয়ার</a><div style="color:#475569;font-size:11px;margin-top:8px;word-break:break-all">ID: '+esc(user&&user.uid)+'</div></div>';
}

/* ---------- ওভারলে ---------- */
function onPop(){if(ov)history.pushState({pz:1},"",location.href)}
function trap(){if(trapped)return;trapped=true;history.pushState({pz:1},"",location.href);addEventListener("popstate",onPop)}
function untrap(){if(!trapped)return;trapped=false;removeEventListener("popstate",onPop)}
function mk(){
  addStyle();
  if(ov)return;
  ov=document.createElement("div");ov.className="pz-ov";
  ov.addEventListener("click",onClick);
  document.body.appendChild(ov);
  trap();
}
function close(){
  if(tm){clearInterval(tm);tm=null}
  if(ov){ov.remove();ov=null}
  untrap();
  lastKey="";
}
function toast(t){
  const d=document.createElement("div");d.className="pz-toast";d.textContent=t;
  document.body.appendChild(d);setTimeout(()=>d.remove(),3200);
}
function render(s){
  const key=s+"|"+(pay?pay.status+"|"+pay.submittedAt:"-")+"|"+imgBad;
  if(key===lastKey&&ov)return;
  lastKey=key;lastState=s;
  mk();
  if(tm){clearInterval(tm);tm=null}
  ov.innerHTML=s==="poster"?pgPoster():s==="pay"?pgPay():s==="wait"?pgWait():pgLock();
  ov.scrollTop=0;
  const im=ov.querySelector(".pz-img");
  if(im)im.addEventListener("error",()=>{imgBad=true;evalState()});
  if(s==="wait"){
    const el=ov.querySelector("#pz-t");
    const upd=()=>{
      const left=Math.max(0,WAIT-Math.floor((Date.now()-(pay.submittedAt||0))/1000));
      if(el)el.textContent=mm(left);
      if(left<=0){clearInterval(tm);tm=null;evalState()}
    };
    upd();tm=setInterval(upd,1000);
  }
}
async function onClick(e){
  const b=e.target.closest("[data-a]");if(!b)return;
  const a=b.dataset.a;
  if(a==="pay"){stage="pay";evalState()}
  else if(a==="copy"){
    try{await navigator.clipboard.writeText(PAY_NUM)}catch(x){}
    b.textContent="✓ কপি হয়েছে";setTimeout(()=>{b.textContent="কপি"},1200);
  }
  else if(a==="submit")submit(b);
}
async function submit(btn){
  const inp=ov.querySelector("#pz-trx"),msg=ov.querySelector("#pz-msg");
  const v=(inp.value||"").trim().toUpperCase();
  if(!/^[A-Z0-9]{8,12}$/.test(v)){msg.textContent="সঠিক ট্রানজ্যাকশন আইডি দিন (৮–১২টা ইংরেজি অক্ষর বা সংখ্যা)";return}
  btn.disabled=true;btn.textContent="পাঠানো হচ্ছে…";msg.textContent="";
  try{
    await setDoc(doc(db,"payments",user.uid),{status:"pending",trxId:v,amount:AMOUNT,uid:user.uid,email:user.email||"",submittedAt:Date.now()});
  }catch(e){
    btn.disabled=false;btn.textContent="সাবমিট";
    msg.textContent="পাঠানো যায়নি, আবার চেষ্টা করুন";
  }
}

/* ---------- অবস্থা ঠিক করা ---------- */
const isPrem=()=>(acc&&acc.premium===true)||(pay&&pay.status==="approved");
function evalState(){
  if(!(got.a&&got.p&&got.c))return;
  if(!cfgOn){close();lastState="ok";return}
  if(isPrem()){
    const was=lastState;
    close();lastState="ok";
    if(was&&was!=="ok")toast("✓ পেমেন্ট অ্যাপ্রুভ হয়েছে");
    return;
  }
  let s;
  if(pay&&pay.status==="pending"){
    s=((Date.now()-(pay.submittedAt||0))/1000<WAIT)?"wait":"lock";
  }else if(pay&&pay.status==="rejected")s="pay";
  else s=stage;
  render(s);
}
function failOpen(){ // কোনো ত্রুটি হলে অ্যাপ আটকাবে না
  unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[];
  close();
}

/* ---------- শুরু ---------- */
async function start(){
  if(!(await waitApp()))return;
  const uid=user.uid;
  unsubs.push(onSnapshot(doc(db,"config","poster"),s=>{
    const d=s.exists()?s.data():{};
    cfgOn=d.enabled===true;
    imgUrl=d.imageUrl||(Array.isArray(d.images)&&d.images[0]&&d.images[0].url)||"";
    imgBad=false;
    got.c=true;
    if(cfgOn&&!imgUrl&&!probed){probed=true;folderPoster().then(u=>{if(u){imgUrl=u;lastKey="";evalState()}})}
    evalState();
  },failOpen));
  unsubs.push(onSnapshot(doc(db,"access",uid),s=>{acc=s.exists()?s.data():null;got.a=true;evalState()},failOpen));
  unsubs.push(onSnapshot(doc(db,"payments",uid),s=>{pay=s.exists()?s.data():null;got.p=true;evalState()},failOpen));
}
onAuthStateChanged(auth,u=>{
  if(!u){
    unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[];
    close();started=false;user=null;acc=null;pay=null;got={a:false,p:false,c:false};stage="poster";lastState="";
    return;
  }
  if(started)return;
  started=true;user=u;start();
});

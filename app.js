
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut as fbSignOut }
  from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, collection, setDoc, deleteDoc, onSnapshot, writeBatch }
  from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAn2tgfgOXb2u4z_x3W_DIVRXtXHDNh9kw",
  authDomain: "habittick-cea77.firebaseapp.com",
  projectId: "habittick-cea77",
  storageBucket: "habittick-cea77.firebasestorage.app",
  messagingSenderId: "717443484188",
  appId: "1:717443484188:web:62919da4f647c40c12edd9",
  measurementId: "G-ZBN0FX48C3"
};

const ALLOWED_EMAILS = ['rajparmarjb43@gmail.com','whatamiraj@gmail.com','arnavsingh2905@gmail.com','manvisingh0619@gmail.com'];

const fbApp = initializeApp(firebaseConfig);
const auth  = getAuth(fbApp);
const db    = getFirestore(fbApp);
const gProv = new GoogleAuthProvider();

/* Handle redirect result on load (mobile PWA) */
/* Handle redirect result — fires when user returns from Google sign-in on mobile */
getRedirectResult(auth).then(result=>{
  if(result&&result.user){
    /* Redirect succeeded — onAuthStateChanged will fire automatically */
    showLoading('Signing in...');
  }
}).catch(e=>{
  if(e.code==='auth/unauthorized-domain'){
    hideLoading();
    alert('Domain not authorized. Please add this URL to Firebase authorized domains.');
  } else if(e.code&&e.code!=='auth/no-current-user'&&e.code!=='auth/null-user'){
    console.error('Redirect result error:',e.code,e.message);
    hideLoading();
  }
});

/* ── CONSTANTS ── */
const EMOJIS = ['🏃','💧','📚','🧘','🥗','💊','✍️','🎯','🛌','💪','🎨','🧹','🌿','☀️','🎵','🚴','🏊','🍎','🧠','🙏'];
const QUOTES = [
  {text:"We are what we repeatedly do. Excellence, then, is not an act, but a habit.",author:"Aristotle"},
  {text:"Success is the sum of small efforts, repeated day in and day out.",author:"Robert Collier"},
  {text:"Motivation gets you started. Habit keeps you going.",author:"Jim Ryun"},
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain"},
  {text:"You don't rise to the level of your goals. You fall to the level of your systems.",author:"James Clear"},
  {text:"Small daily improvements over time lead to stunning results.",author:"Robin Sharma"},
  {text:"Habits are the compound interest of self-improvement.",author:"James Clear"},
  {text:"The chains of habit are too light to be felt until they are too heavy to be broken.",author:"Warren Buffett"},
  {text:"Take care of your body. It's the only place you have to live.",author:"Jim Rohn"},
  {text:"Discipline is choosing between what you want now and what you want most.",author:"Abraham Lincoln"},
  {text:"A year from now you may wish you had started today.",author:"Karen Lamb"},
  {text:"It does not matter how slowly you go as long as you do not stop.",author:"Confucius"},
  {text:"Push yourself, because no one else is going to do it for you.",author:"Unknown"},
  {text:"Your future is created by what you do today, not tomorrow.",author:"Robert Kiyosaki"},
];
const GRADES = [
  {g:'SSS',min:100,cls:'g-sss',bgcls:'gbg-sss',label:'Legendary',color:'#FF1744'},
  {g:'SS', min:95, cls:'g-ss', bgcls:'gbg-ss', label:'Outstanding',color:'#FF3D00'},
  {g:'S',  min:85, cls:'g-s',  bgcls:'gbg-s',  label:'Excellent',color:'#FF6D00'},
  {g:'A',  min:75, cls:'g-a',  bgcls:'gbg-a',  label:'Great',color:'#FF9100'},
  {g:'B',  min:60, cls:'g-b',  bgcls:'gbg-b',  label:'Good',color:'#FFC400'},
  {g:'C',  min:45, cls:'g-c',  bgcls:'gbg-c',  label:'Average',color:'#D4E157'},
  {g:'D',  min:30, cls:'g-d',  bgcls:'gbg-d',  label:'Below average',color:'#9CCC65'},
  {g:'E',  min:15, cls:'g-e',  bgcls:'gbg-e',  label:'Poor',color:'#4DB6AC'},
  {g:'F',  min:0,  cls:'g-f',  bgcls:'gbg-f',  label:'Failed',color:'#78909C'},
];
function getGrade(pct){ return GRADES.find(g=>pct>=g.min)||GRADES[GRADES.length-1]; }

/* streak level CSS class */
function streakClass(s){
  if(s>=100) return 'fire-100';
  if(s>=60)  return 'fire-60';
  if(s>=30)  return 'fire-30';
  if(s>=14)  return 'fire-14';
  if(s>=7)   return 'fire-7';
  if(s>=3)   return 'fire-3';
  if(s>=2)   return 'fire-1';
  return '';
}
/* streak card border class */
function streakBorderClass(s){
  if(s>=100) return 'streak-100';
  if(s>=60)  return 'streak-60';
  if(s>=30)  return 'streak-30';
  if(s>=14)  return 'streak-14';
  if(s>=7)   return 'streak-7';
  if(s>=3)   return 'streak-3';
  if(s>=2)   return 'streak-1';
  return 'streak-0';
}
/* streak flame emoji */
function streakFlame(s){
  if(s>=100) return '🌋';
  if(s>=60)  return '⚡';
  if(s>=30)  return '💥';
  if(s>=14)  return '🔥';
  if(s>=7)   return '🔥';
  if(s>=3)   return '🔥';
  return '🔥';
}
/* streak label */
function streakLabel(s){
  if(s>=100) return `🌋 ${s}d LEGENDARY`;
  if(s>=60)  return `⚡ ${s}d UNSTOPPABLE`;
  if(s>=30)  return `💥 ${s}d ON FIRE`;
  if(s>=14)  return `🔥 ${s}d HOT`;
  if(s>=7)   return `🔥 ${s}d streak`;
  if(s>=3)   return `🔥 ${s}d streak`;
  return `🔥 ${s}d streak`;
}

/* ── STATE ── */
let currentUser=null, habits=[], logs={};
let selEmoji=EMOJIS[0], selHabitType='check', calYear, calMonth, selCalDate, gradeWeekOffset=0, quoteIdx=0;
let notifTimers=[], soundOn=true, prevAllDone=false;
let timers={}, activeTimerModal=null, timerTick=null;
let tasks={};        /* tasks[dateKey] = [{id,name,done},...] — one-day tasks, never affect stats */
let unsubTasks=null; /* Firestore listener for tasks */
let unsubHabits=null, unsubLogs=null;


const now=new Date(), todayKey=fmtDate(now);
calYear=now.getFullYear(); calMonth=now.getMonth();

/* ── HELPERS ── */
function fmtDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function showLoading(t){ document.getElementById('loading-overlay').classList.add('show'); document.querySelector('.loading-text').textContent=t||'Loading...'; }
function hideLoading(){ document.getElementById('loading-overlay').classList.remove('show'); }
function showToast(m){ const t=document.getElementById('toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
function setSyncDot(s){ const d=document.getElementById('sync-dot'); if(d) d.className='sync-dot'+(s?' '+s:''); }

/* ── SOUND ENGINE ── */
function makeCtx(){ return new (window.AudioContext||window.webkitAudioContext)(); }
function playTick(){
  if(!soundOn) return;
  try{
    const ctx=makeCtx();
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.06,ctx.sampleRate);
    const d2=buf.getChannelData(0);
    for(let i=0;i<d2.length;i++) d2[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.015));
    const src=ctx.createBufferSource(), g=ctx.createGain();
    src.buffer=buf; src.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.55,ctx.currentTime);
    src.start(); src.stop(ctx.currentTime+0.06);
    const osc=ctx.createOscillator(), og=ctx.createGain();
    osc.connect(og); og.connect(ctx.destination);
    osc.type='sine'; osc.frequency.setValueAtTime(1200,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.08);
    og.gain.setValueAtTime(0.18,ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
    osc.start(); osc.stop(ctx.currentTime+0.12);
  } catch(e){}
}
function playUncheck(){
  if(!soundOn) return;
  try{
    const ctx=makeCtx();
    const osc=ctx.createOscillator(), g=ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type='sine';
    osc.frequency.setValueAtTime(500,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.12,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.18);
    osc.start(); osc.stop(ctx.currentTime+0.18);
  } catch(e){}
}
function playMilestone(streak){
  if(!soundOn) return;
  try{
    const ctx=makeCtx();
    let freqs;
    if(streak>=100)      freqs=[[523,0],[659,0.1],[784,0.2],[1047,0.3],[1319,0.45],[1047,0.6],[1319,0.75]];
    else if(streak>=30)  freqs=[[523,0],[659,0.1],[784,0.2],[1047,0.3],[1319,0.45]];
    else if(streak>=7)   freqs=[[659,0],[784,0.1],[1047,0.22]];
    else                 freqs=[[880,0],[1047,0.12]];
    freqs.forEach(([f,t2])=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.value=f;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0,ctx.currentTime+t2);
      g.gain.linearRampToValueAtTime(0.28,ctx.currentTime+t2+0.04);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t2+0.35);
      o.start(ctx.currentTime+t2); o.stop(ctx.currentTime+t2+0.38);
    });
  } catch(e){}
}
function playPerfect(){
  if(!soundOn) return;
  try{
    const ctx=makeCtx();
    [[523,0],[659,0.08],[784,0.16],[1047,0.26],[1319,0.38],[1047,0.5],[1319,0.62],[1568,0.78]].forEach(([f,t2])=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='triangle'; o.frequency.value=f;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0,ctx.currentTime+t2);
      g.gain.linearRampToValueAtTime(0.22,ctx.currentTime+t2+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t2+0.4);
      o.start(ctx.currentTime+t2); o.stop(ctx.currentTime+t2+0.42);
    });
  } catch(e){}
}

window.toggleSound=function(){
  soundOn=!soundOn;
  localStorage.setItem('ht3u_sound',soundOn?'1':'0');
  document.getElementById('sound-btn').textContent=soundOn?'🔊':'🔇';
  document.getElementById('s-sound-lbl').textContent=soundOn?'On':'Off';
  showToast(soundOn?'Sound on 🔊':'Sound off 🔇');
};

/* ── DARK MODE ── */
function applyTheme(dark){
  document.documentElement.setAttribute('data-theme',dark?'dark':'');
  document.getElementById('dark-toggle').textContent=dark?'☀️':'🌙';
  document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#0a0000':'#7F77DD');
  localStorage.setItem('ht3u_dark',dark?'1':'0');
  drawTrendChart();
}
window.toggleDark=function(){ applyTheme(document.documentElement.getAttribute('data-theme')!=='dark'); };
(()=>{
  soundOn=localStorage.getItem('ht3u_sound')!=='0';
  document.getElementById('sound-btn').textContent=soundOn?'🔊':'🔇';
  const s=localStorage.getItem('ht3u_dark');
  applyTheme(s!==null?s==='1':window.matchMedia('(prefers-color-scheme: dark)').matches);
})();

/* ── AUTH ── */
function isPWA(){ return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true; }
function isMobile(){ return /Android|iPhone|iPad/i.test(navigator.userAgent); }

window.signInWithGoogle=async function(){
  try{
    showLoading('Signing in...');
    if(isPWA()){
      /* Installed PWA — must use redirect, popup is blocked */
      await signInWithRedirect(auth,gProv);
    } else {
      /* Mobile browser and desktop — try popup first (faster, no page reload) */
      try{
        await signInWithPopup(auth,gProv);
      } catch(popupErr){
        if(popupErr.code==='auth/popup-blocked'||popupErr.code==='auth/popup-closed-by-user'||popupErr.code==='auth/cancelled-popup-request'){
          /* Popup blocked (some mobile browsers block popups) — fall back to redirect */
          await signInWithRedirect(auth,gProv);
        } else {
          throw popupErr;
        }
      }
    }
  } catch(e){
    hideLoading();
    if(e.code==='auth/unauthorized-domain'){
      alert('Domain not authorized. Go to Firebase > Authentication > Settings > Authorized domains and add: '+location.hostname);
    } else {
      alert('Sign-in failed: '+e.message);
    }
  }
};
window.doSignOut=async function(){
  if(!confirm('Sign out of HabitTick?')) return;
  if(unsubHabits)unsubHabits(); if(unsubLogs)unsubLogs();
  habits=[]; logs={}; tasks={};
  if(unsubTasks)unsubTasks();
  await fbSignOut(auth);
  closeModal('settings-modal');
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('app').style.display='none';
  document.getElementById('fab').style.display='none';
};

onAuthStateChanged(auth, user=>{
  if(user){
    if(!ALLOWED_EMAILS.includes(user.email)){
      fbSignOut(auth); hideLoading();
      document.getElementById('login-screen').style.display='flex';
      showToast('Access denied'); return;
    }
    currentUser=user;
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='flex';
    document.getElementById('fab').style.display='flex';
    document.getElementById('task-fab').style.display='flex';
    renderUserAvatar(user); renderHeader(); renderQuote();
    subscribeToData(user.uid);
  } else {
    hideLoading();
    document.getElementById('login-screen').style.display='flex';
    document.getElementById('app').style.display='none';
    document.getElementById('fab').style.display='none';
  }
});

function renderUserAvatar(u){
  const w=document.getElementById('user-avatar-wrap');
  if(u.photoURL) w.innerHTML=`<img src="${u.photoURL}" class="user-avatar">`;
  else w.innerHTML=`<div class="user-avatar-placeholder">${(u.displayName||u.email||'U').charAt(0).toUpperCase()}</div>`;
}

/* ── FIREBASE SYNC ── */
function subscribeToData(uid){
  showLoading('Syncing your habits...');
  setSyncDot('syncing');
  unsubHabits=onSnapshot(collection(db,`users/${uid}/habits`), snap=>{
    habits=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
    // Sync persisted elapsed into timer state
    habits.forEach(h=>{
      if(h.habitType==='timed'){
        const persisted=getTimerElapsed(h.id);
        if(!timers[h.id]) timers[h.id]={elapsed:persisted,running:false,startedAt:null,thresholdSecs:getTimerThreshold(h.id)};
        else if(!timers[h.id].running) timers[h.id].elapsed=persisted;
      }
    });
    renderAll(); setSyncDot(''); hideLoading();
  }, e=>{ console.error(e); setSyncDot('offline'); hideLoading(); showToast('Sync error — check connection'); });
  /* Tasks collection */
  unsubTasks=onSnapshot(collection(db,`users/${uid}/tasks`), snap=>{
    tasks={};
    snap.docs.forEach(d=>{ tasks[d.id]=d.data().items||[]; });
    renderTodayTasks();
  }, e=>{ console.error('tasks error',e); });

  unsubLogs=onSnapshot(collection(db,`users/${uid}/logs`), snap=>{
    logs={}; snap.docs.forEach(d=>{ logs[d.id]=d.data(); });
    habits.forEach(h=>{
      if(h.habitType==='timed'){
        const persisted=getTimerElapsed(h.id);
        if(!timers[h.id]) timers[h.id]={elapsed:persisted,running:false,startedAt:null,thresholdSecs:getTimerThreshold(h.id)};
        else if(!timers[h.id].running) timers[h.id].elapsed=persisted;
      }
    });
    checkAllDone(); renderAll(); setSyncDot('');
  }, e=>{ console.error(e); setSyncDot('offline'); });
}

/* ── WRITE ── */
async function saveHabitToDb(h){ setSyncDot('syncing'); await setDoc(doc(db,`users/${currentUser.uid}/habits/${h.id}`),h); }
async function deleteHabitFromDb(hid){ setSyncDot('syncing'); await deleteDoc(doc(db,`users/${currentUser.uid}/habits/${hid}`)); }
async function toggleLog(hid,dk,useSound=true,forceVal=null){
  setSyncDot('syncing');
  const ref=doc(db,`users/${currentUser.uid}/logs/${dk}`);
  const cur=logs[dk]||{};
  const wasChecked=!!cur[hid];
  const newVal=forceVal!==null?forceVal:!wasChecked;
  if(useSound && forceVal===null){ wasChecked?playUncheck():playTick(); }
  /* Optimistically update local logs so UI reflects change instantly */
  logs[dk]=Object.assign({},cur,{[hid]:newVal});
  /* Re-render immediately with optimistic data */
  renderHeader();
  if(document.getElementById('page-calendar').classList.contains('active')) renderCalendar();
  if(document.getElementById('page-today').classList.contains('active')) renderToday();
  /* Then persist to Firestore (onSnapshot will confirm and re-render again) */
  await setDoc(ref,{...cur,[hid]:newVal},{merge:true});
}
function toggle(hid,dk){ toggleLog(hid,dk,true,null); }

/* ── LOGIC ── */
function isChecked(hid,dk){ return !!(logs[dk]&&logs[dk][hid]); }
function getStreak(hid){ let s=0,d=new Date(now); for(let i=0;i<400;i++){ if(!isChecked(hid,fmtDate(d)))break; s++;d.setDate(d.getDate()-1); } return s; }
function getCompletions(hid){ return Object.values(logs).filter(d=>d[hid]).length; }
function getTodayScore(){ if(!habits.length)return{done:0,total:0,pct:0}; const done=habits.filter(h=>isChecked(h.id,todayKey)).length; return{done,total:habits.length,pct:Math.round(done/habits.length*100)}; }
function getScoreMsg(p){ return p===100?'🎉 Perfect day!':p>=85?'💪 Almost there!':p>=60?'✨ Great progress!':p>0?'🌱 Keep going!':'👋 Let\'s get started!'; }
function getWeekDays(offset=0){ const days=[]; const mon=new Date(now); mon.setDate(mon.getDate()-mon.getDay()+1+offset*7); for(let i=0;i<7;i++){ const d=new Date(mon);d.setDate(mon.getDate()+i);days.push(fmtDate(d)); } return days; }
function getWeekScore(offset=0){ const days=getWeekDays(offset); if(!habits.length)return 0; let t2=0,d2=0; days.forEach(dk=>{ habits.forEach(h=>{ t2++;if(isChecked(h.id,dk))d2++; }); }); return t2?Math.round(d2/t2*100):0; }
function getHabitWeekScore(hid,offset=0){ const days=getWeekDays(offset); return Math.round(days.filter(dk=>isChecked(hid,dk)).length/7*100); }

/* ════════════════════════════════════════
   TIMER ENGINE — with break support
   ════════════════════════════════════════ */
function fmtSecs(s){
  s=Math.floor(s||0);
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
function getTimerThreshold(hid){
  const h=habits.find(x=>x.id===hid); if(!h) return 0;
  return ((h.thresholdH||0)*3600)+((h.thresholdM!=null?h.thresholdM:25)*60);
}
function getTimerElapsed(hid){ const dl=logs[todayKey]||{}; return dl[hid+'_time']||0; }
function getBreakSettings(){
  const wm=parseInt(document.getElementById('bs-work-m')?.value)||25;
  const bm=parseInt(document.getElementById('bs-break-m')?.value)||5;
  const en=document.getElementById('bs-enabled')?.checked!==false;
  return {workSecs:wm*60, breakSecs:bm*60, enabled:en};
}
function loadTimerState(hid){
  const bs=getBreakSettings();
  if(!timers[hid]){
    timers[hid]={elapsed:getTimerElapsed(hid),running:false,startedAt:null,thresholdSecs:getTimerThreshold(hid),inBreak:false,breakElapsed:0,breakStartedAt:null,breakRunning:false,nextBreakAt:bs.workSecs,workIntervalSecs:bs.workSecs,breakDurationSecs:bs.breakSecs,breaksEnabled:bs.enabled};
  } else {
    timers[hid].thresholdSecs=getTimerThreshold(hid);
  }
}
function isTimerRunning(hid){ return !!(timers[hid]?.running||timers[hid]?.breakRunning); }
function getLiveElapsed(hid){
  const t=timers[hid]; if(!t) return 0;
  /* Only add running time if work timer is active (not during break) */
  if(t.running&&!t.inBreak&&t.startedAt) return t.elapsed+Math.floor((Date.now()-t.startedAt)/1000);
  return t.elapsed;
}
function getLiveBreakElapsed(hid){
  const t=timers[hid]; if(!t) return 0;
  if(t.inBreak&&t.breakRunning&&t.breakStartedAt) return t.breakElapsed+Math.floor((Date.now()-t.breakStartedAt)/1000);
  return t.breakElapsed;
}
function getRunningTimerHid(){
  /* Returns hid of whichever timer is currently running (work or break), or null */
  for(const [hid,t] of Object.entries(timers)){
    if(t.running || t.breakRunning) return hid;
  }
  return null;
}
function startTimer(hid){
  loadTimerState(hid);
  const t=timers[hid];
  if(t.inBreak){ resumeBreak(hid); return; }
  if(t.running) return;
  /* Pause any other running timer before starting this one */
  const currentlyRunning=getRunningTimerHid();
  if(currentlyRunning && currentlyRunning!==hid){
    pauseTimer(currentlyRunning);
    showToast(( habits.find(x=>x.id===currentlyRunning)?.name||'Previous habit')+' paused');
  }
  t.running=true; t.startedAt=Date.now();
  if(!timerTick) timerTick=setInterval(tickAll,1000);
  renderToday(); if(activeTimerModal===hid) updateTimerModal(hid);
}
function pauseTimer(hid){
  const t=timers[hid]; if(!t) return;
  if(t.inBreak){ pauseBreak(hid); return; }
  if(!t.running) return;
  t.elapsed=getLiveElapsed(hid); t.running=false; t.startedAt=null;
  persistTimerElapsed(hid,t.elapsed);
  if(!Object.values(timers).some(x=>x.running||x.breakRunning)){ clearInterval(timerTick); timerTick=null; }
  renderToday(); if(activeTimerModal===hid) updateTimerModal(hid);
}
function startBreak(hid){
  const t=timers[hid]; if(!t) return;
  t.elapsed=getLiveElapsed(hid); t.running=false; t.startedAt=null;
  persistTimerElapsed(hid,t.elapsed);
  t.inBreak=true; t.breakElapsed=0; t.breakStartedAt=Date.now(); t.breakRunning=true;
  playBreakStart();
  if(activeTimerModal===hid) updateTimerModal(hid); renderToday();
}
function pauseBreak(hid){
  const t=timers[hid]; if(!t||!t.inBreak) return;
  t.breakElapsed=getLiveBreakElapsed(hid); t.breakRunning=false; t.breakStartedAt=null;
  if(!Object.values(timers).some(x=>x.running||x.breakRunning)){ clearInterval(timerTick); timerTick=null; }
  if(activeTimerModal===hid) updateTimerModal(hid);
}
function resumeBreak(hid){
  const t=timers[hid]; if(!t||!t.inBreak) return;
  t.breakRunning=true; t.breakStartedAt=Date.now();
  if(!timerTick) timerTick=setInterval(tickAll,1000);
  if(activeTimerModal===hid) updateTimerModal(hid);
}
function endBreak(hid){
  const t=timers[hid]; if(!t) return;
  t.inBreak=false; t.breakElapsed=0; t.breakRunning=false; t.breakStartedAt=null;
  const bs=getBreakSettings();
  t.workIntervalSecs=bs.workSecs; t.breakDurationSecs=bs.breakSecs; t.breaksEnabled=bs.enabled;
  t.nextBreakAt=t.elapsed+bs.workSecs;
  t.running=true; t.startedAt=Date.now();
  if(!timerTick) timerTick=setInterval(tickAll,1000);
  playBreakEnd(); renderToday(); if(activeTimerModal===hid) updateTimerModal(hid);
}
window.skipBreak=function(){
  if(!activeTimerModal) return;
  endBreak(activeTimerModal);
  showToast('Break skipped — back to work!');
};
function resetTimer(hid){
  if(isChecked(hid,todayKey)){ showToast('Goal already reached — cannot reset a completed habit'); return; }
  const bs=getBreakSettings();
  timers[hid]={elapsed:0,running:false,startedAt:null,thresholdSecs:getTimerThreshold(hid),inBreak:false,breakElapsed:0,breakStartedAt:null,breakRunning:false,nextBreakAt:bs.workSecs,workIntervalSecs:bs.workSecs,breakDurationSecs:bs.breakSecs,breaksEnabled:bs.enabled};
  persistTimerElapsed(hid,0);
  if(!Object.values(timers).some(x=>x.running||x.breakRunning)){ clearInterval(timerTick); timerTick=null; }
  renderToday(); if(activeTimerModal===hid) updateTimerModal(hid);
}
async function persistTimerElapsed(hid,secs){
  setSyncDot('syncing');
  const ref=doc(db,'users/'+currentUser.uid+'/logs/'+todayKey);
  const cur=logs[todayKey]||{};
  await setDoc(ref,Object.assign({},cur,{[hid+'_time']:secs}),{merge:true});
}
function tickAll(){
  let anyRunning=false;
  Object.entries(timers).forEach(([hid,t])=>{
    if(t.inBreak&&t.breakRunning){
      anyRunning=true;
      const bLive=getLiveBreakElapsed(hid);
      if(bLive>=t.breakDurationSecs){
        endBreak(hid);
        if(activeTimerModal===hid) showToast('Break over — back to work!');
      } else { if(activeTimerModal===hid) updateTimerModal(hid); }
      return;
    }
    if(!t.running) return;
    anyRunning=true;
    const live=getLiveElapsed(hid);
    const thr=t.thresholdSecs;
    if(thr>0&&live>=thr&&!isChecked(hid,todayKey)){
      playTimerComplete();
      toggleLog(hid,todayKey,false,true);
      showToast('Goal reached! '+( habits.find(x=>x.id===hid)?.name||'Habit'));
    }
    /* Always read live break settings so changes take effect immediately */
    const bs2=getBreakSettings();
    t.workIntervalSecs=bs2.workSecs; t.breakDurationSecs=bs2.breakSecs; t.breaksEnabled=bs2.enabled;
    /* Recalculate nextBreakAt if it was never properly set */
    if(t.nextBreakAt<=0||t.nextBreakAt===undefined) t.nextBreakAt=bs2.workSecs;
    if(t.breaksEnabled&&live>=t.nextBreakAt&&!t.inBreak){
      startBreak(hid);
      if(activeTimerModal===hid) showToast('Break time! '+fmtSecs(t.breakDurationSecs)+' break started.');
      return;
    }
    renderTimerCard(hid);
    if(activeTimerModal===hid) updateTimerModal(hid);
  });
  if(!anyRunning){ clearInterval(timerTick); timerTick=null; }
}
function renderTimerCard(hid){
  const card=document.getElementById('timer-card-'+hid); if(!card) return;
  const t=timers[hid]; if(!t) return;
  const live=getLiveElapsed(hid), thr=t.thresholdSecs;
  const pct=thr>0?Math.min(live/thr,1):0, isOver=thr>0&&live>=thr;
  const extra=isOver?live-thr:0;
  const timeStr=t.inBreak?('Break: '+fmtSecs(getLiveBreakElapsed(hid))):(fmtSecs(live)+(isOver?' (+'+fmtSecs(extra)+')':''));
  const tdEl=card.querySelector('.tc-time-display');
  if(tdEl){tdEl.textContent=timeStr;tdEl.style.color=t.inBreak?'#22C55E':(isOver?'var(--acc)':'#2196F3');}
  const bar=card.querySelector('.tc-time-bar-fill');
  if(bar){bar.style.width=(pct*100)+'%';bar.className='tc-time-bar-fill'+(isOver?' over':'');}
  const btn=card.querySelector('.tc-toggle-btn');
  if(btn){
    if(t.inBreak) btn.textContent=t.breakRunning?'Pause break':'Resume break';
    else btn.textContent=t.running?'Pause':'Start';
    btn.className='tc-btn '+(t.running||t.breakRunning?'tc-pause':'tc-start');
  }
  const dot=card.querySelector('.tc-running-dot');
  if(dot) dot.style.display=(t.running||t.breakRunning)?'block':'none';
}
function updateTimerModal(hid){
  const t=timers[hid]; if(!t) return;
  const inner=document.getElementById('tm-modal-inner');
  if(inner) inner.className='timer-modal '+(t.inBreak?'tm-mode-break':'tm-mode-work');
  if(t.inBreak){
    const bLive=getLiveBreakElapsed(hid), bTotal=t.breakDurationSecs;
    const bPct=bTotal>0?Math.min(bLive/bTotal,1):0, bLeft=Math.max(0,bTotal-bLive);
    const fill=document.getElementById('tm-ring-fill');
    if(fill){fill.style.strokeDashoffset=326.7*(1-bPct);fill.style.stroke='#22C55E';}
    const tb=document.getElementById('tm-time-big'); if(tb) tb.textContent=fmtSecs(bLeft);
    const tl=document.getElementById('tm-time-label'); if(tl) tl.textContent='break remaining';
    const st=document.getElementById('tm-status');
    if(st){st.textContent=t.breakRunning?'Break in progress':'Break paused';st.className='tm-status';}
    const sb=document.getElementById('tm-start-btn');
    if(sb){sb.textContent=t.breakRunning?'Pause break':'Resume break';sb.className=t.breakRunning?'tm-btn pause-big':'tm-btn start-big';}
    const bb=document.getElementById('tm-break-banner'); if(bb) bb.classList.add('show');
    const sk=document.getElementById('tm-skip-btn'); if(sk) sk.classList.add('show');
    const si=document.getElementById('tm-session-info');
    if(si) si.textContent='Work today: '+fmtSecs(getLiveElapsed(hid));
  } else {
    const elapsed=getLiveElapsed(hid), thr=t.thresholdSecs, running=t.running;
    const isOver=thr>0&&elapsed>=thr, extra=isOver?elapsed-thr:0, pct=thr>0?Math.min(elapsed/thr,1):0;
    const fill=document.getElementById('tm-ring-fill');
    if(fill){fill.style.strokeDashoffset=326.7*(1-pct);fill.style.stroke=isOver?'#E53935':(running?'#2196F3':'var(--acc)');}
    const tb=document.getElementById('tm-time-big'); if(tb) tb.textContent=fmtSecs(elapsed);
    const tl=document.getElementById('tm-time-label');
    if(tl) tl.textContent=isOver?'+'+fmtSecs(extra)+' over goal':(thr>0?'of '+fmtSecs(thr):'elapsed');
    const st=document.getElementById('tm-status');
    if(st){
      if(isChecked(hid,todayKey)&&isOver){st.textContent='Goal reached!';st.className='tm-status done';}
      else if(isOver){st.textContent='Goal crossed — still going!';st.className='tm-status over';}
      else if(running){
        const toBreak=t.breaksEnabled?Math.max(0,t.nextBreakAt-elapsed):0;
        st.textContent=t.breaksEnabled?'Running — break in '+fmtSecs(toBreak):'Running...';
        st.className='tm-status';
      } else {st.textContent=elapsed>0?'Paused — tap to continue':'Tap Start to begin';st.className='tm-status';}
    }
    const sb=document.getElementById('tm-start-btn');
    if(sb){sb.textContent=running?'Pause':'Start';sb.className=running?'tm-btn pause-big':'tm-btn start-big';}
    const bb=document.getElementById('tm-break-banner'); if(bb) bb.classList.remove('show');
    const sk=document.getElementById('tm-skip-btn'); if(sk) sk.classList.remove('show');
    const si=document.getElementById('tm-session-info');
    if(si) si.textContent="Today's session: "+fmtSecs(elapsed);
    const tt=document.getElementById('tm-total-time');
    if(tt){let total=elapsed;Object.entries(logs).forEach(([dk,dl])=>{if(dk!==todayKey&&dl[hid+'_time'])total+=dl[hid+'_time']||0;});tt.textContent='All-time total: '+fmtSecs(total);}
  }
}
window.toggleBreakSettings=function(){
  const el=document.getElementById('tm-break-settings'); if(el) el.classList.toggle('show');
};

function playTimerComplete(){
  if(!soundOn) return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    [[523,0],[659,0.1],[784,0.2],[1047,0.32],[784,0.44],[1047,0.56],[1319,0.7]].forEach(([f,t2])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='triangle';o.frequency.value=f;
      o.connect(g);g.connect(ctx.destination);
      g.gain.setValueAtTime(0,ctx.currentTime+t2);
      g.gain.linearRampToValueAtTime(0.25,ctx.currentTime+t2+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t2+0.4);
      o.start(ctx.currentTime+t2);o.stop(ctx.currentTime+t2+0.42);
    });
  }catch(e){}
}
function playBreakStart(){
  if(!soundOn) return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    /* soft descending — signals rest */
    [[784,0],[659,0.15],[523,0.3]].forEach(([f,t2])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=f;
      o.connect(g);g.connect(ctx.destination);
      g.gain.setValueAtTime(0,ctx.currentTime+t2);
      g.gain.linearRampToValueAtTime(0.18,ctx.currentTime+t2+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t2+0.4);
      o.start(ctx.currentTime+t2);o.stop(ctx.currentTime+t2+0.45);
    });
  }catch(e){}
}
function playBreakEnd(){
  if(!soundOn) return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    /* ascending — signals back to work */
    [[523,0],[659,0.12],[784,0.25],[1047,0.4]].forEach(([f,t2])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='triangle';o.frequency.value=f;
      o.connect(g);g.connect(ctx.destination);
      g.gain.setValueAtTime(0,ctx.currentTime+t2);
      g.gain.linearRampToValueAtTime(0.2,ctx.currentTime+t2+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t2+0.35);
      o.start(ctx.currentTime+t2);o.stop(ctx.currentTime+t2+0.38);
    });
  }catch(e){}
}

function checkAllDone(){
  if(!habits.length)return;
  const sc=getTodayScore();
  if(sc.pct===100&&!prevAllDone){ launchConfetti(); showToast('🎉 All habits done! Perfect day!'); }
  prevAllDone=sc.pct===100;
}

/* ── RENDER ALL ── */
function renderAll(){ renderHeader(); renderToday(); renderTodayTasks(); renderCalendar(); renderGrade(); renderStats(); renderQuote(); scheduleAllReminders(); }

function renderHeader(){
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mons=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const el=document.getElementById('hdr-date'); if(el)el.textContent=`${days[now.getDay()]}, ${mons[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
  const sc=getTodayScore();
  document.getElementById('score-fraction').textContent=`${sc.done} / ${sc.total}`;
  document.getElementById('score-pct-txt').textContent=sc.pct+'%';
  document.getElementById('score-msg').textContent=getScoreMsg(sc.pct);
  document.getElementById('score-arc').style.strokeDashoffset=175.9*(1-sc.pct/100);
}

/* ── TODAY ── */
function renderToday(){
  const el=document.getElementById('habit-list');
  if(!habits.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">🌱</div><div class="empty-title">No habits yet</div><div class="empty-sub">Tap + to add a habit. Choose checkbox or time-based.</div></div>`;
    return;
  }
  el.innerHTML=habits.map(h=>{
    const chk=isChecked(h.id,todayKey);
    const streak=getStreak(h.id);
    const sc=streakClass(streak);
    const bc=streakBorderClass(streak);
    const rb=h.reminderEnabled?`<span class="habit-reminder-badge">⏰ ${h.reminderTime}</span>`:'';
    const isTimed=h.habitType==='timed';

    let streakRow='';
    if(streak>=2) streakRow=`<div class="streak-badge ${sc}"><span class="s-icon">${streakFlame(streak)}</span><span>${streakLabel(streak)}</span></div>`;

    if(isTimed){
      // ensure timer state loaded
      loadTimerState(h.id);
      const t=timers[h.id];
      const live=getLiveElapsed(h.id);
      const thr=t.thresholdSecs;
      const pct=thr>0?Math.min(live/thr,1):0;
      const isOver=thr>0&&live>=thr;
      const extra=isOver?live-thr:0;
      const timeDisplay=fmtSecs(live)+(isOver?` (+${fmtSecs(extra)})`:'');
      const goalStr=`Goal: ${fmtSecs(thr)}`;
      const allTimePast=Object.entries(logs).filter(([dk])=>dk!==todayKey).reduce((s,[,dl])=>s+(dl[h.id+'_time']||0),0);
      const totalAllTime=allTimePast+live;

      return `<div class="habit-card ${chk?'done-card':''} ${bc}" style="--streak-color:${streak>0?getStreakColor(streak):'transparent'}">
        <div class="habit-emoji" onclick="openTimerModal('${h.id}')" style="cursor:pointer;position:relative">
          ${h.emoji}
          <span style="position:absolute;bottom:-4px;right:-4px;font-size:10px;background:var(--surface);border-radius:50%;padding:1px;border:1px solid var(--border)">⏱</span>
        </div>
        <div class="habit-body" style="cursor:pointer" onclick="openTimerModal('${h.id}')">
          <div class="habit-title">${h.name} <span style="font-size:10px;color:#2196F3;font-weight:600;margin-left:4px">⏱ ${goalStr}</span></div>
          <div id="timer-card-${h.id}">
            <div class="timer-card-controls">
              <span class="tc-running-dot" style="display:${t.running?'block':'none'}"></span>
              <span class="tc-time-display" style="font-size:13px;font-weight:700;color:${isOver?'var(--acc)':'#2196F3'};font-variant-numeric:tabular-nums">${timeDisplay}</span>
              <button class="tc-btn tc-toggle-btn ${t.running?'tc-pause':'tc-start'}" onclick="event.stopPropagation();timerToggleCard('${h.id}')">${t.running?'⏸ Pause':'▶ Start'}</button>
              <button class="tc-open-btn" onclick="event.stopPropagation();openTimerModal('${h.id}')">⤢</button>
            </div>
            <div class="tc-time-bar-bg"><div class="tc-time-bar-fill${isOver?' over':''}" style="width:${pct*100}%"></div></div>
            <div style="font-size:10px;color:var(--text-hint);margin-top:3px">Total all-time: ${fmtSecs(totalAllTime)}</div>
          </div>
          ${streakRow}${rb}
        </div>
        <div class="check-circle ${chk?'checked':''}" style="pointer-events:none;opacity:${chk?'1':'0.3'}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 7,12 13,4" stroke="${chk?'#fff':'#bbb'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>`;
    } else {
      // CHECKBOX habit
      let bottom;
      if(streak>=2) bottom=`${streakRow}${rb}`;
      else bottom=`<div class="habit-sub">${chk?'Completed today ✓':'Tap to mark done'}</div>${rb}`;
      return `<div class="habit-card ${chk?'done-card':''} ${bc}" onclick="toggle('${h.id}','${todayKey}')" style="--streak-color:${streak>0?getStreakColor(streak):'transparent'}">
        <div class="habit-emoji">${h.emoji}</div>
        <div class="habit-body"><div class="habit-title">${h.name}</div>${bottom}</div>
        <div class="check-circle ${chk?'checked':''}" onclick="event.stopPropagation();toggle('${h.id}','${todayKey}')">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 7,12 13,4" stroke="${chk?'#fff':'#bbb'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>`;
    }
  }).join('');
}

function getStreakColor(s){
  if(s>=100) return '#FF1744';
  if(s>=60)  return '#C62828';
  if(s>=30)  return '#E53935';
  if(s>=14)  return '#F4511E';
  if(s>=7)   return '#FF6D00';
  if(s>=3)   return '#FF7043';
  if(s>=2)   return '#FFA726';
  return 'transparent';
}

/* ── CALENDAR ── */
function changeMonth(d){ calMonth+=d; if(calMonth>11){calMonth=0;calYear++;}if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); }
function renderCalendar(){
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-lbl').textContent=`${MONTHS[calMonth]} ${calYear}`;
  const first=new Date(calYear,calMonth,1).getDay(),dim=new Date(calYear,calMonth+1,0).getDate(),prev=new Date(calYear,calMonth,0).getDate();
  let html='';
  for(let i=first-1;i>=0;i--) html+=`<div class="day-cell other-month">${prev-i}</div>`;
  for(let d=1;d<=dim;d++){
    const dk=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isT=dk===todayKey,isSel=dk===(selCalDate||todayKey);
    const dl=logs[dk]||{},done=habits.filter(h=>dl[h.id]).length;
    const cls=!habits.length||!done?'':(done===habits.length?'all-done':'partial');
    html+=`<div class="day-cell ${cls} ${isT?'today':''} ${isSel?'selected':''}" onclick="selectDay('${dk}')">${d}</div>`;
  }
  const rem=7-((first+dim)%7); if(rem<7) for(let i=1;i<=rem;i++) html+=`<div class="day-cell other-month">${i}</div>`;
  document.getElementById('cal-grid').innerHTML=html;
  renderCalDetail(selCalDate||todayKey);
}
function selectDay(dk){ selCalDate=dk; renderCalendar(); }
function renderCalDetail(dk){
  const[y,m,d]=dk.split('-');
  const el=document.getElementById('cal-detail');
  if(!habits.length){el.innerHTML='';return;}
  const MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const sc=habits.length?Math.round(habits.filter(h=>isChecked(h.id,dk)).length/habits.length*100):0;
  const g=getGrade(sc);
  const isFuture=dk>todayKey;

  /* Build container fresh — use DOM nodes so event listeners survive */
  el.innerHTML='';

  /* Date header */
  const hdr=document.createElement('div');
  hdr.className='cal-detail-date';
  hdr.innerHTML=MONS[parseInt(m)-1]+' '+parseInt(d)+', '+y
    +' — <span class="'+g.cls+'" style="font-weight:900">'+g.g+'</span> ('+sc+'%)'
    +(isFuture?' <span style="font-size:10px;color:var(--text-hint)">(future)</span>':'');
  el.appendChild(hdr);

  /* One-day tasks section in calendar */
  const taskWrap=document.createElement('div');
  taskWrap.id='cal-task-wrap';
  taskWrap.style.marginTop='12px';
  el.appendChild(taskWrap);
  renderCalTasks(dk);

  /* One card per habit */
  habits.forEach(h=>{
    const chk=isChecked(h.id,dk);
    const isTimed2=h.habitType==='timed';
    const stroke=chk?'#fff':'#bbb';
    const svgCheck='<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 7,12 13,4" stroke="'+stroke+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const card=document.createElement('div');
    card.className='habit-card'+(chk?' done-card':'');

    if(isTimed2){
      /* Timed — non-interactive, show logged time */
      const timeSecs=(logs[dk]&&logs[dk][h.id+'_time'])||0;
      const sub=chk
        ?'✅ Goal reached'+(timeSecs>0?' · ⏱ '+fmtSecs(timeSecs):'')
        :'⏱ Time-based'+(timeSecs>0?' · '+fmtSecs(timeSecs)+' logged':'');
      card.innerHTML='<div class="habit-emoji">'+h.emoji+'</div>'
        +'<div class="habit-body"><div class="habit-title">'+h.name+'</div>'
        +'<div class="habit-sub">'+sub+'</div></div>'
        +'<div class="check-circle'+(chk?' checked':'')+'" style="pointer-events:none;opacity:'+(chk?'1':'0.3')+'">'+svgCheck+'</div>';
    } else {
      /* Checkbox — fully tappable, appended as DOM node so onclick survives */
      const sub=isFuture
        ?'<span style="color:var(--text-hint)">Future date</span>'
        :(chk?'Completed ✓':'Not done');
      card.style.cursor='pointer';
      card.innerHTML='<div class="habit-emoji">'+h.emoji+'</div>'
        +'<div class="habit-body"><div class="habit-title">'+h.name+'</div>'
        +'<div class="habit-sub">'+sub+'</div></div>'
        +'<div class="check-circle'+(chk?' checked':'')+'">'+svgCheck+'</div>';

      const doToggle=function(e){
        e.stopPropagation();
        toggleLog(h.id,dk,true,null);
      };
      card.addEventListener('click', doToggle);
      card.querySelector('.check-circle').addEventListener('click', doToggle);
    }

    el.appendChild(card);
  });
}

/* ── WEEKLY GRADE ── */
function changeWeek(d){ gradeWeekOffset+=d; if(gradeWeekOffset>0)gradeWeekOffset=0; renderGrade(); }
function getWeekTotalTime(hid){
  /* Sum of _time logged across all days in the current grade week */
  /* For today, add live elapsed if timer is currently running */
  const days=getWeekDays(gradeWeekOffset);
  return days.reduce((sum,dk)=>{
    const dl=logs[dk]||{};
    let secs=dl[hid+'_time']||0;
    /* If this is today and timer is actively running, add live unsaved time */
    if(dk===todayKey && timers[hid] && timers[hid].running){
      secs=getLiveElapsed(hid);
    }
    return sum+secs;
  },0);
}

function renderGrade(){
  const days=getWeekDays(gradeWeekOffset);
  const mon=new Date(days[0]),sun=new Date(days[6]);
  const MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('week-label').textContent=MONS[mon.getMonth()]+' '+mon.getDate()+' – '+MONS[sun.getMonth()]+' '+sun.getDate();
  const pct=getWeekScore(gradeWeekOffset),g=getGrade(pct);
  /* Total timed work across whole week */
  const weekTimedSecs=habits.filter(h=>h.habitType==='timed').reduce((s,h)=>s+getWeekTotalTime(h.id),0);
  const weekTimedStr=weekTimedSecs>0?' · ⏱ '+fmtSecs(weekTimedSecs)+' total work':'';
  document.getElementById('big-grade-card').innerHTML=
    '<div class="big-grade-card '+g.bgcls+'">'
    +'<span class="big-grade-letter '+g.cls+'" style="color:'+g.color+'">'+g.g+'</span>'
    +'<div class="big-grade-label">'+g.label+'</div>'
    +'<div class="big-grade-pct">'+pct+'% weekly completion · '+days.filter(dk=>habits.some(h=>isChecked(h.id,dk))).length+'/7 active days'+weekTimedStr+'</div>'
    +'</div>';
  if(!habits.length){document.getElementById('habit-grade-list').innerHTML='';return;}
  const sorted=[...habits].map(h=>({h,pct:getHabitWeekScore(h.id,gradeWeekOffset)})).sort((a,b)=>b.pct-a.pct);
  document.getElementById('habit-grade-list').innerHTML=sorted.map(({h,pct:hp})=>{
    const hg=getGrade(hp);
    const isTimed=h.habitType==='timed';
    const weekSecs=isTimed?getWeekTotalTime(h.id):0;
    /* For timed habits: also show daily breakdown as small bars */
    let dayBars='';
    if(isTimed){
      const thr=getTimerThreshold(h.id);
      dayBars='<div style="display:flex;gap:2px;margin-top:5px">'
        +days.map(dk=>{
          const secs=(logs[dk]&&logs[dk][h.id+'_time'])||0;
          const dpct=thr>0?Math.min(secs/thr,1):0;
          const isGoal=secs>=thr&&thr>0;
          const d=new Date(dk);
          const dayLbl=['S','M','T','W','T','F','S'][d.getDay()];
          return '<div style="flex:1;text-align:center">'
            +'<div style="height:28px;background:var(--bg);border-radius:4px;overflow:hidden;position:relative">'
            +'<div style="position:absolute;bottom:0;left:0;right:0;height:'+(dpct*100)+'%;background:'+(isGoal?hg.color:'rgba(33,150,243,0.5)')+';border-radius:3px;transition:height 0.4s"></div>'
            +'</div>'
            +'<div style="font-size:9px;color:var(--text-hint);margin-top:2px">'+dayLbl+'</div>'
            +'</div>';
        }).join('')
        +'</div>';
    }
    const metaLine=isTimed
      ? hp+'% · '+days.filter(dk=>isChecked(h.id,dk)).length+'/7 days · ⏱ '+fmtSecs(weekSecs)
      : hp+'% — '+days.filter(dk=>isChecked(h.id,dk)).length+'/7 days';
    return '<div class="habit-grade-row">'
      +'<div class="hg-emoji">'+h.emoji+'</div>'
      +'<div class="hg-info">'
      +'<div class="hg-name">'+h.name+'</div>'
      +'<div class="hg-bar-bg"><div class="hg-bar-fill" style="width:'+hp+'%;background:'+hg.color+'"></div></div>'
      +'<div class="hg-meta">'+metaLine+'</div>'
      +dayBars
      +'</div>'
      +'<div class="hg-grade '+hg.cls+'">'+hg.g+'</div>'
      +'</div>';
  }).join('');
}

/* ── STATS ── */
function renderStats(){
  let tc=0; Object.values(logs).forEach(d=>Object.entries(d).forEach(([k,v])=>{if(!k.endsWith('_time')&&v===true)tc++;}));
  const bs=habits.length?Math.max(0,...habits.map(h=>getStreak(h.id))):0;
  const ad=Object.keys(logs).filter(k=>Object.values(logs[k]).some(v=>v)).length;
  document.getElementById('stat-grid').innerHTML=`
    <div class="stat-card"><div class="stat-val">${habits.length}</div><div class="stat-lbl">Habits tracked</div></div>
    <div class="stat-card"><div class="stat-val">${tc}</div><div class="stat-lbl">Total completions</div></div>
    <div class="stat-card"><div class="stat-val">${bs}</div><div class="stat-lbl">Best streak</div></div>
    <div class="stat-card"><div class="stat-val">${ad}</div><div class="stat-lbl">Active days</div></div>`;
  drawTrendChart();
  let hm=''; for(let i=29;i>=0;i--){ const d=new Date(now);d.setDate(d.getDate()-i);const dk=fmtDate(d),dl=logs[dk]||{},done=habits.filter(h=>dl[h.id]).length,tot=habits.length;const lv=!tot||!done?'':done/tot<0.34?'l1':done/tot<0.67?'l2':done/tot<1?'l3':'l4';hm+=`<div class="hm-cell ${lv}"></div>`; }
  document.getElementById('heatmap').innerHTML=hm;
  const rows=document.getElementById('habit-stat-rows');
  if(!habits.length){rows.innerHTML=`<div style="color:var(--text-hint);font-size:14px;text-align:center;padding:20px 0">No habits yet</div>`;return;}
  const td=Math.max(1,Math.ceil((now-new Date(Object.keys(logs).sort()[0]||now))/86400000)+1);
  rows.innerHTML=habits.map(h=>{ const c=getCompletions(h.id),r=Math.round(c/td*100),s=getStreak(h.id);
    return `<div class="habit-stat-row"><div style="font-size:clamp(22px,6vw,28px)">${h.emoji}</div><div class="habit-stat-bar-wrap"><div class="habit-stat-name">${h.name}</div><div class="habit-stat-bar-bg"><div class="habit-stat-bar-fill" style="width:${Math.min(r,100)}%"></div></div><div class="habit-stat-meta">${c} completions · ${s}d streak · ${r}% rate</div></div><button class="del-habit-btn" onclick="confirmDelete('${h.id}')">🗑️</button></div>`;
  }).join('');
}

function drawTrendChart(){
  const canvas=document.getElementById('trend-canvas'); if(!canvas)return;
  const rect=canvas.getBoundingClientRect(); const W=Math.floor(rect.width)||canvas.parentElement?.offsetWidth||300; if(W===0)return;
  const ctx=canvas.getContext('2d'),dpr=window.devicePixelRatio||1,H=120;
  canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,W,H);
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const gc=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)', lc=dark?'#333':'#B0B0C8';
  const accCol=dark?'#E53935':'#7F77DD', fillCol=dark?'rgba(229,57,53,0.1)':'rgba(127,119,221,0.1)';
  const pts=30,data=[];
  for(let i=pts-1;i>=0;i--){ const d=new Date(now);d.setDate(d.getDate()-i);const dk=fmtDate(d),dl=logs[dk]||{},done=habits.filter(h=>dl[h.id]).length;data.push(habits.length?Math.round(done/habits.length*100):0); }
  const pad={t:8,r:8,b:26,l:28},cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
  [0,50,100].forEach(v=>{const y=pad.t+cH*(1-v/100);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cW,y);ctx.strokeStyle=gc;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=lc;ctx.font=`9px -apple-system,sans-serif`;ctx.textAlign='right';ctx.fillText(v+'%',pad.l-3,y+3);});
  ctx.fillStyle=lc;ctx.font=`9px -apple-system,sans-serif`;ctx.textAlign='center';
  [0,7,14,21,29].forEach(i=>{const x=pad.l+(i/(pts-1))*cW,d=new Date(now);d.setDate(d.getDate()-(pts-1-i));ctx.fillText(`${d.getMonth()+1}/${d.getDate()}`,x,H-4);});
  if(data.every(v=>v===0)){ctx.fillStyle=lc;ctx.font='12px -apple-system,sans-serif';ctx.textAlign='center';ctx.fillText('Complete habits to see trend',W/2,H/2);return;}
  ctx.beginPath();data.forEach((v,i)=>{const x=pad.l+(i/(pts-1))*cW,y=pad.t+cH*(1-v/100);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.lineTo(pad.l+cW,pad.t+cH);ctx.lineTo(pad.l,pad.t+cH);ctx.closePath();ctx.fillStyle=fillCol;ctx.fill();
  ctx.beginPath();data.forEach((v,i)=>{const x=pad.l+(i/(pts-1))*cW,y=pad.t+cH*(1-v/100);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.strokeStyle=accCol;ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
  const tx=pad.l+cW,ty=pad.t+cH*(1-data[pts-1]/100);
  ctx.beginPath();ctx.arc(tx,ty,4,0,Math.PI*2);ctx.fillStyle=accCol;ctx.fill();
}

/* ── QUOTES ── */
function renderQuote(){ const q=QUOTES[quoteIdx]; const qt=document.getElementById('quote-text'),qa=document.getElementById('quote-author'); if(qt)qt.textContent=q.text; if(qa)qa.textContent='— '+q.author; }
window.nextQuote=function(){ quoteIdx=(quoteIdx+1)%QUOTES.length; renderQuote(); };

/* ── NOTIFICATIONS ── */
function scheduleAllReminders(){
  notifTimers.forEach(clearTimeout); notifTimers=[];
  if(!('Notification' in window)||Notification.permission!=='granted') return;
  habits.forEach(h=>{
    if(!h.reminderEnabled||!h.reminderTime)return;
    const[hh,mm]=h.reminderTime.split(':').map(Number),t=new Date();
    t.setHours(hh,mm,0,0); let ms=t-Date.now(); if(ms<0)ms+=86400000;
    notifTimers.push(setTimeout(()=>{ if(!isChecked(h.id,fmtDate(new Date()))) new Notification('HabitTick 🎯',{body:`Time to: ${h.emoji} ${h.name}`,icon:'./icon-192.png',tag:h.id}); scheduleAllReminders(); },ms));
  });
  const hasR=habits.some(h=>h.reminderEnabled);
  if(hasR&&Notification.permission==='default') document.getElementById('notif-banner').classList.add('show');
}
window.requestNotif=function(){
  if(!('Notification' in window))return;
  Notification.requestPermission().then(p=>{ if(p==='granted'){document.getElementById('notif-banner').classList.remove('show');scheduleAllReminders();} });
};

/* ── MODALS ── */
window.openAddModal=function(){
  selEmoji=EMOJIS[0]; selHabitType='check';
  document.getElementById('habit-inp').value='';
  document.getElementById('reminder-toggle-inp').checked=false;
  document.getElementById('reminder-time-inp').style.display='none';
  document.getElementById('threshold-row').style.display='none';
  document.getElementById('threshold-h-inp').value='0';
  document.getElementById('threshold-m-inp').value='0';
  setHabitType('check');
  renderEmojiGrid();
  document.getElementById('add-modal').classList.add('open');
  setTimeout(()=>document.getElementById('habit-inp').focus(),100);
};
window.setHabitType=function(type){
  selHabitType=type;
  const cb=document.getElementById('type-check-btn'), tb=document.getElementById('type-timed-btn');
  const tr=document.getElementById('threshold-row');
  if(type==='check'){
    cb.style.cssText='flex:1;padding:10px;border-radius:12px;border:2px solid var(--acc);background:var(--acc-light);color:var(--acc);font-weight:700;font-size:13px;cursor:pointer';
    tb.style.cssText='flex:1;padding:10px;border-radius:12px;border:2px solid var(--border2);background:var(--bg);color:var(--text-sec);font-weight:700;font-size:13px;cursor:pointer';
    tr.style.display='none';
  } else {
    tb.style.cssText='flex:1;padding:10px;border-radius:12px;border:2px solid #2196F3;background:rgba(33,150,243,0.1);color:#1565C0;font-weight:700;font-size:13px;cursor:pointer';
    cb.style.cssText='flex:1;padding:10px;border-radius:12px;border:2px solid var(--border2);background:var(--bg);color:var(--text-sec);font-weight:700;font-size:13px;cursor:pointer';
    tr.style.display='block';
  }
};
document.getElementById('reminder-toggle-inp').addEventListener('change',function(){ document.getElementById('reminder-time-inp').style.display=this.checked?'inline-block':'none'; });

window.openSettings=function(){
  let lc=0; Object.values(logs).forEach(d=>Object.entries(d).forEach(([k,v])=>{if(!k.endsWith('_time')&&v===true)lc++;}));
  document.getElementById('settings-habit-count').textContent=habits.length;
  document.getElementById('settings-log-count').textContent=lc;
  document.getElementById('s-sound-lbl').textContent=soundOn?'On':'Off';
  if(currentUser){
    document.getElementById('settings-name').textContent=currentUser.displayName||'User';
    document.getElementById('settings-email').textContent=currentUser.email||'';
    if(currentUser.photoURL){document.getElementById('settings-avatar').src=currentUser.photoURL;document.getElementById('settings-avatar').style.display='block';document.getElementById('settings-avatar-placeholder').style.display='none';}
    else{document.getElementById('settings-avatar-placeholder').textContent=(currentUser.displayName||'U').charAt(0).toUpperCase();document.getElementById('settings-avatar').style.display='none';document.getElementById('settings-avatar-placeholder').style.display='flex';}
  }
  document.getElementById('settings-modal').classList.add('open');
};
window.closeModal=function(id){ document.getElementById(id).classList.remove('open'); };
window.bgClose=function(e,id){ if(e.target.id===id) closeModal(id); };
function renderEmojiGrid(){ document.getElementById('emoji-grid').innerHTML=EMOJIS.map(e=>`<div class="emoji-opt ${e===selEmoji?'sel':''}" onclick="pickEmoji('${e}')">${e}</div>`).join(''); }
window.pickEmoji=function(e){ selEmoji=e; renderEmojiGrid(); };

window.saveNewHabit=async function(){
  const name=document.getElementById('habit-inp').value.trim(); if(!name){document.getElementById('habit-inp').focus();return;}
  const reminderEnabled=document.getElementById('reminder-toggle-inp').checked;
  const reminderTime=document.getElementById('reminder-time-inp').value||'08:00';
  const _thH=document.getElementById('threshold-h-inp').value;
  const _thM=document.getElementById('threshold-m-inp').value;
  const thresholdH=selHabitType==='timed'?(isNaN(parseInt(_thH))?0:parseInt(_thH)):0;
  const thresholdM=selHabitType==='timed'?(isNaN(parseInt(_thM))?0:parseInt(_thM)):0;
  const h={id:`h${Date.now()}`,name,emoji:selEmoji,habitType:selHabitType||'check',thresholdH,thresholdM,reminderEnabled,reminderTime,order:habits.length,createdAt:Date.now()};
  closeModal('add-modal');
  await saveHabitToDb(h);
  showToast(selHabitType==='timed'?`⏱ Time habit added — goal: ${thresholdH?thresholdH+'h ':''}${thresholdM}min`:'✅ Habit added ✓');
  if(reminderEnabled&&'Notification' in window&&Notification.permission==='default') Notification.requestPermission().then(p=>{if(p==='granted')scheduleAllReminders();});
};

window.confirmDelete=async function(hid){
  const h=habits.find(x=>x.id===hid); if(!h)return;
  if(!confirm(`Delete "${h.name}"?\n\nThis will remove all its history.`))return;
  await deleteHabitFromDb(hid);
  const batch=writeBatch(db);
  Object.keys(logs).forEach(dk=>{ if(logs[dk][hid]) batch.set(doc(db,`users/${currentUser.uid}/logs/${dk}`),{...logs[dk],[hid]:false},{merge:true}); });
  await batch.commit();
  showToast('Habit deleted');
};

window.clearAllData=async function(){
  if(!confirm('Clear ALL habits and history?\nThis cannot be undone.'))return;
  const batch=writeBatch(db);
  Object.keys(logs).forEach(dk=>batch.delete(doc(db,`users/${currentUser.uid}/logs/${dk}`)));
  habits.forEach(h=>batch.delete(doc(db,`users/${currentUser.uid}/habits/${h.id}`)));
  await batch.commit();
  closeModal('settings-modal'); showToast('All data cleared');
};

/* ── TIMER MODAL ── */
let modalDisplayTick=null;
window.openTimerModal=function(hid){
  const h=habits.find(x=>x.id===hid); if(!h) return;
  activeTimerModal=hid;
  loadTimerState(hid);
  document.getElementById('tm-habit-name').textContent=h.emoji+' '+h.name;
  const thr=getTimerThreshold(hid);
  document.getElementById('tm-threshold-label').textContent='Goal: '+fmtSecs(thr);
  document.getElementById('timer-modal').classList.add('open');
  updateTimerModal(hid);
  /* Dedicated display tick so clock updates even when not in tickAll */
  if(modalDisplayTick) clearInterval(modalDisplayTick);
  modalDisplayTick=setInterval(()=>{ if(activeTimerModal) updateTimerModal(activeTimerModal); },200);
  /* When work-interval input changes, update nextBreakAt immediately */
  const workInp=document.getElementById('bs-work-m');
  const breakInp=document.getElementById('bs-break-m');
  const enabledInp=document.getElementById('bs-enabled');
  function onSettingsChange(){
    const t2=timers[hid]; if(!t2) return;
    const bs3=getBreakSettings();
    t2.workIntervalSecs=bs3.workSecs;
    t2.breakDurationSecs=bs3.breakSecs;
    t2.breaksEnabled=bs3.enabled;
    /* Reset nextBreakAt relative to current elapsed so break triggers correctly */
    const live2=getLiveElapsed(hid);
    t2.nextBreakAt=live2+bs3.workSecs;
    updateTimerModal(hid);
    showToast('Break every '+Math.round(bs3.workSecs/60)+'min, '+Math.round(bs3.breakSecs/60)+'min break');
  }
  if(workInp) workInp.onchange=onSettingsChange;
  if(breakInp) breakInp.onchange=onSettingsChange;
  if(enabledInp) enabledInp.onchange=onSettingsChange;
};
window.closeTimerModal=function(){
  document.getElementById('timer-modal').classList.remove('open');
  activeTimerModal=null;
  if(modalDisplayTick){ clearInterval(modalDisplayTick); modalDisplayTick=null; }
  renderToday(); /* refresh card state after closing */
};
/* FIX: tap background to close */
document.getElementById('timer-modal').addEventListener('click',function(e){
  if(e.target===this) window.closeTimerModal();
});
window.timerToggle=function(){
  if(!activeTimerModal) return;
  isTimerRunning(activeTimerModal)?pauseTimer(activeTimerModal):startTimer(activeTimerModal);
};
window.timerReset=function(){
  if(!activeTimerModal) return;
  if(!confirm('Reset timer? This will clear today\'s session and uncheck the habit.')) return;
  resetTimer(activeTimerModal);
};
window.timerToggleCard=function(hid){ isTimerRunning(hid)?pauseTimer(hid):startTimer(hid); };
window.timerResetCard=function(hid){
  if(!confirm('Reset this timer? This will clear today\'s session.')) return;
  resetTimer(hid);
};


/* ════ ONE-DAY TASK ENGINE ════ */
async function saveTasksForDate(dk, items){
  setSyncDot('syncing');
  const ref=doc(db,`users/${currentUser.uid}/tasks/${dk}`);
  await setDoc(ref,{items},{ merge:false });
}

function getTasksForDate(dk){ return tasks[dk]||[]; }

function renderTodayTasks(){
  const list=getTasksForDate(todayKey);
  const section=document.getElementById('task-section-today');
  const el=document.getElementById('task-list-today');
  if(!section||!el) return;
  section.style.display=list.length?'block':'none';
  el.innerHTML='';
  list.forEach((task,idx)=>{
    const card=document.createElement('div');
    card.className='task-card'+(task.done?' done-card':'');
    card.innerHTML=
      '<div class="task-emoji">📋</div>'
      +'<div class="task-body">'
      +'<div class="task-title">'+task.name+'</div>'
      +'<div class="task-sub">One-day task</div>'
      +'</div>'
      +'<div class="task-check'+(task.done?' checked':'')+'"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 7,12 13,4" stroke="'+(task.done?'#fff':'rgba(33,150,243,0.5)')+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
      +'<button class="task-delete" title="Delete task">✕</button>';
    /* toggle done */
    const toggleDone=()=>{
      const updated=[...getTasksForDate(todayKey)];
      updated[idx]={...updated[idx],done:!updated[idx].done};
      tasks[todayKey]=updated;
      renderTodayTasks();
      saveTasksForDate(todayKey,updated);
      if(!updated[idx].done) playUncheck(); else playTick();
    };
    card.querySelector('.task-check').addEventListener('click',e=>{e.stopPropagation();toggleDone();});
    card.addEventListener('click',toggleDone);
    /* delete */
    card.querySelector('.task-delete').addEventListener('click',e=>{
      e.stopPropagation();
      const updated=getTasksForDate(todayKey).filter((_,i)=>i!==idx);
      tasks[todayKey]=updated;
      renderTodayTasks();
      saveTasksForDate(todayKey,updated);
      showToast('Task removed');
    });
    el.appendChild(card);
  });
}

function renderCalTasks(dk){
  /* Render task list for a given calendar date inside cal-detail */
  const list=getTasksForDate(dk);
  const isFuture=dk>todayKey;
  const wrap=document.getElementById('cal-task-wrap');
  if(!wrap) return;
  /* Build task rows */
  let html='';
  list.forEach((task,idx)=>{
    html+='<div class="task-card'+(task.done?' done-card':'')+'" style="cursor:pointer" data-idx="'+idx+'">'
      +'<div class="task-emoji">📋</div>'
      +'<div class="task-body"><div class="task-title">'+task.name+'</div>'
      +'<div class="task-sub">One-day task</div></div>'
      +'<div class="task-check'+(task.done?' checked':'')+'"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 7,12 13,4" stroke="'+(task.done?'#fff':'rgba(33,150,243,0.5)')+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
      +'<button class="task-delete" data-del="'+idx+'" title="Delete">✕</button>'
      +'</div>';
  });
  /* Add task button */
  html+='<button class="cal-task-btn" id="cal-add-task-btn">+ Add one-day task</button>';
  wrap.innerHTML=html;

  /* Attach events */
  wrap.querySelectorAll('.task-card').forEach(card=>{
    const i=parseInt(card.dataset.idx);
    const doToggle=()=>{
      const updated=[...getTasksForDate(dk)];
      updated[i]={...updated[i],done:!updated[i].done};
      tasks[dk]=updated;
      saveTasksForDate(dk,updated);
      renderCalTasks(dk);
      if(!updated[i].done) playUncheck(); else playTick();
    };
    card.addEventListener('click',doToggle);
    card.querySelector('.task-check').addEventListener('click',e=>{e.stopPropagation();doToggle();});
    card.querySelector('.task-delete').addEventListener('click',e=>{
      e.stopPropagation();
      const updated=getTasksForDate(dk).filter((_,j)=>j!==i);
      tasks[dk]=updated;
      saveTasksForDate(dk,updated);
      renderCalTasks(dk);
      showToast('Task removed');
    });
  });
  document.getElementById('cal-add-task-btn').addEventListener('click',()=>{
    openAddTaskModal(dk);
  });
}

/* Open add-task modal — optionally pre-set a date */
window.openAddTaskModal=function(presetDate){
  const dateInp=document.getElementById('task-date-inp');
  const nameInp=document.getElementById('task-name-inp');
  nameInp.value='';
  dateInp.value=presetDate||todayKey;
  document.getElementById('task-modal-title').textContent='New one-day task';
  document.getElementById('add-task-modal').classList.add('open');
  setTimeout(()=>nameInp.focus(),100);
};

window.saveNewTask=async function(){
  const name=document.getElementById('task-name-inp').value.trim();
  const dk=document.getElementById('task-date-inp').value||todayKey;
  if(!name){ document.getElementById('task-name-inp').focus(); return; }
  const newTask={id:'t'+Date.now(),name,done:false};
  const updated=[...getTasksForDate(dk),newTask];
  tasks[dk]=updated;
  closeModal('add-task-modal');
  /* Re-render whichever view is showing */
  if(dk===todayKey) renderTodayTasks();
  /* If calendar is showing this date, update it */
  const calActive=document.getElementById('page-calendar').classList.contains('active');
  if(calActive) renderCalTasks(dk);
  await saveTasksForDate(dk,updated);
  showToast('Task added for '+(dk===todayKey?'today':dk));
};

document.getElementById('task-name-inp').addEventListener('keydown',e=>{
  if(e.key==='Enter') saveNewTask();
});

/* ── TABS ── */
window.switchTab=function(tab){
  ['today','calendar','grade','stats'].forEach(t=>{
    document.getElementById(`tab-${t}`).classList.toggle('active',t===tab);
    document.getElementById(`page-${t}`).classList.toggle('active',t===tab);
  });
  document.getElementById('fab').style.display=tab==='today'?'flex':'none';
  document.getElementById('task-fab').style.display=tab==='today'?'flex':'none';
  if(tab==='calendar')renderCalendar();
  if(tab==='grade')renderGrade();
  if(tab==='stats'){ renderStats(); setTimeout(drawTrendChart,80); }
};
window.changeMonth=changeMonth;
window.changeWeek=changeWeek;
window.selectDay=selectDay;
window.toggle=toggle;
window.addEventListener('resize',()=>{ if(document.getElementById('page-stats').classList.contains('active')) drawTrendChart(); });

/* ── SERVICE WORKER ── */
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
document.getElementById('habit-inp').addEventListener('keydown',e=>{ if(e.key==='Enter') saveNewHabit(); });

(function(){
'use strict';

// ── INIT ────────────────────────────────────────────────
const canvas = document.getElementById('pano');
const viewer = new PanoViewer(canvas);
window.__viewer = viewer;

let currentIdx = 0;
  window.__currentIdx = 0;
let audioOn = true;
let isPaused = false;
let rafId = null;
const synth = window.speechSynthesis;
let voice = null;

// pick best voice
function pickVoice(){
  const vs = synth ? synth.getVoices() : [];
  const prefs = [
    v=>/en-IN/i.test(v.lang)&&/Google/i.test(v.name),
    v=>/en-GB/i.test(v.lang)&&/Google/i.test(v.name),
    v=>/en-US/i.test(v.lang)&&/Google/i.test(v.name),
    v=>/en-IN/i.test(v.lang), v=>/en-GB/i.test(v.lang),
    v=>/en-US/i.test(v.lang), v=>/^en/i.test(v.lang)
  ];
  for(const t of prefs){ const m=vs.find(t); if(m){voice=m;return;} }
  if(vs.length) voice=vs[0];
}
if(synth){ pickVoice(); if(synth.onvoiceschanged!==undefined) synth.onvoiceschanged=pickVoice; }

// ── ELEMENTS ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = {
  intro:      $('intro'),
  btnStart:   $('btn-start'),
  loading:    $('loading'),
  loaderFill: $('loader-fill'),
  dragHint:   $('drag-hint'),
  navCounter: $('nav-counter'),
  navTitle:   $('nav-title'),
  hotLayer:   $('hotspot-layer'),
  captionScT: $('caption-scene-title'),
  captionTxt: $('caption-text'),
  captionPrg: $('caption-progress'),
  captionPlay:$('caption-play'),
  playIcon:   $('play-icon'),
  filmstrip:  $('filmstrip'),
  sidebar:    $('sidebar'),
  sideList:   $('sidebar-list'),
  btnMenu:    $('btn-menu'),
  btnSideClose:$('btn-sidebar-close'),
  btnMap:     $('btn-map'),
  mapPanel:   $('map-panel'),
  btnMapClose:$('btn-map-close'),
  btnAudio:   $('btn-audio'),
  audioIcon:  $('audio-icon'),
  btnFs:      $('btn-fs'),
  btnZoomIn:  $('btn-zoom-in'),
  btnZoomOut: $('btn-zoom-out'),
  themeToggle:$('theme-toggle'),
};

// ── THEME ────────────────────────────────────────────────
let dark = false;
el.themeToggle.addEventListener('click',()=>{
  dark=!dark;
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
});

// ── PRELOAD ──────────────────────────────────────────────
function preload(){
  let loaded=0;
  return Promise.all(SCENES.map(s=>new Promise(res=>{
    const img=new Image();
    img.onload=img.onerror=()=>{
      loaded++;
      el.loaderFill.style.width=Math.round(loaded/SCENES.length*100)+'%';
      res();
    };
    img.src=s.thumb;
  })));
}

// ── BUILD UI ─────────────────────────────────────────────
function buildFilmstrip(){
  el.filmstrip.innerHTML='';
  SCENES.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='film-btn'; b.dataset.i=i;
    b.innerHTML=`<img src="${s.thumb}" alt="${s.title}" loading="lazy"><span class="film-num">${String(i+1).padStart(2,'0')}</span>`;
    b.addEventListener('click',()=>goTo(i,true));
    el.filmstrip.appendChild(b);
  });
}

function buildSidebar(){
  el.sideList.innerHTML='';
  let lastZone='';
  SCENES.forEach((s,i)=>{
    if(s.zone!==lastZone){
      lastZone=s.zone;
      const z=ZONES[s.zone]||{label:s.zone};
      const lbl=document.createElement('div');
      lbl.className='zone-label';
      lbl.style.color=z.color||'var(--on-sv)';
      lbl.textContent=z.label;
      el.sideList.appendChild(lbl);
    }
    const btn=document.createElement('button');
    btn.className='scene-item'; btn.dataset.i=i;
    btn.innerHTML=`
      <img src="${s.thumb}" alt="">
      <div class="scene-item-info">
        <div class="scene-item-num">${String(i+1).padStart(2,'0')}</div>
        <div class="scene-item-name">${s.title}</div>
        <div class="scene-item-sub">${s.subtitle||''}</div>
      </div>`;
    btn.addEventListener('click',()=>{ goTo(i,true); closeSidebar(); });
    el.sideList.appendChild(btn);
  });
}

// ── HOTSPOTS ─────────────────────────────────────────────
const DIR_ICONS = { L:'turn_left', R:'turn_right', S:'straight', i:'login', back:'arrow_back' };
const DIR_LABELS = { L:'Left', R:'Right', S:'Straight', i:'Enter', back:'Back' };

window.__buildHotspots = buildHotspots;
  function buildHotspots(scene){
  el.hotLayer.innerHTML='';
  (scene.hotspots||[]).forEach(h=>{
    const pin=document.createElement('button');
    pin.className='hotspot';
    const icon=DIR_ICONS[h.dir]||'arrow_upward';
    const dirLbl=DIR_LABELS[h.dir]||h.dir;
    pin.innerHTML=`
      <div class="hotspot-ring"></div>
      <div class="hotspot-btn">
        <span class="material-symbols-outlined" style="font-size:22px">${icon}</span>
      </div>
      <div class="hotspot-dir">${dirLbl} · ${h.label}</div>`;
    pin.dataset.yaw=h.yaw; pin.dataset.pitch=h.pitch||0;
    pin.addEventListener('click',()=>{
      const idx=SCENES.findIndex(s=>s.id===h.to);
      if(idx>-1) goTo(idx,true);
    });
    el.hotLayer.appendChild(pin);
  });
  positionHotspots();
}

function positionHotspots(){
  el.hotLayer.querySelectorAll('.hotspot').forEach(pin=>{
    const pos=viewer.getScreenPos(+pin.dataset.yaw,+pin.dataset.pitch);
    if(pos.visible){
      pin.style.display='flex';
      pin.style.transform=`translate(-50%,-50%) translate(${pos.x}px,${pos.y}px) scale(${pos.scale})`;
    } else {
      pin.style.display='none';
    }
  });
}

function startHotspotLoop(){
  if(rafId) cancelAnimationFrame(rafId);
  function loop(){ positionHotspots(); rafId=requestAnimationFrame(loop); }
  loop();
}

// ── NARRATION ────────────────────────────────────────────
function setPlayState(playing){
  el.playIcon.textContent = playing ? 'pause' : 'play_arrow';
}

function speak(text){
  if(!synth||!audioOn) return;
  synth.cancel();
  const u=new SpeechSynthesisUtterance(text);
  if(voice) u.voice=voice;
  u.rate=0.97; u.pitch=1; u.volume=1;
  u.onstart=()=>setPlayState(true);
  u.onend=u.onerror=()=>{ setPlayState(false); el.captionPrg.style.width='100%'; };
  u.onboundary=e=>{ el.captionPrg.style.width=Math.round(e.charIndex/text.length*100)+'%'; };
  setTimeout(()=>synth.speak(u),30);
}

el.captionPlay.addEventListener('click',()=>{
  if(!synth) return;
  if(synth.speaking&&!synth.paused){ synth.pause(); setPlayState(false); }
  else if(synth.paused){ synth.resume(); setPlayState(true); }
  else speak(SCENES[currentIdx].narration);
});

// ── SCENE NAV ────────────────────────────────────────────
function goTo(idx, animate){
  if(idx<0||idx>=SCENES.length) return;
  currentIdx=idx; window.__currentIdx=idx;
  const scene=SCENES[idx];
  if(synth) synth.cancel();

  // fade flash
  if(animate){
    const wrap=document.getElementById('viewer-wrap');
    el.loading.classList.remove('hidden');
  }

  viewer.loadImage(scene.image).then(()=>{
    el.loading.classList.add('hidden');
    viewer.fov=90;
    viewer.setYawPitch(scene.yaw||0,0);
    buildHotspots(scene);
  });

  // update UI
  el.navCounter.textContent=`${String(idx+1).padStart(2,'0')} / ${SCENES.length}`;
  el.navTitle.textContent=scene.title;
  el.captionScT.textContent=scene.title;
  el.captionTxt.textContent=scene.narration;
  el.captionPrg.style.width='0%';

  // filmstrip
  document.querySelectorAll('.film-btn').forEach(b=>b.classList.toggle('active',+b.dataset.i===idx));
  document.querySelectorAll('.scene-item').forEach(b=>b.classList.toggle('active',+b.dataset.i===idx));
  const af=el.filmstrip.querySelector(`.film-btn[data-i="${idx}"]`);
  if(af) af.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});

  if(idx>0) el.dragHint.classList.add('hidden');
  speak(scene.narration);
}

// ── SIDEBAR ──────────────────────────────────────────────
function openSidebar(){ el.sidebar.classList.remove('collapsed'); el.btnMenu.classList.add('active'); }
function closeSidebar(){ el.sidebar.classList.add('collapsed'); el.btnMenu.classList.remove('active'); }
el.btnMenu.addEventListener('click',()=>el.sidebar.classList.contains('collapsed')?openSidebar():closeSidebar());
el.btnSideClose.addEventListener('click',closeSidebar);

// ── MAP ──────────────────────────────────────────────────
el.btnMap.addEventListener('click',()=>{ el.mapPanel.classList.add('open'); el.mapPanel.setAttribute('aria-hidden','false'); });
el.btnMapClose.addEventListener('click',()=>{ el.mapPanel.classList.remove('open'); el.mapPanel.setAttribute('aria-hidden','true'); });
el.mapPanel.addEventListener('click',e=>{ if(e.target===el.mapPanel) el.mapPanel.classList.remove('open'); });

// ── AUDIO TOGGLE ─────────────────────────────────────────
el.btnAudio.addEventListener('click',()=>{
  audioOn=!audioOn;
  el.audioIcon.textContent=audioOn?'volume_up':'volume_off';
  el.btnAudio.classList.toggle('active',!audioOn);
  if(!audioOn&&synth) synth.cancel();
  else if(audioOn) speak(SCENES[currentIdx].narration);
});

// ── FULLSCREEN ───────────────────────────────────────────
el.btnFs.addEventListener('click',()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// ── ZOOM ─────────────────────────────────────────────────
el.btnZoomIn.addEventListener('click',()=>viewer.zoom(-10));
el.btnZoomOut.addEventListener('click',()=>viewer.zoom(10));

// ── KEYBOARD ─────────────────────────────────────────────
window.addEventListener('keydown',e=>{
  if(el.intro.classList.contains('hidden')===false) return;
  if(e.key==='ArrowRight') goTo(currentIdx+1,true);
  if(e.key==='ArrowLeft') goTo(currentIdx-1,true);
  if(e.key==='Escape'){ closeSidebar(); el.mapPanel.classList.remove('open'); }
  if(e.key==='m'||e.key==='M') el.btnMap.click();
});

// ── START ────────────────────────────────────────────────
el.btnStart.addEventListener('click',()=>{
  // unlock speech on user gesture
  if(synth){ try{ const w=new SpeechSynthesisUtterance(' '); w.volume=0; synth.speak(w); }catch(e){} }
  el.intro.classList.add('hidden');
  document.getElementById('app').style.visibility='visible';
  goTo(0,false);
  startHotspotLoop();
});

// ── BOOT ─────────────────────────────────────────────────
document.getElementById('app').style.visibility='hidden';
buildFilmstrip();
buildSidebar();
el.sidebar.classList.add('collapsed'); // start collapsed

preload().then(()=>{
  el.loaderFill.style.width='100%';
});

})();

/**
 * CALIBRATION TOOL
 * Press Ctrl+Shift+E to enter edit mode.
 * 
 * In edit mode:
 *  - Current yaw/pitch shown live in top-left HUD
 *  - "Set scene default" saves current yaw as scene.yaw
 *  - Click "Add hotspot here" — places a new hotspot at current center view
 *  - Drag any existing hotspot chip to a new yaw/pitch
 *  - "Export JSON" copies corrected scenes[] to clipboard
 */

(function(){
  let editMode = false;
  let pendingHotspot = null; // { to, label, dir } waiting for placement

  const overlay = document.createElement('div');
  overlay.id = 'cal-overlay';
  overlay.style.cssText = `
    display:none;position:fixed;inset:0;z-index:200;pointer-events:none;
    font-family:'SF Mono',monospace;font-size:12px;
  `;
  overlay.innerHTML = `
    <div id="cal-hud" style="
      position:absolute;top:72px;left:12px;
      background:rgba(0,0,0,.82);color:#0f0;
      padding:12px 16px;border-radius:8px;border:1px solid #0f04;
      pointer-events:auto;user-select:none;min-width:280px;
    ">
      <div style="color:#ff0;font-weight:700;margin-bottom:8px;font-size:13px">
        🛠 CALIBRATION MODE  <span style="color:#888;font-size:10px">[Ctrl+Shift+E to exit]</span>
      </div>
      <div>Scene: <b id="cal-scene-id">—</b></div>
      <div>Yaw: <b id="cal-yaw">0.0</b>°</div>
      <div>Pitch: <b id="cal-pitch">0.0</b>°</div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        <button class="cal-btn" id="cal-set-default" title="Set current yaw as this scene's start angle">
          📌 Set scene default yaw
        </button>
        <button class="cal-btn" id="cal-add-hs" title="Place a hotspot at the current view direction">
          ➕ Place hotspot at current view
        </button>
        <button class="cal-btn" id="cal-del-hs" title="Delete selected hotspot">
          🗑 Delete selected hotspot
        </button>
        <button class="cal-btn" id="cal-export" style="background:#1a4a1a">
          💾 Export corrected JSON
        </button>
      </div>
      <div id="cal-hs-list" style="margin-top:10px;font-size:11px;border-top:1px solid #333;padding-top:8px">
        <div style="color:#888;margin-bottom:4px">HOTSPOTS (click to select):</div>
        <div id="cal-hs-items"></div>
      </div>
      <div id="cal-msg" style="margin-top:8px;color:#ff0;font-size:11px;min-height:16px"></div>
    </div>
    <div id="cal-crosshair" style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:30px;height:30px;pointer-events:none;
    ">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <line x1="15" y1="0" x2="15" y2="11" stroke="#f00" stroke-width="1.5"/>
        <line x1="15" y1="19" x2="15" y2="30" stroke="#f00" stroke-width="1.5"/>
        <line x1="0" y1="15" x2="11" y2="15" stroke="#f00" stroke-width="1.5"/>
        <line x1="19" y1="15" x2="30" y2="15" stroke="#f00" stroke-width="1.5"/>
        <circle cx="15" cy="15" r="3" stroke="#f00" fill="none" stroke-width="1.5"/>
      </svg>
    </div>
  `;
  document.body.appendChild(overlay);

  const calStyle = document.createElement('style');
  calStyle.textContent=`.cal-btn{
    padding:6px 10px;border-radius:5px;border:1px solid #444;
    background:#1a1a2e;color:#eee;cursor:pointer;text-align:left;
    font-size:11px;font-family:inherit;width:100%;
    transition:background .15s;
  }
  .cal-btn:hover{background:#2a2a4e}
  .cal-hs-item{padding:4px 6px;border-radius:4px;cursor:pointer;margin-bottom:2px;border:1px solid transparent}
  .cal-hs-item:hover{background:#1a2a1a}
  .cal-hs-item.selected{border-color:#0f0;background:#0a1a0a}`;
  document.head.appendChild(calStyle);

  // state
  const sceneData = {}; // deep copy of SCENES for editing
  let selectedHsIdx = null;

  function msg(t){ document.getElementById('cal-msg').textContent=t; setTimeout(()=>document.getElementById('cal-msg').textContent='',3000); }

  function deepCopy(){
    // init sceneData from live SCENES if empty
    SCENES.forEach(s=>{
      if(!sceneData[s.id]) sceneData[s.id]={yaw:s.yaw,pitch:s.pitch||0,hotspots:JSON.parse(JSON.stringify(s.hotspots||[]))};
    });
  }

  function updateHUD(){
    if(!editMode) return;
    const v=window.__viewer;
    document.getElementById('cal-yaw').textContent   = v.yaw.toFixed(1);
    document.getElementById('cal-pitch').textContent = v.pitch.toFixed(1);
    document.getElementById('cal-scene-id').textContent = SCENES[window.__currentIdx]?.id||'?';
    renderHsList();
    requestAnimationFrame(updateHUD);
  }

  function renderHsList(){
    const scene=SCENES[window.__currentIdx];
    if(!scene) return;
    const sd=sceneData[scene.id];
    const container=document.getElementById('cal-hs-items');
    container.innerHTML='';
    (sd?.hotspots||[]).forEach((h,i)=>{
      const d=document.createElement('div');
      d.className='cal-hs-item'+(i===selectedHsIdx?' selected':'');
      d.innerHTML=`<b>${h.dir||'?'}</b> → ${h.to} | yaw:<b>${h.yaw?.toFixed(1)}</b> pitch:<b>${(h.pitch||0).toFixed(1)}</b>`;
      d.onclick=()=>{ selectedHsIdx=i; renderHsList(); msg(`Selected hotspot ${i}: ${h.label}`); };
      container.appendChild(d);
    });
  }

  // SET DEFAULT YAW
  document.getElementById('cal-set-default').onclick=()=>{
    deepCopy();
    const scene=SCENES[window.__currentIdx];
    if(!scene) return;
    const v=window.__viewer;
    sceneData[scene.id].yaw=parseFloat(v.yaw.toFixed(1));
    scene.yaw=sceneData[scene.id].yaw; // live update
    msg(`✅ Default yaw set to ${v.yaw.toFixed(1)}° for ${scene.id}`);
  };

  // PLACE HOTSPOT at current view center
  document.getElementById('cal-add-hs').onclick=()=>{
    deepCopy();
    const scene=SCENES[window.__currentIdx];
    if(!scene){ msg('No scene loaded'); return; }
    const v=window.__viewer;
    const to=prompt('Target scene id (e.g. s03):','');
    if(!to) return;
    const dir=prompt('Direction code (L / R / S / i / back):','S');
    if(!dir) return;
    const label=prompt('Label text:',to);
    const hs={yaw:parseFloat(v.yaw.toFixed(1)),pitch:parseFloat(v.pitch.toFixed(1)),to,dir,label:label||to};
    sceneData[scene.id].hotspots.push(hs);
    scene.hotspots=sceneData[scene.id].hotspots; // live update
    selectedHsIdx=scene.hotspots.length-1;
    if(window.__buildHotspots) window.__buildHotspots(scene);
    msg(`✅ Hotspot added → ${to} at yaw ${hs.yaw} pitch ${hs.pitch}`);
  };

  // DELETE selected hotspot
  document.getElementById('cal-del-hs').onclick=()=>{
    const scene=SCENES[window.__currentIdx];
    if(!scene||selectedHsIdx===null){ msg('Select a hotspot first'); return; }
    deepCopy();
    sceneData[scene.id].hotspots.splice(selectedHsIdx,1);
    scene.hotspots=sceneData[scene.id].hotspots;
    selectedHsIdx=null;
    if(window.__buildHotspots) window.__buildHotspots(scene);
    msg('🗑 Hotspot deleted');
  };

  // Also allow clicking on existing hotspot chip in 3D to select + nudge
  // (exposed via app.js __onHotspotClick)

  // EXPORT
  document.getElementById('cal-export').onclick=()=>{
    deepCopy();
    // merge edits back into full SCENES structure
    const out=SCENES.map(s=>{
      const ed=sceneData[s.id]||{};
      return Object.assign({},s,{
        yaw:ed.yaw??s.yaw,
        hotspots:ed.hotspots||s.hotspots
      });
    });
    const json=JSON.stringify(out,null,2);
    navigator.clipboard.writeText(json).then(()=>msg('📋 Copied to clipboard! Paste into js/scenes.js'),()=>{
      const ta=document.createElement('textarea');
      ta.value=json; document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      ta.remove(); msg('📋 Copied (fallback)!');
    });
  };

  // TOGGLE
  function enter(){
    editMode=true;
    deepCopy();
    overlay.style.display='block';
    requestAnimationFrame(updateHUD);
    // disable hotspot pointer-events so clicks don't trigger nav
    document.querySelectorAll('.hotspot').forEach(h=>h.style.pointerEvents='none');
    msg('Edit mode ON — look around then use buttons');
  }
  function exit(){
    editMode=false;
    overlay.style.display='none';
    document.querySelectorAll('.hotspot').forEach(h=>h.style.pointerEvents='auto');
  }

  window.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.shiftKey&&e.key==='E'){e.preventDefault(); editMode?exit():enter();}
  });
  window.__calExit=exit; window.__calEnter=enter;
})();

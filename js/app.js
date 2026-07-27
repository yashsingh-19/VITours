/* ============================================================
   APP.JS
   Wires together: PanoViewer (viewer.js), SCENES (scenes.js),
   Narrator (narration.js), and all the chrome UI: top bar,
   hotspots, filmstrip, drawer, map overlay, captions.
   ============================================================ */

(function () {
  "use strict";

  const canvas = document.getElementById("pano");
  const viewer = new PanoViewer(canvas);
  window.__viewer = viewer; // debug hook
  const narrator = new Narrator();

  let currentIndex = 0;
  let audioOn = true;
  let isPaused = false;
  let rafHotspots = null;

  const els = {
    loader: document.getElementById("loader"),
    loaderFill: document.getElementById("loaderFill"),
    intro: document.getElementById("intro"),
    btnStart: document.getElementById("btnStart"),
    stage: document.getElementById("stage"),
    hotspotLayer: document.getElementById("hotspotLayer"),
    dragHint: document.getElementById("dragHint"),
    sceneCounter: document.getElementById("sceneCounter"),
    sceneTitle: document.getElementById("sceneTitle"),
    captionText: document.getElementById("captionText"),
    captionFill: document.getElementById("captionFill"),
    btnCaptionPlay: document.getElementById("btnCaptionPlay"),
    playIcon: document.getElementById("playIcon"),
    pauseIcon: document.getElementById("pauseIcon"),
    filmstrip: document.getElementById("filmstrip"),
    btnMenu: document.getElementById("btnMenu"),
    drawer: document.getElementById("drawer"),
    drawerList: document.getElementById("drawerList"),
    btnDrawerClose: document.getElementById("btnDrawerClose"),
    drawerScrim: document.getElementById("drawerScrim"),
    btnMap: document.getElementById("btnMap"),
    mapOverlay: document.getElementById("mapOverlay"),
    btnMapClose: document.getElementById("btnMapClose"),
    btnAudio: document.getElementById("btnAudio"),
    btnFullscreen: document.getElementById("btnFullscreen"),
    btnZoomIn: document.getElementById("btnZoomIn"),
    btnZoomOut: document.getElementById("btnZoomOut")
  };

  /* ---------------- preload images with progress ---------------- */
  function preload() {
    let loaded = 0;
    const total = SCENES.length;
    const promises = SCENES.map(s => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        els.loaderFill.style.width = Math.round((loaded / total) * 100) + "%";
        resolve();
      };
      img.src = s.image;
    }));
    return Promise.all(promises);
  }

  /* ---------------- build static UI: filmstrip + drawer ---------------- */
  function buildFilmstrip() {
    els.filmstrip.innerHTML = "";
    SCENES.forEach((s, i) => {
      const btn = document.createElement("button");
      btn.className = "film-item";
      btn.dataset.index = i;
      btn.innerHTML = `
        <img src="${s.thumb}" alt="${s.title}" loading="lazy">
        <span class="film-num mono">${String(i + 1).padStart(2, "0")}</span>
      `;
      btn.addEventListener("click", () => goToScene(i, true));
      els.filmstrip.appendChild(btn);
    });
  }

  function buildDrawer() {
    els.drawerList.innerHTML = "";
    let lastZone = null;
    SCENES.forEach((s, i) => {
      if (s.zone !== lastZone) {
        lastZone = s.zone;
        const head = document.createElement("div");
        head.className = "drawer-zone mono small";
        head.style.color = TOUR_ZONES[s.zone].color;
        head.textContent = TOUR_ZONES[s.zone].name;
        els.drawerList.appendChild(head);
      }
      const item = document.createElement("button");
      item.className = "drawer-item";
      item.dataset.index = i;
      item.innerHTML = `
        <img src="${s.thumb}" alt="">
        <span class="drawer-item-text">
          <span class="drawer-item-num mono">${String(i + 1).padStart(2, "0")}</span>
          <span class="drawer-item-title">${s.title}</span>
        </span>
      `;
      item.addEventListener("click", () => { goToScene(i, true); closeDrawer(); });
      els.drawerList.appendChild(item);
    });
  }

  /* ---------------- hotspots ---------------- */
  function buildHotspotsForScene(scene) {
    els.hotspotLayer.innerHTML = "";
    scene.hotspots.forEach(h => {
      const target = SCENE_MAP[h.to];
      const pin = document.createElement("button");
      pin.className = "hotspot";
      pin.innerHTML = `
        <span class="hotspot-ring"></span>
        <span class="hotspot-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M12 4l-6 6M12 4l6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="hotspot-label mono">${h.label}</span>
      `;
      pin.dataset.yaw = h.yaw;
      pin.dataset.pitch = h.pitch;
      pin.addEventListener("click", () => {
        const idx = SCENES.findIndex(s => s.id === h.to);
        if (idx > -1) goToScene(idx, true);
      });
      els.hotspotLayer.appendChild(pin);
    });
    positionHotspots();
  }

  function positionHotspots() {
    const pins = els.hotspotLayer.querySelectorAll(".hotspot");
    pins.forEach(pin => {
      const yaw = parseFloat(pin.dataset.yaw);
      const pitch = parseFloat(pin.dataset.pitch);
      const pos = viewer.getScreenPos(yaw, pitch);
      if (pos.visible) {
        pin.style.display = "flex";
        pin.style.transform = `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`;
      } else {
        pin.style.display = "none";
      }
    });
  }

  function hotspotLoop() {
    positionHotspots();
    rafHotspots = requestAnimationFrame(hotspotLoop);
  }

  /* ---------------- captions / narration ---------------- */
  function updateCaptionText(text) {
    els.captionText.textContent = text;
    els.captionFill.style.width = "0%";
  }

  function playNarration(scene) {
    if (!audioOn) return;
    isPaused = false;
    setPlayIconPlaying(true);
    narrator.onBoundary = (charIndex, total) => {
      els.captionFill.style.width = Math.round((charIndex / total) * 100) + "%";
    };
    narrator.onStart = () => setPlayIconPlaying(true);
    narrator.onEnd = () => {
      setPlayIconPlaying(false);
      els.captionFill.style.width = "100%";
    };
    narrator.speak(scene.narration);
  }

  function setPlayIconPlaying(playing) {
    els.playIcon.style.display = playing ? "none" : "block";
    els.pauseIcon.style.display = playing ? "block" : "none";
  }

  els.btnCaptionPlay.addEventListener("click", () => {
    if (!narrator.supported) return;
    if (narrator.synth.speaking && !narrator.synth.paused) {
      narrator.pause();
      isPaused = true;
      setPlayIconPlaying(false);
    } else if (narrator.synth.paused) {
      narrator.resume();
      isPaused = false;
      setPlayIconPlaying(true);
    } else {
      playNarration(SCENES[currentIndex]);
    }
  });

  /* ---------------- scene transitions ---------------- */
  function goToScene(index, animate) {
    if (index < 0 || index >= SCENES.length) return;
    currentIndex = index;
    const scene = SCENES[index];

    narrator.stop();

    const layer = els.stage;
    if (animate) {
      layer.classList.add("scene-fade");
      setTimeout(() => layer.classList.remove("scene-fade"), 420);
    }

    viewer.loadImage(scene.image).then(() => {
      viewer.fov = 90;
      viewer.setYawPitch(scene.yaw || 0, 0);
      buildHotspotsForScene(scene);
    });

    els.sceneCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${SCENES.length}`;
    els.sceneTitle.textContent = scene.title;
    updateCaptionText(scene.narration);

    // highlight filmstrip + drawer
    document.querySelectorAll(".film-item").forEach(b => b.classList.toggle("active", +b.dataset.index === index));
    document.querySelectorAll(".drawer-item").forEach(b => b.classList.toggle("active", +b.dataset.index === index));
    const activeFilm = els.filmstrip.querySelector(`.film-item[data-index="${index}"]`);
    if (activeFilm) activeFilm.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    playNarration(scene);

    // hide drag hint after first couple of scenes
    if (index > 0) els.dragHint.classList.add("hidden");
  }

  /* ---------------- map iframe fallback detection ---------------- */
  let mapChecked = false;
  function checkMapLoaded() {
    if (mapChecked) return;
    mapChecked = true;
    const frame = document.getElementById("mapFrame");
    const fallback = document.getElementById("mapFallback");
    let resolved = false;
    frame.addEventListener("load", () => {
      resolved = true;
      // A blocked/host-not-allowed response still fires 'load' for an error doc,
      // so also check if the frame ended up effectively empty after a beat.
      setTimeout(() => {
        try {
          // cross-origin: any access throws -> assume it loaded fine (real maps page)
          const test = frame.contentWindow.location.href;
        } catch (e) {
          // expected for a successful cross-origin embed; leave as-is
        }
      }, 300);
    });
    frame.addEventListener("error", () => {
      if (!resolved) { frame.style.display = "none"; fallback.style.display = "flex"; }
    });
    // Hard timeout: if nothing fires within 3.5s, assume blocked (sandboxed/no network)
    setTimeout(() => {
      if (!resolved) { frame.style.display = "none"; fallback.style.display = "flex"; }
    }, 3500);
  }

  /* ---------------- drawer + map controls ---------------- */
  function openDrawer() {
    els.drawer.classList.add("open");
    els.drawerScrim.classList.add("show");
    els.drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    els.drawer.classList.remove("open");
    els.drawerScrim.classList.remove("show");
    els.drawer.setAttribute("aria-hidden", "true");
  }
  els.btnMenu.addEventListener("click", openDrawer);
  els.btnDrawerClose.addEventListener("click", closeDrawer);
  els.drawerScrim.addEventListener("click", closeDrawer);

  els.btnMap.addEventListener("click", () => {
    els.mapOverlay.classList.add("open");
    els.mapOverlay.setAttribute("aria-hidden", "false");
    checkMapLoaded();
  });
  els.btnMapClose.addEventListener("click", () => {
    els.mapOverlay.classList.remove("open");
    els.mapOverlay.setAttribute("aria-hidden", "true");
  });

  /* ---------------- audio toggle ---------------- */
  els.btnAudio.addEventListener("click", () => {
    audioOn = narrator.toggleEnabled();
    els.btnAudio.classList.toggle("muted", !audioOn);
    if (!audioOn) {
      setPlayIconPlaying(false);
    } else {
      playNarration(SCENES[currentIndex]);
    }
  });

  /* ---------------- fullscreen + zoom ---------------- */
  els.btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
  els.btnZoomIn.addEventListener("click", () => viewer.zoom(-10));
  els.btnZoomOut.addEventListener("click", () => viewer.zoom(10));

  /* ---------------- keyboard nav ---------------- */
  window.addEventListener("keydown", e => {
    if (els.intro.classList.contains("hidden") === false) return;
    if (e.key === "ArrowRight") goToScene(currentIndex + 1, true);
    if (e.key === "ArrowLeft") goToScene(currentIndex - 1, true);
    if (e.key === "Escape") { closeDrawer(); els.mapOverlay.classList.remove("open"); }
  });

  /* ---------------- start flow ---------------- */
  function start() {
    els.intro.classList.add("hidden");
    els.stage.setAttribute("aria-hidden", "false");
    document.body.classList.add("tour-active");
    goToScene(0, false);
    if (!rafHotspots) hotspotLoop();
  }

  els.btnStart.addEventListener("click", () => {
    // Speech synthesis needs a user gesture to unlock on some browsers — speak a tiny blank utterance
    if (narrator.supported) {
      try {
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        narrator.synth.speak(warm);
      } catch (e) {}
    }
    start();
  });

  /* ---------------- boot ---------------- */
  buildFilmstrip();
  buildDrawer();
  preload().then(() => {
    els.loader.classList.add("hidden");
  });

})();

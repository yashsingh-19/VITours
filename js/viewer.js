/* ============================================================
   VIEWER.JS
   A compact WebGL equirectangular panorama renderer.
   Renders a textured sphere from the inside, camera at origin.
   Exposes: PanoViewer class with .loadImage(), .setYawPitch(),
   .getScreenPos(yawDeg, pitchDeg) for hotspot placement, and
   pointer/touch/wheel interaction built in.
   ============================================================ */

class PanoViewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", { antialias: true, alpha: false })
           || canvas.getContext("experimental-webgl");
    if (!this.gl) {
      console.error("WebGL not supported");
      return;
    }
    this.yaw = 0;        // degrees, 0..360
    this.pitch = 0;       // degrees, -90..90
    this.fov = 90;        // degrees
    this.minFov = 40;
    this.maxFov = 110;
    this.texture = null;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.onChange = null; // callback fired on yaw/pitch/fov change

    this._initGL();
    this._bindInteraction();
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  /* ---------- GL setup ---------- */
  _initGL() {
    const gl = this.gl;
    const vsSrc = `
      attribute vec3 aPos;
      attribute vec2 aUV;
      uniform mat4 uProj;
      uniform mat4 uView;
      varying vec2 vUV;
      void main() {
        vUV = aUV;
        gl_Position = uProj * uView * vec4(aPos, 1.0);
      }
    `;
    const fsSrc = `
      precision highp float;
      varying vec2 vUV;
      uniform sampler2D uTex;
      void main() {
        gl_FragColor = texture2D(uTex, vUV);
      }
    `;
    const vs = this._compile(gl.VERTEX_SHADER, vsSrc);
    const fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
    }
    this.prog = prog;
    gl.useProgram(prog);

    this.aPos = gl.getAttribLocation(prog, "aPos");
    this.aUV = gl.getAttribLocation(prog, "aUV");
    this.uProj = gl.getUniformLocation(prog, "uProj");
    this.uView = gl.getUniformLocation(prog, "uView");
    this.uTex = gl.getUniformLocation(prog, "uTex");

    this._buildSphere(48, 32);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.05, 0.06, 0.09, 1);
  }

  _compile(type, src) {
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }

  // Build an inward-facing UV sphere
  _buildSphere(latBands, lonBands) {
    const gl = this.gl;
    const positions = [];
    const uvs = [];
    const indices = [];
    const R = 50;

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands; // 0..PI
      const sinT = Math.sin(theta), cosT = Math.cos(theta);
      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands; // 0..2PI
        const sinP = Math.sin(phi), cosP = Math.cos(phi);
        const x = R * sinT * cosP;
        const y = R * cosT;
        const z = R * sinT * sinP;
        positions.push(x, y, z);
        uvs.push(lon / lonBands, lat / latBands);
      }
    }
    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const a = lat * (lonBands + 1) + lon;
        const b = a + lonBands + 1;
        // Reverse winding so faces point inward (visible from inside sphere)
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    this.indexCount = indices.length;

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.uvbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  /* ---------- texture loading ---------- */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const gl = this.gl;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (this.texture) gl.deleteTexture(this.texture);
        this.texture = tex;
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /* ---------- matrices ---------- */
  _perspective(fovDeg, aspect, near, far) {
    const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  _viewMatrix() {
    // Build rotation from yaw (around Y) and pitch (around X)
    const yawR = (this.yaw * Math.PI) / 180;
    const pitchR = (this.pitch * Math.PI) / 180;
    const cy = Math.cos(yawR), sy = Math.sin(yawR);
    const cp = Math.cos(pitchR), sp = Math.sin(pitchR);

    // Rotation Y (yaw) then X (pitch), then we need the inverse (camera looks from origin)
    // Combined rotation matrix R = Rx(pitch) * Ry(yaw); view = R^-1 = R^T for pure rotation
    const m = new Float32Array(16);
    // Ry
    const ry = [
      cy, 0, sy, 0,
      0,  1, 0,  0,
      -sy,0, cy, 0,
      0,  0, 0,  1
    ];
    // Rx
    const rx = [
      1, 0,  0,   0,
      0, cp, -sp, 0,
      0, sp, cp,  0,
      0, 0,  0,   1
    ];
    // combined = rx * ry  (column-major mult)
    const out = this._mul4(rx, ry);
    // view matrix is transpose (inverse of rotation) since camera at origin
    return this._transpose4(out);
  }

  _mul4(a, b) {
    const out = new Array(16).fill(0);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[r + k * 4] * b[k + c * 4];
        out[r + c * 4] = s;
      }
    }
    return out;
  }
  _transpose4(m) {
    const out = new Float32Array(16);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        out[r + c * 4] = m[c + r * 4];
    return out;
  }

  /* ---------- render loop ---------- */
  render() {
    const gl = this.gl;
    if (!this.texture) return;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.prog);

    const aspect = this.canvas.width / this.canvas.height;
    gl.uniformMatrix4fv(this.uProj, false, this._perspective(this.fov, aspect, 0.1, 200));
    gl.uniformMatrix4fv(this.uView, false, this._viewMatrix());

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbo);
    gl.enableVertexAttribArray(this.aUV);
    gl.vertexAttribPointer(this.aUV, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uTex, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.render();
  }

  /* ---------- interaction ---------- */
  _bindInteraction() {
    const c = this.canvas;
    let pinchStartDist = null;
    let pinchStartFov = null;

    const start = (x, y) => { this.dragging = true; this.lastX = x; this.lastY = y; c.classList.add("grabbing"); };
    const move = (x, y) => {
      if (!this.dragging) return;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x; this.lastY = y;
      const sensitivity = this.fov / 90 * 0.18;
      this.yaw -= dx * sensitivity;
      this.pitch += dy * sensitivity;
      this.pitch = Math.max(-85, Math.min(85, this.pitch));
      this.yaw = ((this.yaw % 360) + 360) % 360;
      this.render();
      if (this.onChange) this.onChange();
    };
    const end = () => { this.dragging = false; c.classList.remove("grabbing"); };

    c.addEventListener("mousedown", e => start(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
    window.addEventListener("mouseup", end);

    c.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        start(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        this.dragging = false;
        pinchStartDist = this._touchDist(e.touches);
        pinchStartFov = this.fov;
      }
    }, { passive: true });
    c.addEventListener("touchmove", e => {
      if (e.touches.length === 1) {
        move(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && pinchStartDist) {
        const d = this._touchDist(e.touches);
        const scale = pinchStartDist / d;
        this.fov = Math.max(this.minFov, Math.min(this.maxFov, pinchStartFov * scale));
        this.render();
        if (this.onChange) this.onChange();
      }
    }, { passive: true });
    c.addEventListener("touchend", () => { end(); pinchStartDist = null; });

    c.addEventListener("wheel", e => {
      e.preventDefault();
      this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + e.deltaY * 0.04));
      this.render();
      if (this.onChange) this.onChange();
    }, { passive: false });
  }

  _touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoom(delta) {
    this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + delta));
    this.render();
    if (this.onChange) this.onChange();
  }

  setYawPitch(yaw, pitch) {
    this.yaw = ((yaw % 360) + 360) % 360;
    this.pitch = Math.max(-85, Math.min(85, pitch));
    this.render();
  }

  /* Project a yaw/pitch (degrees, scene-space) to screen pixel coords.
     Returns {x, y, visible, scale} where visible is false if behind camera. */
  getScreenPos(yawDeg, pitchDeg) {
    // World point on unit sphere at given yaw/pitch (same convention as sphere build)
    const yawR = (yawDeg * Math.PI) / 180;
    const pitchR = (pitchDeg * Math.PI) / 180;
    // Convert yaw/pitch to a direction vector matching texture mapping convention
    const theta = (90 - pitchDeg) * Math.PI / 180; // polar angle from +Y
    const phi = yawR;
    const wx = Math.sin(theta) * Math.cos(phi);
    const wy = Math.cos(theta);
    const wz = Math.sin(theta) * Math.sin(phi);

    // Rotate world point into camera space using the same R = Rx(pitch)*Ry(yaw)
    const cyaw = (this.yaw * Math.PI) / 180;
    const cpitch = (this.pitch * Math.PI) / 180;
    const cy = Math.cos(cyaw), sy = Math.sin(cyaw);
    const cp = Math.cos(cpitch), sp = Math.sin(cpitch);

    // Ry(yaw) applied to point
    let x1 = cy * wx + sy * wz;
    let y1 = wy;
    let z1 = -sy * wx + cy * wz;
    // Rx(pitch) applied
    let x2 = x1;
    let y2 = cp * y1 - sp * z1;
    let z2 = sp * y1 + cp * z1;

    // Camera looks down -Z in view space after our matrix convention; check sign via projection
    const aspect = this.canvas.width / this.canvas.height;
    const f = 1 / Math.tan((this.fov * Math.PI) / 360);

    if (z2 >= -0.05) return { visible: false };

    const ndcX = (f / aspect) * (x2 / -z2);
    const ndcY = f * (y2 / -z2);

    if (ndcX < -1.3 || ndcX > 1.3 || ndcY < -1.3 || ndcY > 1.3) return { visible: false };

    const rect = this.canvas.getBoundingClientRect();
    const screenX = (ndcX * 0.5 + 0.5) * rect.width;
    const screenY = (1 - (ndcY * 0.5 + 0.5)) * rect.height;
    const scale = Math.max(0.55, Math.min(1.25, 90 / this.fov));
    return { visible: true, x: screenX, y: screenY, scale };
  }
}

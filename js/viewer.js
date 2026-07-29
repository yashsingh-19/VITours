/**
 * PanoViewer — equirectangular WebGL viewer
 * Supports yaw (horizontal pan) + pitch (vertical tilt) with NO roll.
 * Horizon stays level at all times (gimbal-locked in the good way).
 */
class PanoViewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl',{antialias:true,alpha:false})
            || canvas.getContext('experimental-webgl');
    this.yaw = 0; this.pitch = 0; this.fov = 90;
    this.minFov = 40; this.maxFov = 110;
    this.texture = null;
    this.dragging = false; this.lastX = 0; this.lastY = 0;
    this.onChange = null;
    if(!this.gl){console.error('WebGL not supported');return;}
    this._initGL();
    this._bindEvents();
    this._resize();
    window.addEventListener('resize',()=>this._resize());
  }

  _initGL(){
    const gl = this.gl;
    const vs = `attribute vec3 a;attribute vec2 u;uniform mat4 P,V;varying vec2 v;
                void main(){v=u;gl_Position=P*V*vec4(a,1.);}`;
    const fs = `precision highp float;varying vec2 v;uniform sampler2D T;
                void main(){gl_FragColor=texture2D(T,v);}`;
    const mk = (t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;};
    const prog = gl.createProgram();
    gl.attachShader(prog,mk(gl.VERTEX_SHADER,vs));
    gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(prog);
    this.prog = prog;
    this.aPos = gl.getAttribLocation(prog,'a');
    this.aUV  = gl.getAttribLocation(prog,'u');
    this.uP   = gl.getUniformLocation(prog,'P');
    this.uV   = gl.getUniformLocation(prog,'V');
    this.uT   = gl.getUniformLocation(prog,'T');
    this._buildSphere(64,48);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.04,0.07,0.15,1);
  }

  _buildSphere(lat,lon){
    const gl=this.gl, R=50, pos=[], uvs=[], idx=[];
    for(let i=0;i<=lat;i++){
      const t=i*Math.PI/lat, st=Math.sin(t), ct=Math.cos(t);
      for(let j=0;j<=lon;j++){
        const p=j*2*Math.PI/lon, sp=Math.sin(p), cp=Math.cos(p);
        pos.push(R*st*cp, R*ct, R*st*sp);
        uvs.push(j/lon, i/lat);
      }
    }
    for(let i=0;i<lat;i++) for(let j=0;j<lon;j++){
      const a=i*(lon+1)+j, b=a+lon+1;
      idx.push(a,b,a+1, b,b+1,a+1);
    }
    this.idxCount = idx.length;
    const put = (buf,data,type)=>{ gl.bindBuffer(type,buf); gl.bufferData(type,data,gl.STATIC_DRAW); };
    this.vbo = gl.createBuffer(); put(this.vbo, new Float32Array(pos),  gl.ARRAY_BUFFER);
    this.ubo = gl.createBuffer(); put(this.ubo, new Float32Array(uvs),  gl.ARRAY_BUFFER);
    this.ibo = gl.createBuffer(); put(this.ibo, new Uint16Array(idx),   gl.ELEMENT_ARRAY_BUFFER);
  }

  loadImage(url){
    return new Promise((res,rej)=>{
      const img = new Image(); img.crossOrigin='anonymous';
      img.onload = ()=>{
        const gl=this.gl, tex=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
        [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE));
        [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR));
        if(this.texture) gl.deleteTexture(this.texture);
        this.texture = tex; res();
      };
      img.onerror = rej; img.src = url;
    });
  }

  /** perspective matrix */
  _persp(fov,asp,n,f){
    const t=1/Math.tan(fov*Math.PI/360), nf=1/(n-f);
    return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)*nf,-1, 0,0,2*f*n*nf,0]);
  }

  /**
   * View matrix: Ry(yaw) then Rx(pitch) — no roll ever.
   * Camera stays upright; dragging up/down tilts pitch, left/right pans yaw.
   */
  _view(){
    const yr = this.yaw   * Math.PI/180;
    const pr = this.pitch * Math.PI/180;
    const cy=Math.cos(yr), sy=Math.sin(yr);
    const cp=Math.cos(pr), sp=Math.sin(pr);
    // Combined rotation: R = Rx(pitch) * Ry(yaw)
    // View matrix = R^T (transpose = inverse for pure rotation)
    // Row-major stored column-major for WebGL:
    return new Float32Array([
      cy,      sp*sy,  -cp*sy,  0,
      0,       cp,      sp,     0,
      sy,     -sp*cy,   cp*cy,  0,
      0,       0,       0,      1
    ]);
  }

  render(){
    const gl=this.gl; if(!this.texture) return;
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);
    const asp=this.canvas.width/this.canvas.height;
    gl.uniformMatrix4fv(this.uP,false,this._persp(this.fov,asp,0.1,200));
    gl.uniformMatrix4fv(this.uV,false,this._view());
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
    gl.enableVertexAttribArray(this.aPos); gl.vertexAttribPointer(this.aPos,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.ubo);
    gl.enableVertexAttribArray(this.aUV); gl.vertexAttribPointer(this.aUV,2,gl.FLOAT,false,0,0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.texture); gl.uniform1i(this.uT,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibo);
    gl.drawElements(gl.TRIANGLES,this.idxCount,gl.UNSIGNED_SHORT,0);
  }

  _resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const r=this.canvas.getBoundingClientRect();
    this.canvas.width  = Math.round(r.width*dpr);
    this.canvas.height = Math.round(r.height*dpr);
    this.render();
  }

  _bindEvents(){
    const c=this.canvas;
    let pinchDist=null, pinchFov=null;
    const start=(x,y)=>{ this.dragging=true; this.lastX=x; this.lastY=y; c.classList.add('grabbing'); };
    const move=(x,y)=>{
      if(!this.dragging) return;
      const sens = this.fov/90*0.18;
      this.yaw   -= (x-this.lastX)*sens;
      this.pitch  = Math.max(-85, Math.min(85, this.pitch + (y-this.lastY)*sens));
      this.yaw    = ((this.yaw%360)+360)%360;
      this.lastX=x; this.lastY=y;
      this.render(); if(this.onChange) this.onChange();
    };
    const end=()=>{ this.dragging=false; c.classList.remove('grabbing'); };

    c.addEventListener('mousedown',  e=>start(e.clientX,e.clientY));
    window.addEventListener('mousemove', e=>move(e.clientX,e.clientY));
    window.addEventListener('mouseup',   end);

    c.addEventListener('touchstart', e=>{
      if(e.touches.length===1) start(e.touches[0].clientX,e.touches[0].clientY);
      else if(e.touches.length===2){
        this.dragging=false;
        pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        pinchFov=this.fov;
      }
    },{passive:true});
    c.addEventListener('touchmove', e=>{
      if(e.touches.length===1) move(e.touches[0].clientX,e.touches[0].clientY);
      else if(e.touches.length===2&&pinchDist){
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        this.fov=Math.max(this.minFov,Math.min(this.maxFov,pinchFov*(pinchDist/d)));
        this.render(); if(this.onChange) this.onChange();
      }
    },{passive:true});
    c.addEventListener('touchend',()=>{ end(); pinchDist=null; });
    c.addEventListener('wheel',e=>{
      e.preventDefault();
      this.fov=Math.max(this.minFov,Math.min(this.maxFov,this.fov+e.deltaY*0.04));
      this.render(); if(this.onChange) this.onChange();
    },{passive:false});
  }

  zoom(d){ this.fov=Math.max(this.minFov,Math.min(this.maxFov,this.fov+d)); this.render(); }
  setYawPitch(y,p){ this.yaw=((y%360)+360)%360; this.pitch=Math.max(-85,Math.min(85,p||0)); this.render(); }

  /**
   * Project a scene-space yaw/pitch to screen pixel position.
   * Must match the _view() matrix exactly.
   */
  getScreenPos(yawDeg,pitchDeg){
    // Direction vector of the target point in world space
    const th=(90-(pitchDeg||0))*Math.PI/180, ph=(yawDeg||0)*Math.PI/180;
    const wx=Math.sin(th)*Math.cos(ph), wy=Math.cos(th), wz=Math.sin(th)*Math.sin(ph);

    // Apply view matrix (_view() is already the transpose/inverse)
    const yr=this.yaw*Math.PI/180, pr=this.pitch*Math.PI/180;
    const cy=Math.cos(yr),sy=Math.sin(yr),cp=Math.cos(pr),sp=Math.sin(pr);
    // View matrix rows (same as _view columns):
    // row0: [cy,    sp*sy,  -cp*sy]
    // row1: [0,     cp,      sp   ]
    // row2: [sy,   -sp*cy,   cp*cy]
    const vx = cy*wx   + sp*sy*wy  + (-cp*sy)*wz;
    const vy = 0*wx   + cp*wy     + sp*wz;
    const vz = sy*wx  + (-sp*cy)*wy+ cp*cy*wz;

    // Camera looks down -Z (vz must be negative to be in front)
    if(vz>=-0.01) return {visible:false};

    const asp=this.canvas.width/this.canvas.height;
    const f=1/Math.tan(this.fov*Math.PI/360);
    const ndcX=(f/asp)*(vx/-vz);
    const ndcY=f*(vy/-vz);
    if(ndcX<-1.4||ndcX>1.4||ndcY<-1.4||ndcY>1.4) return {visible:false};

    const r=this.canvas.getBoundingClientRect();
    return {
      visible:true,
      x:(ndcX*0.5+0.5)*r.width,
      y:(1-(ndcY*0.5+0.5))*r.height,
      scale:Math.max(0.55,Math.min(1.3,90/this.fov))
    };
  }
}

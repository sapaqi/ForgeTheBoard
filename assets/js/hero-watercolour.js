/* Original painterly reveal inspired by the public Ocarina demo.
 * Uses Three.js + free Motion animate(number, number, { onUpdate }).
 * No Motion+ source, motion/three or threeEffect integration is used.
 */
export async function paintHero({ animate, preference, preview }) {
  const host = document.querySelector('.map-canvas');
  const image = host?.querySelector('.world-image');
  const journey = document.querySelector('.forge-journey');
  const noop = () => {};
  if (!host || !image || preview || preference.matches || scrollY > journey.offsetHeight) return noop;

  let renderer, texture, material, geometry, observer, animation, canvas;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    animation?.stop();
    observer?.disconnect();
    canvas?.remove();
    texture?.dispose();
    material?.dispose();
    geometry?.dispose();
    renderer?.dispose();
    host.dataset.paintState = 'complete';
    host.style.removeProperty('--paint-progress');
  };
  try {
    // Load locally, only when motion is allowed. The HTML image stays underneath.
    const THREE = await import('../vendor/three.module.js');
    await image.decode();
    if (preference.matches || scrollY > journey.offsetHeight) return noop;
    // Never use the CSS-sized DOM image as a texture source. Three's mip level
    // calculation uses image.width: at 4K this exceeds the decoded 1536px width
    // and requests an invalid mip chain, producing an all-black texture.
    texture = await new THREE.TextureLoader().loadAsync(image.currentSrc || image.src);
    if (preference.matches || scrollY > journey.offsetHeight) { dispose(); return noop; }
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0xf5efe2, 1);
    canvas = renderer.domElement;
    canvas.className = 'hero-paint';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', dispose, { once: true });
    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      throw new Error(`Watercolour shader: ${gl.getShaderInfoLog(vertex)} ${gl.getShaderInfoLog(fragment)}`);
    };
    // Raw sRGB samples/output match the HTML image exactly at the final frame.
    const uniforms = {
      uMap: { value: texture }, uProgress: { value: 0 },
      uCover: { value: new THREE.Vector2(1, 1) },
      uPosition: { value: new THREE.Vector2(.62, .54) },
      uTexel: { value: new THREE.Vector2(1 / image.naturalWidth, 1 / image.naturalHeight) }
    };
    material = new THREE.ShaderMaterial({
      uniforms, depthTest: false, depthWrite: false,
      vertexShader: `varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uProgress;
        uniform vec2 uCover, uPosition, uTexel;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
        }
        float paperNoise(vec2 p) {
          return noise(p)*.57+noise(p*2.07)*.28+noise(p*4.13)*.15;
        }
        float inkLuma(vec3 c) { return dot(c,vec3(.299,.587,.114)); }
        void main() {
          vec2 uv=vUv*uCover+(1.0-uCover)*uPosition;
          vec3 color=texture2D(uMap,uv).rgb;
          float l=inkLuma(color);
          // Colour-dodge pencil extraction: local light areas become blank paper,
          // fine contours remain warm burgundy, like the margin illustrations.
          float blur=0.0;
          blur+=inkLuma(texture2D(uMap,uv+uTexel*vec2(3,0)).rgb);
          blur+=inkLuma(texture2D(uMap,uv-uTexel*vec2(3,0)).rgb);
          blur+=inkLuma(texture2D(uMap,uv+uTexel*vec2(0,3)).rgb);
          blur+=inkLuma(texture2D(uMap,uv-uTexel*vec2(0,3)).rgb);
          blur*=.25;
          float edge=clamp((blur-l)*5.2,0.0,.8);
          float grain=hash(uv*vec2(1536,1024));
          vec3 paper=vec3(.9608,.9373,.8863)+(grain-.5)*.024;
          vec3 ink=vec3(.255,.075,.047);
          vec3 sketch=mix(paper,ink,edge*.8);
          // Several overlapping brush passes, feathered by coarse paper fibres.
          // The front spreads over the image, rather than crossfading saturation.
          float fibre=paperNoise(uv*19.0);
          float strokes=sin(uv.y*43.0+noise(uv*7.0)*5.0)*.035;
          // Viewport-normalised travel starts in the visible right-centre,
          // even on ultrawide screens where object-fit crops much of the map.
          float sweep=(1.0-vUv.x)*.64+abs(vUv.y-.5)*.55;
          float front=sweep+(fibre-.5)*.24+strokes;
          float travel=mix(-.02,1.12,uProgress);
          float wet=1.0-smoothstep(travel-.11,travel+.045,front);
          float pigment=1.0-smoothstep(travel-.06,travel+.015,front);
          vec3 wash=mix(sketch,mix(paper,color,.45),wet);
          vec3 painted=mix(wash,color,pigment);
          // Guarantee pixel-exact end colour before handing back to the image.
          painted=mix(painted,color,smoothstep(.93,1.0,uProgress));
          gl_FragColor=vec4(painted,1.0);
        }`
    });
    geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const gl = renderer.getContext();
    const maxBufferSide = Math.min(renderer.capabilities.maxTextureSize, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    let bufferWidth = 0, bufferHeight = 0;
    function draw() {
      if (disposed) return;
      renderer.render(scene, camera);
    }
    function resize() {
      if (disposed) return;
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height) return;
      // The artwork is 1536px wide. Rendering millions of extra fragments on
      // 4K/HiDPI displays adds GPU cost without adding any image detail.
      const ratio = Math.min(devicePixelRatio, innerWidth <= 760 ? 1.25 : 1.5,
        Math.sqrt(1920 * 1080 / (width * height)), maxBufferSide / Math.max(width, height));
      const nextWidth = Math.max(1, Math.floor(width * ratio));
      const nextHeight = Math.max(1, Math.floor(height * ratio));
      if (nextWidth !== bufferWidth || nextHeight !== bufferHeight) {
        renderer.setDrawingBufferSize(width, height, ratio);
        bufferWidth = nextWidth;
        bufferHeight = nextHeight;
      }
      const aspect = width / height, sourceAspect = image.naturalWidth / image.naturalHeight;
      uniforms.uCover.value.set(Math.min(1, aspect / sourceAspect), Math.min(1, sourceAspect / aspect));
      const position = getComputedStyle(image).objectPosition.split(' ').map(parseFloat);
      uniforms.uPosition.value.set(position[0] / 100, 1 - position[1] / 100);
      draw();
    }
    resize(); // Compile/render successfully before covering the fallback image.
    if (disposed) return noop;
    host.append(canvas);
    host.dataset.paintState = 'painting';
    observer = new ResizeObserver(resize);
    observer.observe(host);
    animation = animate(0, 1, {
      duration: innerWidth <= 760 ? 3.2 : 4, ease: [.25, .25, .5, 1],
      onUpdate: progress => {
        if (preference.matches) { dispose(); return; }
        uniforms.uProgress.value = progress;
        host.style.setProperty('--paint-progress', progress.toFixed(3));
        draw();
      },
      onComplete: dispose
    });
    return dispose;
  } catch (error) {
    dispose();
    console.warn('Watercolour: original image remains visible.', error);
    return noop;
  }
}

import * as THREE from 'three';

export class ThreeBubbleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bubbles = [];
    this.rays = null;
    this.ambientBubbles = null;
    this.animId = null;

    this.targetCameraY = 0;
    this.currentCameraY = 0;
    this.scrollVelocity = 0;
    this.lastScrollY = window.scrollY;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020b18, 0.0012);

    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 3000);
    this.camera.position.z = 600;
    this.camera.position.y = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.createBubbleParticles();

    this.createGodRays();

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  createBubbleParticles() {
    const bubbleCount = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(bubbleCount * 3);
    const scales = new Float32Array(bubbleCount);
    const speeds = new Float32Array(bubbleCount);
    const wobbles = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      
      positions[i * 3] = (Math.random() - 0.5) * 1400;     
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4000; 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;  

      scales[i] = Math.random() * 18 + 6;
      speeds[i] = Math.random() * 1.5 + 0.8;
      wobbles[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('wobble', new THREE.BufferAttribute(wobbles, 1));

    const texture = this.createBubbleTexture();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bubbleTexture: { value: texture },
        oceanColor: { value: new THREE.Color(0x38bdf8) }
      },
      vertexShader: `
        attribute float scale;
        attribute float speed;
        attribute float wobble;
        uniform float time;
        varying float vAlpha;

        void main() {
          vec3 pos = position;

          float yOffset = mod(time * speed * 60.0 + pos.y + 2000.0, 4000.0) - 2000.0;
          pos.y = yOffset;

          pos.x += sin(time * 2.0 + wobble) * 15.0;
          pos.z += cos(time * 1.5 + wobble) * 10.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = scale * (600.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = smoothstep(-1500.0, -100.0, mvPosition.z) * (1.0 - smoothstep(1200.0, 1800.0, abs(pos.y)));
        }
      `,
      fragmentShader: `
        uniform sampler2D bubbleTexture;
        uniform vec3 oceanColor;
        varying float vAlpha;

        void main() {
          vec4 texColor = texture2D(bubbleTexture, gl_PointCoord);
          if (texColor.a < 0.05) discard;

          vec3 finalColor = mix(oceanColor, vec3(1.0, 1.0, 1.0), texColor.r * 0.8);
          gl_FragColor = vec4(finalColor, texColor.a * vAlpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.ambientBubbles = new THREE.Points(geometry, material);
    this.scene.add(this.ambientBubbles);
  }

  createBubbleTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;
    const radius = size * 0.44;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    const grad = ctx.createRadialGradient(center, center, radius * 0.5, center, center, radius);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
    grad.addColorStop(0.8, 'rgba(125, 211, 252, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center - radius * 0.35, center - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createGodRays() {
    const rayGroup = new THREE.Group();
    const rayCount = 5;

    for (let i = 0; i < rayCount; i++) {
      const geometry = new THREE.PlaneGeometry(160, 3200);
      const material = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.045,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const ray = new THREE.Mesh(geometry, material);
      ray.position.x = (i - rayCount / 2) * 220;
      ray.position.y = 400;
      ray.position.z = -150 - i * 30;
      ray.rotation.z = 0.12 * (i % 2 === 0 ? 1 : -1);

      rayGroup.add(ray);
    }

    this.rays = rayGroup;
    this.scene.add(rayGroup);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  updateScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const progress = Math.max(0, Math.min(1, scrollY / docHeight));

    this.targetCameraY = (0.5 - progress) * 3200;

    const delta = scrollY - this.lastScrollY;
    this.scrollVelocity = Math.min(Math.max(delta * 0.1, -15), 15);
    this.lastScrollY = scrollY;
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);
    const time = Date.now() * 0.001;

    this.updateScroll();

    const smoothingFactor = 0.06;
    this.currentCameraY += (this.targetCameraY - this.currentCameraY) * smoothingFactor;

    const swayX = Math.sin(time * 0.4) * 12;
    const swayY = Math.cos(time * 0.6) * 8;

    this.camera.position.x = swayX;
    this.camera.position.y = this.currentCameraY + swayY;
    this.camera.lookAt(0, this.currentCameraY, 0);

    if (this.ambientBubbles && this.ambientBubbles.material.uniforms) {
      this.ambientBubbles.material.uniforms.time.value = time;
    }

    if (this.rays) {
      this.rays.children.forEach((ray, i) => {
        ray.rotation.z = Math.sin(time * 0.3 + i) * 0.08;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) this.renderer.dispose();
  }
}

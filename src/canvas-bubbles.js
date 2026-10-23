// Canvas Underwater Ambient Bubbles & Caustic Light Rays
export class UnderwaterCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bubbles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;
    this.animId = null;

    this.resize = this.resize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);

    // Seed bubbles
    const bubbleCount = Math.floor(this.width / 28);
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbles.push(this.createBubble(true));
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  onMouseMove(e) {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;
  }

  createBubble(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20 + Math.random() * 50,
      radius: Math.random() * 5 + 2,
      speed: Math.random() * 1.2 + 0.6,
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      wobbleAmp: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.2,
      highlightOffset: Math.random() * 0.4 + 0.2
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Render Caustic Light Beams piercing down
    this.drawGodRays();

    // Render Bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.angle += b.wobbleSpeed;
      b.y -= b.speed;
      b.x += Math.sin(b.angle) * b.wobbleAmp;

      // Mouse displacement
      const dx = b.x - this.mouseX;
      const dy = b.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        b.x += (dx / dist) * force * 3;
      }

      // Draw bubble body
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(180, 230, 255, ${b.opacity * 0.15})`;
      this.ctx.fill();

      // Draw bubble rim
      this.ctx.strokeStyle = `rgba(220, 245, 255, ${b.opacity * 0.5})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Highlight gleam
      this.ctx.beginPath();
      this.ctx.arc(
        b.x - b.radius * 0.35,
        b.y - b.radius * 0.35,
        b.radius * 0.28,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
      this.ctx.fill();

      // Reset when off top
      if (b.y < -30) {
        this.bubbles[i] = this.createBubble(false);
      }
    }

    this.animId = requestAnimationFrame(this.animate);
  }

  drawGodRays() {
    const time = Date.now() * 0.0006;
    const rayCount = 4;
    for (let i = 0; i < rayCount; i++) {
      const offset = (i / rayCount) * this.width;
      const sway = Math.sin(time + i * 1.5) * 40;
      const startX = offset + sway;
      const endX = startX + (i % 2 === 0 ? 120 : -100);

      const grad = this.ctx.createLinearGradient(startX, 0, endX, this.height);
      grad.addColorStop(0, 'rgba(125, 211, 252, 0.05)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.02)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      this.ctx.beginPath();
      this.ctx.moveTo(startX - 30, 0);
      this.ctx.lineTo(startX + 30, 0);
      this.ctx.lineTo(endX + 80, this.height);
      this.ctx.lineTo(endX - 80, this.height);
      this.ctx.closePath();
      this.ctx.fillStyle = grad;
      this.ctx.fill();
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}

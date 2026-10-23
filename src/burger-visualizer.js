import { CANON_LAYERS } from './layers-data.js';
import { sound } from './audio.js';

export class BurgerVisualizer {
  constructor(containerId, infoPanelId) {
    this.container = document.getElementById(containerId);
    this.infoPanel = document.getElementById(infoPanelId);
    this.layers = [...CANON_LAYERS]; 
    this.separation = 0; 
    this.selectedLayer = null;
    this.isFlipped = false;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
    
    this.selectLayer('patty');
  }

  render() {
    this.container.innerHTML = `
      <div class="burger-stage">
        <div class="burger-stack" id="burger-stack">
          ${this.layers.map((layer, index) => {
            return `
              <div class="layer-item ${layer.id}" data-id="${layer.id}" data-index="${index}">
                <div class="layer-graphic ${layer.id}-graphic">
                  ${this.getLayerSVG(layer.id)}
                </div>
                <div class="layer-tag">
                  <span class="layer-number">${this.layers.length - index}</span>
                  <span class="layer-title">${layer.name.split(' (')[0]}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    this.updateSeparation(this.separation);
  }

  getLayerSVG(id) {
    switch (id) {
      case 'top-bun':
        return `
          <svg viewBox="0 0 320 100" class="layer-svg">
            <defs>
              <linearGradient id="topBunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f59e0b"/>
                <stop offset="40%" stop-color="#d97706"/>
                <stop offset="100%" stop-color="#92400e"/>
              </linearGradient>
              <filter id="bunGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.4)"/>
              </filter>
            </defs>
            <path d="M 20 90 C 20 20, 300 20, 300 90 C 300 96, 20 96, 20 90 Z" fill="url(#topBunGrad)" filter="url(#bunGlow)" />
            <!-- Sesame seeds -->
            <ellipse cx="80" cy="45" rx="4" ry="2" fill="#fef3c7" transform="rotate(-15, 80, 45)"/>
            <ellipse cx="120" cy="35" rx="4" ry="2" fill="#fef3c7" transform="rotate(10, 120, 35)"/>
            <ellipse cx="160" cy="30" rx="4" ry="2" fill="#fef3c7" transform="rotate(-5, 160, 30)"/>
            <ellipse cx="200" cy="38" rx="4" ry="2" fill="#fef3c7" transform="rotate(20, 200, 38)"/>
            <ellipse cx="240" cy="50" rx="4" ry="2" fill="#fef3c7" transform="rotate(-10, 240, 50)"/>
            <ellipse cx="100" cy="65" rx="4" ry="2" fill="#fef3c7" transform="rotate(25, 100, 65)"/>
            <ellipse cx="150" cy="55" rx="4" ry="2" fill="#fef3c7" transform="rotate(-20, 150, 55)"/>
            <ellipse cx="190" cy="60" rx="4" ry="2" fill="#fef3c7" transform="rotate(15, 190, 60)"/>
            <ellipse cx="230" cy="70" rx="4" ry="2" fill="#fef3c7" transform="rotate(-5, 230, 70)"/>
            <!-- Golden highlight -->
            <path d="M 50 40 C 90 25, 230 25, 270 40" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round" fill="none"/>
          </svg>
        `;
      case 'ketchup-mustard':
        return `
          <svg viewBox="0 0 320 40" class="layer-svg">
            <!-- Mustard spiral -->
            <path d="M 50 15 Q 80 5, 120 18 T 190 12 T 260 20" stroke="#eab308" stroke-width="8" stroke-linecap="round" fill="none"/>
            <!-- Ketchup spiral -->
            <path d="M 40 22 Q 95 30, 140 16 T 220 25 T 275 14" stroke="#dc2626" stroke-width="9" stroke-linecap="round" fill="none"/>
          </svg>
        `;
      case 'tomato':
        return `
          <svg viewBox="0 0 320 45" class="layer-svg">
            <ellipse cx="160" cy="22" rx="135" ry="18" fill="#dc2626"/>
            <ellipse cx="160" cy="20" rx="130" ry="15" fill="#ef4444"/>
            <ellipse cx="120" cy="20" rx="25" ry="8" fill="#b91c1c"/>
            <ellipse cx="200" cy="20" rx="25" ry="8" fill="#b91c1c"/>
            <circle cx="120" cy="20" r="3" fill="#fef08a"/>
            <circle cx="200" cy="20" r="3" fill="#fef08a"/>
          </svg>
        `;
      case 'cheese':
        return `
          <svg viewBox="0 0 320 45" class="layer-svg">
            <polygon points="30,12 160,2 290,12 250,38 180,44 140,40 70,36" fill="#f59e0b"/>
            <!-- Melted drip -->
            <path d="M 70 36 C 70 48, 85 48, 85 36 Z" fill="#fbbf24"/>
            <path d="M 230 36 C 230 46, 245 46, 245 36 Z" fill="#fbbf24"/>
            <polygon points="40,14 160,5 280,14 240,34 180,38 140,36 80,32" fill="#fbbf24" opacity="0.6"/>
          </svg>
        `;
      case 'lettuce':
        return `
          <svg viewBox="0 0 320 50" class="layer-svg">
            <path d="M 25 25 Q 40 5, 65 20 Q 90 2, 120 18 Q 150 5, 175 22 Q 210 4, 240 19 Q 275 6, 295 25 Q 260 42, 210 35 Q 160 45, 110 36 Q 60 44, 25 25 Z" fill="#15803d"/>
            <path d="M 35 22 Q 50 10, 75 18 Q 100 8, 130 16 Q 160 10, 185 20 Q 220 9, 250 17 Q 280 12, 285 22" stroke="#4ade80" stroke-width="3" fill="none" opacity="0.8"/>
          </svg>
        `;
      case 'onions':
        return `
          <svg viewBox="0 0 320 30" class="layer-svg">
            <rect x="70" y="8" width="22" height="12" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <rect x="110" y="10" width="28" height="14" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
            <rect x="155" y="6" width="20" height="12" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
            <rect x="195" y="11" width="26" height="13" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <rect x="235" y="7" width="22" height="11" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
          </svg>
        `;
      case 'pickles':
        return `
          <svg viewBox="0 0 320 40" class="layer-svg">
            <!-- Left pickle disc -->
            <ellipse cx="110" cy="20" rx="36" ry="16" fill="#166534" stroke="#15803d" stroke-width="3"/>
            <ellipse cx="110" cy="20" rx="26" ry="10" fill="#14532d"/>
            <circle cx="102" cy="18" r="2" fill="#86efac"/>
            <circle cx="118" cy="21" r="2" fill="#86efac"/>
            <!-- Right pickle disc -->
            <ellipse cx="205" cy="20" rx="36" ry="16" fill="#166534" stroke="#15803d" stroke-width="3"/>
            <ellipse cx="205" cy="20" rx="26" ry="10" fill="#14532d"/>
            <circle cx="196" cy="19" r="2" fill="#86efac"/>
            <circle cx="214" cy="22" r="2" fill="#86efac"/>
          </svg>
        `;
      case 'patty':
        return `
          <svg viewBox="0 0 320 75" class="layer-svg">
            <defs>
              <linearGradient id="pattyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#78350f"/>
                <stop offset="30%" stop-color="#451a03"/>
                <stop offset="70%" stop-color="#3f1d0b"/>
                <stop offset="100%" stop-color="#1f0e05"/>
              </linearGradient>
              <filter id="pattyShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="rgba(0,0,0,0.6)"/>
              </filter>
            </defs>
            <rect x="25" y="10" width="270" height="52" rx="26" fill="url(#pattyGrad)" filter="url(#pattyShadow)"/>
            <!-- Searing grill lines -->
            <path d="M 60 16 L 90 56 M 110 16 L 140 56 M 160 16 L 190 56 M 210 16 L 240 56" stroke="rgba(20, 8, 3, 0.85)" stroke-width="5" stroke-linecap="round"/>
            <!-- Golden sizzle highlights -->
            <path d="M 75 16 C 120 12, 190 12, 245 16" stroke="rgba(245, 158, 11, 0.5)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="85" cy="30" r="3" fill="#f59e0b" opacity="0.6"/>
            <circle cx="170" cy="35" r="2.5" fill="#f59e0b" opacity="0.7"/>
            <circle cx="230" cy="28" r="3" fill="#f59e0b" opacity="0.5"/>
          </svg>
        `;
      case 'bottom-bun':
        return `
          <svg viewBox="0 0 320 60" class="layer-svg">
            <defs>
              <linearGradient id="bottomBunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#d97706"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>
            </defs>
            <rect x="28" y="10" width="264" height="42" rx="20" fill="url(#bottomBunGrad)"/>
            <!-- Crust rim -->
            <path d="M 38 42 C 90 52, 230 52, 282 42" stroke="rgba(69, 26, 3, 0.6)" stroke-width="4" stroke-linecap="round" fill="none"/>
          </svg>
        `;
      default:
        return '';
    }
  }

  updateSeparation(val) {
    this.separation = Math.max(0, Math.min(1, val));
    const items = this.container.querySelectorAll('.layer-item');
    const total = items.length;
    const maxSpacing = 52; 

    items.forEach((item, idx) => {
      
      const center = (total - 1) / 2;
      const offsetMultiplier = (idx - center);
      const translateY = offsetMultiplier * (this.separation * maxSpacing);
      const isSelected = item.getAttribute('data-id') === this.selectedLayer;

      const rotateX = 12 * (1 - this.separation * 0.3);
      const scale = isSelected ? 1.05 : 1;

      item.style.transform = `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`;
      
      const tag = item.querySelector('.layer-tag');
      if (tag) {
        tag.style.opacity = this.separation > 0.15 ? '1' : '0';
        tag.style.pointerEvents = this.separation > 0.15 ? 'auto' : 'none';
      }
    });
  }

  selectLayer(id) {
    this.selectedLayer = id;
    const items = this.container.querySelectorAll('.layer-item');
    items.forEach(item => {
      if (item.getAttribute('data-id') === id) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    const data = this.layers.find(l => l.id === id);
    if (!data || !this.infoPanel) return;

    this.infoPanel.innerHTML = `
      <div class="layer-dossier-card">
        <div class="dossier-header">
          <div class="badge-canon">CANONICAL STRATUM</div>
          <div class="stratum-rank">Order Position: #${this.getLayerOrder(id)} of 9</div>
        </div>
        <h3 class="dossier-title">${data.name}</h3>
        <p class="dossier-role"><strong>Role:</strong> ${data.role}</p>
        <p class="dossier-desc">${data.description}</p>
        
        <div class="dossier-footer">
          <div class="canon-ref">
            <span class="icon-book">📜</span>
            <span><strong>Source Verification:</strong> ${data.canonicalSource}</span>
          </div>
          <div class="canon-detail">
            <span>🔬 <em>${data.details}</em></span>
          </div>
        </div>
      </div>
    `;

    this.updateSeparation(this.separation);
  }

  getLayerOrder(id) {
    const canonicalOrder = [
      'bottom-bun',
      'patty',
      'ketchup-mustard',
      'pickles',
      'onions',
      'lettuce',
      'cheese',
      'tomato',
      'top-bun'
    ];
    return canonicalOrder.indexOf(id) + 1;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.layer-item');
      if (item) {
        const id = item.getAttribute('data-id');
        this.selectLayer(id);
        sound.playSpatulaClink();
      }
    });
  }

  flipPatty() {
    const pattyItem = this.container.querySelector('.layer-item.patty');
    if (!pattyItem) return;
    this.isFlipped = !this.isFlipped;
    sound.playSpatulaClink();
    pattyItem.classList.add('flipping');
    setTimeout(() => {
      pattyItem.classList.remove('flipping');
    }, 600);
  }
}

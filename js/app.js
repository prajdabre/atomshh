import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { ELEMENTS, ELEMENTS_BY_Z, CATEGORIES, CRYSTAL_SYSTEMS } from './data/elements.js';
import { PeriodicTable3DVisualizer } from './visualizers/periodicTable3D.js';
import { BohrModel3DVisualizer } from './visualizers/bohrModel3D.js';
import { QuantumOrbital3DVisualizer, ORBITAL_LABELS } from './visualizers/quantumOrbital3D.js';
import { CrystalLattice3DVisualizer } from './visualizers/crystalLattice3D.js';
import { clamp } from './utils/threeHelpers.js';

const SHELL_LETTERS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

class AtomshhApp {
  constructor() {
    this.state = {
      mode: 'bohr', // 'table' | 'bohr' | 'orbital' | 'crystal'
      selectedZ: 26, // Iron default
      autoRotate: false
    };

    this.dom = {
      container: document.getElementById('webgl-container'),
      stage: document.getElementById('canvas-stage'),
      modeTabs: Array.from(document.querySelectorAll('.mode-tab')),
      modeControls: document.getElementById('mode-controls'),
      pill: document.getElementById('active-element-pill'),
      searchInput: document.getElementById('element-search'),
      searchResults: document.getElementById('search-results'),
      btnPrev: document.getElementById('btn-prev-el'),
      btnNext: document.getElementById('btn-next-el'),
      btnAutoRotate: document.getElementById('btn-autorotate'),
      btnResetView: document.getElementById('btn-reset-view'),
      hoverTooltip: document.getElementById('hover-tooltip'),
      miniDock: document.getElementById('mini-table-dock'),
      miniGrid: document.getElementById('mini-table-grid'),
      btnToggleDock: document.getElementById('btn-toggle-dock'),
      inspectorHero: document.getElementById('inspector-hero'),
      inspectorQuick3D: document.getElementById('inspector-quick-3d'),
      inspectorShells: document.getElementById('inspector-shells'),
      inspectorProps: document.getElementById('inspector-props'),
      inspectorCrystal: document.getElementById('inspector-crystal'),
      inspectorSummary: document.getElementById('inspector-summary')
    };

    this.cameraTween = null;
    this.pointer = new THREE.Vector2(-99, -99);
    this.pointerDownPos = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.hoveredElement = null;

    this._initThree();
    this._initVisualizers();
    this._buildMiniPeriodicTable();
    this._bindEvents();

    // Initial selection & UI render
    this.selectElement(this.state.selectedZ, { applyCamera: false });
    this.setMode('bohr', { resetCam: true });
    this._animate();
  }

  _initThree() {
    const width = this.dom.container.clientWidth || window.innerWidth - 332;
    const height = this.dom.container.clientHeight || window.innerHeight - 60;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#050814');

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 250);
    this.camera.position.set(0, 0.5, 27);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.dom.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 75;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.9;

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.72);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(14, 22, 18);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    fillLight.position.set(-16, -8, 12);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.5);
    rimLight.position.set(0, 12, -20);
    this.scene.add(rimLight);

    // Subtle deep-space particle field
    this._buildStarfield();

    // Post-processing subtle bloom
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.28, 0.45, 0.78);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    this.clock = new THREE.Clock();
  }

  _buildStarfield() {
    const count = 900;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 38 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.14,
      transparent: true,
      opacity: 0.45
    });
    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  _initVisualizers() {
    this.visualizers = {
      table: new PeriodicTable3DVisualizer(),
      bohr: new BohrModel3DVisualizer(),
      orbital: new QuantumOrbital3DVisualizer(),
      crystal: new CrystalLattice3DVisualizer()
    };

    for (const [key, vis] of Object.entries(this.visualizers)) {
      vis.group.visible = key === this.state.mode;
      this.scene.add(vis.group);
    }
  }

  _buildMiniPeriodicTable() {
    const grid = this.dom.miniGrid;
    grid.innerHTML = '';

    // f-block reference markers on rows 6 and 7, column 3
    for (const [row, label] of [[6, '57-71'], [7, '89-103']]) {
      const marker = document.createElement('div');
      marker.className = 'mini-f-marker';
      marker.textContent = label;
      marker.style.gridColumn = '3';
      marker.style.gridRow = String(row);
      grid.appendChild(marker);
    }

    for (const el of ELEMENTS) {
      const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'mini-cell';
      cell.dataset.z = String(el.z);
      cell.title = `#${el.z} ${el.name} (${el.symbol})`;
      cell.style.gridColumn = String(el.col);
      cell.style.gridRow = String(el.row);
      cell.style.borderColor = `${cat.color}88`;
      cell.style.background = cat.bg;
      cell.textContent = el.symbol;
      cell.addEventListener('click', () => {
        this.selectElement(el.z);
      });
      grid.appendChild(cell);
    }
  }

  _bindEvents() {
    // Mode Tabs
    this.dom.modeTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode, { resetCam: true });
      });
    });

    // Prev / Next Element
    this.dom.btnPrev.addEventListener('click', () => {
      const nextZ = this.state.selectedZ > 1 ? this.state.selectedZ - 1 : 118;
      this.selectElement(nextZ);
    });
    this.dom.btnNext.addEventListener('click', () => {
      const nextZ = this.state.selectedZ < 118 ? this.state.selectedZ + 1 : 1;
      this.selectElement(nextZ);
    });

    // Auto-Rotate & Reset Camera
    this.dom.btnAutoRotate.addEventListener('click', () => {
      this.state.autoRotate = !this.state.autoRotate;
      this.controls.autoRotate = this.state.autoRotate;
      this.dom.btnAutoRotate.classList.toggle('active', this.state.autoRotate);
    });

    this.dom.btnResetView.addEventListener('click', () => {
      this._flyToPreset(this.getActiveCameraPreset());
    });

    // Mini table dock toggle
    this.dom.btnToggleDock.addEventListener('click', () => {
      const collapsed = this.dom.miniDock.classList.toggle('collapsed');
      this.dom.btnToggleDock.textContent = collapsed
        ? 'Show Periodic Table ▲'
        : 'Hide Periodic Table ▼';
    });

    // Search input
    this.dom.searchInput.addEventListener('input', () => {
      this._handleSearchInput();
    });
    this.dom.searchInput.addEventListener('focus', () => {
      this._handleSearchInput();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) {
        this.dom.searchResults.classList.add('hidden');
      }
    });

    // Pointer hover & click on 3D Periodic Table
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.cameraTween = null; // user grabbed camera
    });
    canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
    canvas.addEventListener('dblclick', (e) => this._onDoubleClick(e));
    canvas.addEventListener('pointerleave', () => {
      this.visualizers.table.setHoveredZ(null);
      this.dom.hoverTooltip.classList.add('hidden');
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target === this.dom.searchInput) {
        if (e.key === 'Escape') {
          this.dom.searchInput.blur();
          this.dom.searchResults.classList.add('hidden');
        } else if (e.key === 'Enter') {
          const first = this.dom.searchResults.querySelector('.search-item');
          if (first) first.click();
        }
        return;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.key === '1') this.setMode('table', { resetCam: true });
      else if (e.key === '2') this.setMode('bohr', { resetCam: true });
      else if (e.key === '3') this.setMode('orbital', { resetCam: true });
      else if (e.key === '4') this.setMode('crystal', { resetCam: true });
      else if (e.key === '/') {
        e.preventDefault();
        this.dom.searchInput.focus();
      } else if (e.key === 'ArrowLeft') {
        const nextZ = this.state.selectedZ > 1 ? this.state.selectedZ - 1 : 118;
        this.selectElement(nextZ);
      } else if (e.key === 'ArrowRight') {
        const nextZ = this.state.selectedZ < 118 ? this.state.selectedZ + 1 : 1;
        this.selectElement(nextZ);
      }
    });

    // Resize observer
    const ro = new ResizeObserver(() => this._onResize());
    ro.observe(this.dom.stage);
  }

  _handleSearchInput() {
    const raw = this.dom.searchInput.value.trim();
    const q = raw.toLowerCase();

    if (this.state.mode === 'table') {
      this.visualizers.table.setFilter({ search: raw });
    }

    if (!q) {
      this.dom.searchResults.classList.add('hidden');
      return;
    }

    const matches = ELEMENTS.filter((el) =>
      String(el.z) === q
      || el.symbol.toLowerCase().startsWith(q)
      || el.name.toLowerCase().includes(q)
    ).slice(0, 10);

    if (matches.length === 0) {
      this.dom.searchResults.classList.add('hidden');
      return;
    }

    this.dom.searchResults.innerHTML = '';
    for (const el of matches) {
      const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <div class="search-item-left">
          <span class="search-z">#${el.z}</span>
          <span class="search-sym" style="color:${cat.color}">${el.symbol}</span>
          <span>${el.name}</span>
        </div>
        <span style="font-size:11px;color:#94a3b8">${cat.name}</span>
      `;
      item.addEventListener('click', () => {
        this.selectElement(el.z);
        this.dom.searchResults.classList.add('hidden');
      });
      this.dom.searchResults.appendChild(item);
    }
    this.dom.searchResults.classList.remove('hidden');
  }

  _updateRayPointer(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    return rect;
  }

  _onPointerMove(e) {
    if (this.state.mode !== 'table') {
      this.dom.hoverTooltip.classList.add('hidden');
      return;
    }
    const rect = this._updateRayPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.visualizers.table.pick(this.raycaster);

    if (hit) {
      const el = hit.element;
      this.hoveredElement = el;
      this.visualizers.table.setHoveredZ(el.z);
      this.renderer.domElement.style.cursor = 'pointer';

      const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
      this.dom.hoverTooltip.innerHTML = `
        <div class="tooltip-top">
          <span>#${el.z} · ${el.block.toUpperCase()}-block</span>
          <span style="color:${cat.glow}">${cat.name}</span>
        </div>
        <div class="tooltip-main">${el.symbol} — ${el.name}</div>
        <div class="tooltip-sub">Mass ${el.mass} u · Double-click for Bohr 3D</div>
      `;
      const left = clamp(e.clientX - rect.left + 16, 12, rect.width - 185);
      const top = clamp(e.clientY - rect.top - 16, 12, rect.height - 90);
      this.dom.hoverTooltip.style.left = `${left}px`;
      this.dom.hoverTooltip.style.top = `${top}px`;
      this.dom.hoverTooltip.classList.remove('hidden');
    } else {
      this.hoveredElement = null;
      this.visualizers.table.setHoveredZ(null);
      this.renderer.domElement.style.cursor = 'grab';
      this.dom.hoverTooltip.classList.add('hidden');
    }
  }

  _onPointerUp(e) {
    if (this.state.mode !== 'table') return;
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    if (Math.hypot(dx, dy) > 6) return; // dragged camera

    this._updateRayPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.visualizers.table.pick(this.raycaster);
    if (hit) {
      this.selectElement(hit.element.z);
    }
  }

  _onDoubleClick(e) {
    if (this.state.mode !== 'table') return;
    this._updateRayPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.visualizers.table.pick(this.raycaster);
    if (hit) {
      this.selectElement(hit.element.z);
      this.setMode('bohr', { resetCam: true });
    }
  }

  selectElement(z, { applyCamera = false } = {}) {
    const el = ELEMENTS_BY_Z.get(z);
    if (!el) return;
    this.state.selectedZ = el.z;

    this.visualizers.table.setSelectedZ(el.z);
    this.visualizers.bohr.setElement(el);
    this.visualizers.orbital.setElement(el);
    this.visualizers.crystal.setElement(el);

    this._renderHeaderPill(el);
    this._renderInspector(el);
    this._renderModeControls();

    // Update mini table highlight
    this.dom.miniGrid.querySelectorAll('.mini-cell').forEach((cell) => {
      cell.classList.toggle('active', Number(cell.dataset.z) === el.z);
    });

    if (applyCamera) {
      this._flyToPreset(this.getActiveCameraPreset());
    }
  }

  setMode(mode, { resetCam = true } = {}) {
    if (!this.visualizers[mode]) return;
    this.state.mode = mode;

    for (const [key, vis] of Object.entries(this.visualizers)) {
      vis.group.visible = key === mode;
    }

    this.dom.modeTabs.forEach((tab) => {
      const isAct = tab.dataset.mode === mode;
      tab.classList.toggle('active', isAct);
      tab.setAttribute('aria-selected', String(isAct));
    });

    // Clear table tooltip if leaving table mode
    if (mode !== 'table') {
      this.dom.hoverTooltip.classList.add('hidden');
      this.renderer.domElement.style.cursor = 'grab';
    }

    // Show mini periodic table dock automatically in single-element modes (keep collapsible)
    this.dom.miniDock.classList.toggle('hidden', mode === 'table');

    const el = ELEMENTS_BY_Z.get(this.state.selectedZ);
    this._renderInspector(el);
    this._renderModeControls();

    if (resetCam) {
      this._flyToPreset(this.getActiveCameraPreset());
    }
  }

  getActiveCameraPreset() {
    return this.visualizers[this.state.mode].getCameraPreset();
  }

  _flyToPreset(preset) {
    if (!preset) return;
    this.cameraTween = {
      startPos: this.camera.position.clone(),
      endPos: preset.position.clone(),
      startTarget: this.controls.target.clone(),
      endTarget: preset.target.clone(),
      progress: 0
    };
  }

  _renderHeaderPill(el) {
    const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
    this.dom.pill.style.borderColor = `${cat.color}88`;
    this.dom.pill.innerHTML = `
      <span class="pill-z">#${el.z}</span>
      <strong class="pill-sym" style="color:${cat.glow}">${el.symbol}</strong>
      <span class="pill-name">${el.name}</span>
    `;
  }

  _renderModeControls() {
    const container = this.dom.modeControls;
    const mode = this.state.mode;
    const el = ELEMENTS_BY_Z.get(this.state.selectedZ);
    container.innerHTML = '';

    if (mode === 'table') {
      const vis = this.visualizers.table;
      const row1 = document.createElement('div');
      row1.className = 'ctrl-row';
      row1.innerHTML = `<span class="ctrl-label">3D Layout</span>`;

      const layouts = [
        ['table', '3D Table'],
        ['bars', 'Property Bars'],
        ['helix', 'Helix Spiral'],
        ['sphere', 'Sphere']
      ];
      for (const [id, label] of layouts) {
        const b = this._makeBtn(label, vis.layout === id, () => {
          vis.setLayout(id);
          this._renderModeControls();
          this._flyToPreset(vis.getCameraPreset(id));
        });
        row1.appendChild(b);
      }
      container.appendChild(row1);

      if (vis.layout === 'bars') {
        const rowProp = document.createElement('div');
        rowProp.className = 'ctrl-row';
        rowProp.innerHTML = `<span class="ctrl-label">Elevation</span>`;
        const props = [
          ['radius', 'Atomic Radius'],
          ['electronegativity', 'Electronegativity'],
          ['ionization', 'Ionization'],
          ['density', 'Density'],
          ['melt', 'Melting Pt'],
          ['mass', 'Mass']
        ];
        for (const [id, label] of props) {
          rowProp.appendChild(this._makeBtn(label, vis.barProperty === id, () => {
            vis.setBarProperty(id);
            this._renderModeControls();
          }));
        }
        container.appendChild(rowProp);
      }

      const row2 = document.createElement('div');
      row2.className = 'ctrl-row';
      row2.innerHTML = `<span class="ctrl-label">Block</span>`;
      for (const blk of ['all', 's', 'p', 'd', 'f']) {
        row2.appendChild(this._makeBtn(blk === 'all' ? 'All' : `${blk}`, vis.filter.block === blk, () => {
          vis.setFilter({ block: blk });
          this._renderModeControls();
        }));
      }

      const catSelect = document.createElement('select');
      catSelect.className = 'ctrl-select';
      catSelect.setAttribute('aria-label', 'Filter by Element Category');
      const optAll = document.createElement('option');
      optAll.value = 'all';
      optAll.textContent = 'All Categories';
      catSelect.appendChild(optAll);
      for (const [key, meta] of Object.entries(CATEGORIES)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = meta.name;
        if (vis.filter.category === key) opt.selected = true;
        catSelect.appendChild(opt);
      }
      catSelect.addEventListener('change', () => {
        vis.setFilter({ category: catSelect.value });
      });
      row2.appendChild(catSelect);
      container.appendChild(row2);
    } else if (mode === 'bohr') {
      const vis = this.visualizers.bohr;
      const row1 = document.createElement('div');
      row1.className = 'ctrl-row';
      row1.innerHTML = `<span class="ctrl-label">Orbits</span>`;
      row1.appendChild(this._makeBtn('3D Tilted', vis.orbitMode === '3d-tilted', () => {
        vis.setOrbitMode('3d-tilted');
        this._renderModeControls();
        this._flyToPreset(vis.getCameraPreset('atom'));
      }));
      row1.appendChild(this._makeBtn('Coplanar Rings', vis.orbitMode === 'coplanar', () => {
        vis.setOrbitMode('coplanar');
        this._renderModeControls();
        this._flyToPreset(vis.getCameraPreset('atom'));
      }));
      row1.appendChild(this._makeBtn('Valence Glow', vis.highlightValence, () => {
        vis.setHighlightValence(!vis.highlightValence);
        this._renderModeControls();
      }));
      row1.appendChild(this._makeBtn('Shell Labels', vis.showLabels, () => {
        vis.setShowLabels(!vis.showLabels);
        this._renderModeControls();
      }));
      row1.appendChild(this._makeBtn('Zoom Nucleus', false, () => {
        this._flyToPreset(vis.getCameraPreset('nucleus'));
      }));
      container.appendChild(row1);

      const row2 = document.createElement('div');
      row2.className = 'ctrl-row';
      row2.innerHTML = `<span class="ctrl-label">Speed (${vis.speed.toFixed(1)}×)</span>`;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '3';
      slider.step = '0.25';
      slider.value = String(vis.speed);
      slider.className = 'ctrl-slider';
      slider.addEventListener('input', () => {
        vis.setSpeed(parseFloat(slider.value));
        row2.querySelector('.ctrl-label').textContent = `Speed (${vis.speed.toFixed(1)}×)`;
      });
      row2.appendChild(slider);

      const badge = document.createElement('span');
      badge.className = 'ctrl-badge';
      badge.textContent = `Nucleus: ${el.z}p⁺ / ${el.neutrons}n⁰ · Shells: [${el.shells.join(', ')}]`;
      row2.appendChild(badge);
      container.appendChild(row2);
    } else if (mode === 'orbital') {
      const vis = this.visualizers.orbital;
      const row1 = document.createElement('div');
      row1.className = 'ctrl-row';
      row1.innerHTML = `<span class="ctrl-label">Subshell</span>`;

      for (const sub of el.subshells) {
        const active = vis.subshell.label === sub.label;
        row1.appendChild(this._makeBtn(`${sub.label} (${sub.count})`, active, () => {
          vis.setSubshell(sub);
          this._renderModeControls();
        }));
      }
      container.appendChild(row1);

      const row2 = document.createElement('div');
      row2.className = 'ctrl-row';
      row2.innerHTML = `<span class="ctrl-label">Orbital m</span>`;
      const mList = ORBITAL_LABELS[vis.subshell.l] || ORBITAL_LABELS[0];
      for (const opt of mList) {
        row2.appendChild(this._makeBtn(opt.name, vis.m === opt.m, () => {
          vis.setM(opt.m);
          this._renderModeControls();
        }));
      }
      if (vis.subshell.l > 0) {
        row2.appendChild(this._makeBtn('Composite (All m)', vis.m === 'all', () => {
          vis.setM('all');
          this._renderModeControls();
        }));
      }
      container.appendChild(row2);

      const row3 = document.createElement('div');
      row3.className = 'ctrl-row';
      row3.innerHTML = `<span class="ctrl-label">Render</span>`;
      row3.appendChild(this._makeBtn('Probability Cloud', vis.renderMode === 'cloud', () => {
        vis.setRenderMode('cloud');
        this._renderModeControls();
      }));
      row3.appendChild(this._makeBtn('Harmonic Lobes', vis.renderMode === 'surface', () => {
        vis.setRenderMode('surface');
        this._renderModeControls();
      }));
      row3.appendChild(this._makeBtn('Cross-Section Slice', vis.crossSection, () => {
        vis.setCrossSection(!vis.crossSection);
        this._renderModeControls();
      }));
      row3.appendChild(this._makeBtn('Axes', vis.showAxes, () => {
        vis.setShowAxes(!vis.showAxes);
        this._renderModeControls();
      }));

      const legend = document.createElement('span');
      legend.className = 'phase-legend';
      legend.innerHTML = `
        <span><i class="legend-dot" style="background:#22d3ee"></i>+ψ</span>
        <span><i class="legend-dot" style="background:#f43f5e"></i>−ψ</span>
      `;
      row3.appendChild(legend);
      container.appendChild(row3);
    } else if (mode === 'crystal') {
      const vis = this.visualizers.crystal;
      const sys = CRYSTAL_SYSTEMS[el.crystal.type] || CRYSTAL_SYSTEMS.fcc;

      const row1 = document.createElement('div');
      row1.className = 'ctrl-row';
      row1.innerHTML = `<span class="ctrl-label">Supercell</span>`;
      for (const n of [1, 2, 3]) {
        row1.appendChild(this._makeBtn(`${n}×${n}×${n}`, vis.supercell === n, () => {
          vis.setSupercell(n);
          this._renderModeControls();
          this._flyToPreset(vis.getCameraPreset());
        }));
      }

      row1.appendChild(this._makeBtn('Bonds', vis.showBonds, () => {
        vis.setShowBonds(!vis.showBonds);
        this._renderModeControls();
      }));
      row1.appendChild(this._makeBtn('Unit Cell', vis.showUnitCell, () => {
        vis.setShowUnitCell(!vis.showUnitCell);
        this._renderModeControls();
      }));
      container.appendChild(row1);

      const row2 = document.createElement('div');
      row2.className = 'ctrl-row';
      row2.innerHTML = `<span class="ctrl-label">Style</span>`;
      for (const [id, label] of [
        ['ball-and-stick', 'Ball & Stick'],
        ['space-filling', 'Space-Filling'],
        ['polyhedra', 'Coordination']
      ]) {
        row2.appendChild(this._makeBtn(label, vis.style === id, () => {
          vis.setStyle(id);
          this._renderModeControls();
        }));
      }

      const badge = document.createElement('span');
      badge.className = 'ctrl-badge';
      badge.textContent = `${sys.short} · Coord ${sys.coordination} · APF ${sys.apf}`;
      row2.appendChild(badge);
      container.appendChild(row2);
    }
  }

  _makeBtn(label, isActive, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `ctrl-btn${isActive ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  _renderInspector(el) {
    if (!el) return;
    const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
    const sys = CRYSTAL_SYSTEMS[el.crystal.type] || CRYSTAL_SYSTEMS.fcc;

    this.dom.inspectorHero.style.borderColor = `${cat.color}66`;
    this.dom.inspectorHero.innerHTML = `
      <div class="hero-top">
        <span class="hero-z">Atomic #${el.z}</span>
        <span class="hero-phase">${el.phase}</span>
      </div>
      <div class="hero-main">
        <div class="hero-symbol" style="color:${cat.glow}">${el.symbol}</div>
        <div class="hero-name-wrap">
          <div class="hero-name">${el.name}</div>
          <div class="hero-cat" style="color:${cat.color}">${cat.name}</div>
        </div>
      </div>
      <div class="hero-mass">
        <span>Mass: <strong>${el.mass} u</strong></span>
        <span>${el.year ? `Discovered ${el.year}` : 'Ancient'}</span>
      </div>
    `;

    this.dom.inspectorQuick3D.innerHTML = `
      <button type="button" class="quick-3d-btn${this.state.mode === 'bohr' ? ' active' : ''}" data-jump="bohr">Bohr 3D</button>
      <button type="button" class="quick-3d-btn${this.state.mode === 'orbital' ? ' active' : ''}" data-jump="orbital">Orbitals 3D</button>
      <button type="button" class="quick-3d-btn${this.state.mode === 'crystal' ? ' active' : ''}" data-jump="crystal">Crystal 3D</button>
    `;
    this.dom.inspectorQuick3D.querySelectorAll('.quick-3d-btn').forEach((b) => {
      b.addEventListener('click', () => {
        this.setMode(b.dataset.jump, { resetCam: true });
      });
    });

    const maxIdx = el.shells.length - 1;
    const shellPills = el.shells.map((cnt, idx) => `
      <span class="shell-pill${idx === maxIdx ? ' valence' : ''}">
        ${SHELL_LETTERS[idx] || `n${idx + 1}`}:${cnt}
      </span>
    `).join('');

    this.dom.inspectorShells.innerHTML = `
      <div class="sec-title">Electron Configuration</div>
      <div class="config-str">${el.nobleConfig}</div>
      <div class="shell-pills">${shellPills}</div>
    `;

    const fmt = (val, unit) => (val == null ? '—' : `${val} ${unit}`);
    this.dom.inspectorProps.innerHTML = `
      <div class="sec-title">Physical &amp; Atomic Properties</div>
      <div class="props-grid">
        <div class="prop-item">
          <span class="prop-label">Period / Group</span>
          <span class="prop-val">P${el.period} · ${el.group ? `G${el.group}` : 'f-block'} (${el.block})</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Nucleons</span>
          <span class="prop-val">${el.z}p⁺ / ${el.neutrons}n⁰</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Atomic Radius</span>
          <span class="prop-val">${fmt(el.radius, 'pm')}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Electronegativity</span>
          <span class="prop-val">${el.electronegativity ?? '—'}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">1st Ionization</span>
          <span class="prop-val">${fmt(el.ionization, 'kJ/mol')}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Density</span>
          <span class="prop-val">${fmt(el.density, 'g/cm³')}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Melting Point</span>
          <span class="prop-val">${fmt(el.melt, 'K')}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Boiling Point</span>
          <span class="prop-val">${fmt(el.boil, 'K')}</span>
        </div>
      </div>
    `;

    const latticeStr = el.crystal.a
      ? `a = ${el.crystal.a} Å${el.crystal.c ? `, c = ${el.crystal.c} Å` : ''}`
      : 'Theoretical / predicted parameters';

    this.dom.inspectorCrystal.innerHTML = `
      <div class="sec-title">Crystal Lattice</div>
      <div class="crystal-box">
        <div class="crystal-name">${sys.name}</div>
        <div class="crystal-meta">${latticeStr} · Coord ${sys.coordination} · APF ${sys.apf}</div>
        <div class="crystal-meta">${el.crystal.note}</div>
      </div>
    `;

    this.dom.inspectorSummary.innerHTML = `
      <div class="sec-title">Overview</div>
      <p class="summary-text">${el.summary}</p>
    `;
  }

  _onResize() {
    const w = this.dom.stage.clientWidth;
    const h = this.dom.stage.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomPass.setSize(w, h);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    if (this.cameraTween) {
      this.cameraTween.progress = Math.min(1, this.cameraTween.progress + dt * 2.4);
      const t = 1 - Math.pow(1 - this.cameraTween.progress, 3);
      this.camera.position.lerpVectors(this.cameraTween.startPos, this.cameraTween.endPos, t);
      this.controls.target.lerpVectors(this.cameraTween.startTarget, this.cameraTween.endTarget, t);
      if (this.cameraTween.progress >= 1) {
        this.cameraTween = null;
      }
    }

    const activeVis = this.visualizers[this.state.mode];
    if (activeVis) {
      activeVis.update(dt, elapsed);
    }

    this.starfield.rotation.y += dt * 0.012;
    this.controls.update();
    this.composer.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__atomshh = new AtomshhApp();
});

import * as THREE from 'three';
import { ELEMENTS, CATEGORIES } from '../data/elements.js';
import { roundRect, clamp } from '../utils/threeHelpers.js';

const PROPERTY_META = {
  radius: { label: 'Atomic Radius', unit: 'pm', max: 350 },
  electronegativity: { label: 'Electronegativity', unit: 'Pauling', max: 4.0 },
  ionization: { label: '1st Ionization', unit: 'kJ/mol', max: 2400 },
  density: { label: 'Density (log-scaled)', unit: 'g/cm³', max: 41, log: true },
  melt: { label: 'Melting Point', unit: 'K', max: 3900 },
  mass: { label: 'Atomic Mass', unit: 'u', max: 295 }
};

function createTileTexture(el) {
  const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
  const w = 256;
  const h = 308;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Deep card background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#090e1c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle category wash at top
  const glowGrad = ctx.createLinearGradient(0, 0, 0, 120);
  glowGrad.addColorStop(0, cat.color + '44');
  glowGrad.addColorStop(1, 'rgba(15,23,42,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, 120);

  // Inner glowing border
  ctx.strokeStyle = cat.color;
  ctx.lineWidth = 6;
  roundRect(ctx, 7, 7, w - 14, h - 14, 16);
  ctx.stroke();

  // Top accent strip
  ctx.fillStyle = cat.color;
  roundRect(ctx, 20, 18, w - 40, 6, 3);
  ctx.fill();

  // Atomic number
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(el.z), 22, 34);

  // Mass / Phase dot
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  const massStr = el.mass >= 100 ? el.mass.toFixed(1) : el.mass.toFixed(2);
  ctx.fillText(massStr, w - 22, 38);

  // Symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 94px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.symbol, w / 2, h * 0.46);

  // Element name
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(el.name, w / 2, h * 0.72, w - 34);

  // Shells summary dots along bottom
  const nShells = el.shells.length;
  const dotSpacing = 14;
  const startX = w / 2 - ((nShells - 1) * dotSpacing) / 2;
  for (let i = 0; i < nShells; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * dotSpacing, h - 48, 4, 0, Math.PI * 2);
    ctx.fillStyle = i === nShells - 1 ? cat.glow : 'rgba(148, 163, 184, 0.5)';
    ctx.fill();
  }

  // Category tag text
  ctx.fillStyle = cat.glow;
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`${el.block.toUpperCase()}-BLOCK`, w / 2, h - 24);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function heatColor(t) {
  const c = new THREE.Color();
  // Cyan -> Emerald -> Amber -> Coral
  if (t < 0.33) {
    c.lerpColors(new THREE.Color('#2563eb'), new THREE.Color('#06b6d4'), t / 0.33);
  } else if (t < 0.66) {
    c.lerpColors(new THREE.Color('#06b6d4'), new THREE.Color('#f59e0b'), (t - 0.33) / 0.33);
  } else {
    c.lerpColors(new THREE.Color('#f59e0b'), new THREE.Color('#f43f5e'), (t - 0.66) / 0.34);
  }
  return c;
}

export class PeriodicTable3DVisualizer {
  constructor() {
    this.group = new THREE.Group();
    this.layout = 'table';
    this.barProperty = 'radius';
    this.selectedZ = 26;
    this.hoveredZ = null;
    this.filter = { category: 'all', block: 'all', search: '' };

    this.tiles = [];
    this.tileMeshes = [];
    this.barsGroup = new THREE.Group();
    this.gridHelper = null;
    this.selectionFrame = null;

    this._initSceneObjects();
    this._computeTargets();
    this._snapToTargets();
  }

  _initSceneObjects() {
    const tileGeo = new THREE.BoxGeometry(1.48, 1.78, 0.14);
    const barGeo = new THREE.BoxGeometry(1.22, 1.0, 1.22);
    // Shift bar geometry so y=0 is bottom face
    barGeo.translate(0, 0.5, 0);

    const sideMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.45,
      metalness: 0.6
    });

    // Subtle floor grid for 3D Property Bars mode
    this.gridHelper = new THREE.GridHelper(42, 24, 0x334155, 0x1e293b);
    this.gridHelper.position.set(0, -0.05, 0);
    this.gridHelper.visible = false;
    this.group.add(this.gridHelper);
    this.group.add(this.barsGroup);

    // Selection glow frame
    const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.66, 1.96, 0.24));
    const frameMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    this.selectionFrame = new THREE.LineSegments(frameGeo, frameMat);
    this.group.add(this.selectionFrame);

    for (let i = 0; i < ELEMENTS.length; i++) {
      const el = ELEMENTS[i];
      const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
      const tex = createTileTexture(el);

      const faceMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.35,
        metalness: 0.18,
        emissive: new THREE.Color(cat.color),
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 1.0
      });

      const materials = [sideMat.clone(), sideMat.clone(), sideMat.clone(), sideMat.clone(), faceMat, faceMat];
      const mesh = new THREE.Mesh(tileGeo, materials);
      mesh.userData = { z: el.z, element: el };

      const barMat = new THREE.MeshStandardMaterial({
        color: cat.color,
        emissive: new THREE.Color(cat.color),
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.25,
        transparent: true,
        opacity: 0.85
      });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.visible = false;
      this.barsGroup.add(barMesh);

      this.group.add(mesh);
      this.tileMeshes.push(mesh);

      this.tiles.push({
        el,
        mesh,
        faceMat,
        barMesh,
        barMat,
        targetPos: new THREE.Vector3(),
        targetQuat: new THREE.Quaternion(),
        targetScale: 1.0,
        targetBarHeight: 0.01,
        barPos: new THREE.Vector3(),
        matchesFilter: true
      });
    }
  }

  _getNormalizedProperty(el, prop) {
    const raw = el[prop];
    if (raw == null || Number.isNaN(raw)) return null;
    const meta = PROPERTY_META[prop];
    if (meta.log) {
      // Density ranges from 0.00009 to 40.7
      const norm = (Math.log10(raw + 0.001) - Math.log10(0.001)) / (Math.log10(meta.max + 0.001) - Math.log10(0.001));
      return clamp(norm, 0.04, 1.0);
    }
    return clamp(raw / meta.max, 0.04, 1.0);
  }

  _computeTargets() {
    const colSpacing = 1.72;
    const rowSpacing = 2.04;
    const dummy = new THREE.Object3D();

    const showBars = this.layout === 'bars';
    this.gridHelper.visible = showBars;

    for (let i = 0; i < this.tiles.length; i++) {
      const item = this.tiles[i];
      const el = item.el;

      if (this.layout === 'table') {
        const x = (el.col - 9.5) * colSpacing;
        // Group rows visually with slight gap before f-block (row 9/10)
        const visualRow = el.row >= 9 ? el.row - 0.5 : el.row;
        const y = (5.4 - visualRow) * rowSpacing;
        const z = el.row >= 9 ? 0.5 : 0;

        item.targetPos.set(x, y, z);
        dummy.position.copy(item.targetPos);
        dummy.rotation.set(0, 0, 0);
        item.targetQuat.copy(dummy.quaternion);
        item.barMesh.visible = false;
      } else if (this.layout === 'bars') {
        const x = (el.col - 9.5) * colSpacing;
        const visualRow = el.row >= 9 ? el.row - 0.5 : el.row;
        const zPos = (visualRow - 5.4) * 1.95;

        const norm = this._getNormalizedProperty(el, this.barProperty);
        const height = norm === null ? 0.25 : 0.4 + norm * 10.5;
        item.targetBarHeight = height;
        item.barPos.set(x, 0, zPos);

        // Float tile right atop the bar, tilted slightly back for legibility
        item.targetPos.set(x, height + 0.92, zPos);
        dummy.position.copy(item.targetPos);
        dummy.rotation.set(-0.45, 0, 0);
        item.targetQuat.copy(dummy.quaternion);

        const colColor = norm === null ? new THREE.Color('#334155') : heatColor(norm);
        item.barMat.color.copy(colColor);
        item.barMat.emissive.copy(colColor);
        item.barMat.emissiveIntensity = norm === null ? 0.08 : 0.22 + norm * 0.28;
        item.barMesh.visible = true;
        item.barMesh.position.set(x, 0, zPos);
      } else if (this.layout === 'helix') {
        const turns = 4.6;
        const angle = (i / ELEMENTS.length) * Math.PI * 2 * turns;
        const radius = 8.2 + (el.period - 1) * 0.42;
        const y = (i / ELEMENTS.length - 0.5) * 20.0;

        item.targetPos.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        dummy.position.copy(item.targetPos);
        dummy.lookAt(Math.cos(angle) * (radius + 10), y, Math.sin(angle) * (radius + 10));
        item.targetQuat.copy(dummy.quaternion);
        item.barMesh.visible = false;
      } else if (this.layout === 'sphere') {
        const n = ELEMENTS.length;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const yUnit = 1 - (i / (n - 1)) * 2;
        const rSlice = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
        const theta = goldenAngle * i;
        const radius = 10.2;

        item.targetPos.set(
          Math.cos(theta) * rSlice * radius,
          yUnit * radius,
          Math.sin(theta) * rSlice * radius
        );
        dummy.position.copy(item.targetPos);
        dummy.lookAt(item.targetPos.clone().multiplyScalar(2));
        item.targetQuat.copy(dummy.quaternion);
        item.barMesh.visible = false;
      }
    }

    this._applyFilterVisuals();
  }

  _applyFilterVisuals() {
    const query = (this.filter.search || '').trim().toLowerCase();
    for (const item of this.tiles) {
      const el = item.el;
      const catOk = this.filter.category === 'all' || el.category === this.filter.category;
      const blockOk = this.filter.block === 'all' || el.block === this.filter.block;
      const searchOk = !query
        || el.name.toLowerCase().includes(query)
        || el.symbol.toLowerCase().includes(query)
        || String(el.z) === query;

      item.matchesFilter = catOk && blockOk && searchOk;
    }
  }

  _snapToTargets() {
    for (const item of this.tiles) {
      item.mesh.position.copy(item.targetPos);
      item.mesh.quaternion.copy(item.targetQuat);
      item.barMesh.scale.y = item.targetBarHeight;
    }
  }

  setLayout(layout) {
    this.layout = layout;
    this._computeTargets();
  }

  setBarProperty(prop) {
    if (!PROPERTY_META[prop]) return;
    this.barProperty = prop;
    if (this.layout === 'bars') {
      this._computeTargets();
    }
  }

  setFilter(filter) {
    this.filter = { ...this.filter, ...filter };
    this._applyFilterVisuals();
  }

  setSelectedZ(z) {
    this.selectedZ = z;
  }

  setHoveredZ(z) {
    this.hoveredZ = z;
  }

  pick(raycaster) {
    const hits = raycaster.intersectObjects(this.tileMeshes, false);
    if (hits.length === 0) return null;
    // Prefer matching filter tiles first if overlapping
    const visibleHit = hits.find((h) => {
      const t = this.tiles[h.object.userData.z - 1];
      return t && t.matchesFilter;
    }) || hits[0];
    return {
      element: visibleHit.object.userData.element,
      point: visibleHit.point
    };
  }

  getCameraPreset(layout = this.layout) {
    switch (layout) {
      case 'bars':
        return { position: new THREE.Vector3(0, 18, 28), target: new THREE.Vector3(0, 3.5, 0) };
      case 'helix':
        return { position: new THREE.Vector3(21, 5, 21), target: new THREE.Vector3(0, 0, 0) };
      case 'sphere':
        return { position: new THREE.Vector3(0, 2, 26), target: new THREE.Vector3(0, 0, 0) };
      case 'table':
      default:
        return { position: new THREE.Vector3(0, 0.5, 27), target: new THREE.Vector3(0, 0, 0) };
    }
  }

  update(dt, elapsed) {
    const smooth = clamp(dt * 7.5, 0.02, 0.35);

    for (const item of this.tiles) {
      const isSelected = item.el.z === this.selectedZ;
      const isHovered = item.el.z === this.hoveredZ;

      let popOffset = 0;
      let targetScale = item.matchesFilter ? 1.0 : 0.84;
      let targetOpacity = item.matchesFilter ? 1.0 : 0.16;
      let targetEmissive = item.matchesFilter ? 0.14 : 0.02;

      if (isHovered) {
        popOffset = 0.65;
        targetScale = 1.12;
        targetOpacity = 1.0;
        targetEmissive = 0.45;
      }
      if (isSelected) {
        popOffset = Math.max(popOffset, 0.85);
        targetScale = Math.max(targetScale, 1.14);
        targetOpacity = 1.0;
        targetEmissive = 0.55 + Math.sin(elapsed * 3.5) * 0.12;
      }

      // Compute pop direction along local +Z of targetQuat
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(item.targetQuat);
      const goalPos = item.targetPos.clone().addScaledVector(forward, popOffset);

      item.mesh.position.lerp(goalPos, smooth);
      item.mesh.quaternion.slerp(item.targetQuat, smooth);

      const nextScale = item.mesh.scale.x + (targetScale - item.mesh.scale.x) * smooth;
      item.mesh.scale.setScalar(nextScale);

      item.faceMat.opacity += (targetOpacity - item.faceMat.opacity) * smooth;
      item.faceMat.emissiveIntensity += (targetEmissive - item.faceMat.emissiveIntensity) * smooth;

      if (item.barMesh.visible) {
        item.barMesh.scale.y += (item.targetBarHeight - item.barMesh.scale.y) * smooth;
        item.barMat.opacity = item.matchesFilter ? 0.86 : 0.12;
      }

      if (isSelected) {
        this.selectionFrame.position.copy(item.mesh.position);
        this.selectionFrame.quaternion.copy(item.mesh.quaternion);
        this.selectionFrame.scale.setScalar(nextScale);
      }
    }
  }

  dispose() {
    for (const item of this.tiles) {
      item.mesh.geometry.dispose();
      item.barMesh.geometry.dispose();
      item.barMat.dispose();
      const mats = Array.isArray(item.mesh.material) ? item.mesh.material : [item.mesh.material];
      for (const m of mats) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
    this.selectionFrame.geometry.dispose();
    this.selectionFrame.material.dispose();
    this.gridHelper.dispose();
  }
}

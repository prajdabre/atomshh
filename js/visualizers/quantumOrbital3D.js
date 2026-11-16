import * as THREE from 'three';
import { getGlowTexture, disposeGroupChildren, clamp } from '../utils/threeHelpers.js';

export const ORBITAL_LABELS = {
  0: [{ m: 0, name: 's', formula: 'Y₀⁰' }],
  1: [
    { m: 0, name: 'pz', formula: 'z / r' },
    { m: 1, name: 'px', formula: 'x / r' },
    { m: -1, name: 'py', formula: 'y / r' }
  ],
  2: [
    { m: 0, name: 'dz²', formula: '3z² - r²' },
    { m: 1, name: 'dxz', formula: 'xz' },
    { m: -1, name: 'dyz', formula: 'yz' },
    { m: 2, name: 'dx²-y²', formula: 'x² - y²' },
    { m: -2, name: 'dxy', formula: 'xy' }
  ],
  3: [
    { m: 0, name: 'fz³', formula: 'z(5z² - 3r²)' },
    { m: 1, name: 'fxz²', formula: 'x(5z² - r²)' },
    { m: -1, name: 'fyz²', formula: 'y(5z² - r²)' },
    { m: 2, name: 'fz(x²-y²)', formula: 'z(x² - y²)' },
    { m: -2, name: 'fxyz', formula: 'xyz' },
    { m: 3, name: 'fx(x²-3y²)', formula: 'x(x² - 3y²)' },
    { m: -3, name: 'fy(3x²-y²)', formula: 'y(3x² - y²)' }
  ]
};

// Real spherical harmonics evaluated on unit vector (x, y, z)
// Note: standard chemistry axes map quantum Z vertically (Three.js Y) so z-lobes point up/down!
export function realSphericalHarmonic(l, m, x, y, z) {
  if (l === 0) {
    return 0.28209479177; // 1 / (2*sqrt(pi))
  }
  if (l === 1) {
    const c = 0.4886025119; // sqrt(3 / (4*pi))
    if (m === 0) return c * z;
    if (m === 1) return c * x;
    return c * y; // m === -1
  }
  if (l === 2) {
    if (m === 0) return 0.31539156525 * (3 * z * z - 1); // sqrt(5/(16*pi))
    if (m === 1) return 1.09254843059 * x * z; // sqrt(15/(4*pi))
    if (m === -1) return 1.09254843059 * y * z;
    if (m === 2) return 0.54627421529 * (x * x - y * y); // sqrt(15/(16*pi))
    return 1.09254843059 * x * y; // m === -2
  }
  if (l === 3) {
    if (m === 0) return 0.37317633259 * z * (5 * z * z - 3); // sqrt(7/(16*pi))
    if (m === 1) return 0.45704579946 * x * (5 * z * z - 1); // sqrt(21/(32*pi))
    if (m === -1) return 0.45704579946 * y * (5 * z * z - 1);
    if (m === 2) return 1.44530572132 * z * (x * x - y * y); // sqrt(105/(16*pi))
    if (m === -2) return 2.89061144264 * x * y * z; // sqrt(105/(4*pi))
    if (m === 3) return 0.59004358992 * x * (x * x - 3 * y * y); // sqrt(35/(32*pi))
    return 0.59004358992 * y * (3 * x * x - y * y); // m === -3
  }
  return 0.282;
}

function assocLaguerre(k, alpha, x) {
  if (k <= 0) return 1;
  if (k === 1) return 1 + alpha - x;
  let L0 = 1;
  let L1 = 1 + alpha - x;
  for (let i = 2; i <= k; i++) {
    const L2 = ((2 * i - 1 + alpha - x) * L1 - (i - 1 + alpha) * L0) / i;
    L0 = L1;
    L1 = L2;
  }
  return L1;
}

function radialWavefunction(n, l, rho) {
  const k = Math.max(0, n - l - 1);
  const alpha = 2 * l + 1;
  const lag = assocLaguerre(k, alpha, rho);
  return Math.exp(-rho * 0.5) * Math.pow(rho, l) * lag;
}

export class QuantumOrbital3DVisualizer {
  constructor() {
    this.group = new THREE.Group();
    this.orbitalGroup = new THREE.Group();
    this.axesGroup = new THREE.Group();
    this.group.add(this.orbitalGroup);
    this.group.add(this.axesGroup);

    this.element = null;
    this.subshell = { n: 1, l: 0, label: '1s', count: 1 };
    this.m = 0; // integer in [-l, l] or 'all'
    this.renderMode = 'cloud'; // 'cloud' | 'surface'
    this.crossSection = false;
    this.showAxes = true;

    this._buildAxes();
  }

  _buildAxes() {
    disposeGroupChildren(this.axesGroup);
    const len = 7.4;

    const makeAxis = (dir, color) => {
      const pts = [dir.clone().multiplyScalar(-len), dir.clone().multiplyScalar(len)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.26
      });
      return new THREE.Line(geo, mat);
    };

    // Map physics x -> Three.js X, physics y -> Three.js Z, physics z -> Three.js Y
    this.axesGroup.add(makeAxis(new THREE.Vector3(1, 0, 0), 0xf43f5e)); // X
    this.axesGroup.add(makeAxis(new THREE.Vector3(0, 1, 0), 0x38bdf8)); // Quantum Z (up)
    this.axesGroup.add(makeAxis(new THREE.Vector3(0, 0, 1), 0x34d399)); // Y

    // Tiny nucleus core point
    const nucGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const nucMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.axesGroup.add(new THREE.Mesh(nucGeo, nucMat));
  }

  /**
   * Selects the element and automatically picks its characteristic valence subshell.
   */
  setElement(element) {
    this.element = element;
    const valence = this._pickCharacteristicSubshell(element);
    this.subshell = valence;
    this.m = 0;
    this._rebuild();
  }

  _pickCharacteristicSubshell(el) {
    if (!el || !el.subshells || el.subshells.length === 0) {
      return { n: 1, l: 0, label: '1s', count: 1 };
    }
    // Prefer the highest-energy subshell matching the element's block (e.g. 3d for Fe, 4f for Nd, 2p for C)
    const blockL = { s: 0, p: 1, d: 2, f: 3 }[el.block];
    const matching = el.subshells.filter((s) => s.l === blockL);
    if (matching.length > 0) {
      return matching[matching.length - 1];
    }
    return el.subshells[el.subshells.length - 1];
  }

  setSubshell(subshell) {
    this.subshell = subshell;
    if (this.m !== 'all' && Math.abs(this.m) > subshell.l) {
      this.m = 0;
    }
    this._rebuild();
  }

  setM(m) {
    this.m = m;
    this._rebuild();
  }

  setRenderMode(mode) {
    if (this.renderMode === mode) return;
    this.renderMode = mode;
    this._rebuild();
  }

  setCrossSection(flag) {
    if (this.crossSection === flag) return;
    this.crossSection = flag;
    this._rebuild();
  }

  setShowAxes(flag) {
    this.showAxes = flag;
    this.axesGroup.visible = flag;
  }

  _rebuild() {
    disposeGroupChildren(this.orbitalGroup);
    if (this.renderMode === 'cloud') {
      this._buildProbabilityCloud();
    } else {
      this._buildHarmonicSurface();
    }
  }

  _buildProbabilityCloud() {
    const { n, l } = this.subshell;
    const numPoints = 32000;

    // Rho extends far enough to capture all radial nodes & tail
    const rhoMax = 2 * n + 4.8 * Math.sqrt(n) + 6;
    const displayRadius = 6.6;

    // 1. Precompute 1D radial CDF on 600 bins of r^2 |R_{nl}(r)|^2
    const bins = 600;
    const cdf = new Float64Array(bins);
    const radialSign = new Int8Array(bins);
    let accum = 0;

    for (let i = 0; i < bins; i++) {
      const rho = ((i + 0.5) / bins) * rhoMax;
      const R = radialWavefunction(n, l, rho);
      const prob = rho * rho * R * R;
      accum += prob;
      cdf[i] = accum;
      radialSign[i] = R >= 0 ? 1 : -1;
    }
    for (let i = 0; i < bins; i++) {
      cdf[i] /= accum || 1;
    }

    const sampleRho = () => {
      const u = Math.random();
      let lo = 0;
      let hi = bins - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < u) lo = mid + 1;
        else hi = mid;
      }
      const jitter = (Math.random() - 0.5) / bins;
      const rho = clamp(((lo + 0.5) / bins + jitter) * rhoMax, 0.001, rhoMax);
      return { rho, rSign: radialSign[lo] };
    };

    // Estimate max |Y_{l,m}|^2 for angular rejection sampling
    const maxY2 = l === 0 ? 0.08 : l === 1 ? 0.25 : l === 2 ? 0.42 : 0.72;

    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);

    const posColor = new THREE.Color('#22d3ee'); // Positive wavefunction phase (cyan)
    const negColor = new THREE.Color('#f43f5e'); // Negative wavefunction phase (coral-magenta)
    const compositeColorA = new THREE.Color('#38bdf8');
    const compositeColorB = new THREE.Color('#a855f7');
    const tmpCol = new THREE.Color();

    let count = 0;
    let guard = 0;
    const maxAttempts = numPoints * 28;

    while (count < numPoints && guard < maxAttempts) {
      guard++;

      // Uniform unit sphere sample
      const u = Math.random() * 2 - 1; // cos(theta) = z
      const phi = Math.random() * Math.PI * 2;
      const sinTheta = Math.sqrt(Math.max(0, 1 - u * u));
      const x = sinTheta * Math.cos(phi);
      const y = sinTheta * Math.sin(phi);
      const z = u;

      if (this.crossSection && x > 0.02) continue;

      let ySign = 1;
      if (this.m !== 'all') {
        const Y = realSphericalHarmonic(l, this.m, x, y, z);
        const y2 = Y * Y;
        if (Math.random() * maxY2 > y2) continue;
        ySign = Y >= 0 ? 1 : -1;
      }

      const { rho, rSign } = sampleRho();
      const radius = (rho / rhoMax) * displayRadius;

      const idx = count * 3;
      // Physics (x, y, z) -> Three.js (x, z, y) so quantum z is vertical
      positions[idx] = x * radius;
      positions[idx + 1] = z * radius;
      positions[idx + 2] = y * radius;

      if (this.m === 'all') {
        const t = clamp(radius / (displayRadius * 0.78), 0, 1);
        tmpCol.lerpColors(compositeColorA, compositeColorB, t);
      } else {
        const phaseSign = rSign * ySign;
        tmpCol.copy(phaseSign >= 0 ? posColor : negColor);
        // Subtle luminance gradient near outer density fringes
        const radialFade = 1.0 - 0.25 * clamp(radius / displayRadius, 0, 1);
        tmpCol.multiplyScalar(radialFade);
      }

      colors[idx] = tmpCol.r;
      colors[idx + 1] = tmpCol.g;
      colors[idx + 2] = tmpCol.b;
      count++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.subarray(0, count * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors.subarray(0, count * 3), 3));

    const mat = new THREE.PointsMaterial({
      size: 0.145,
      map: getGlowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geo, mat);
    this.orbitalGroup.add(points);
  }

  _buildHarmonicSurface() {
    const { l } = this.subshell;
    const mValues = this.m === 'all'
      ? Array.from({ length: 2 * l + 1 }, (_, i) => i - l)
      : [this.m];

    const multi = mValues.length > 1;
    const scale = l === 0 ? 4.2 : l === 1 ? 7.2 : l === 2 ? 6.6 : 6.0;

    for (const mVal of mValues) {
      const segTheta = 72;
      const segPhi = 96;
      const vertices = [];
      const colors = [];
      const indices = [];

      const posColor = new THREE.Color('#22d3ee');
      const negColor = new THREE.Color('#f43f5e');

      for (let it = 0; it <= segTheta; it++) {
        const theta = (it / segTheta) * Math.PI;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let ip = 0; ip <= segPhi; ip++) {
          const phi = (ip / segPhi) * Math.PI * 2;
          const xDir = sinT * Math.cos(phi);
          const yDir = sinT * Math.sin(phi);
          const zDir = cosT;

          const Y = realSphericalHarmonic(l, mVal, xDir, yDir, zDir);
          const r = Math.abs(Y) * scale;

          // Clip x > 0 cleanly if crossSection is active by collapsing to plane x=0 or clamping
          const px = xDir * r;
          const py = zDir * r;
          const pz = yDir * r;

          vertices.push(this.crossSection ? Math.min(0, px) : px, py, pz);

          const col = Y >= 0 ? posColor : negColor;
          colors.push(col.r, col.g, col.b);
        }
      }

      for (let it = 0; it < segTheta; it++) {
        for (let ip = 0; ip < segPhi; ip++) {
          const a = it * (segPhi + 1) + ip;
          const b = a + segPhi + 1;
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.22,
        metalness: 0.08,
        transmission: 0.0,
        transparent: true,
        opacity: multi ? 0.34 : 0.86,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      this.orbitalGroup.add(mesh);

      if (!multi) {
        // Subtle wireframe contour lines on single harmonic lobe surface
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.07
        });
        this.orbitalGroup.add(new THREE.Mesh(geo.clone(), wireMat));
      }
    }
  }

  getCameraPreset() {
    return {
      position: new THREE.Vector3(7.6, 5.2, 10.6),
      target: new THREE.Vector3(0, 0, 0)
    };
  }

  update(dt) {
    this.orbitalGroup.rotation.y += dt * 0.22;
  }

  dispose() {
    disposeGroupChildren(this.orbitalGroup);
    disposeGroupChildren(this.axesGroup);
  }
}

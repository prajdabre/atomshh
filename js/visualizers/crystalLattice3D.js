import * as THREE from 'three';
import { CATEGORIES } from '../data/elements.js';
import { disposeGroupChildren } from '../utils/threeHelpers.js';

function getLatticeSpec(type) {
  switch (type) {
    case 'fcc':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0, 1, 0),
        a3: new THREE.Vector3(0, 0, 1),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0],
          [0.5, 0, 0.5],
          [0, 0.5, 0.5]
        ],
        bondTol: 1.08
      };
    case 'bcc':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0, 1, 0),
        a3: new THREE.Vector3(0, 0, 1),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0.5]
        ],
        bondTol: 1.08
      };
    case 'hcp':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0.5, 0, Math.sqrt(3) / 2),
        a3: new THREE.Vector3(0, 1.633, 0),
        motif: [
          [0, 0, 0],
          [1 / 3, 1 / 3, 0.5]
        ],
        bondTol: 1.08
      };
    case 'diamond':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0, 1, 0),
        a3: new THREE.Vector3(0, 0, 1),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0],
          [0.5, 0, 0.5],
          [0, 0.5, 0.5],
          [0.25, 0.25, 0.25],
          [0.75, 0.75, 0.25],
          [0.75, 0.25, 0.75],
          [0.25, 0.75, 0.75]
        ],
        bondTol: 1.08
      };
    case 'sc':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0, 1, 0),
        a3: new THREE.Vector3(0, 0, 1),
        motif: [[0, 0, 0]],
        bondTol: 1.08
      };
    case 'hexagonal':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0.5, 0, Math.sqrt(3) / 2),
        a3: new THREE.Vector3(0, 1.45, 0),
        motif: [
          [0, 0, 0],
          [1 / 3, 1 / 3, 0],
          [0, 0, 0.5],
          [2 / 3, 2 / 3, 0.5]
        ],
        bondTol: 1.12
      };
    case 'rhombohedral': {
      // 72-degree trigonal primitive vectors
      const ang = 1.12;
      const cosA = Math.cos(ang);
      const a1 = new THREE.Vector3(1, 0, 0);
      const a2 = new THREE.Vector3(cosA, 0, Math.sin(ang));
      const cx = cosA;
      const cz = (cosA - cosA * cosA) / Math.sin(ang);
      const cy = Math.sqrt(Math.max(0.1, 1 - cx * cx - cz * cz));
      const a3 = new THREE.Vector3(cx, cy, cz);
      return {
        a1,
        a2,
        a3,
        motif: [[0, 0, 0]],
        bondTol: 1.1
      };
    }
    case 'orthorhombic':
      return {
        a1: new THREE.Vector3(1.0, 0, 0),
        a2: new THREE.Vector3(0, 1.38, 0),
        a3: new THREE.Vector3(0, 0, 0.82),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0],
          [0.5, 0, 0.5],
          [0, 0.5, 0.5]
        ],
        bondTol: 1.18
      };
    case 'tetragonal':
      return {
        a1: new THREE.Vector3(1.0, 0, 0),
        a2: new THREE.Vector3(0, 1.48, 0),
        a3: new THREE.Vector3(0, 0, 1.0),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0.5]
        ],
        bondTol: 1.16
      };
    case 'monoclinic':
      return {
        a1: new THREE.Vector3(1.0, 0, 0),
        a2: new THREE.Vector3(0, 1.25, 0),
        a3: new THREE.Vector3(0.28, 0, 0.96),
        motif: [
          [0, 0, 0],
          [0.5, 0.5, 0]
        ],
        bondTol: 1.18
      };
    case 'molecular-cubic':
      return {
        a1: new THREE.Vector3(1, 0, 0),
        a2: new THREE.Vector3(0, 1, 0),
        a3: new THREE.Vector3(0, 0, 1),
        motif: [
          [0.08, 0.08, 0.08], [-0.08, -0.08, -0.08],
          [0.58, 0.42, 0.08], [0.42, 0.58, -0.08],
          [0.58, 0.08, 0.42], [0.42, -0.08, 0.58],
          [0.08, 0.58, 0.42], [-0.08, 0.42, 0.58]
        ].map(([x, y, z]) => [(x + 1) % 1, (y + 1) % 1, (z + 1) % 1]),
        bondTol: 1.25,
        molecular: true
      };
    default:
      return getLatticeSpec('fcc');
  }
}

export class CrystalLattice3DVisualizer {
  constructor() {
    this.group = new THREE.Group();
    this.latticeGroup = new THREE.Group();
    this.group.add(this.latticeGroup);

    this.element = null;
    this.supercell = 2; // 1, 2, or 3
    this.style = 'ball-and-stick'; // 'ball-and-stick' | 'space-filling' | 'polyhedra'
    this.showBonds = true;
    this.showUnitCell = true;
  }

  setElement(element) {
    this.element = element;
    this._rebuild();
  }

  setSupercell(n) {
    if (this.supercell === n) return;
    this.supercell = n;
    this._rebuild();
  }

  setStyle(style) {
    if (this.style === style) return;
    this.style = style;
    this._rebuild();
  }

  setShowBonds(flag) {
    if (this.showBonds === flag) return;
    this.showBonds = flag;
    this._rebuild();
  }

  setShowUnitCell(flag) {
    if (this.showUnitCell === flag) return;
    this.showUnitCell = flag;
    this._rebuild();
  }

  _rebuild() {
    disposeGroupChildren(this.latticeGroup);
    if (!this.element) return;

    const type = this.element.crystal?.type || 'fcc';
    const spec = getLatticeSpec(type);
    const N = this.supercell;
    const cat = CATEGORIES[this.element.category] || CATEGORIES.unknown;

    // Scale basis vectors so 1 unit cell looks consistent across supercells
    const baseScale = N === 1 ? 4.4 : N === 2 ? 2.75 : 2.05;
    const a1 = spec.a1.clone().multiplyScalar(baseScale);
    const a2 = spec.a2.clone().multiplyScalar(baseScale);
    const a3 = spec.a3.clone().multiplyScalar(baseScale);

    // Center of supercell
    const centerOffset = new THREE.Vector3()
      .addScaledVector(a1, N * 0.5)
      .addScaledVector(a2, N * 0.5)
      .addScaledVector(a3, N * 0.5);

    // Generate deduplicated atom positions inside [0, N]^3
    const points = [];
    const seen = new Set();
    const eps = 0.002;

    if (spec.molecular) {
      // For molecular cubic, place dimers centered on FCC sites within [0, N]^3
      const fccSites = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
      const dimerOffsets = [
        new THREE.Vector3(0.09, 0.09, 0.09),
        new THREE.Vector3(-0.09, 0.09, 0.09),
        new THREE.Vector3(0.09, -0.09, 0.09),
        new THREE.Vector3(0.09, 0.09, -0.09)
      ];
      for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
          for (let k = 0; k <= N; k++) {
            fccSites.forEach(([fx, fy, fz], sIdx) => {
              const u = i + fx;
              const v = j + fy;
              const w = k + fz;
              if (u <= N + eps && v <= N + eps && w <= N + eps) {
                const off = dimerOffsets[sIdx % dimerOffsets.length];
                for (const sign of [-1, 1]) {
                  const p = new THREE.Vector3()
                    .addScaledVector(a1, u + sign * off.x)
                    .addScaledVector(a2, v + sign * off.y)
                    .addScaledVector(a3, w + sign * off.z)
                    .sub(centerOffset);
                  const key = `${Math.round(p.x * 200)},${Math.round(p.y * 200)},${Math.round(p.z * 200)}`;
                  if (!seen.has(key)) {
                    seen.add(key);
                    points.push(p);
                  }
                }
              }
            });
          }
        }
      }
    } else {
      for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
          for (let k = 0; k <= N; k++) {
            for (const [fx, fy, fz] of spec.motif) {
              const u = i + fx;
              const v = j + fy;
              const w = k + fz;
              if (u <= N + eps && v <= N + eps && w <= N + eps) {
                const p = new THREE.Vector3()
                  .addScaledVector(a1, u)
                  .addScaledVector(a2, v)
                  .addScaledVector(a3, w)
                  .sub(centerOffset);
                const key = `${Math.round(p.x * 200)},${Math.round(p.y * 200)},${Math.round(p.z * 200)}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  points.push(p);
                }
              }
            }
          }
        }
      }
    }

    // Determine minimum nearest-neighbor distance
    let dMin = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = points[i].distanceTo(points[j]);
        if (d > 0.05 && d < dMin) {
          dMin = d;
        }
      }
    }
    if (!Number.isFinite(dMin)) dMin = baseScale;

    // Determine central atom & nearest neighbors for polyhedra mode
    let centerIdx = 0;
    let bestCenterDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = points[i].length();
      if (dist < bestCenterDist) {
        bestCenterDist = dist;
        centerIdx = i;
      }
    }

    const neighborSet = new Set();
    const bondCut = dMin * (spec.bondTol || 1.1);
    const bonds = [];

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = points[i].distanceTo(points[j]);
        if (d <= bondCut) {
          bonds.push([i, j, d]);
          if (i === centerIdx) neighborSet.add(j);
          if (j === centerIdx) neighborSet.add(i);
        }
      }
    }

    const atomRadius = this.style === 'space-filling'
      ? dMin * 0.495
      : this.style === 'polyhedra'
        ? dMin * 0.22
        : Math.min(dMin * 0.28, baseScale * 0.22);

    const sphereGeo = new THREE.SphereGeometry(atomRadius, 24, 20);
    const atomMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.22,
      metalness: 0.45
    });

    const instAtoms = new THREE.InstancedMesh(sphereGeo, atomMat, points.length);
    const dummy = new THREE.Object3D();
    const baseColor = new THREE.Color(cat.color);
    const highlightColor = new THREE.Color('#fde047');
    const neighborColor = new THREE.Color('#38bdf8');
    const mutedColor = new THREE.Color('#475569');

    points.forEach((p, idx) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      instAtoms.setMatrixAt(idx, dummy.matrix);

      if (this.style === 'polyhedra') {
        if (idx === centerIdx) {
          instAtoms.setColorAt(idx, highlightColor);
        } else if (neighborSet.has(idx)) {
          instAtoms.setColorAt(idx, neighborColor);
        } else {
          instAtoms.setColorAt(idx, mutedColor);
        }
      } else {
        instAtoms.setColorAt(idx, baseColor);
      }
    });
    instAtoms.instanceMatrix.needsUpdate = true;
    if (instAtoms.instanceColor) instAtoms.instanceColor.needsUpdate = true;
    this.latticeGroup.add(instAtoms);

    // Nearest-neighbor bonds (ball-and-stick or polyhedra mode)
    const shouldRenderBonds = (this.style === 'ball-and-stick' && this.showBonds) || this.style === 'polyhedra';
    if (shouldRenderBonds && bonds.length > 0) {
      const visibleBonds = this.style === 'polyhedra'
        ? bonds.filter(([i, j]) => i === centerIdx || j === centerIdx)
        : bonds;

      if (visibleBonds.length > 0) {
        const cylRadius = this.style === 'polyhedra' ? atomRadius * 0.28 : atomRadius * 0.24;
        const bondGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, 1.0, 10);
        const bondMat = new THREE.MeshStandardMaterial({
          color: this.style === 'polyhedra' ? '#7dd3fc' : '#94a3b8',
          emissive: this.style === 'polyhedra' ? '#0284c7' : '#1e293b',
          emissiveIntensity: this.style === 'polyhedra' ? 0.5 : 0.2,
          roughness: 0.35,
          metalness: 0.4
        });

        const instBonds = new THREE.InstancedMesh(bondGeo, bondMat, visibleBonds.length);
        const up = new THREE.Vector3(0, 1, 0);
        const dir = new THREE.Vector3();
        const mid = new THREE.Vector3();
        const quat = new THREE.Quaternion();

        visibleBonds.forEach(([i, j, dist], idx) => {
          const p1 = points[i];
          const p2 = points[j];
          mid.addVectors(p1, p2).multiplyScalar(0.5);
          dir.subVectors(p2, p1).normalize();
          quat.setFromUnitVectors(up, dir);

          dummy.position.copy(mid);
          dummy.quaternion.copy(quat);
          dummy.scale.set(1, dist, 1);
          dummy.updateMatrix();
          instBonds.setMatrixAt(idx, dummy.matrix);
        });
        instBonds.instanceMatrix.needsUpdate = true;
        this.latticeGroup.add(instBonds);
      }
    }

    // Coordination shell outline in polyhedra mode
    if (this.style === 'polyhedra' && neighborSet.size >= 3) {
      const neighborPts = Array.from(neighborSet).map((idx) => points[idx]);
      const hullLines = [];
      // Connect pairs of neighbors that are adjacent around the central atom
      let minNN = Infinity;
      for (let i = 0; i < neighborPts.length; i++) {
        for (let j = i + 1; j < neighborPts.length; j++) {
          const d = neighborPts[i].distanceTo(neighborPts[j]);
          if (d < minNN) minNN = d;
        }
      }
      for (let i = 0; i < neighborPts.length; i++) {
        for (let j = i + 1; j < neighborPts.length; j++) {
          if (neighborPts[i].distanceTo(neighborPts[j]) <= minNN * 1.35) {
            hullLines.push(neighborPts[i], neighborPts[j]);
          }
        }
      }
      if (hullLines.length > 0) {
        const polyGeo = new THREE.BufferGeometry().setFromPoints(hullLines);
        const polyMat = new THREE.LineBasicMaterial({
          color: '#fde047',
          transparent: true,
          opacity: 0.65
        });
        this.latticeGroup.add(new THREE.LineSegments(polyGeo, polyMat));
      }
    }

    // Glowing primary unit cell wireframe + supercell outer bounding box
    if (this.showUnitCell) {
      this._addParallelepipedWireframe(
        new THREE.Vector3().sub(centerOffset),
        a1, a2, a3,
        '#38bdf8',
        0.75
      );
      if (N > 1) {
        this._addParallelepipedWireframe(
          new THREE.Vector3().sub(centerOffset),
          a1.clone().multiplyScalar(N),
          a2.clone().multiplyScalar(N),
          a3.clone().multiplyScalar(N),
          '#64748b',
          0.32
        );
      }
    }
  }

  _addParallelepipedWireframe(origin, v1, v2, v3, color, opacity) {
    const p000 = origin.clone();
    const p100 = p000.clone().add(v1);
    const p010 = p000.clone().add(v2);
    const p001 = p000.clone().add(v3);
    const p110 = p100.clone().add(v2);
    const p101 = p100.clone().add(v3);
    const p011 = p010.clone().add(v3);
    const p111 = p110.clone().add(v3);

    const edges = [
      p000, p100, p000, p010, p000, p001,
      p100, p110, p100, p101,
      p010, p110, p010, p011,
      p001, p101, p001, p011,
      p110, p111, p101, p111, p011, p111
    ];

    const geo = new THREE.BufferGeometry().setFromPoints(edges);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    this.latticeGroup.add(new THREE.LineSegments(geo, mat));
  }

  getCameraPreset() {
    const dist = this.supercell === 1 ? 8.2 : this.supercell === 2 ? 10.6 : 12.2;
    return {
      position: new THREE.Vector3(dist * 0.72, dist * 0.56, dist * 0.85),
      target: new THREE.Vector3(0, 0, 0)
    };
  }

  update(dt) {
    this.latticeGroup.rotation.y += dt * 0.18;
  }

  dispose() {
    disposeGroupChildren(this.latticeGroup);
  }
}

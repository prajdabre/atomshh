import * as THREE from 'three';
import { CATEGORIES } from '../data/elements.js';
import { getGlowTexture, disposeGroupChildren, createLabelSprite } from '../utils/threeHelpers.js';

const SHELL_LETTERS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

// Deterministic pseudo-random helper for nucleon jitter
function hashFloat(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export class BohrModel3DVisualizer {
  constructor() {
    this.group = new THREE.Group();
    this.nucleusGroup = new THREE.Group();
    this.shellsGroup = new THREE.Group();
    this.labelsGroup = new THREE.Group();

    this.group.add(this.nucleusGroup);
    this.group.add(this.shellsGroup);
    this.group.add(this.labelsGroup);

    this.element = null;
    this.orbitMode = '3d-tilted';
    this.speed = 1.0;
    this.highlightValence = true;
    this.showLabels = true;
    this.shellAnimators = [];
    this.nucleusRadius = 1.0;
  }

  setElement(element) {
    this.element = element;
    this._rebuild();
  }

  setOrbitMode(mode) {
    if (this.orbitMode === mode) return;
    this.orbitMode = mode;
    if (this.element) this._rebuild();
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setHighlightValence(flag) {
    if (this.highlightValence === flag) return;
    this.highlightValence = flag;
    if (this.element) this._rebuild();
  }

  setShowLabels(flag) {
    this.showLabels = flag;
    this.labelsGroup.visible = flag;
  }

  _rebuild() {
    disposeGroupChildren(this.nucleusGroup);
    disposeGroupChildren(this.shellsGroup);
    disposeGroupChildren(this.labelsGroup);
    this.shellAnimators = [];
    if (!this.element) return;

    this._buildNucleus(this.element);
    this._buildShells(this.element);
    this.labelsGroup.visible = this.showLabels;
  }

  _buildNucleus(el) {
    const protons = el.z;
    const neutrons = el.neutrons;
    const total = protons + neutrons;

    const nucleonRadius = total === 1 ? 0.42 : Math.max(0.18, 0.34 - Math.log10(total) * 0.055);
    const clusterScale = total === 1 ? 0 : nucleonRadius * 1.18 * Math.cbrt(total);
    this.nucleusRadius = Math.max(0.5, clusterScale + nucleonRadius);

    // Build interleaved list of nucleon types across spherical Fibonacci slots
    const protonMatrices = [];
    const neutronMatrices = [];
    const dummy = new THREE.Object3D();
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // Evenly distribute protons & neutrons through the cluster indices
    let pAssigned = 0;
    let nAssigned = 0;

    for (let i = 0; i < total; i++) {
      let pos;
      if (total === 1) {
        pos = new THREE.Vector3(0, 0, 0);
      } else {
        const u = (i + 0.5) / total;
        const r = clusterScale * Math.cbrt(u);
        const yUnit = 1 - 2 * ((i + 0.5) / total);
        const rSlice = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
        const theta = goldenAngle * i + hashFloat(i) * 0.25;
        const jitter = nucleonRadius * 0.14;
        pos = new THREE.Vector3(
          r * rSlice * Math.cos(theta) + (hashFloat(i + 10) - 0.5) * jitter,
          r * yUnit + (hashFloat(i + 20) - 0.5) * jitter,
          r * rSlice * Math.sin(theta) + (hashFloat(i + 30) - 0.5) * jitter
        );
      }

      dummy.position.copy(pos);
      dummy.updateMatrix();

      // Decide proton vs neutron via Bresenham-like ratio distribution
      const pTarget = Math.round(((i + 1) * protons) / total);
      const isProton = pAssigned < pTarget && (nAssigned >= neutrons || pAssigned < protons);
      if (isProton) {
        protonMatrices.push(dummy.matrix.clone());
        pAssigned++;
      } else {
        neutronMatrices.push(dummy.matrix.clone());
        nAssigned++;
      }
    }

    const sphereGeo = new THREE.SphereGeometry(nucleonRadius, 18, 16);

    if (protonMatrices.length > 0) {
      const protonMat = new THREE.MeshStandardMaterial({
        color: '#f43f5e',
        emissive: '#e11d48',
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.2
      });
      const pMesh = new THREE.InstancedMesh(sphereGeo, protonMat, protonMatrices.length);
      protonMatrices.forEach((m, idx) => pMesh.setMatrixAt(idx, m));
      pMesh.instanceMatrix.needsUpdate = true;
      this.nucleusGroup.add(pMesh);
    }

    if (neutronMatrices.length > 0) {
      const neutronMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0284c7',
        emissiveIntensity: 0.28,
        roughness: 0.3,
        metalness: 0.25
      });
      const nMesh = new THREE.InstancedMesh(sphereGeo, neutronMat, neutronMatrices.length);
      neutronMatrices.forEach((m, idx) => nMesh.setMatrixAt(idx, m));
      nMesh.instanceMatrix.needsUpdate = true;
      this.nucleusGroup.add(nMesh);
    }

    // Nucleus halo glow
    const haloMat = new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: '#fb7185',
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const halo = new THREE.Sprite(haloMat);
    const haloScale = Math.max(2.6, this.nucleusRadius * 3.4);
    halo.scale.set(haloScale, haloScale, 1);
    this.nucleusGroup.add(halo);
  }

  _buildShells(el) {
    const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
    const shells = el.shells;
    const maxShellIdx = shells.length - 1;
    const baseRadius = Math.max(2.8, this.nucleusRadius + 1.55);
    const stepRadius = shells.length > 5 ? 1.18 : 1.38;

    const electronGeo = new THREE.SphereGeometry(0.145, 16, 16);
    const innerMat = new THREE.MeshStandardMaterial({
      color: '#67e8f9',
      emissive: '#06b6d4',
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1
    });
    const valenceMat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#f59e0b',
      emissiveIntensity: 1.0,
      roughness: 0.15,
      metalness: 0.15
    });

    const glowTex = getGlowTexture();

    for (let sIdx = 0; sIdx < shells.length; sIdx++) {
      const count = shells[sIdx];
      if (count <= 0) continue;

      const isValence = sIdx === maxShellIdx;
      const radius = baseRadius + sIdx * stepRadius;

      const shellPivot = new THREE.Group();
      if (this.orbitMode === '3d-tilted') {
        // Symmetric multi-axis 3D inclinations across shells
        const tiltX = ((sIdx % 2 === 0 ? 1 : -1) * (0.28 + sIdx * 0.21));
        const tiltZ = ((sIdx % 3 === 0 ? 0.35 : -0.32) * (1 + sIdx * 0.12));
        shellPivot.rotation.set(tiltX, sIdx * 0.65, tiltZ);
      } else {
        // Coplanar horizontal XZ plane (classic Bohr rings)
        shellPivot.rotation.set(0, 0, 0);
      }

      // Orbital ring
      const ringGeo = new THREE.TorusGeometry(radius, isValence ? 0.026 : 0.017, 12, 128);
      ringGeo.rotateX(Math.PI / 2);
      const ringColor = (isValence && this.highlightValence) ? '#fbbf24' : cat.color;
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: isValence ? 0.72 : 0.36
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      shellPivot.add(ringMesh);

      // Orbiting electron carrier group
      const orbitGroup = new THREE.Group();
      shellPivot.add(orbitGroup);

      const useValenceStyle = isValence && this.highlightValence;
      const eMat = useValenceStyle ? valenceMat : innerMat;

      for (let eIdx = 0; eIdx < count; eIdx++) {
        const theta = (eIdx / count) * Math.PI * 2;
        const electronNode = new THREE.Group();
        electronNode.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);

        const sphere = new THREE.Mesh(electronGeo, eMat);
        electronNode.add(sphere);

        const spriteMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: useValenceStyle ? '#fde047' : '#38bdf8',
          transparent: true,
          opacity: useValenceStyle ? 0.85 : 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.68, 0.68, 1);
        electronNode.add(sprite);

        orbitGroup.add(electronNode);
      }

      // Shell label badge placed in world-oriented space via labelsGroup attached to shellPivot
      const labelText = `${SHELL_LETTERS[sIdx] || `n=${sIdx + 1}`}: ${count}e⁻`;
      const label = createLabelSprite(labelText, {
        fontSize: 22,
        color: useValenceStyle ? '#fef08a' : '#cbd5e1',
        border: useValenceStyle ? 'rgba(251, 191, 36, 0.65)' : 'rgba(148, 163, 184, 0.35)',
        scale: 0.72
      });
      // Position label at local +X of shellPivot, transformed into labelsGroup
      const localLabelPos = new THREE.Vector3(radius + 0.15, 0.25, 0);
      localLabelPos.applyEuler(shellPivot.rotation);
      label.position.copy(localLabelPos);
      this.labelsGroup.add(label);

      this.shellsGroup.add(shellPivot);

      // Inner shells orbit faster than outer shells; alternate direction slightly for visual richness
      const dir = sIdx % 2 === 0 ? 1 : -1;
      const angularSpeed = dir * (1.25 / (1 + sIdx * 0.42));
      this.shellAnimators.push({ orbitGroup, shellPivot, angularSpeed });
    }
  }

  getCameraPreset(view = 'atom') {
    if (view === 'nucleus') {
      const dist = Math.max(3.6, this.nucleusRadius * 3.8);
      return {
        position: new THREE.Vector3(dist * 0.75, dist * 0.45, dist),
        target: new THREE.Vector3(0, 0, 0)
      };
    }

    const nShells = this.element ? this.element.shells.length : 4;
    const outerRadius = Math.max(2.8, this.nucleusRadius + 1.55) + (nShells - 1) * (nShells > 5 ? 1.18 : 1.38);
    const dist = outerRadius * 2.15 + 3.5;

    if (this.orbitMode === 'coplanar') {
      return {
        position: new THREE.Vector3(0, dist * 0.78, dist * 0.68),
        target: new THREE.Vector3(0, 0, 0)
      };
    }
    return {
      position: new THREE.Vector3(dist * 0.32, dist * 0.38, dist * 0.92),
      target: new THREE.Vector3(0, 0, 0)
    };
  }

  update(dt) {
    const step = dt * this.speed;
    if (step !== 0) {
      this.nucleusGroup.rotation.y += step * 0.38;
      this.nucleusGroup.rotation.x += step * 0.17;
      for (const anim of this.shellAnimators) {
        anim.orbitGroup.rotation.y += step * anim.angularSpeed;
      }
    }
  }

  dispose() {
    disposeGroupChildren(this.nucleusGroup);
    disposeGroupChildren(this.shellsGroup);
    disposeGroupChildren(this.labelsGroup);
  }
}

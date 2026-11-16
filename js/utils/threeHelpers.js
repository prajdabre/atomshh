import * as THREE from 'three';

let sharedGlowTexture = null;

/**
 * Returns a shared soft radial glow texture for particles and sprites.
 */
export function getGlowTexture() {
  if (sharedGlowTexture) return sharedGlowTexture;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  sharedGlowTexture = new THREE.CanvasTexture(canvas);
  sharedGlowTexture.colorSpace = THREE.SRGBColorSpace;
  return sharedGlowTexture;
}

/**
 * Recursively disposes geometries, materials, and non-shared textures in a scene subtree.
 */
export function disposeGroupChildren(group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    disposeSubtree(child);
  }
}

export function disposeSubtree(obj) {
  obj.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose();
    }
    if (node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const mat of mats) {
        if (mat.map && mat.map !== sharedGlowTexture) mat.map.dispose();
        if (mat.emissiveMap && mat.emissiveMap !== sharedGlowTexture) mat.emissiveMap.dispose();
        mat.dispose();
      }
    }
  });
}

/**
 * Creates a crisp 3D billboard text sprite.
 */
export function createLabelSprite(text, {
  fontSize = 26,
  color = '#e2e8f0',
  bg = 'rgba(10, 15, 28, 0.72)',
  border = 'rgba(148, 163, 184, 0.35)',
  scale = 0.9
} = {}) {
  const padX = 16;
  const padY = 10;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const textWidth = Math.ceil(ctx.measureText(text).width);

  canvas.width = Math.max(64, textWidth + padX * 2);
  canvas.height = fontSize + padY * 2;

  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = bg;
  roundRect(ctx, 1, 1, canvas.width - 2, canvas.height - 2, 10);
  ctx.fill();

  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(scale * aspect, scale, 1);
  return sprite;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

import { SCALE } from './constants';
import { HITBOXES } from './constants'; // optionally move this to constants.js entirely

// Compute collision box
export function getHitbox(entity, type) {
  const box = HITBOXES[type];
  return {
    x: entity.x + box.offsetX * SCALE,
    y: entity.y + box.offsetY * SCALE,
    width: box.width * SCALE,
    height: box.height * SCALE,
  };
}

// Axis-Aligned Bounding Box (AABB) collision check
export function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Optional: Draw hitbox outline for debugging
export function drawHitbox(ctx, entity, type) {
  const hb = getHitbox(entity, type);
  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 1;
  ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
}

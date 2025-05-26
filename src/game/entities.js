import { LOGIC_WIDTH, LOGIC_HEIGHT, SPRITE_SCALE, SCALE } from './constants';

// Spawn Enemies
export function spawnEnemies({ enemies, player, enemyMoveImage, enemyShootImage, getHitbox }) {
  const MAX_ENEMIES = 6;
  const NATIVE_SIZE = 512;
  const ENEMY_SIZE = NATIVE_SIZE * SPRITE_SCALE;

  if (enemies.length >= MAX_ENEMIES) return;

  const isChaser = Math.random() < 0.3;

  // Avoid more than one chaser
  if (isChaser && enemies.some(e => e.type === 'chaser')) return;

  let x;
  let tries = 0;
  const minSpacing = ENEMY_SIZE * 1.2;

  do {
    x = Math.random() * (LOGIC_WIDTH - ENEMY_SIZE);
    tries++;

    // Try to ensure spacing between enemies
    const overlaps = enemies.some(
      e => Math.abs(e.x - x) < minSpacing && Math.abs(e.y + ENEMY_SIZE) < 150
    );

    if (!overlaps || tries > 10) break;
  } while (true);

  const enemy = {
    x,
    y: -ENEMY_SIZE,
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    direction: Math.random() < 0.5 ? 1 : -1,
    type: isChaser ? 'chaser' : 'shooter',
    image: isChaser ? enemyMoveImage : enemyShootImage,
    ...(isChaser && {
      rotation: 0,
      flopTimer: Math.random() * 120 + 60,
      flopDirection: 1,
    }),
  };

  const enemyHitbox = getHitbox(enemy, isChaser ? 'enemyChaser' : 'enemyShooter');
  const playerHitbox = getHitbox(player, 'player');

  // Avoid unfair spawn on top of player
  if (!checkCollision(enemyHitbox, playerHitbox)) {
    enemies.push(enemy);
  }
}

// Spawn Coins
export function spawnCoin({ coins }) {
  if (Math.random() < 0.3) {
    coins.push({
      x: Math.random() * (LOGIC_WIDTH - 30 * SCALE),
      y: -30 * SCALE,
      width: 30 * SCALE,
      height: 30 * SCALE,
      speed: 1.5,
    });
  }
}

// Spawn Laser Warning
export function spawnLaser({ laserCooldown, laserWarning, player }) {
  if (laserCooldown.value > 0 || Math.random() > 0.01) return;

  const edge = ['top', 'left', 'right'][Math.floor(Math.random() * 3)];
  const fx = edge === 'top' ? Math.random() * LOGIC_WIDTH : edge === 'left' ? 0 : LOGIC_WIDTH;
  const fy = edge === 'top' ? 0 : Math.random() * LOGIC_HEIGHT;

  laserWarning.value = {
    edge,
    flareX: fx,
    flareY: fy,
    targetX: player.x + player.width / 2,
    targetY: player.y + player.height / 2,
    timer: 150,
  };

  laserCooldown.value = 300;
}

// Utility: Collision Detection
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

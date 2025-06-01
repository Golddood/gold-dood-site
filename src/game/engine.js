import {
  SPRITE_SCALE,
  SCALE,
  LOGIC_WIDTH,
  LOGIC_HEIGHT,
  DEBUG_HITBOXES,
} from './constants';
import { spawnEnemies, spawnCoin, spawnLaser } from './entities';
import { getHitbox, checkCollision, drawHitbox } from './utils';

export function runGameEngine({
  canvas,
  playerImage,
  coinImage,
  enemyMoveImage,
  enemyShootImage,
  setScore,
  setTime,
  setGameOver,
  setShowPlayer,
  setGameStarted,
  setModeSelected,
  setHighScore,
  setHighTime,
  setLives,
  livesRef,
  livesModeRef,
  gameResetRef,
  paused,
  setPaused,
}) {
  // ─── 1) Canvas & Invincibility Setup ─────────────────────
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
// how many pixels of overlap we require before we call it a hit
const MIN_COLLISION_OVERLAP = 8;

  // How long (ms) the player remains invincible after a hit
  const HIT_INVINCIBILITY_MS = 800;
  // One single flag, toggled on/off by handlePlayerHit
  let playerInvincible = false;
  let currentSessionId = 0;

  // ─── 2) Core Game State ──────────────────────────────────
  const bullets     = [];
  const enemies     = [];
  const enemyBullets= [];
  const coins       = [];
  const lasers      = [];
  const keys        = {};
  let frameCount    = 0;
  let elapsed       = 0;
  let animationId;
  let invincibilityTimeoutId;
  let gameStartTimeoutId;
  const laserCooldown = { value: 0 };
  const laserWarning  = { value: null };
  let gameRunning = true;
  let canShoot    = true;
  const ENEMY_SPAWN_INTERVAL = 60;
  let spawnTimer = 0;

  // Player object
  const PLAYER_SIZE = 52;
  const PLAYER_KNOCKBACK_DISTANCE = 40 * SCALE;
  const player = {
    x: LOGIC_WIDTH/2 - PLAYER_SIZE/2,
    y: LOGIC_HEIGHT - PLAYER_SIZE*1.5,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 5 * SCALE,
  };

  // ─── 3) Hit & Game-Over Handlers ─────────────────────────
  const handlePlayerHit = () => {
    // New guard: If in lives mode and lives are already 0 or less, do nothing.
    if (livesModeRef.current === 'lives' && livesRef.current <= 0) {
      return;
    }
    // Existing guard
    if (!gameRunning || playerInvincible) return;
    // turn on invincibility
    playerInvincible = true;
    setTimeout(() => (playerInvincible = false), HIT_INVINCIBILITY_MS);

    console.log('💥 Player hit! Lives before hit:', livesRef.current);

    if (livesModeRef.current === 'lives') {
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      if (newLives <= 0) triggerGameOver();
    } else {
      triggerGameOver();
    }
  };

  const triggerGameOver = () => {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    setShowPlayer(false);
    setGameOver(true);

    // reset UI back to start after 1s
    setTimeout(() => {
      setGameStarted(false);
      setModeSelected(false);
      setGameOver(false);
      setShowPlayer(true);
    }, 1000);
  };

  // ─── 4) Reset Logic ───────────────────────────────────────
  const resetGame = () => {
    currentSessionId++;
    const loopSessionId = currentSessionId;
    console.log(`[SESSION_DEBUG] resetGame: Incremented currentSessionId to ${currentSessionId}. loopSessionId for this reset is ${loopSessionId}.`);
    console.log('[RESET_DEBUG] resetGame START');
    gameRunning = false;
    cancelAnimationFrame(animationId);
    // clear existing timeouts
    clearTimeout(invincibilityTimeoutId);
    clearTimeout(gameStartTimeoutId);

    // clear everything
    bullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    coins.length = 0;
    lasers.length = 0;
    laserCooldown.value = 0;
    laserWarning.value   = null;
    frameCount = 0;
    elapsed    = 0;
    spawnTimer = ENEMY_SPAWN_INTERVAL;
    canShoot   = true; // Reset shooting ability

    // Clear any pressed keys
    for (const key in keys) {
      delete keys[key];
    }

    // reset player pos
    player.x = LOGIC_WIDTH/2 - player.width/2;
    player.y = LOGIC_HEIGHT - player.height*1.5;

    // reset UI states
    setScore(0);
    setTime(0);
    setGameOver(false);
    setShowPlayer(true);

    // reset lives
    if (livesModeRef.current === 'lives') {
      livesRef.current = 3;
      setLives(3);
      console.log('[resetGame] Lives reset. Current lives:', livesRef.current);
    }

    // give a brief invincibility at start
    playerInvincible = true;
    invincibilityTimeoutId = setTimeout(() => (playerInvincible = false), 2000);

    // then kick off the loop
    gameStartTimeoutId = setTimeout(() => {
      console.log(`[SESSION_DEBUG] Scheduling loop start for session ${loopSessionId}. Current global session: ${currentSessionId}`);
      gameRunning = true;
      animationId = requestAnimationFrame(() => loop(loopSessionId)); // NEW
    }, 300);
    console.log(`[RESET_DEBUG] resetGame END. playerInvincible: ${playerInvincible}, livesRef.current: ${livesRef.current}`);
  };
  gameResetRef.current = resetGame;

  // ─── 5) Input Listeners ──────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === 'p') {
      setPaused && setPaused((prev) => !prev); // Toggle pause state
      return; // Prevent other actions if 'P' is pressed
    }
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'Spacebar') && canShoot) {
      bullets.push({
        x:      player.x + player.width/2 - 2,
        y:      player.y,
        width:  4,
        height: 10,
        speed:  10,
      });
      canShoot = false;
      setTimeout(() => (canShoot = true), 200);
    }
  };
  const handleKeyUp = (e) => {
    keys[e.key] = false;
  };
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup',   handleKeyUp);

  // ─── 6) Main Game Loop ───────────────────────────────────
  const loop = (thisLoopSessionId) => {
    if (thisLoopSessionId !== currentSessionId) {
      console.log(`[SESSION_DEBUG] Stale loop (session ${thisLoopSessionId}) detected. Current global session: ${currentSessionId}. Bailing out.`);
      return;
    }
    if (!gameRunning) {
      console.log(`[SESSION_DEBUG] gameRunning is false for session ${thisLoopSessionId}. Bailing out.`);
      return;
    }

    if (paused) {
      // Request the next frame to keep the loop alive and responsive to unpause
      animationId = requestAnimationFrame(() => loop(thisLoopSessionId));

      // Draw "Paused" overlay
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
      ctx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

      ctx.fillStyle = 'white';
      ctx.font = `${32 * SCALE}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Paused', LOGIC_WIDTH / 2, LOGIC_HEIGHT / 2);
      ctx.restore();
      return; // Skip the rest of the game logic for this frame
    }
    animationId = requestAnimationFrame(() => loop(thisLoopSessionId)); // NEW
    frameCount++;

    // clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

    // timing
    if (frameCount % 60 === 0) {
      elapsed++;
      setTime(elapsed);
    }

    // spawn logic
    if (--spawnTimer <= 0) {
      spawnEnemies({
        enemies,
        player,
        enemyMoveImage,
        enemyShootImage,
        getHitbox,
      });
      spawnTimer = ENEMY_SPAWN_INTERVAL;
    }
    spawnCoin({ coins });
    spawnLaser({ laserCooldown, laserWarning, player });
    laserCooldown.value = Math.max(0, laserCooldown.value - 1);

    // player movement & draw
    if (keys['ArrowLeft'] || keys['a'])    player.x -= player.speed;
    if (keys['ArrowRight']|| keys['d'])    player.x += player.speed;
    if (keys['ArrowUp']   || keys['w'])    player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s'])    player.y += player.speed;
    player.x = Math.max(0, Math.min(player.x, LOGIC_WIDTH - player.width));
    player.y = Math.max(
      LOGIC_HEIGHT/2,
      Math.min(player.y, LOGIC_HEIGHT - player.height)
    );

    if (playerImage?.complete) {
      ctx.drawImage(
        playerImage,
        0,0,512,512,
        player.x,player.y,player.width,player.height
      );
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    drawHitbox(ctx, player, 'player');

    // enemies & collision
    console.log('Loop Start - Enemies Array:', JSON.stringify(enemies.map(e => ({ x: e.x, y: e.y, type: e.type, width: e.width, height: e.height, imageSrc: e.image ? e.image.src : 'No image', imageComplete: e.image ? e.image.complete : 'No image' }))));
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy   = enemies[i];
      console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, Processing enemy ${i}: Type: ${enemy.type}, X: ${enemy.x}, Y: ${enemy.y}, Rotation: ${enemy.rotation || 0}, PlayerInvincible: ${playerInvincible}`);
      console.log('Processing Enemy:', {
        index: i,
        x: enemy.x,
        y: enemy.y,
        width: enemy.width,
        height: enemy.height,
        type: enemy.type,
        rotation: enemy.rotation,
        flopTimer: enemy.flopTimer,
        imageSrc: enemy.image ? enemy.image.src : 'No image object',
        imageComplete: enemy.image ? enemy.image.complete : 'No image object'
      });
        // Since your spawner sets enemy.type to "enemyChaser" or "enemyShooter":
        const boxType = enemy.type;

      // movement
      if (enemy.type === 'enemyChaser') {
        const horizontalSpeed = 0.65 * player.speed;
        const verticalSpeedPlayerTarget = 0.65 * player.speed;
        const standardFallSpeed = 1.5;
        // Horizontal movement
        if (enemy.x < player.x) {
          enemy.x += horizontalSpeed;
          // Prevent overshooting
          if (enemy.x > player.x) enemy.x = player.x;
        } else if (enemy.x > player.x) {
          enemy.x -= horizontalSpeed;
          // Prevent overshooting
          if (enemy.x < player.x) enemy.x = player.x;
        }

        // Vertical movement
        if (player.y > enemy.y) { // Player is below enemy
          // Move towards player, but don't overshoot
          enemy.y = Math.min(player.y, enemy.y + verticalSpeedPlayerTarget);
      } else {
        enemy.y += 1.5;
      }
        // Flop animation
        enemy.flopTimer--;
        if (enemy.flopTimer <= 0) {
          enemy.flopTimer    = Math.random() * 120 + 60;
          enemy.flopDirection*= -1;
          enemy.rotation     = 0.25 * enemy.flopDirection;
        } else {
          enemy.rotation *= 0.9;
        }
      } else {
        enemy.y += 1.5;
      }

      // draw
      let drewSuccessfully = false;
      if (enemy.image?.complete) {
        try {
          ctx.save();
          ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          if (enemy.type === 'enemyChaser') ctx.rotate(enemy.rotation || 0);
          ctx.drawImage(
            enemy.image,
            -enemy.width/2,
            -enemy.height/2,
            enemy.width,
            enemy.height
          );
          ctx.restore();
          // Check if the image actually drew something (won't work if image is transparent)
          // For now, assume success if no error and complete is true.
          // A more robust check might involve getImageData, but that's slow.
          drewSuccessfully = true; 
        } catch (e) {
          console.error("Error drawing enemy image:", e, enemy);
          drewSuccessfully = false;
        }
      }

      if (!drewSuccessfully) { // If image object missing, or not complete, or drawImage failed or (heuristically) drew nothing
        console.log(`Fallback drawing for enemy: ${enemy.type} at ${enemy.x}, ${enemy.y}. Image complete: ${enemy.image?.complete}`);
        ctx.fillStyle = 'red'; // BRIGHT RED
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height); // Full enemy rect
        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`FALLBACK ${enemy.type}`, enemy.x + 2, enemy.y + 10);
      }
      drawHitbox(ctx, enemy, boxType); // Hitbox is lime
 // ─── skip collision until enemy is on–screen ──────────────
if (enemy.y < 0) {
   // it’s still above the top edge—skip checking collision
   continue;
}      // collision check
// after drawHitbox(ctx, enemy, boxType);

const enemyBoxForCollision = getHitbox(enemy, boxType); // Calculate enemy box

if (enemyBoxForCollision.y + enemyBoxForCollision.height < LOGIC_HEIGHT / 2) {
    // Enemy is too high, collision check with player is skipped for this frame.
    console.log(`[COLLISION_GUARD] Frame: ${frameCount}, Skipping enemy ${i} (type ${enemy.type}). EnemyBox bottom: ${enemyBoxForCollision.y + enemyBoxForCollision.height}. Player movement area top: ${LOGIC_HEIGHT / 2}`);
} else {
    // Enemy is in a potentially interactive zone, proceed with player collision check.
    const playerBox = getHitbox(player, 'player');
    // The PRE-CHECK log currently uses 'enemyBox'. Ensure it uses 'enemyBoxForCollision'.
    // Modify the existing PRE-CHECK log:
    console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, PRE-CHECK PlayerBox:`, playerBox, `EnemyBox (${i}):`, enemyBoxForCollision);
    
    if (checkCollision(playerBox, enemyBoxForCollision)) {
        console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, CHECK PASSED for enemy ${i}. PlayerInvincible: ${playerInvincible}`);
        if (!playerInvincible) {
        // compute actual overlap on each axis
        const overlapX = Math.min(
          playerBox.x + playerBox.width,
          enemyBoxForCollision.x  + enemyBoxForCollision.width
        ) - Math.max(playerBox.x, enemyBoxForCollision.x);

        const overlapY = Math.min(
          playerBox.y + playerBox.height,
          enemyBoxForCollision.y  + enemyBoxForCollision.height
        ) - Math.max(playerBox.y, enemyBoxForCollision.y);
        console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, Enemy ${i} Overlap: X=${overlapX}, Y=${overlapY}. MIN_OVERLAP=${MIN_COLLISION_OVERLAP}`);

        // only a real hit if both overlaps exceed our threshold
        if (overlapX > MIN_COLLISION_OVERLAP && overlapY > MIN_COLLISION_OVERLAP) {
          console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, THRESHOLD PASSED for enemy ${i}. Calling handlePlayerHit.`);
          console.log(
            '💥 Real hit:', { overlapX, overlapY },
            'playerBox', playerBox,
            'enemyBox', enemyBoxForCollision
          );

          // HYPER-AGGRESSIVE DIAGNOSTIC DRAW FOR COLLIDING ENEMY
          console.log('[DIAGNOSTIC DRAW] Attempting to highlight colliding enemy. Enemy details:', enemy, 'EnemyBox:', enemyBoxForCollision);

          // Clear a slightly larger area around the enemy's hitbox to ensure visibility
          ctx.clearRect(enemyBoxForCollision.x - 5, enemyBoxForCollision.y - 5, enemyBoxForCollision.width + 10, enemyBoxForCollision.height + 10);

          // Prominent hitbox style
          ctx.strokeStyle = 'yellow'; // Bright yellow
          ctx.lineWidth = 4;          // Very thick
          ctx.setLineDash([5, 3]);    // Dashed line

          // Re-draw the hitbox
          ctx.strokeRect(enemyBoxForCollision.x, enemyBoxForCollision.y, enemyBoxForCollision.width, enemyBoxForCollision.height);

    // Reset line dash for subsequent drawing
    ctx.setLineDash([]);
    // END DIAGNOSTIC DRAW

    // Player knockback logic
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;

    let dx = playerCenterX - enemyCenterX;
    let dy = playerCenterY - enemyCenterY;

    const length = Math.sqrt(dx * dx + dy * dy);
    let normDx = 0;
    let normDy = -1; // Default knockback direction (upwards) if centers overlap

    if (length !== 0) {
      normDx = dx / length;
      normDy = dy / length;
    }

    player.x += normDx * PLAYER_KNOCKBACK_DISTANCE;
    player.y += normDy * PLAYER_KNOCKBACK_DISTANCE;
    
    // Existing player boundary checks later in the loop will handle clamping.
    // Enemy is NOT removed.
    handlePlayerHit();
    console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, AFTER handlePlayerHit for enemy ${i}. Current lives: ${livesRef.current}`);
    continue;
  } else {
      console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, THRESHOLD FAILED for enemy ${i}. No hit registered.`);
  }
} else {
  console.log(`[COLLISION_DEBUG] Frame: ${frameCount}, CHECK PASSED but player invincible for enemy ${i}. No hit registered.`);
}
}
} // This closes the new 'else' block for the guard condition

// off‐screen removal
if (enemy.y > LOGIC_HEIGHT) {
  enemies.splice(i, 1);
}
    }

    // draw lives
    if (livesModeRef.current === 'lives') {
      ctx.font          = `${16 * SCALE}px Arial`;
      ctx.textAlign     = 'right';
      ctx.textBaseline  = 'top';
      for (let i = 0; i < 3; i++) {
        const x = LOGIC_WIDTH - 10 - i * (25 * SCALE);
        ctx.fillText(i < livesRef.current ? '❤️' : '🖤', x, 10);
      }
    }
  };

  // ─── 7) Kickoff & Cleanup ───────────────────────────────
  resetGame();
  return () => {
    cancelAnimationFrame(animationId);
    clearTimeout(invincibilityTimeoutId);
    clearTimeout(gameStartTimeoutId);
    gameRunning = false;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup',   handleKeyUp);
  };
}

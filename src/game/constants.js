// Game Dimensions
export const LOGIC_WIDTH = 360;
export const LOGIC_HEIGHT = 640;

export const CANVAS_DISPLAY_WIDTH = 540;
export const CANVAS_DISPLAY_HEIGHT = 960;

// Scaling
export const SPRITE_SCALE = 64 / 512; // 64px target from 512px sprite
export const SCALE = 1;

// Debug
export const DEBUG_HITBOXES = true;

// Player
export const PLAYER_SIZE = 52;

// Hitboxes
export const HITBOXES = {
  player: { offsetX: 15, offsetY: 2, width: 20, height: 46 },
  coin: { offsetX: 4, offsetY: 4, width: 22, height: 22 },
  enemyChaser: { offsetX: 0, offsetY: 20, width: 64, height: 25 },
  enemyShooter: { offsetX: 6, offsetY: 1, width: 50, height: 49 },
};

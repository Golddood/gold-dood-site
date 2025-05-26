// src/game/assets.js

export function loadAssets(onAllLoaded) {
  const playerImage = new Image();
  const coinImage = new Image();
  const enemyMoveImage = new Image();
  const enemyShootImage = new Image();

  let loaded = 0;
  const checkLoaded = () => {
    loaded++;
    if (loaded === 4) {
      console.log('✅ All images loaded.');
      onAllLoaded({ playerImage, coinImage, enemyMoveImage, enemyShootImage });
    }
  };

  playerImage.onload = () => {
    console.log('✅ Player image loaded:', playerImage.width, playerImage.height);
    checkLoaded();
  };
  playerImage.onerror = () => {
    console.error('❌ Failed to load player image:', playerImage.src);
    checkLoaded();
  };

  [coinImage, enemyMoveImage, enemyShootImage].forEach((img) => {
    img.onload = checkLoaded;
    img.onerror = () => {
      console.error(`❌ Failed to load image: ${img.src}`);
      checkLoaded();
    };
  });

  // Image source paths
  playerImage.src = '/player.png';
  coinImage.src = '/goldcoin.png';
  enemyMoveImage.src = '/enemiesMove.png';
  enemyShootImage.src = '/enemiesShoot.png';
}

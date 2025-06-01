import React, { useEffect, useRef, useState } from 'react';
import {
  LOGIC_WIDTH,
  LOGIC_HEIGHT,
  CANVAS_DISPLAY_WIDTH,
  CANVAS_DISPLAY_HEIGHT,
} from '../game/constants';
import { loadAssets } from '../game/assets';
import { runGameEngine } from '../game/engine';
import { getHitbox } from '../game/utils';

function Boneship() {
  const canvasRef = useRef(null);
  const gameResetRef = useRef(() => {});

  // Game State
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highTime, setHighTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);
  const [livesMode, setLivesMode] = useState('instant');
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const livesModeRef = useRef(livesMode);
  const [showPlayer, setShowPlayer] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [paused, setPaused] = useState(false);

  // Asset Refs
  const playerImageRef = useRef();
  const coinImageRef = useRef();
  const enemyMoveImageRef = useRef();
  const enemyShootImageRef = useRef();

  // Load Assets
  useEffect(() => {
    loadAssets(({ playerImage, coinImage, enemyMoveImage, enemyShootImage }) => {
      playerImageRef.current = playerImage;
      coinImageRef.current = coinImage;
      enemyMoveImageRef.current = enemyMoveImage;
      enemyShootImageRef.current = enemyShootImage;
      setAssetsLoaded(true);
    });
  }, []);

  // Keep ref in sync
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    livesModeRef.current = livesMode;
  }, [livesMode]);

  // Reset when mode selected & start pressed
  useEffect(() => {
    if (gameStarted && assetsLoaded && canvasRef.current) {
      // engine’s resetGame will run here
      gameResetRef.current();
    }
  }, [gameStarted, assetsLoaded]);

  // Run Game Engine
  useEffect(() => {
    if (!gameStarted || !assetsLoaded || !canvasRef.current) return;

    const cleanup = runGameEngine({
      canvas: canvasRef.current,
      playerImage: playerImageRef.current,
      coinImage: coinImageRef.current,
      enemyMoveImage: enemyMoveImageRef.current,
      enemyShootImage: enemyShootImageRef.current,
      getHitbox,
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
    });

    return cleanup;
  }, [gameStarted, assetsLoaded]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={LOGIC_WIDTH}
          height={LOGIC_HEIGHT}
          className="border-2 border-gray-300"
          style={{
            width: `${CANVAS_DISPLAY_WIDTH}px`,
            height: `${CANVAS_DISPLAY_HEIGHT}px`,
            imageRendering: 'pixelated',
            backgroundColor: 'black',
          }}
        />
        {gameStarted && !gameOver && (
          <button
            className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setPaused((prev) => !prev)}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        )}
        {!gameStarted && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            {!modeSelected ? (
              <div className="flex gap-4">
                <button
                  className="bg-red-500 px-4 py-2 rounded text-white"
                  onClick={() => {
                    setLivesMode('instant');
                    setModeSelected(true);
                  }}
                >
                  Instant Death
                </button>
                <button
                  className="bg-yellow-400 px-4 py-2 rounded text-black"
                  onClick={() => {
                    setLivesMode('lives');
                    setModeSelected(true);
                  }}
                >
                  3 Lives Mode
                </button>
              </div>
            ) : (
              <button
                className="bg-green-500 px-6 py-2 rounded text-white"
                onClick={() => {
                  // reset UI flags
                  setShowPlayer(true);
                  setGameOver(false);
                  setScore(0);
                  setTime(0);
                  // reset lives if in 3-lives mode
                  if (livesMode === 'lives') {
                    setLives(3);
                    livesRef.current = 3;
                  }
                  // kick off engine reset + start
                  setGameStarted(true);
                }}
              >
                Start Game
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm z-20 relative min-h-[3rem] text-white text-center">
        {gameStarted ? (
          <>
            <p>Score: {score} | Time: {time}s</p>
            <p className="text-yellow-400">
              Highscore – Coins: {highScore}, Time: {highTime}s
            </p>
            {gameOver && <p className="text-red-500 mt-2 font-bold">Game Over</p>}
          </>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>
    </div>
  );
}

export default Boneship;

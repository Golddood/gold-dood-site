// Test for Chaser Enemy Movement Logic

// --- Mock Player and Enemy Objects ---
const mockPlayer = {
  x: 0,
  y: 0,
  speed: 5, // Default player speed
};

const mockEnemy = {
  x: 0,
  y: 0,
  type: 'chaser',
  width: 50,  // Example value
  height: 50, // Example value
  // Flop animation properties (not directly tested for movement logic but part of object)
  flopTimer: 60,
  flopDirection: 1,
  rotation: 0,
};

// --- Constants ---
const STANDARD_FALL_SPEED = 1.5;

// --- Chaser Movement Logic (extracted and adapted from engine.js) ---
function updateChaserMovement(enemy, player) {
  const newEnemyState = { ...enemy }; // Avoid modifying the original object directly

  const horizontalSpeed = 0.85 * player.speed;
  const verticalSpeedPlayerTarget = 0.85 * player.speed;

  // Horizontal movement
  if (newEnemyState.x < player.x) {
    newEnemyState.x += horizontalSpeed;
    if (newEnemyState.x > player.x) newEnemyState.x = player.x; // Prevent overshooting
  } else if (newEnemyState.x > player.x) {
    newEnemyState.x -= horizontalSpeed;
    if (newEnemyState.x < player.x) newEnemyState.x = player.x; // Prevent overshooting
  }

  // Vertical movement
  if (player.y > newEnemyState.y) { // Player is below enemy
    newEnemyState.y += verticalSpeedPlayerTarget;
  } else { // Player is above or at the same level as enemy
    newEnemyState.y += STANDARD_FALL_SPEED;
  }

  // Flop animation logic (kept for completeness, not the focus of this movement test)
  newEnemyState.flopTimer--;
  if (newEnemyState.flopTimer <= 0) {
    newEnemyState.flopTimer = Math.random() * 120 + 60;
    newEnemyState.flopDirection *= -1;
    newEnemyState.rotation = 0.25 * newEnemyState.flopDirection;
  } else {
    newEnemyState.rotation *= 0.9;
  }

  return newEnemyState;
}

// --- Test Scenarios ---
function runTests() {
  let allTestsPassed = true;
  let testCount = 0;
  let passedCount = 0;

  function assertEqual(actual, expected, message) {
    testCount++;
    if (Math.abs(actual - expected) < 0.001) { // Using a small tolerance for float comparison
      console.log(`PASS: ${message} (Expected: ${expected}, Got: ${actual})`);
      passedCount++;
    } else {
      console.error(`FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
      allTestsPassed = false;
    }
  }

  console.log("--- Starting Chaser Movement Tests ---");

  // Scenario 1: Player is below and to the right of the chaser
  console.log("\n--- Scenario 1: Player below and right ---");
  const player1 = { ...mockPlayer, x: 100, y: 100, speed: 5 };
  const enemy1_initial = { ...mockEnemy, x: 50, y: 50 };
  const enemy1_expected_x = 50 + (0.85 * player1.speed); // 50 + 4.25 = 54.25
  const enemy1_expected_y = 50 + (0.85 * player1.speed); // 50 + 4.25 = 54.25

  const enemy1_actual = updateChaserMovement(enemy1_initial, player1);

  assertEqual(enemy1_actual.x, enemy1_expected_x, "Scenario 1 - Enemy X position");
  assertEqual(enemy1_actual.y, enemy1_expected_y, "Scenario 1 - Enemy Y position");

  // Scenario 2: Player is above and to the left of the chaser
  console.log("\n--- Scenario 2: Player above and left ---");
  const player2 = { ...mockPlayer, x: 50, y: 50, speed: 5 };
  const enemy2_initial = { ...mockEnemy, x: 100, y: 100 };
  const enemy2_expected_x = 100 - (0.85 * player2.speed); // 100 - 4.25 = 95.75
  const enemy2_expected_y = 100 + STANDARD_FALL_SPEED;   // 100 + 1.5 = 101.5

  const enemy2_actual = updateChaserMovement(enemy2_initial, player2);

  assertEqual(enemy2_actual.x, enemy2_expected_x, "Scenario 2 - Enemy X position");
  assertEqual(enemy2_actual.y, enemy2_expected_y, "Scenario 2 - Enemy Y position");

  // Scenario 3: Player directly to the right, enemy should not overshoot
  console.log("\n--- Scenario 3: Player close right (test overshoot prevention) ---");
  const player3 = { ...mockPlayer, x: 52, y: 50, speed: 5 }; // Player is 2 units away
  const enemy3_initial = { ...mockEnemy, x: 50, y: 50 };
  // Horizontal speed is 4.25. Since player is only 2 units away, enemy should move to player.x
  const enemy3_expected_x = player3.x; 
  const enemy3_expected_y = 50 + STANDARD_FALL_SPEED; // Player is level, so standard fall

  const enemy3_actual = updateChaserMovement(enemy3_initial, player3);
  assertEqual(enemy3_actual.x, enemy3_expected_x, "Scenario 3 - Enemy X position (overshoot)");
  assertEqual(enemy3_actual.y, enemy3_expected_y, "Scenario 3 - Enemy Y position");

  // Scenario 4: Player directly to the left, enemy should not overshoot
  console.log("\n--- Scenario 4: Player close left (test overshoot prevention) ---");
  const player4 = { ...mockPlayer, x: 48, y: 50, speed: 5 }; // Player is 2 units away
  const enemy4_initial = { ...mockEnemy, x: 50, y: 50 };
  // Horizontal speed is 4.25. Since player is only 2 units away, enemy should move to player.x
  const enemy4_expected_x = player4.x;
  const enemy4_expected_y = 50 + STANDARD_FALL_SPEED; // Player is level, so standard fall

  const enemy4_actual = updateChaserMovement(enemy4_initial, player4);
  assertEqual(enemy4_actual.x, enemy4_expected_x, "Scenario 4 - Enemy X position (overshoot)");
  assertEqual(enemy4_actual.y, enemy4_expected_y, "Scenario 4 - Enemy Y position");


  console.log("\n--- Test Summary ---");
  console.log(`Total tests: ${testCount}, Passed: ${passedCount}, Failed: ${testCount - passedCount}`);
  if (allTestsPassed) {
    console.log("✅ All chaser movement tests passed!");
  } else {
    console.error("❌ Some chaser movement tests failed.");
  }
  console.log("--------------------------------------");

  return allTestsPassed;
}

// --- How to Run ---
// To run these tests, save this file as 'test_enemy_movement.js'
// within the 'src/game/' directory.
// Then, execute it using Node.js from the root project directory:
//
// node src/game/test_enemy_movement.js
//
// The results of the tests will be printed to the console.

// Automatically run tests if the script is executed directly
// Changed for ES Module compatibility: directly call runTests()
runTests();

// Export for potential use in other modules (though not currently planned)
// For ES module compatibility, you would use 'export { ... }'
// However, for this standalone test script, exports are not strictly needed
// if it's only meant to be run directly.
export {
  updateChaserMovement,
  runTests,
  mockPlayer,
  mockEnemy
};

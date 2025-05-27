// Test for Player Knockback Collision Mechanic

// --- Mock Objects and Constants ---
const mockPlayerStart = {
  x: 0,
  y: 0,
  width: 10,
  height: 10,
  isInvincible: false, // For testing handlePlayerHit effect
};

const mockEnemyStart = {
  x: 0,
  y: 0,
  width: 10,
  height: 10,
};

const PLAYER_KNOCKBACK_DISTANCE = 40; // Assuming SCALE = 1 for simplicity

// Mock handlePlayerHit function
let handlePlayerHitCalled = false;
function mockHandlePlayerHit(playerObj) {
  handlePlayerHitCalled = true;
  playerObj.isInvincible = true; // Simulate one effect of handlePlayerHit
}

// --- Collision and Knockback Logic (extracted and adapted from engine.js) ---
function simulatePlayerKnockback(player, enemy) {
  const playerAfterKnockback = { ...player }; // Avoid modifying the original object directly
  const enemyAfterCollision = { ...enemy };   // Enemy state does not change in this interaction

  // Reset mock states for fresh test
  handlePlayerHitCalled = false;
  playerAfterKnockback.isInvincible = false;

  // Simplified collision check (assuming collision is always true for these tests)
  // The core logic to test is the knockback itself.

  const playerCenterX = playerAfterKnockback.x + playerAfterKnockback.width / 2;
  const playerCenterY = playerAfterKnockback.y + playerAfterKnockback.height / 2;
  const enemyCenterX = enemyAfterCollision.x + enemyAfterCollision.width / 2;
  const enemyCenterY = enemyAfterCollision.y + enemyAfterCollision.height / 2;

  let dx = playerCenterX - enemyCenterX;
  let dy = playerCenterY - enemyCenterY;

  const length = Math.sqrt(dx * dx + dy * dy);
  let normDx = 0;
  let normDy = -1; // Default knockback direction (player upwards) if centers overlap

  if (length !== 0) {
    normDx = dx / length;
    normDy = dy / length;
  }

  playerAfterKnockback.x += normDx * PLAYER_KNOCKBACK_DISTANCE;
  playerAfterKnockback.y += normDy * PLAYER_KNOCKBACK_DISTANCE;
  
  // Call the mocked player hit handler
  mockHandlePlayerHit(playerAfterKnockback);

  return { player: playerAfterKnockback, enemy: enemyAfterCollision };
}

// --- Test Scenarios ---
function runTests() {
  let allTestsPassed = true;
  let testCount = 0;
  let passedCount = 0;

  function assertEqual(actual, expected, message, isBoolean = false) {
    testCount++;
    const condition = isBoolean ? (actual === expected) : (Math.abs(actual - expected) < 0.001);
    if (condition) {
      console.log(`PASS: ${message} (Expected: ${expected}, Got: ${actual})`);
      passedCount++;
    } else {
      console.error(`FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
      allTestsPassed = false;
    }
  }
  
  console.log("--- Starting Player Knockback Collision Tests ---");

  // Scenario 1: Direct Head-on Collision (Player below Enemy)
  console.log("\n--- Scenario 1: Player below Enemy ---");
  const player1_initial = { ...mockPlayerStart, x: 50, y: 70 };
  const enemy1_initial = { ...mockEnemyStart, x: 50, y: 50 };
  
  const result1 = simulatePlayerKnockback(player1_initial, enemy1_initial);
  const player1_actual = result1.player;
  const enemy1_actual = result1.enemy;

  // Expected: Player is directly below enemy, so knockback is downwards.
  // dx = (50+5) - (50+5) = 0
  // dy = (70+5) - (50+5) = 20
  // length = 20
  // normDx = 0, normDy = 1
  const player1_expected_x = player1_initial.x + (0 * PLAYER_KNOCKBACK_DISTANCE); // 50
  const player1_expected_y = player1_initial.y + (1 * PLAYER_KNOCKBACK_DISTANCE); // 70 + 40 = 110
  
  assertEqual(enemy1_actual.x, enemy1_initial.x, "Scenario 1 - Enemy X position unchanged");
  assertEqual(enemy1_actual.y, enemy1_initial.y, "Scenario 1 - Enemy Y position unchanged");
  assertEqual(player1_actual.x, player1_expected_x, "Scenario 1 - Player X after knockback");
  assertEqual(player1_actual.y, player1_expected_y, "Scenario 1 - Player Y after knockback");
  assertEqual(handlePlayerHitCalled, true, "Scenario 1 - handlePlayerHit was called", true);
  assertEqual(player1_actual.isInvincible, true, "Scenario 1 - Player is invincible", true);
  
  // Scenario 2: Angled Collision (Player to the left and slightly below Enemy)
  console.log("\n--- Scenario 2: Angled Collision (Player left-below) ---");
  const player2_initial = { ...mockPlayerStart, x: 30, y: 60 }; // Player center: (35, 65)
  const enemy2_initial = { ...mockEnemyStart, x: 50, y: 50 };   // Enemy center: (55, 55)

  const result2 = simulatePlayerKnockback(player2_initial, enemy2_initial);
  const player2_actual = result2.player;
  const enemy2_actual = result2.enemy;

  // dx = (35) - (55) = -20
  // dy = (65) - (55) = 10
  // length = sqrt((-20)^2 + 10^2) = sqrt(400 + 100) = sqrt(500) = 22.36067977...
  const s2_dx = -20;
  const s2_dy = 10;
  const s2_length = Math.sqrt(s2_dx * s2_dx + s2_dy * s2_dy);
  const s2_normDx = s2_dx / s2_length; // Approx -0.8944
  const s2_normDy = s2_dy / s2_length; // Approx 0.4472

  const player2_expected_x = player2_initial.x + (s2_normDx * PLAYER_KNOCKBACK_DISTANCE);
  const player2_expected_y = player2_initial.y + (s2_normDy * PLAYER_KNOCKBACK_DISTANCE);
  
  assertEqual(enemy2_actual.x, enemy2_initial.x, "Scenario 2 - Enemy X position unchanged");
  assertEqual(enemy2_actual.y, enemy2_initial.y, "Scenario 2 - Enemy Y position unchanged");
  assertEqual(player2_actual.x, player2_expected_x, "Scenario 2 - Player X after knockback");
  assertEqual(player2_actual.y, player2_expected_y, "Scenario 2 - Player Y after knockback");
  assertEqual(handlePlayerHitCalled, true, "Scenario 2 - handlePlayerHit was called", true);
  assertEqual(player2_actual.isInvincible, true, "Scenario 2 - Player is invincible", true);

  // Scenario 3: Perfect Center Overlap
  console.log("\n--- Scenario 3: Perfect Center Overlap ---");
  const player3_initial = { ...mockPlayerStart, x: 50, y: 50 }; // Player center: (55, 55)
  const enemy3_initial = { ...mockEnemyStart, x: 50, y: 50 };   // Enemy center: (55, 55)

  const result3 = simulatePlayerKnockback(player3_initial, enemy3_initial);
  const player3_actual = result3.player;
  const enemy3_actual = result3.enemy;
  
  // dx = 0, dy = 0, length = 0. Default knockback: normDx = 0, normDy = -1 (player upwards)
  const player3_expected_x = player3_initial.x + (0 * PLAYER_KNOCKBACK_DISTANCE); // 50
  const player3_expected_y = player3_initial.y + (-1 * PLAYER_KNOCKBACK_DISTANCE); // 50 - 40 = 10

  assertEqual(enemy3_actual.x, enemy3_initial.x, "Scenario 3 - Enemy X position unchanged");
  assertEqual(enemy3_actual.y, enemy3_initial.y, "Scenario 3 - Enemy Y position unchanged");
  assertEqual(player3_actual.x, player3_expected_x, "Scenario 3 - Player X after knockback");
  assertEqual(player3_actual.y, player3_expected_y, "Scenario 3 - Player Y after knockback");
  assertEqual(handlePlayerHitCalled, true, "Scenario 3 - handlePlayerHit was called", true);
  assertEqual(player3_actual.isInvincible, true, "Scenario 3 - Player is invincible", true);


  console.log("\n--- Test Summary ---");
  console.log(`Total tests: ${testCount}, Passed: ${passedCount}, Failed: ${testCount - passedCount}`);
  if (allTestsPassed) {
    console.log("✅ All player knockback tests passed!");
  } else {
    console.error("❌ Some player knockback tests failed.");
  }
  console.log("--------------------------------------");

  return allTestsPassed;
}

// --- How to Run ---
// To run these tests, save this file as 'test_collision.js'
// within the 'src/game/' directory.
// Then, execute it using Node.js from the root project directory:
//
// node src/game/test_collision.js
//
// The results of the tests will be printed to the console.

// Automatically run tests if the script is executed directly
runTests();

// Export for potential use in other modules (though not currently planned)
export {
  simulatePlayerKnockback,
  runTests,
  mockPlayerStart,
  mockEnemyStart
};

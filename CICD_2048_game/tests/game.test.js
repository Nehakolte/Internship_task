const assert = require("assert");
const { emptyGrid, slideRowLeft, move, canMove, hasWon } = require("../src/script.js");

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS - ${name}`);
    return true;
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(`         ${err.message}`);
    return false;
  }
}

console.log("Running 2048 game logic tests...\n");
let failures = 0;
const results = [];

results.push(test("emptyGrid creates a 4x4 grid of zeros", () => {
  const grid = emptyGrid();
  assert.strictEqual(grid.length, 4);
  grid.forEach((row) => {
    assert.strictEqual(row.length, 4);
    row.forEach((v) => assert.strictEqual(v, 0));
  });
}));

results.push(test("slideRowLeft merges equal adjacent tiles", () => {
  const { row, scoreGained } = slideRowLeft([2, 2, 0, 0]);
  assert.deepStrictEqual(row, [4, 0, 0, 0]);
  assert.strictEqual(scoreGained, 4);
}));

results.push(test("slideRowLeft does not double-merge in one move", () => {
  const { row } = slideRowLeft([2, 2, 2, 2]);
  assert.deepStrictEqual(row, [4, 4, 0, 0]);
}));

results.push(test("slideRowLeft compacts without merging non-equal tiles", () => {
  const { row } = slideRowLeft([0, 2, 0, 4]);
  assert.deepStrictEqual(row, [2, 4, 0, 0]);
}));

results.push(test("move('left') slides entire grid correctly", () => {
  const grid = [
    [0, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  const { grid: newGrid, scoreGained } = move(grid, "left");
  assert.deepStrictEqual(newGrid[0], [4, 0, 0, 0]);
  assert.strictEqual(scoreGained, 4);
}));

results.push(test("move('right') slides entire grid correctly", () => {
  const grid = [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  const { grid: newGrid } = move(grid, "right");
  assert.deepStrictEqual(newGrid[0], [0, 0, 0, 4]);
}));

results.push(test("canMove returns true when empty cells exist", () => {
  const grid = emptyGrid();
  assert.strictEqual(canMove(grid), true);
}));

results.push(test("canMove returns false on a full, unmergeable grid", () => {
  const grid = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];
  assert.strictEqual(canMove(grid), false);
}));

results.push(test("hasWon detects a 2048 tile", () => {
  const grid = emptyGrid();
  grid[0][0] = 2048;
  assert.strictEqual(hasWon(grid), true);
}));

failures = results.filter((r) => !r).length;
console.log(`\n${results.length - failures}/${results.length} tests passed.`);

if (failures > 0) {
  process.exit(1);
}

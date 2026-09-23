/**
 * 2048 game logic.
 * Core grid functions are written as pure functions so they can be
 * unit-tested by the Jenkins "Test" stage without needing a browser/DOM.
 */

const SIZE = 4;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(grid) {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
}

// Slide + merge a single row to the left. Returns { row, scoreGained }
function slideRowLeft(row) {
  let scoreGained = 0;
  const nonZero = row.filter((v) => v !== 0);
  const merged = [];
  for (let i = 0; i < nonZero.length; i++) {
    if (nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      merged.push(mergedVal);
      scoreGained += mergedVal;
      i++;
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, scoreGained };
}

function rotateGrid(grid) {
  // rotate 90 degrees clockwise
  const newGrid = emptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newGrid[c][SIZE - 1 - r] = grid[r][c];
    }
  }
  return newGrid;
}

// direction: 'left' | 'right' | 'up' | 'down'
function move(grid, direction) {
  let working = grid.map((row) => [...row]);
  let rotations = 0;

  if (direction === "up") rotations = 3;
  else if (direction === "right") rotations = 2;
  else if (direction === "down") rotations = 1;

  for (let i = 0; i < rotations; i++) working = rotateGrid(working);

  let totalScore = 0;
  let moved = false;
  const result = working.map((row) => {
    const before = row.join(",");
    const { row: newRow, scoreGained } = slideRowLeft(row);
    totalScore += scoreGained;
    if (before !== newRow.join(",")) moved = true;
    return newRow;
  });

  let finalGrid = result;
  const remainingRotations = (4 - rotations) % 4;
  for (let i = 0; i < remainingRotations; i++) finalGrid = rotateGrid(finalGrid);

  return { grid: finalGrid, scoreGained: totalScore, moved };
}

function hasWon(grid) {
  return grid.some((row) => row.some((v) => v >= 2048));
}

function canMove(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

// Export for Node-based unit tests (Jenkins "Test" stage)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { emptyGrid, addRandomTile, slideRowLeft, move, hasWon, canMove, SIZE };
}

// ---------------- Browser UI wiring ----------------
if (typeof document !== "undefined") {
  let grid = emptyGrid();
  let score = 0;

  const boardEl = document.getElementById("game-board");
  const scoreEl = document.getElementById("score");
  const messageEl = document.getElementById("message");
  const newGameBtn = document.getElementById("new-game-btn");

  function render() {
    boardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = grid[r][c] === 0 ? "" : grid[r][c];
        boardEl.appendChild(cell);
      }
    }
    scoreEl.textContent = score;
  }

  function startGame() {
    grid = emptyGrid();
    score = 0;
    addRandomTile(grid);
    addRandomTile(grid);
    messageEl.classList.add("hidden");
    render();
  }

  function handleMove(direction) {
    const result = move(grid, direction);
    if (!result.moved) return;
    grid = result.grid;
    score += result.scoreGained;
    addRandomTile(grid);
    render();

    if (hasWon(grid)) {
      messageEl.textContent = "You reached 2048! 🎉";
      messageEl.classList.remove("hidden");
    } else if (!canMove(grid)) {
      messageEl.textContent = "Game over!";
      messageEl.classList.remove("hidden");
    }
  }

  document.addEventListener("keydown", (e) => {
    const map = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
    };
    if (map[e.key]) {
      e.preventDefault();
      handleMove(map[e.key]);
    }
  });

  newGameBtn.addEventListener("click", startGame);

  startGame();
}

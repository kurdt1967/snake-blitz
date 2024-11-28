const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

// Game settings
let tileSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let food = { x: randomTile(), y: randomTile() };
let score = 0;
let level = 1;
let speed = 1000;
let playerName = "";
let topScorers = JSON.parse(localStorage.getItem("topScorers")) || [];
let obstacles = [];

// DOM Elements
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gameOver = document.getElementById("gameOver");
const startGame = document.getElementById("startGame");
const playerInput = document.getElementById("playerName");
const playerDisplay = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const finalScore = document.getElementById("finalScore");
const topScorersList = document.getElementById("topScorers");
const restartGame = document.getElementById("restartGame");

// Initialize game
startGame.addEventListener("click", () => {
  playerName = playerInput.value || "Player";
  playerDisplay.textContent = `Player: ${playerName}`;
  menu.classList.remove("active");
  game.classList.add("active");
  resetGame();
  startGameLoop();
});

// Restart game
restartGame.addEventListener("click", () => {
  gameOver.classList.remove("active");
  menu.classList.add("active");
});

// Game loop
function startGameLoop() {
  const loop = setInterval(() => {
    updateGame();
    drawGame();
    if (isGameOver()) {
      clearInterval(loop);
      handleGameOver();
    }
  }, speed);
}

// Add to your existing JavaScript

// Detect if the device is a mobile device
function isMobileDevice() {
  return window.innerWidth <= 768 || 'ontouchstart' in window;
}

// Show on-screen control buttons if on mobile
function showMobileControls() {
  if (isMobileDevice()) {
    document.getElementById('controls').style.display = 'flex';
  }
}

// Hide on-screen controls when not on mobile
function hideMobileControls() {
  document.getElementById('controls').style.display = 'none';
}

// Initialize game
startGame.addEventListener("click", () => {
  playerName = playerInput.value || "Player";
  playerDisplay.textContent = `Player: ${playerName}`;
  menu.classList.remove("active");
  game.classList.add("active");
  resetGame();
  startGameLoop();
  showMobileControls(); // Show controls if mobile
});

// Restart game
restartGame.addEventListener("click", () => {
  gameOver.classList.remove("active");
  menu.classList.add("active");
  hideMobileControls(); // Hide controls when restarting
});

// Handle on-screen button presses for mobile devices
document.getElementById("upButton").addEventListener("click", () => {
  if (direction.y === 0) direction = { x: 0, y: -tileSize }; // Move up
});

document.getElementById("downButton").addEventListener("click", () => {
  if (direction.y === 0) direction = { x: 0, y: tileSize }; // Move down
});

document.getElementById("leftButton").addEventListener("click", () => {
  if (direction.x === 0) direction = { x: -tileSize, y: 0 }; // Move left
});

document.getElementById("rightButton").addEventListener("click", () => {
  if (direction.x === 0) direction = { x: tileSize, y: 0 }; // Move right
});

// Reset game
function resetGame() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: 0, y: 0 };
  food = { x: randomTile(), y: randomTile() };
  score = 0;
  level = 1;
  speed = 200;
  obstacles = generateObstacles(level);
  scoreDisplay.textContent = "Score: 0";
  levelDisplay.textContent = "Level: 1";
}

// Generate obstacles
function generateObstacles(level) {
  const obs = [];
  for (let i = 0; i < level * 3; i++) {
    obs.push({ x: randomTile(), y: randomTile() });
  }
  return obs;
}

// Update game state
function updateGame() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check if eating food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = { x: randomTile(), y: randomTile() };
    obstacles = generateObstacles(++level);
    speed = Math.max(50, speed - 10);
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
  } else {
    snake.pop(); // Remove tail
  }

  snake.unshift(head); // Add new head
}

// Draw game state
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "green" : "lime";
    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, tileSize, tileSize);

  // Draw obstacles
  ctx.fillStyle = "gray";
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, tileSize, tileSize);
  });
}

// Handle game over
function handleGameOver() {
  game.classList.remove("active");
  gameOver.classList.add("active");
  finalScore.textContent = `Final Score: ${score}`;
  saveTopScore(playerName, score);
  displayTopScorers();
}

// Save top score
function saveTopScore(name, score) {
  topScorers.push({ name, score });
  topScorers.sort((a, b) => b.score - a.score);
  topScorers = topScorers.slice(0, 5);
  localStorage.setItem("topScorers", JSON.stringify(topScorers));
}

// Display top scorers
function displayTopScorers() {
  topScorersList.innerHTML = "";
  topScorers.forEach((scorer) => {
    const li = document.createElement("li");
    li.textContent = `${scorer.name} - ${scorer.score}`;
    topScorersList.appendChild(li);
  });
}

// Check if game is over
function isGameOver() {
  const head = snake[0];
  if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
    return true;
  }
  if (snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)) {
    return true;
  }
  if (obstacles.some((obs) => obs.x === head.x && obs.y === head.y)) {
    return true;
  }
  return false;
}

// Random tile position
function randomTile() {
  return Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize;
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -tileSize };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: tileSize };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -tileSize, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: tileSize, y: 0 };
      break;
  }
});
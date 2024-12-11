import { findPathAStar } from './aStar.js';


document.addEventListener("DOMContentLoaded", () => {
    // Game setup
    const gameCanvas = document.getElementById("gameCanvas");
    const ctx = gameCanvas.getContext("2d");
    const gridSize = 25;
    const blockSize = gameCanvas.width / gridSize;
    let snake = [{ x: 5, y: 5 }];
    let foodPosition = { x: 15, y: 15 };
    let snakeDirection = { x: 0, y: 0 };
    let gameInterval;
    let score = 0;
    let level = 1;
    let foodEaten = 0;
    let isPaused = false;
    let isAI = false;
    let gameOverBool = false;
    let gameSpeed = 350;
    let playerName = "";
    let obstacles = [];
    let scoreboard = [];
    //initialization
    let currSpeed;
    let currObs;
    let boostSpeed;


    // UI elements
    const scoreDisplay = document.getElementById("scoreDisplay");
    const playerNameDisplay = document.getElementById("playerNameDisplay");
    const playerNameInput = document.getElementById("playerName");
    const pauseButton = document.getElementById("pauseButton");
    const resumeButton = document.getElementById("resumeButton");
    const restartButton = document.getElementById("restartButton");
    const submitNameButton = document.getElementById("submitNameButton");
    const easyModeButton = document.getElementById("easyModeButton");
    const mediumModeButton = document.getElementById("mediumModeButton");
    const hardModeButton = document.getElementById("hardModeButton");
    const extremeModeButton = document.getElementById("extremeModeButton");
    const retryButton = document.getElementById("retryButton");


    // Show specific menus
    const showMenu = (menuId) => {
        document.querySelectorAll(".menu").forEach(menu => menu.classList.add("hidden"));
        document.getElementById(menuId).classList.remove("hidden");
    };
    const showGameOver = () => {
        document.getElementById('gameOverScreen').classList.remove("hidden");
    }

    const backToMenu = () => {
        clearInterval(gameInterval);
        showMenu("mainMenu");
    };

    document.querySelectorAll(".backToMenuButton").forEach(button => {
        button.addEventListener("click", backToMenu);
    });


    document.querySelectorAll(".backToMenu").forEach(button => {
        button.addEventListener("click", () => showMenu("mainMenu"));
    });

    // Start game with selected difficulty
    const startGame = (speed, obstacleCount) => {
        gameSpeed = speed
        resetGame();
        obstacles = generateObstacles(obstacleCount);
        showMenu("gameCanvasContainer");
        gameInterval = setInterval(gameLoop, gameSpeed);
    };


    // Generate obstacle positions
    const generateObstacles = (count) => {
        const newObstacles = [];
        while (newObstacles.length < count) {
            const obstacle = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
            if (
                !snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) &&
                !newObstacles.some(existing => existing.x === obstacle.x && existing.y === obstacle.y) &&
                !(foodPosition.x === obstacle.x && foodPosition.y === obstacle.y)
            ) {
                newObstacles.push(obstacle);
            }
        }
        return newObstacles;
    };

    // Game loop (manual or AI mode)
    const gameLoop = () => {
        if (isPaused) return;
        if (isAI) { snakeDirection = aiMove(); }
        playerNameDisplay.textContent = `Player: ${playerName}`;
        gameOverBool = false;
        moveSnake();
        checkCollisions();
        drawGame();
    };

    // Snake movement for manual mode
    const moveSnake = () => {
        // Prevent moving if the direction is not set
        if (snakeDirection.x === 0 && snakeDirection.y === 0) return;

        // Create a new head based on the current direction
        const head = { ...snake[0] };
        head.x += snakeDirection.x;
        head.y += snakeDirection.y;

        // Add the new head to the snake
        snake.unshift(head);

        // Check if the snake eats the food
        if (head.x === foodPosition.x && head.y === foodPosition.y) {

            score++;
            console.log(`Score: ${score}`);
            foodEaten++;
            foodPosition = generateFood();

            // Level up every 5 pieces of food eaten
            if (foodEaten % 5 === 0) levelUp();
        } else {
            // Remove the tail if no food is eaten
            snake.pop();
        }
    };

    // AI movement logic (A star)
    const aiMove = () => {
        const path = findPathAStar(snake[0], foodPosition, gridSize, snake, obstacles);

        if (path.length > 0) {
            const nextMove = path[0];
            return {
                x: nextMove.x - snake[0].x,
                y: nextMove.y - snake[0].y
            };
        }
        gameOver(); // if AI cant find path then gameover.
        return { x: 0, y: 0 };
    };


    const generateFood = () => {
        let newFood;
        do {
            newFood = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        } while (
            snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
            obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y)
        );
        return newFood;
    };

    // Draw the game
    const drawGame = () => {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw snake
        snake.forEach(segment => {
            ctx.fillStyle = "green";
            ctx.fillRect(segment.x * blockSize, segment.y * blockSize, blockSize, blockSize);
        });

        // Draw food
        ctx.fillStyle = "red";
        ctx.fillRect(foodPosition.x * blockSize, foodPosition.y * blockSize, blockSize, blockSize);

        ctx.fillStyle = "gray";
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * blockSize, obstacle.y * blockSize, blockSize, blockSize);
        });


        // Update score and level display
        scoreDisplay.innerText = `Score: ${score} | Level: ${level}`;
    };

    // Check for collisions (walls, self, obstacles)
    const checkCollisions = () => {
        const head = snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver();
        }

        // Self collision
        if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
        }

        // Obstacle collision
        if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
            gameOver();
        }
    };

    // Game over logic
    const gameOver = () => {
        gameOverBool = true;
        scoreboard.push({ name: playerName, score: score });
        scoreboard.sort((a, b) => b.score - a.score);
        if (scoreboard.length > 10) {
            scoreboard = scoreboard.slice(0, 10); // Show only top 10 scorers
        }

        finalScoreDisplay.innerText = `${playerName}: ${score}`
        clearInterval(gameInterval);
        showGameOver();
    };

    const updateScoreboard = () => {
        const scoreboardList = document.getElementById("topScorersList");
        const topScorersMessage = document.getElementById("topScorersMessage");

        // Clear existing scoreboard entries
        scoreboardList.innerHTML = "";

        // If there are no scores, show a message
        if (scoreboard.length === 0) {
            topScorersMessage.style.display = "block";
            return;
        }
        // Otherwise, hide the message and display the top scorers
        topScorersMessage.style.display = "none";

        // Loop through the scoreboard array and create list items
        scoreboard.forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
            scoreboardList.appendChild(li);
        });
    };


    document.getElementById("scoreboardButton").addEventListener("click", () => {
        showMenu("scoreboard");  // Show the scoreboard menu
        updateScoreboard();       // Update the scoreboard display
    });


    const levelUp = () => {
        level++;
        if (gameSpeed > 100) gameSpeed -= 50;
        obstacles = obstacles.concat(generateObstacles(level));
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    };

    // Reset the game state
    const resetGame = () => {
        gameOverBool = false;
        snake = [{ x: 5, y: 5 }];
        foodPosition = generateFood();
        snakeDirection = { x: 0, y: 0 };
        score = 0;
        level = 1;
        foodEaten = 0;
        isPaused = false;
        obstacles = [];
        obstacles = generateObstacles(currObs);
    };

    // Event listeners for buttons
    document.getElementById("playButton").addEventListener("click", () => {
        showMenu("playMenu");
    });

    document.getElementById("howToPlayButton").addEventListener("click", () => {
        showMenu("howToPlay");
    });

    document.getElementById("scoreboardButton").addEventListener("click", () => {
        showMenu("scoreboard");
    });

    document.getElementById("manualModeButton").addEventListener("click", () => {
        showMenu("manualMode");
        isAI = false;
        playerNameInput.classList.remove("hidden");
        submitNameButton.classList.remove("hidden");
    });

    document.getElementById("aiModeButton").addEventListener("click", () => {
        isAI = true;
        playerName = 'AI';
        startGame(50, 0);
    });

    // Event listeners for buttons
    submitNameButton.addEventListener("click", () => {
        playerName = playerNameInput.value.trim().toUpperCase();


        if (!playerName) {
            return alert("Please enter your name!");
        }

        // Hide the name input and submit button
        playerNameInput.classList.add("hidden");
        submitNameButton.classList.add("hidden");

        // Unhide the difficulty menu
        document.getElementById("difficultyMenu").classList.remove("hidden");
    });

    easyModeButton.addEventListener("click", () => {
        currSpeed = 400;
        boostSpeed = 200;
        currObs = 5;
        startGame(currSpeed, 5);
    });

    mediumModeButton.addEventListener("click", () => {
        currSpeed = 350;
        boostSpeed = 200;
        currObs = 10;
        startGame(currSpeed, 10);
    });

    hardModeButton.addEventListener("click", () => {
        currSpeed = 250;
        boostSpeed = 150;
        currObs = 15;
        startGame(currSpeed, 15);
    });

    extremeModeButton.addEventListener("click", () => {
        currSpeed = 150;
        boostSpeed = 80;
        currObs = 20;
        startGame(currSpeed, 20);
    });


    document.addEventListener("keydown", (event) => {
        if (isAI) return;
        if (gameOverBool) return;
        const { key } = event;
        const { x, y } = snakeDirection;

        switch (key) {
            case "ArrowUp":
                if (y === 0) snakeDirection = { x: 0, y: -1 }; // Prevent reversing
                break;
            case "ArrowDown":
                if (y === 0) snakeDirection = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                if (x === 0) snakeDirection = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                if (x === 0) snakeDirection = { x: 1, y: 0 };
                break;
            case " ":
                if (gameInterval && gameSpeed !== boostSpeed) {
                    clearInterval(gameInterval);
                    gameSpeed = boostSpeed;
                    gameInterval = setInterval(gameLoop, gameSpeed);
                }
                break;
        }
    });

    document.addEventListener("keyup", (event) => {
        if (isAI) return;
        if (gameOverBool) return;
        if (event.key === " ") {
            clearInterval(gameInterval);
            gameSpeed = currSpeed; // Reset to normal speed
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    });

    pauseButton.addEventListener("click", () => {
        isPaused = true;
        pauseButton.classList.add("hidden");
        resumeButton.classList.remove("hidden");
    });

    resumeButton.addEventListener("click", () => {
        isPaused = false;
        resumeButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");
    });

    restartButton.addEventListener("click", () => {
        resetGame();
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    });

    retryButton.addEventListener("click", () => {
        showMenu("gameCanvasContainer");
        resetGame();
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    });

});

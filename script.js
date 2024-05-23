// Set up context
const context = c.getContext("2d");

// Create bird
const bird = new Image();
bird.src = "bird.png";

// Create Alert
const alertimg = new Image();
alertimg.src = "Alert.png";

// Create Arrow
const arrow = new Image();
arrow.src = "downarrow.png";

// Create variables
const canvasSize = 400;
const birdSize = 30;
const birdX = 50;
let birdY = 200;
let birdDY = 0;

let score = 0;
const interval = 30; // The speed at which the game is played

let started = false;
let alert = false;

let alertFuncID;

c.addEventListener("click", function() {
    birdDY = 9;
    if (!started) {
        started = true;

        // Call the function initially to create the first pipe
        generatePipe();
        alertFuncID = setInterval(alertFunc, 13000);
    }
    const snd = new Audio("sfx_wing.wav");
    snd.play();
});

// PIPE VARIABLES
const pipeWidth = 36;
const pipeGap = 150; // Gap width between top and bottom pipes
let pipes = []; // Array to hold pipe objects

// Function to generate a new pipe
function generatePipe() {
    const topPipeHeight = Math.random() * (canvasSize - pipeGap - 50) + 20;
    const bottomPipeY = topPipeHeight + pipeGap;
    pipes.push({
        x: canvasSize,
        topHeight: topPipeHeight,
        bottomY: bottomPipeY
    });
}

// Bar Variables
let barActive = false;
let barX = 0;
let barY = 0;
let barWidth = canvasSize;
let barHeight = 20;
let barSpeed = 5;

function summonBar() {
    barActive = true;
    barX = 0;
    barY = 0;
    pipes = []; // Remove all pipes when bar is summoned
}

// Flashing alert variables and function
var flashed = 0;
var flashingID;
function alertFunc() {
    var snd = new Audio("half-life-alarm.mp3");
    snd.play();

    flashed = 0;
    flashingID = setInterval(flashAlert, 500);
}

function flashAlert() {
    alert = !alert;
    flashed++;
    if (flashed >= 12) {
        alert = false;
        clearInterval(flashingID);
        // Summon bar after flashing alert
        summonBar();
    }
}

// Function to reset the game state
function resetGame() {
    birdY = 200;
    birdDY = 0;
    score = 0;
    pipes = [];
    started = false;
    barActive = false;
    alert = false;
    clearInterval(alertFuncID);
    clearInterval(flashingID);
}

// Game loop
setInterval(() => {
    // Clear the canvas
    context.fillStyle = "skyblue";
    context.fillRect(0, 0, canvasSize, canvasSize); // Draw sky

    // Alert Effects
    if (alert) {
        context.drawImage(alertimg, birdX, 50, 100, 100);
        context.drawImage(arrow, birdX, canvasSize - 100, 100, 100);
    }

    // Draw and update bird
    birdY -= birdDY -= started ? 0.7 : 0; // Gravity
    context.drawImage(bird, birdX, birdY, birdSize, birdSize); // Draw bird

    // Draw text
    context.fillStyle = "black";
    context.fillText(`Flappy Loops`, 170, 10); // Title text
    context.fillText(`Score: ${score}`, 350, 380); // Draw score

    // Draw and update pipes
    context.fillStyle = "green";
    pipes.forEach(pipe => {
        // Draw top pipe
        context.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Draw bottom pipe
        context.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvasSize - pipe.bottomY);

        // Move pipe
        pipe.x -= 8;

        // Check for collision with bird
        if (birdX < pipe.x + pipeWidth && birdX + birdSize > pipe.x &&
            (birdY < pipe.topHeight || birdY + birdSize > pipe.bottomY)) {
            resetGame();
        }

        // Increase score if bird passes pipe
        if (pipe.x + pipeWidth < birdX && !pipe.passed) {
            pipe.passed = true;
            score++;

            const snd = new Audio("sfx_point.wav");
            snd.play();
        }
    });

    // Remove off-screen pipes and generate new ones
    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
        generatePipe();
    }

    // Draw and update bar
    if (barActive) {
        context.fillStyle = "red";
        context.fillRect(barX, barY, barWidth, barHeight);
        barY += barSpeed;

        // Check for collision with bird
        if (barY + barHeight >= birdY && barY <= birdY + birdSize && birdX + birdSize >= barX) {
            resetGame();
        }

        // Remove bar if it goes off the bottom
        if (barY > canvasSize) {
            barActive = false;
            generatePipe();
        }
    }

    // Loop Top
    if (birdY < 0) {
        birdY = canvasSize + birdY;

        const snd = new Audio("loop.wav");
        snd.play();
    }

    // Loop Bottom
    if (birdY >= canvasSize) {
        birdY = canvasSize - birdY;

        const snd = new Audio("loop.wav");
        snd.play();

        score += 2;

        const pointsnd = new Audio("sfx_2point.wav");
        pointsnd.play();
    }
}, interval);

// Flappy Bird Game
// Adapted to original Flappy Bird physics, sizes, movement, and smoothness
// Runs in any browser without device-specific adaptations

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Images
const birdImg = new Image();
const bgImg = new Image();
const fgImg = new Image();
const pipeNorthImg = new Image();
const pipeSouthImg = new Image();

birdImg.src = 'assets/flappy_bird_bird.png'; // Assume original bird asset
bgImg.src = 'assets/bg.png';
fgImg.src = 'assets/fg.png';
pipeNorthImg.src = 'assets/pipeUp.png'; // North (top) pipe
pipeSouthImg.src = 'assets/pipeBottom.png'; // South (bottom) pipe

// Audio (optional, can be removed if not needed)
const flapSound = new Audio('assets/jump.mp3');
const scoreSound = new Audio('assets/coin.mp3'); // Reused for score
const dieSound = new Audio('assets/hit.wav');
const bgMusic = new Audio('assets/music.mp3');
bgMusic.loop = true;

// Game variables matching original Flappy Bird
let birdX, birdY, velocity = 0;
const gravity = 0.25; // Original gravity per frame
const lift = -4.5; // Original jump strength (adjusted for feel)
const pipeGap = 90; // Original gap size
const birdWidth = 34; // Original bird size
const birdHeight = 24;
const pipeWidth = 52; // Original pipe width
const groundHeight = 112; // Original ground height
let pipes = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('flappyBestScore') || '0');
let gameState = 'start'; // 'start', 'playing', 'over'
let frameCount = 0;
let bgX = 0;
let fgX = 0;
let lastTime = 0;

// Fixed timestep for smooth physics (60 FPS)
const fixedStep = 1 / 60;
let accumulator = 0;

// Resize canvas to fit window (responsive, maintains aspect for browsers)
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    birdX = canvas.width / 4;
    birdY = canvas.height / 2;
    ctx.imageSmoothingEnabled = false; // Pixel art style
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load resources and init
let resourcesLoaded = 0;
const resources = [birdImg, bgImg, fgImg, pipeNorthImg, pipeSouthImg];
resources.forEach(img => {
    img.onload = () => {
        resourcesLoaded++;
        if (resourcesLoaded === resources.length) {
            initGame();
        }
    };
});

// Initialize game
function initGame() {
    // Input handlers (click/touch/space for any browser)
    document.addEventListener('keydown', handleInput);
    document.addEventListener('click', handleInput);
    document.addEventListener('touchstart', handleInput, { passive: false });

    resetGame();
    requestAnimationFrame(gameLoop);
}

// Handle input (flap or start/restart)
function handleInput(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (e.type === 'keydown' && e.key !== ' ') return;

    if (gameState === 'start') {
        gameState = 'playing';
        velocity = lift;
        playSound(flapSound);
        playMusic();
    } else if (gameState === 'playing') {
        velocity = lift;
        playSound(flapSound);
    } else if (gameState === 'over') {
        resetGame();
        gameState = 'playing';
    }
}

// Reset game state
function resetGame() {
    pipes = [];
    score = 0;
    birdX = canvas.width / 4;
    birdY = canvas.height / 2;
    velocity = 0;
    bgX = 0;
    fgX = 0;
    frameCount = 0;
    accumulator = 0;
    lastTime = performance.now();
    stopMusic();
}

// Game loop with delta time and fixed timestep
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    accumulator += delta;
    while (accumulator >= fixedStep) {
        update(fixedStep);
        accumulator -= fixedStep;
    }

    render();
    requestAnimationFrame(gameLoop);
}

// Update logic
function update(dt) {
    if (gameState !== 'playing') return;

    velocity += gravity / dt; // Apply gravity
    birdY += velocity * dt * 60; // Normalize movement to 60 FPS

    // Ceiling and floor collision (original: bird can't go above screen, dies on floor)
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    if (birdY + birdHeight > canvas.height - groundHeight) {
        die();
        return;
    }

    frameCount++;

    // Generate pipes (original: every ~90-100 frames)
    if (frameCount % 90 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - groundHeight - pipeGap - 200)) + 100;
        pipes.push({
            x: canvas.width,
            y: pipeHeight - canvas.height, // Offset for top pipe (original positioning)
            scored: false
        });
    }

    // Move pipes and check score/collision
    pipes.forEach((pipe, index) => {
        pipe.x -= 1.5; // Original pipe speed

        // Score when passing pipe
        if (pipe.x + pipeWidth < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            playSound(scoreSound);
        }

        // Collision detection (original hitboxes)
        if (checkCollision(pipe)) {
            die();
        }

        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Background and foreground scrolling (original speeds)
    bgX -= 0.2; // Slow bg
    if (bgX <= -bgImg.width) bgX = 0;
    fgX -= 1.5; // Faster fg
    if (fgX <= -fgImg.width) fgX = 0;
}

// Collision check (bird vs pipes)
function checkCollision(pipe) {
    const birdRight = birdX + birdWidth;
    const birdBottom = birdY + birdHeight;

    // Top pipe
    if (birdRight > pipe.x && birdX < pipe.x + pipeWidth &&
        birdBottom > 0 && birdY < pipe.y + canvas.height) {
        return true;
    }

    // Bottom pipe
    const bottomY = pipe.y + canvas.height + pipeGap;
    if (birdRight > pipe.x && birdX < pipe.x + pipeWidth &&
        birdBottom > bottomY && birdY < canvas.height - groundHeight) {
        return true;
    }

    return false;
}

// Render
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + bgImg.width, 0, canvas.width, canvas.height); // Tile

    if (gameState === 'playing' || gameState === 'over') {
        // Pipes
        pipes.forEach(pipe => {
            ctx.drawImage(pipeNorthImg, pipe.x, pipe.y, pipeWidth, canvas.height); // Top pipe full height
            ctx.drawImage(pipeSouthImg, pipe.x, pipe.y + canvas.height + pipeGap, pipeWidth, canvas.height); // Bottom
        });

        // Foreground (ground)
        ctx.drawImage(fgImg, fgX, canvas.height - groundHeight);
        ctx.drawImage(fgImg, fgX + fgImg.width, canvas.height - groundHeight); // Tile
    }

    // Bird (with rotation based on velocity, original feature)
    ctx.save();
    ctx.translate(birdX + birdWidth / 2, birdY + birdHeight / 2);
    ctx.rotate(velocity * 0.05); // Slight rotation for dive/climb
    ctx.drawImage(birdImg, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);
    ctx.restore();

    // Score display (original font style)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 40px Arial';
    ctx.strokeText(score, canvas.width / 2, 50);
    ctx.fillText(score, canvas.width / 2, 50);

    // Start screen
    if (gameState === 'start') {
        ctx.font = 'bold 30px Arial';
        ctx.strokeText('Tap to Start', canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText('Tap to Start', canvas.width / 2 - 100, canvas.height / 2);
    }

    // Game over screen
    if (gameState === 'over') {
        ctx.font = 'bold 40px Arial';
        ctx.strokeText('Game Over', canvas.width / 2 - 120, canvas.height / 2 - 50);
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2 - 50);
        ctx.font = 'bold 30px Arial';
        ctx.strokeText(`Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
        ctx.strokeText(`Best: ${bestScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.fillText(`Best: ${bestScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.strokeText('Tap to Restart', canvas.width / 2 - 120, canvas.height / 2 + 80);
        ctx.fillText('Tap to Restart', canvas.width / 2 - 120, canvas.height / 2 + 80);
    }
}

// Die function
function die() {
    gameState = 'over';
    playSound(dieSound);
    stopMusic();
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBestScore', bestScore);
    }
}

// Sound helpers (handle browser autoplay policies)
function playSound(sound) {
    sound.play().catch(() => {}); // Ignore if blocked
}

function playMusic() {
    bgMusic.play().catch(() => {});
}

function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}
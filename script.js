const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// DOM элементы
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const mainMenu = document.querySelector('.main-menu');
const gameOverMenu = document.querySelector('.game-over-menu');
const startScreen = document.querySelector('.start-screen');
const loadingScreen = document.getElementById('loading-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const audioBtn = document.getElementById('audio-btn');
const finalScoreElement = document.getElementById('final-score');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');

// Изображения (пути к твоим файлам)
const birdImg = new Image(); birdImg.src = 'assets/flappy_bird_bird.png';
const bgImg = new Image(); bgImg.src = 'assets/bg.png';
const fgImg = new Image(); fgImg.src = 'assets/fg.png';
const pipeTopImg = new Image(); pipeTopImg.src = 'assets/pipeUp.png';
const pipeBottomImg = new Image(); pipeBottomImg.src = 'assets/pipeBottom.png';
const coinImg = new Image(); coinImg.src = 'assets/coin.png'; // Твой файл

// Звуки (если нет файлов — просто не будут играть, ошибки не будет)
const jumpSound = new Audio('assets/jump.mp3');
const coinSound = new Audio('assets/coin.mp3');
const hitSound = new Audio('assets/hit.mp3');
const bgMusic = new Audio('assets/music.mp3');

// Игровые переменные
let score = 0, coinsCollected = 0, bestScore = 0;
let gameActive = false, gameStarted = false;
let pipes = [], coinsList = [];
let birdX, birdY, velocity = 0;
const gravity = 0.35;
const jumpPower = -8;
const gap = 150;
const pipeWidth = 60; // Подгони под свои трубы
const birdSize = 40;
let frame = 0;
let isSoundOn = true;

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Загрузка рекорда
bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;

// Скрываем loading сразу (чтобы меню показалось)
loadingScreen.style.display = 'none';
mainMenu.classList.add('active');

// Кнопки
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', () => {
    mainMenu.classList.add('active');
    gameOverMenu.classList.remove('active');
});
audioBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    audioBtn.textContent = isSoundOn ? '🔊' : '🔇';
});

// Касания/клики (надёжно для Telegram)
document.addEventListener('touchstart', handleTap, { passive: false });
document.addEventListener('click', handleTap);
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); handleTap(); } });

function handleTap(e) {
    if (e) e.preventDefault();
    if (!gameActive) return;
    if (!gameStarted) startFlying();
    else jump();
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

function startGame() {
    mainMenu.classList.remove('active');
    startScreen.classList.add('active');

    // Сброс игры
    score = 0; coinsCollected = 0;
    pipes = []; coinsList = [];
    birdX = canvas.width * 0.2;
    birdY = canvas.height / 2;
    velocity = 0;
    gameActive = true;
    gameStarted = false;
    frame = 0;
    scoreElement.textContent = `СЧЕТ: 0`;

    addPipe(); // Первая пара труб

    if (isSoundOn) {
        bgMusic.loop = true;
        bgMusic.currentTime = 0;
        bgMusic.play().catch(() => {});
    }

    gameLoop();
}

function startFlying() {
    gameStarted = true;
    startScreen.classList.remove('active');
    jump();
}

function jump() {
    velocity = jumpPower;
    if (isSoundOn) jumpSound.play().catch(() => {});
}

function addPipe() {
    const minTop = 60;
    const maxTop = canvas.height - fgImg.height - gap - 80;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

    pipes.push({ x: canvas.width, top: topHeight, passed: false });

    coinsList.push({
        x: canvas.width + pipeWidth / 2,
        y: topHeight + gap / 2,
        collected: false
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон (просто растягиваем)
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Трубы
    pipes.forEach(p => {
        ctx.drawImage(pipeTopImg, p.x, p.top - pipeTopImg.height);
        ctx.drawImage(pipeBottomImg, p.x, p.top + gap);
    });

    // Монетки
    coinsList.forEach(c => {
        if (!c.collected) {
            ctx.drawImage(coinImg, c.x - 20, c.y - 20, 40, 40);
        }
    });

    // Птица
    ctx.save();
    ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
    ctx.rotate(velocity * 0.08);
    ctx.drawImage(birdImg, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
    ctx.restore();

    // Земля
    ctx.drawImage(fgImg, 0, canvas.height - fgImg.height, canvas.width, fgImg.height);
}

function update() {
    if (!gameStarted) return;

    velocity += gravity;
    birdY += velocity;

    frame++;
    if (frame % 95 === 0) addPipe();

    pipes.forEach((p, i) => {
        p.x -= 2;
        if (!p.passed && p.x + pipeWidth < birdX) {
            p.passed = true;
            score++;
            updateScore();
            if (isSoundOn) coinSound.play().catch(() => {});
        }
        if (p.x < -pipeWidth) pipes.splice(i, 1);
    });

    coinsList.forEach((c, i) => {
        c.x -= 2;
        if (!c.collected && Math.hypot(c.x - birdX, c.y - birdY) < 45) {
            c.collected = true;
            coinsCollected++;
            updateScore();
            if (isSoundOn) coinSound.play().catch(() => {});
        }
        if (c.x < -50) coinsList.splice(i, 1);
    });

    // Коллизии
    if (birdY + birdSize > canvas.height - fgImg.height || birdY < 0) gameOver();

    pipes.forEach(p => {
        if (birdX + birdSize > p.x && birdX < p.x + pipeWidth) {
            if (birdY < p.top || birdY + birdSize > p.top + gap) gameOver();
        }
    });
}

function updateScore() {
    scoreElement.textContent = `СЧЕТ: ${score + coinsCollected}`;
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

function gameOver() {
    if (!gameActive) return;
    gameActive = false;
    if (isSoundOn) {
        bgMusic.pause();
        hitSound.play().catch(() => {});
    }
    const total = score + coinsCollected;
    if (total > bestScore) {
        bestScore = total;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore);
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    }
    finalScoreElement.textContent = total;
    gameOverMenu.classList.add('active');
}

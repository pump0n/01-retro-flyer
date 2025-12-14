// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    tg.enableClosingConfirmation();
}

// DOM элементы
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.querySelector('.main-menu');
const gameOverMenu = document.querySelector('.game-over-menu');
const startScreen = document.querySelector('.start-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const audioBtn = document.getElementById('audio-btn');
const shareBtn = document.getElementById('share-btn');
const finalScoreElement = document.getElementById('final-score');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');

// Ресурсы
const birdImg = new Image();
const bgImg = new Image();
const fgImg = new Image();
const pipeTopImg = new Image();    // Твоя pipeUp.png (шляпка сверху)
const pipeBottomImg = new Image(); // Твоя pipeBottom.png (шляпка снизу)

// Новый ассет для коина (добавь в assets/coin.png или используй этот URL)
const coinImg = new Image();
coinImg.src = 'https://img.itch.zone/aW1hZ2UvMTEwOTk0MS82NDA5NjcwLnBuZw==/original/%2B8%2F%2F%2F%2F.png'; // Пример золотой медали из Flappy-клонов

// Звуки
const bgMusic = new Audio('assets/music.mp3');
const jumpSound = new Audio('assets/jump.mp3');
const coinSound = new Audio('assets/coin.mp3');
const hitSound = new Audio('assets/hit.mp3');

// Переменные
let score = 0;
let coinsCollected = 0; // Отдельный счёт для коинов (можно потом в магазин)
let bestScore = 0;
let gameActive = false;
let gameStarted = false;
let pipes = [];
let coins = [];
let xPos, yPos, velocity = 0;
const grav = 0.3;
const jumpForce = -7;
const gap = 140; // Зазор между трубами
const pipeWidth = 52; // Примерно ширина твоих труб
const birdWidth = 34;
const birdHeight = 24;
let frameCount = 0;
let isSoundEnabled = true;
let bgX = 0;
let fgX = 0;
let birdRotation = 0;
let canvasWidth, canvasHeight;

// Загрузка изображений
birdImg.src = 'assets/flappy_bird_bird.png';
bgImg.src = 'assets/bg.png';
fgImg.src = 'assets/fg.png';
pipeTopImg.src = 'assets/pipeUp.png';
pipeBottomImg.src = 'assets/pipeBottom.png';

// Ожидание загрузки всех ресурсов
let loadedResources = 0;
const totalResources = 6; // + coin если добавишь локально
function resourceLoaded() {
    loadedResources++;
    if (loadedResources >= totalResources) animateLoading();
}
birdImg.onload = bgImg.onload = fgImg.onload = pipeTopImg.onload = pipeBottomImg.onload = coinImg.onload = resourceLoaded;

// События
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
audioBtn.addEventListener('click', toggleSound);
shareBtn.addEventListener('click', shareScore);

canvas.addEventListener('touchstart', handleInput, { passive: false });
canvas.addEventListener('click', handleInput);
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); handleInput(); } });

function handleInput(e) {
    if (e) e.preventDefault();
    if (!gameActive) return;
    if (!gameStarted) startPlaying();
    else jump();
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Инит
function init() {
    resizeCanvas();
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
}

function animateLoading() {
    // Твоя анимация загрузки...
    // (оставь как было или упрости)
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainMenu.classList.add('active');
        }, 300);
    }, 1000);
}

function startGame() {
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    startScreen.classList.add('active');

    score = 0;
    coinsCollected = 0;
    pipes = [];
    coins = [];
    velocity = 0;
    xPos = canvasWidth * 0.2;
    yPos = canvasHeight / 2;
    gameActive = true;
    gameStarted = false;
    frameCount = 0;
    bgX = fgX = 0;

    addPipePair();
    updateScoreDisplay();

    if (isSoundEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(() => {});
    }

    gameLoop();
}

function startPlaying() {
    gameStarted = true;
    startScreen.classList.remove('active');
    jump();
}

function jump() {
    velocity = jumpForce;
    birdRotation = -0.3;
    if (isSoundEnabled) jumpSound.play().catch(() => {});
}

function addPipePair() {
    const minHeight = 50;
    const maxHeight = canvasHeight - fgImg.height - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    pipes.push({
        x: canvasWidth + pipeWidth,
        topHeight: topHeight, // Высота верхней трубы
        passed: false
    });

    // Добавляем коин в центр зазора
    coins.push({
        x: canvasWidth + pipeWidth + 50, // Немного правее труб
        y: topHeight + gap / 2,
        collected: false
    });
}

function updateScoreDisplay() {
    scoreElement.textContent = `СЧЕТ: ${score + coinsCollected}`;
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Фон
    ctx.drawImage(bgImg, bgX, 0, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, bgX + canvasWidth, 0, canvasWidth, canvasHeight);
    bgX -= 0.5;
    if (bgX <= -canvasWidth) bgX = 0;

    // Трубы и коины
    pipes.forEach(pipe => {
        // Верхняя труба (от верха экрана вниз на topHeight)
        ctx.drawImage(pipeTopImg, pipe.x, pipe.topHeight - pipeTopImg.height);

        // Нижняя труба (от низа верхней + gap)
        const bottomY = pipe.topHeight + gap;
        ctx.drawImage(pipeBottomImg, pipe.x, bottomY);
    });

    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.drawImage(coinImg, coin.x - 15, coin.y - 15, 30, 30);
        }
    });

    // Птичка с поворотом
    ctx.save();
    ctx.translate(xPos + birdWidth/2, yPos + birdHeight/2);
    ctx.rotate(birdRotation);
    ctx.drawImage(birdImg, -birdWidth/2, -birdHeight/2, birdWidth, birdHeight);
    ctx.restore();

    // Земля
    ctx.drawImage(fgImg, fgX, canvasHeight - fgImg.height);
    ctx.drawImage(fgImg, fgX + fgImg.width, canvasHeight - fgImg.height);
    fgX -= 2;
    if (fgX <= -fgImg.width) fgX = 0;
}

function update() {
    if (!gameStarted) return;

    velocity += grav;
    yPos += velocity;
    birdRotation = Math.min(Math.max(velocity * 0.07, -0.5), 1.2); // Плавный поворот

    frameCount++;
    if (frameCount % 90 === 0) addPipePair();

    // Движение труб и коинов
    pipes.forEach((pipe, i) => {
        pipe.x -= 2;

        // Прохождение трубы +1 очко
        if (!pipe.passed && pipe.x + pipeWidth < xPos) {
            pipe.passed = true;
            score++;
            updateScoreDisplay();
            if (isSoundEnabled) coinSound.play().catch(() => {});
        }

        if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
    });

    coins.forEach((coin, i) => {
        coin.x -= 2;
        // Сбор коина
        if (!coin.collected &&
            xPos + birdWidth > coin.x - 15 &&
            xPos < coin.x + 15 &&
            yPos + birdHeight > coin.y - 15 &&
            yPos < coin.y + 15) {
            coin.collected = true;
            coinsCollected++;
            updateScoreDisplay();
            if (isSoundEnabled) coinSound.play().catch(() => {});
        }
        if (coin.x < -50) coins.splice(i, 1);
    });

    // Коллизии
    if (yPos + birdHeight > canvasHeight - fgImg.height || yPos < 0) {
        gameOver();
        return;
    }

    for (const pipe of pipes) {
        if (xPos + birdWidth > pipe.x && xPos < pipe.x + pipeWidth) {
            if (yPos < pipe.topHeight || yPos + birdHeight > pipe.topHeight + gap) {
                gameOver();
                return;
            }
        }
    }
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

function gameOver() {
    if (!gameActive) return; // Защита от двойного вызова
    gameActive = false;
    if (isSoundEnabled) {
        bgMusic.pause();
        hitSound.play().catch(() => {});
    }
    const totalScore = score + coinsCollected;
    if (totalScore > bestScore) {
        bestScore = totalScore;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore);
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    }
    finalScoreElement.textContent = totalScore;
    gameOverMenu.classList.add('active');
}

function showMainMenu() {
    gameOverMenu.classList.remove('active');
    mainMenu.classList.add('active');
    startScreen.classList.remove('active');
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (!isSoundEnabled) bgMusic.pause();
}

function shareScore() {
    // Твой код шаринга
}

function resizeCanvas() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', init);

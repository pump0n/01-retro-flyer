// Инициализация Telegram WebApp
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
const startScreen = document.querySelector('.start-screen'); // Стартовый экран всегда в DOM
const loadingScreen = document.getElementById('loading-screen');
const shopMenu = document.querySelector('.shop-menu');
const achievementsMenu = document.querySelector('.achievements-menu');
const referralMenu = document.querySelector('.referral-menu');
const leaderboardMenu = document.querySelector('.leaderboard-menu');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const shopBtn = document.getElementById('shop-btn');
const shopBackBtn = document.getElementById('shop-back-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const achievementsBackBtn = document.getElementById('achievements-back-btn');
const referralBtn = document.getElementById('referral-btn');
const referralBackBtn = document.getElementById('referral-back-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardBackBtn = document.getElementById('leaderboard-back-btn');
const audioBtn = document.getElementById('audio-btn');
const finalScoreElement = document.getElementById('final-score');
const coinsEarnedElement = document.getElementById('coins-earned');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');
const coinsCountElement = document.getElementById('coins-count');
const shopContent = document.getElementById('shop-content');
const achievementsContent = document.getElementById('achievements-content');
const leaderboardContent = document.getElementById('leaderboard-content');
const referralLinkInput = document.getElementById('referral-link-input');
const copyLinkBtn = document.getElementById('copy-link-btn');
const referralsCountElement = document.getElementById('referrals-count');
const referralsBonusElement = document.getElementById('referrals-bonus');
const shareBtn = document.getElementById('share-btn');

// Графические ресурсы
const bird = new Image();
const bg = new Image();
const fg = new Image();
const pipeUp = new Image();
const pipeBottom = new Image();
const coin = new Image();

// Звуковые файлы
const jumpSound = new Audio();
const coinSound = new Audio();
const hitSound = new Audio();
const bgMusic = new Audio();

// Загрузка ресурсов
bird.src = 'assets/flappy_bird_bird.png';
bg.src = 'assets/bg.png';
fg.src = 'assets/fg.png';
pipeUp.src = 'assets/pipeUp.png';
pipeBottom.src = 'assets/pipeBottom.png';
coin.src = 'assets/coin.png';

jumpSound.src = 'assets/jump.mp3';
coinSound.src = 'assets/coin.mp3';
hitSound.src = 'assets/hit.mp3';
bgMusic.src = 'assets/music.mp3';

// Игровые переменные
let score = 0;
let coinsCollected = 0;
let coinsEarned = 0;
let totalCoins = 0;
let bestScore = 0;
let gameActive = false;
let gameStarted = false;
let pipes = [];
let coinsList = [];
let birdX, birdY, velocity = 0;
const gravity = 0.35;
const jumpPower = -6.5;
const gap = 120; // Уменьшенный зазор между трубами
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let lastTouchTime = 0;
let touchCooldown = 100; // 100 мс между тапами для предотвращения дребезга
let loadingStartTime = 0;
let minLoadTime = 1500; // 1.5 секунды

// Проверка загрузки всех ресурсов
const resources = [bird, bg, fg, pipeUp, pipeBottom, coin];
let loadedResources = 0;

// Обработчик загрузки ресурсов
function resourceLoaded() {
    loadedResources++;
    const progress = Math.floor((loadedResources / resources.length) * 100);
    document.getElementById('loading-progress').style.width = progress + '%';
    
    if (loadingStartTime === 0) {
        loadingStartTime = Date.now();
    }
    
    const elapsedTime = Date.now() - loadingStartTime;
    
    // Если все ресурсы загружены и прошло минимальное время
    if (loadedResources >= resources.length && elapsedTime >= minLoadTime) {
        gameLoaded = true;
        setTimeout(initGame, 300);
    } else if (loadedResources >= resources.length) {
        // Дождемся минимального времени загрузки
        setTimeout(() => {
            gameLoaded = true;
            initGame();
        }, minLoadTime - elapsedTime);
    }
}

resources.forEach(res => {
    res.onload = resourceLoaded;
    res.onerror = function() {
        console.error(`Failed to load resource: ${res.src}`);
        resourceLoaded();
    };
});

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Инициализация игры
function initGame() {
    // Скрыть экран загрузки
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainMenu.classList.add('active');
    }, 300);
    
    // Загрузка данных из localStorage
    loadGameData();
    
    // Инициализация меню
    initShop();
    initAchievements();
    initReferral();
    initLeaderboard();
}

// Загрузка данных игры
function loadGameData() {
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    totalCoins = parseInt(localStorage.getItem('retroPixelFlyerCoins') || '0');
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    coinsCountElement.textContent = totalCoins;
}

// Управление игрой (ключевая часть)
document.addEventListener('keydown', handleKey);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

// Также добавляем обработчики на стартовый экран
if (startScreen) {
    startScreen.addEventListener('click', handleStartScreenClick);
    startScreen.addEventListener('touchstart', handleTouchStart, { passive: false });
    startScreen.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// Обработчики для стартового экрана
function handleStartScreenClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (gameActive && !gameStarted) {
        startPlaying();
    }
}

function handleKey(e) {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleInput();
    }
}

function handleClick(e) {
    e.preventDefault();
    handleInput();
}

function handleTouchStart(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    // Коoldown для предотвращения множественных тапов
    const now = Date.now();
    if (now - lastTouchTime < touchCooldown) {
        return;
    }
    lastTouchTime = now;
    
    handleInput();
}

// Универсальный обработчик ввода
function handleInput() {
    if (!gameActive) return;
    
    if (!gameStarted) {
        startPlaying();
    } else {
        jump();
    }
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Кнопки главного меню
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
// ... остальные кнопки аналогично

// Старт игры (исправленная версия)
function startGame() {
    // Скрыть все меню
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    startScreen.classList.add('active');
    
    // Сбросить игру
    score = 0;
    coinsCollected = 0;
    coinsEarned = 0;
    pipes = [];
    coinsList = [];
    
    // Позиция птицы
    birdX = canvas.width * 0.2;
    birdY = canvas.height / 2;
    velocity = 0;
    gameActive = true;
    gameStarted = false;
    frame = 0;
    bgX = 0;
    fgX = 0;
    
    // Обновить интерфейс
    scoreElement.textContent = `СЧЕТ: ${score}`;
    
    // Добавить первые трубы
    addPipe();
    
    // Запустить музыку
    if (isSoundOn) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(e => console.log('Autoplay blocked'));
    }
    
    // Запустить игровой цикл
    if (animationFrame) cancelAnimationFrame(animationFrame);
    gameLoop();
}

// Начало полета
function startPlaying() {
    if (!gameActive) return;
    
    gameStarted = true;
    startScreen.classList.remove('active');
    jump();
}

function jump() {
    velocity = jumpPower;
    if (isSoundOn) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log('Sound playback failed'));
    }
}

// Игровой цикл
function gameLoop() {
    if (!gameActive) return;
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка фона
    drawBackground();
    
    // Отрисовка труб
    drawPipes();
    
    // Отрисовка монет
    drawCoins();
    
    // Отрисовка птицы
    drawBird();
    
    // Отрисовка земли
    drawForeground();
    
    // Если игра не началась - показать стартовый экран
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('КАСНИТЕСЬ ЭКРАНА', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText('ЧТОБЫ НАЧАТЬ', canvas.width / 2, canvas.height / 2 + 20);
        
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }
    
    // Обновление позиции труб
    updatePipes();
    
    // Обновление позиции монет
    updateCoins();
    
    // Обновление позиции птицы
    updateBird();
    
    // Проверка столкновений
    checkCollisions();
    
    // Обновление счета
    updateScore();
    
    // Запуск следующего кадра
    animationFrame = requestAnimationFrame(gameLoop);
}

// Остальные функции остаются без изменений (drawBackground, drawPipes, drawCoins, drawBird, drawForeground, updatePipes, updateCoins, updateBird, checkCollisions, updateScore, gameOver, toggleSound, etc.)

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик для стартового экрана
    if (startScreen) {
        startScreen.style.pointerEvents = 'auto';
    }
    
    // Дополнительно проверяем, что canvas и другие элементы доступны
    setTimeout(() => {
        if (!gameLoaded && resources.length > 0) {
            // Если ресурсы не загрузились, но игра нужна - инициализируем принудительно
            gameLoaded = true;
            initGame();
        }
    }, 3000);
});

// Функция для проверки обработчиков (для отладки)
function checkEventHandlers() {
    console.log('🔍 Проверка обработчиков событий:');
    console.log('Canvas click handlers:', canvas.onclick);
    console.log('Canvas touchstart handlers:', canvas.ontouchstart);
    console.log('Canvas touchend handlers:', canvas.ontouchend);
    console.log('Start screen click handlers:', startScreen && startScreen.onclick);
    console.log('Document keydown handlers:', document.onkeydown);
    
    // Проверяем, есть ли обработчики на стартовом экране
    if (startScreen) {
        const listeners = getEventListeners(startScreen);
        console.log('Start screen listeners:', Object.keys(listeners));
    }
}

// Для отладки: добавляем проверку при загрузке
document.addEventListener('DOMContentLoaded', checkEventHandlers);

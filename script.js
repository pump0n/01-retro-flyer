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
const startScreen = document.querySelector('.start-screen');
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
hitSound.src = 'assets/hit.wav';
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
const gap = 150; // Зазор между трубами
let gameSpeed = 2; // Базовая скорость игры
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';

// Система достижений
const achievements = [
    { id: 'score_10', name: 'ПЕРВЫЕ ШАГИ', description: 'Набери 10 очков', score: 10, unlocked: false },
    { id: 'score_25', name: 'НОВИЧОК', description: 'Набери 25 очков', score: 25, unlocked: false },
    { id: 'score_50', name: 'ОПЫТНЫЙ', description: 'Набери 50 очков', score: 50, unlocked: false },
    { id: 'score_100', name: 'МАСТЕР', description: 'Набери 100 очков', score: 100, unlocked: false },
    { id: 'score_200', name: 'ПРОФЕССИОНАЛ', description: 'Набери 200 очков', score: 200, unlocked: false },
    { id: 'score_500', name: 'ЛЕГЕНДА', description: 'Набери 500 очков', score: 500, unlocked: false }
];

// Магазин птичек
const shopItems = [
    { id: 'default', name: 'ДЕД МОРОЗ', price: 0, owned: true, description: 'Базовый персонаж' },
    { id: 'snowman', name: 'СНЕГОВИК', price: 50, owned: false, description: 'Классический снеговик' },
    { id: 'reindeer', name: 'ОЛЕНЬ', price: 100, owned: false, description: 'Быстрый олень' },
    { id: 'elf', name: 'ЭЛЬФ', price: 150, owned: false, description: 'Волшебный эльф' },
    { id: 'penguin', name: 'ПИНГВИН', price: 200, owned: false, description: 'Морозный пингвин' }
];

// Проверка загрузки всех ресурсов
const resources = [bird, bg, fg, pipeUp, pipeBottom, coin];
let loadedResources = 0;

// Обработчик загрузки ресурсов
function resourceLoaded() {
    loadedResources++;
    const progress = Math.floor((loadedResources / resources.length) * 100);
    document.getElementById('loading-progress').style.width = progress + '%';
    
    if (loadedResources >= resources.length) {
        gameLoaded = true;
        setTimeout(initGame, 300);
    }
}

resources.forEach(res => {
    res.onload = resourceLoaded;
    res.onerror = function() {
        console.error(`Failed to load resource: ${res.src}`);
        resourceLoaded();
    };
});

// Утилита для обновления размеров canvas
function resizeCanvas() {
    // Получаем реальные размеры экрана
    const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width;
    const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height;
    
    // Устанавливаем CSS размеры
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Устанавливаем внутренние размеры canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Применяем масштабирование для корректного отображения
    if (dpr > 1) {
        ctx.scale(dpr, dpr);
    }
    
    // Сохраняем реальные размеры для использования в игре
    canvas._width = width;
    canvas._height = height;
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resizeCanvas);
} else {
    resizeCanvas();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// Инициализация игры
function initGame() {
    // Устанавливаем размеры canvas
    resizeCanvas();
    
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
    
    // Улучшенная поддержка мобильных устройств
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Загрузка данных игры
function loadGameData() {
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    totalCoins = parseInt(localStorage.getItem('retroPixelFlyerCoins') || '0');
    currentBird = localStorage.getItem('retroPixelFlyerBird') || 'default';
    
    // Загрузка достижений
    const savedAchievements = JSON.parse(localStorage.getItem('retroPixelFlyerAchievements') || '[]');
    savedAchievements.forEach(saved => {
        const achievement = achievements.find(a => a.id === saved.id);
        if (achievement) achievement.unlocked = saved.unlocked;
    });
    
    // Загрузка магазина
    const savedShop = JSON.parse(localStorage.getItem('retroPixelFlyerShop') || '[]');
    savedShop.forEach(saved => {
        const item = shopItems.find(s => s.id === saved.id);
        if (item) item.owned = saved.owned;
    });
    
    // Обновление интерфейса
    updateUI();
}

// Обновление UI
function updateUI() {
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    coinsCountElement.textContent = totalCoins;
    initShop();
    initAchievements();
}

// Кнопки главного меню
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
shopBtn.addEventListener('click', () => showMenu('shop'));
shopBackBtn.addEventListener('click', showMainMenu);
achievementsBtn.addEventListener('click', () => showMenu('achievements'));
achievementsBackBtn.addEventListener('click', showMainMenu);
referralBtn.addEventListener('click', () => showMenu('referral'));
referralBackBtn.addEventListener('click', showMainMenu);
leaderboardBtn.addEventListener('click', () => showMenu('leaderboard'));
leaderboardBackBtn.addEventListener('click', showMainMenu);
audioBtn.addEventListener('click', toggleSound);
copyLinkBtn.addEventListener('click', copyReferralLink);
shareBtn.addEventListener('click', shareGame);

// Показать меню
function showMenu(menuName) {
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    shopMenu.classList.remove('active');
    achievementsMenu.classList.remove('active');
    referralMenu.classList.remove('active');
    leaderboardMenu.classList.remove('active');
    
    if (menuName === 'shop') {
        shopMenu.classList.add('active');
        initShop();
    } else if (menuName === 'achievements') {
        achievementsMenu.classList.add('active');
        initAchievements();
    } else if (menuName === 'referral') {
        referralMenu.classList.add('active');
        initReferral();
    } else if (menuName === 'leaderboard') {
        leaderboardMenu.classList.add('active');
        initLeaderboard();
    }
}

function showMainMenu() {
    mainMenu.classList.add('active');
    gameOverMenu.classList.remove('active');
    shopMenu.classList.remove('active');
    achievementsMenu.classList.remove('active');
    referralMenu.classList.remove('active');
    leaderboardMenu.classList.remove('active');
    startScreen.classList.remove('active');
}

// Управление игрой
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
document.addEventListener('keydown', handleKey);

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
    handleInput();
}

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

function startGame() {
    // Устанавливаем размеры canvas
    resizeCanvas();
    
    // Проверяем, что canvas доступен
    if (!canvas || !ctx) {
        console.error('Canvas not available');
        return;
    }
    
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
    gameSpeed = 2;
    
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    // Правильная инициализация позиции птицы
    birdX = canvasWidth * 0.2;
    birdY = canvasHeight / 2;
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
    lastTime = 0;
    gameLoop();
}

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

// Добавление труб (исправленная версия)
function addPipe() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Минимальное и максимальное расстояние от верха до зазора
    const minTop = 50; // Минимальная высота верхней трубы
    const maxTop = canvasHeight - fgHeight - gap - 50; // Максимальная высота верхней трубы
    
    if (maxTop <= minTop) {
        console.warn('Not enough space for pipes');
        return;
    }
    
    // Генерируем случайную высоту зазора
    const gapY = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    
    // Добавляем пару труб
    pipes.push({
        x: canvasWidth,
        gapY: gapY, // Позиция зазора от верха
        passed: false
    });
    
    // Добавляем монету между трубами (30% вероятность)
    if (Math.random() > 0.7) {
        coinsList.push({
            x: canvasWidth + 40,
            y: gapY + gap / 2,
            collected: false,
            size: 24,
            value: 1
        });
    }
    
    // Очень редко добавляем специальную монету (3% вероятность)
    if (Math.random() > 0.97) {
        // Случайное расположение: либо близко к верхней трубе, либо к нижней
        const coinY = Math.random() > 0.5 ? 
            gapY - 30 : // Близко к верхней трубе
            gapY + gap + 30; // Близко к нижней трубе
            
        coinsList.push({
            x: canvasWidth + 80,
            y: coinY,
            collected: false,
            size: 28,
            value: 2
        });
    }
}

// Отрисовка фона
function drawBackground() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    // Рисуем фон с бесконечной прокруткой
    if (!bg.complete) return;
    
    const bgWidth = bg.naturalWidth || bg.width;
    const speedMultiplier = 1 + (score * 0.01);
    const bgSpeed = 0.5 * speedMultiplier;
    
    // Нормализуем bgX для бесконечной прокрутки
    bgX = bgX % bgWidth;
    if (bgX > 0) bgX -= bgWidth;
    
    // Вычисляем количество плиток для покрытия экрана
    const tilesNeeded = Math.ceil(canvasWidth / bgWidth) + 2;
    
    // Рисуем все плитки фона
    for (let i = 0; i < tilesNeeded; i++) {
        const x = bgX + (i * bgWidth);
        ctx.drawImage(bg, x, 0, bgWidth, canvasHeight);
    }
    
    // Обновляем позицию фона
    bgX -= bgSpeed;
}

// Отрисовка труб (исправленная версия)
function drawPipes() {
    if (!pipeUp.complete || !pipeBottom.complete) return;
    
    // Получаем реальные размеры canvas
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Стандартные размеры труб
    const pipeWidth = 52;
    const pipeHeadHeight = 26;
    const pipeImageHeight = pipeUp.naturalHeight || pipeUp.height;
    const pipeBodySourceHeight = pipeImageHeight - pipeHeadHeight;
    
    pipes.forEach(pipe => {
        // Верхняя труба: начинается сверху и идет вниз до gapY
        const topPipeHeight = pipe.gapY;
        
        if (topPipeHeight > pipeHeadHeight) {
            // Рисуем тело верхней трубы
            const topPipeBodyHeight = topPipeHeight - pipeHeadHeight;
            let bodyY = 0;
            let remainingHeight = topPipeBodyHeight;
            
            while (remainingHeight > 0) {
                const drawHeight = Math.min(remainingHeight, pipeBodySourceHeight);
                ctx.drawImage(pipeUp, 0, pipeHeadHeight, pipeWidth, drawHeight,
                             pipe.x, bodyY, pipeWidth, drawHeight);
                bodyY += drawHeight;
                remainingHeight -= drawHeight;
            }
            
            // Рисуем шапку верхней трубы внизу (перед зазором)
            ctx.drawImage(pipeUp, 0, 0, pipeWidth, pipeHeadHeight,
                         pipe.x, pipe.gapY - pipeHeadHeight, pipeWidth, pipeHeadHeight);
        }
        
        // Нижняя труба: начинается с земли и идет вверх до gapY + gap
        const bottomPipeY = pipe.gapY + gap;
        const bottomPipeHeight = groundY - bottomPipeY;
        
        if (bottomPipeHeight > pipeHeadHeight && bottomPipeY < groundY) {
            // Рисуем шапку нижней трубы вверху (после зазора)
            ctx.drawImage(pipeBottom, 0, 0, pipeWidth, pipeHeadHeight,
                         pipe.x, bottomPipeY, pipeWidth, pipeHeadHeight);
            
            // Рисуем тело нижней трубы от шапки до земли
            const bottomPipeBodyHeight = bottomPipeHeight - pipeHeadHeight;
            let bodyY = bottomPipeY + pipeHeadHeight;
            let remainingHeight = bottomPipeBodyHeight;
            
            while (remainingHeight > 0) {
                const drawHeight = Math.min(remainingHeight, pipeBodySourceHeight);
                ctx.drawImage(pipeBottom, 0, pipeHeadHeight, pipeWidth, drawHeight,
                             pipe.x, bodyY, pipeWidth, drawHeight);
                bodyY += drawHeight;
                remainingHeight -= drawHeight;
            }
        }
    });
}

// Отрисовка монет
function drawCoins() {
    if (!coin.complete || coinsList.length === 0) return;
    
    coinsList.forEach(coinObj => {
        if (!coinObj.collected) {
            // Анимация вращения монетки
            const rotation = Math.sin(frame / 10) * 0.15;
            
            ctx.save();
            ctx.translate(coinObj.x, coinObj.y);
            ctx.rotate(rotation);
            ctx.drawImage(coin, -coinObj.size/2, -coinObj.size/2, coinObj.size, coinObj.size);
            ctx.restore();
        }
    });
}

// Отрисовка птицы
function drawBird() {
    if (!bird.complete) return;
    
    ctx.save();
    ctx.translate(birdX + bird.width/2, birdY + bird.height/2);
    ctx.rotate(velocity * 0.1);
    ctx.drawImage(bird, -bird.width/2, -bird.height/2, bird.width, bird.height);
    ctx.restore();
}

// Отрисовка земли
function drawForeground() {
    if (!fg.complete) return;
    
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    const fgWidth = fg.naturalWidth || fg.width;
    const fgHeight = fg.naturalHeight || fg.height;
    const groundY = canvasHeight - fgHeight;
    
    // Вычисляем количество плиток для покрытия экрана
    const tilesNeeded = Math.ceil(canvasWidth / fgWidth) + 2;
    
    // Нормализуем fgX для бесконечной прокрутки
    fgX = fgX % fgWidth;
    if (fgX > 0) fgX -= fgWidth;
    
    // Рисуем все плитки земли
    for (let i = 0; i < tilesNeeded; i++) {
        const x = fgX + (i * fgWidth);
        ctx.drawImage(fg, x, groundY, fgWidth, fgHeight);
    }
    
    // Обновляем позицию земли (синхронизировано со скоростью игры)
    const speedMultiplier = 1 + (score * 0.02);
    const fgSpeed = gameSpeed * speedMultiplier;
    fgX -= fgSpeed;
}

// Игровой цикл
let lastTime = 0;
function gameLoop(currentTime = performance.now()) {
    if (!gameActive) return;
    
    // Обновляем размеры canvas для мобильных устройств
    if (frame % 120 === 0) {
        resizeCanvas();
    }
    
    // Очистка canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
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
        ctx.fillRect(0, 0, canvas._width || canvas.width, canvas._height || canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('КАСНИТЕСЬ ЭКРАНА', (canvas._width || canvasWidth) / 2, (canvas._height || canvasHeight) / 2 - 20);
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText('ЧТОБЫ НАЧАТЬ', (canvas._width || canvasWidth) / 2, (canvas._height || canvasHeight) / 2 + 20);
        
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }
    
    // Обновление игры
    updateGame();
    
    // Запуск следующего кадра
    animationFrame = requestAnimationFrame(gameLoop);
}

function updateGame() {
    frame++;
    
    // Обновление позиции птицы
    updateBird();
    
    // Добавление новых труб
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const lastPipeX = pipes.length > 0 ? pipes[pipes.length - 1].x : 0;
    
    if (pipes.length === 0 || canvasWidth - lastPipeX > 200) {
        addPipe();
    }
    
    // Обновление позиции труб
    updatePipes();
    
    // Обновление позиции монет
    updateCoins();
    
    // Проверка столкновений
    checkCollisions();
    
    // Обновление счета
    updateScore();
    
    // Проверка достижений
    if (frame % 10 === 0) {
        checkAchievements();
    }
}

function updateBird() {
    if (gameStarted) {
        velocity += gravity;
        birdY += velocity;
    }
    
    // Проверка столкновения с верхом экрана
    if (birdY <= 0) {
        birdY = 0;
        velocity = 0;
    }
    
    // Проверка столкновения с землей
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    const birdBottom = birdY + bird.height;
    
    if (birdBottom >= groundY) {
        gameOver();
    }
}

function updatePipes() {
    // Скорость увеличивается со временем, но с ограничением
    const speedMultiplier = 1 + Math.min(score * 0.02, 2.0); // Максимум 3x ускорения
    const currentSpeed = gameSpeed * speedMultiplier;
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= currentSpeed;
        
        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x + 52 < birdX) {
            pipes[i].passed = true;
            score++;
        }
        
        // Удаление труб за пределами экрана
        if (pipes[i].x + 52 < 0) {
            pipes.splice(i, 1);
        }
    }
}

function updateCoins() {
    // Скорость увеличивается со временем, но с ограничением
    const speedMultiplier = 1 + Math.min(score * 0.02, 2.0);
    const currentSpeed = gameSpeed * speedMultiplier;
    
    for (let i = coinsList.length - 1; i >= 0; i--) {
        coinsList[i].x -= currentSpeed;
        
        // Проверка сбора монеты
        if (!coinsList[i].collected) {
            const coinCenterX = coinsList[i].x;
            const coinCenterY = coinsList[i].y;
            const birdCenterX = birdX + bird.width / 2;
            const birdCenterY = birdY + bird.height / 2;
            
            const dx = coinCenterX - birdCenterX;
            const dy = coinCenterY - birdCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionDistance = (coinsList[i].size / 2 + bird.width / 2);
            
            if (distance < collisionDistance) {
                coinsList[i].collected = true;
                const coinValue = coinsList[i].value || 1;
                coinsCollected += coinValue;
                coinsEarned += coinValue;
                totalCoins += coinValue;
                coinsCountElement.textContent = totalCoins;
                
                if (isSoundOn) {
                    coinSound.currentTime = 0;
                    coinSound.play().catch(e => console.log('Sound playback failed'));
                }
            }
        }
        
        // Удаление монет за пределами экрана
        if (coinsList[i].x + coinsList[i].size < 0) {
            coinsList.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const birdLeft = birdX;
    const birdRight = birdX + bird.width;
    const birdTop = birdY;
    const birdBottom = birdY + bird.height;
    
    // Проверка столкновений с трубами
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + 52; // Ширина трубы
        
        // Проверяем только видимые трубы
        if (pipeRight < birdLeft - 50 || pipeLeft > birdRight + 50) {
            continue;
        }
        
        // Проверка горизонтального пересечения
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Верхняя труба: от верха до gapY
            if (birdTop < pipe.gapY) {
                gameOver();
                return;
            }
            
            // Нижняя труба: от gapY + gap до земли
            const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
            const fgHeight = fg.naturalHeight || fg.height || 112;
            const groundY = canvasHeight - fgHeight;
            const bottomPipeTop = pipe.gapY + gap;
            
            if (birdBottom > bottomPipeTop && bottomPipeTop < groundY) {
                gameOver();
                return;
            }
        }
    }
}

function updateScore() {
    const totalScore = score + coinsCollected;
    scoreElement.textContent = `СЧЕТ: ${totalScore}`;
}

function checkAchievements() {
    const totalScore = score + coinsCollected;
    achievements.forEach(achievement => {
        if (!achievement.unlocked && totalScore >= achievement.score) {
            achievement.unlocked = true;
            saveGameData();
            if (tg && tg.showAlert) {
                tg.showAlert(`ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО: ${achievement.name}`);
            }
        }
    });
}

function gameOver() {
    gameActive = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    
    if (isSoundOn) {
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play().catch(e => console.log('Sound playback failed'));
    }
    
    // Обновление рекорда
    const totalScore = score + coinsCollected;
    if (totalScore > bestScore) {
        bestScore = totalScore;
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
        
        // Добавление в таблицу рекордов
        let leaderboard = JSON.parse(localStorage.getItem('retroPixelFlyerLeaderboard') || '[]');
        leaderboard.push({ 
            score: bestScore, 
            date: new Date().toLocaleDateString('ru-RU'),
            timestamp: Date.now()
        });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10); // Топ 10
        localStorage.setItem('retroPixelFlyerLeaderboard', JSON.stringify(leaderboard));
    }
    
    // Добавление монет
    totalCoins += coinsEarned;
    coinsCountElement.textContent = totalCoins;
    
    // Сохранение данных
    saveGameData();
    
    // Показать меню Game Over
    finalScoreElement.textContent = totalScore;
    coinsEarnedElement.textContent = coinsEarned;
    gameOverMenu.classList.add('active');
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    audioBtn.textContent = isSoundOn ? '🔊' : '🔇';
    if (isSoundOn) {
        bgMusic.play().catch(e => console.log('Autoplay blocked'));
    } else {
        bgMusic.pause();
    }
}

// Сохранение данных игры
function saveGameData() {
    localStorage.setItem('retroPixelFlyerBestScore', bestScore.toString());
    localStorage.setItem('retroPixelFlyerCoins', totalCoins.toString());
    localStorage.setItem('retroPixelFlyerBird', currentBird);
    localStorage.setItem('retroPixelFlyerAchievements', JSON.stringify(achievements.map(a => ({ id: a.id, unlocked: a.unlocked }))));
    localStorage.setItem('retroPixelFlyerShop', JSON.stringify(shopItems.map(s => ({ id: s.id, owned: s.owned }))));
}

// Инициализация магазина
function initShop() {
    shopContent.innerHTML = '';
    shopItems.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        shopItem.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.description}</div>
            </div>
            <div class="shop-item-actions">
                ${item.owned ? 
                    `<button class="btn-small ${currentBird === item.id ? 'btn-selected' : ''}" 
                             onclick="selectBird('${item.id}')">
                        ${currentBird === item.id ? 'ВЫБРАНО' : 'ВЫБРАТЬ'}
                    </button>` :
                    `<div class="shop-item-price">${item.price} 🪙</div>
                     <button class="btn-small ${totalCoins >= item.price ? '' : 'btn-disabled'}" 
                             onclick="buyBird('${item.id}')" 
                             ${totalCoins < item.price ? 'disabled' : ''}>
                        КУПИТЬ
                    </button>`
                }
            </div>
        `;
        shopContent.appendChild(shopItem);
    });
}

// Глобальные функции для обработчиков
window.buyBird = function(birdId) {
    const item = shopItems.find(s => s.id === birdId);
    if (!item || item.owned || totalCoins < item.price) return;
    totalCoins -= item.price;
    item.owned = true;
    saveGameData();
    updateUI();
    initShop();
    if (tg && tg.showAlert) {
        tg.showAlert(`Куплено: ${item.name}`);
    }
};

window.selectBird = function(birdId) {
    const item = shopItems.find(s => s.id === birdId);
    if (!item || !item.owned) return;
    currentBird = birdId;
    saveGameData();
    initShop();
};

// Инициализация достижений
function initAchievements() {
    achievementsContent.innerHTML = '';
    achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementItem.innerHTML = `
            <div class="achievement-icon">${achievement.unlocked ? '🏆' : '🔒'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
            ${achievement.unlocked ? '<div class="achievement-badge">РАЗБЛОКИРОВАНО</div>' : ''}
        `;
        achievementsContent.appendChild(achievementItem);
    });
}

// Инициализация реферальной программы
function initReferral() {
    // Генерация реферальной ссылки
    let userId = 'user_' + Date.now();
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id.toString();
    }
    
    const referralCode = encodeURIComponent(userId).substring(0, 12);
    const referralLink = `https://t.me/your_bot?start=${referralCode}`;
    referralLinkInput.value = referralLink;
    
    // Проверка реферального кода при запуске
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
        const refCode = tg.initDataUnsafe.start_param;
        handleReferral(refCode);
    }
}

function handleReferral(refCode) {
    // Проверка, не пригласил ли пользователь сам себя
    let userId = 'user_' + Date.now();
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id.toString();
    }
    
    try {
        const refUserId = decodeURIComponent(refCode);
        if (refUserId === userId || refUserId.includes(userId)) return;
        
        // Проверка, не обрабатывали ли уже этот реферальный код
        const processedRefs = JSON.parse(localStorage.getItem('retroPixelFlyerProcessedRefs') || '[]');
        if (processedRefs.includes(refCode)) return;
        
        processedRefs.push(refCode);
        localStorage.setItem('retroPixelFlyerProcessedRefs', JSON.stringify(processedRefs));
        
        // Добавление реферала
        const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
        referralData.count++;
        referralData.bonus += 10; // Бонус за реферала
        totalCoins += 10; // Бонус приглашенному
        localStorage.setItem('retroPixelFlyerReferrals', JSON.stringify(referralData));
        referralsCountElement.textContent = referralData.count;
        referralsBonusElement.textContent = referralData.bonus;
        coinsCountElement.textContent = totalCoins;
        saveGameData();
        
        if (tg && tg.showAlert) {
            tg.showAlert('Вы получили 10 монет за приглашение друга!');
        }
    } catch (e) {
        console.error('Error processing referral:', e);
    }
}

function copyReferralLink() {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999); // Для мобильных устройств
    
    try {
        navigator.clipboard.writeText(referralLinkInput.value).then(() => {
            if (tg && tg.showAlert) {
                tg.showAlert('Ссылка скопирована!');
            }
        }).catch(() => {
            document.execCommand('copy');
            if (tg && tg.showAlert) {
                tg.showAlert('Ссылка скопирована!');
            }
        });
    } catch (e) {
        document.execCommand('copy');
        if (tg && tg.showAlert) {
            tg.showAlert('Ссылка скопирована!');
        }
    }
}

// Инициализация таблицы рекордов
function initLeaderboard() {
    leaderboardContent.innerHTML = '';
    
    // Получение рекордов из localStorage
    let leaderboard = JSON.parse(localStorage.getItem('retroPixelFlyerLeaderboard') || '[]');
    
    // Сортировка по очкам
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Удаление дубликатов (оставляем только лучший результат)
    const uniqueLeaderboard = [];
    const seenScores = new Set();
    leaderboard.forEach(entry => {
        if (!seenScores.has(entry.score)) {
            seenScores.add(entry.score);
            uniqueLeaderboard.push(entry);
        }
    });
    
    leaderboard = uniqueLeaderboard.slice(0, 10); // Топ 10
    localStorage.setItem('retroPixelFlyerLeaderboard', JSON.stringify(leaderboard));
    
    if (leaderboard.length === 0) {
        leaderboardContent.innerHTML = '<div class="leaderboard-empty">Пока нет рекордов<br>Сыграй и установи свой рекорд!</div>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        if (entry.score === bestScore) {
            leaderboardItem.style.borderColor = '#ffd700';
            leaderboardItem.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
        }
        leaderboardItem.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-score">${entry.score}</div>
            <div class="leaderboard-date">${entry.date || 'Сегодня'}</div>
        `;
        leaderboardContent.appendChild(leaderboardItem);
    });
}

// Функция поделиться
function shareGame() {
    const totalScore = score + coinsCollected;
    const shareText = `🎮 Я набрал ${totalScore} очков в НОВОГОДНЕМ ПОЛЕТЕ! 🎄
Попробуй побить мой рекорд!`;
    
    if (tg && tg.shareUrl) {
        tg.shareUrl(`https://t.me/your_bot?start=share_${totalScore}`, shareText);
    } else if (navigator.share) {
        navigator.share({
            title: 'НОВОГОДНИЙ ПОЛЕТ',
            text: shareText,
            url: window.location.href
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        if (tg && tg.showAlert) {
            tg.showAlert('Текст скопирован!');
        }
    } catch (e) {
        console.error('Failed to copy:', e);
    }
    document.body.removeChild(textarea);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    resizeCanvas();
    
    // Если ресурсы не загрузились вовремя, инициализируем игру вручную
    setTimeout(() => {
        if (!gameLoaded) {
            console.warn('Forcing game initialization');
            gameLoaded = true;
            initGame();
        }
    }, 3000);
});

// Загрузка игры при полной загрузке страницы
window.addEventListener('load', function() {
    resizeCanvas();
});
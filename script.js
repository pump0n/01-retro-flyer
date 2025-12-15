// Система логирования для отладки
const gameLogger = {
    enabled: true,
    logs: [],
    
    log: function(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}`;
        this.logs.push(logEntry);
        
        if (this.enabled) {
            console.log(logEntry);
        }
        
        // Сохраняем последние 100 логов
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    },
    
    error: function(message) {
        this.log(message, 'ERROR');
    },
    
    warn: function(message) {
        this.log(message, 'WARN');
    },
    
    debug: function(message) {
        this.log(message, 'DEBUG');
    },
    
    getLogs: function() {
        return this.logs.join('\n');
    },
    
    downloadLogs: function() {
        const blob = new Blob([this.getLogs()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'retro-pixel-flyer-logs.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    gameLogger.log('✅ Telegram WebApp инициализирован');
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
const gravity = 0.4;
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
let touchCooldown = 100;
let pipeDistance = 250; // Расстояние между трубами
let gameSpeed = 2; // Базовая скорость игры
let minPipeHeight = 50; // Минимальная высота трубы
let maxPipeHeight = 0; // Будет вычислено при запуске игры
let birdSize = 34; // Размер птички
let pipeWidth = 52; // Ширина трубы
let lastPipeX = 0; // Последняя позиция трубы
let gameStartTime = 0; // Время начала игры
let touchActive = false; // Флаг активности касания

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
let loadingStartTime = 0;
const minLoadTime = 1500; // 1.5 секунды для анимации загрузки

// Обработчик загрузки ресурсов
function resourceLoaded() {
    loadedResources++;
    const progress = Math.floor((loadedResources / resources.length) * 100);
    document.getElementById('loading-progress').style.width = progress + '%';
    
    gameLogger.log(`📦 Загружен ресурс: ${resources[loadedResources-1].src} (${loadedResources}/${resources.length})`);
    
    if (loadingStartTime === 0) {
        loadingStartTime = Date.now();
    }
    
    const elapsedTime = Date.now() - loadingStartTime;
    
    if (loadedResources >= resources.length && elapsedTime >= minLoadTime) {
        gameLoaded = true;
        gameLogger.log('✅ Все ресурсы загружены, запуск игры через 300мс');
        setTimeout(initGame, 300);
    } else if (loadedResources >= resources.length) {
        setTimeout(() => {
            gameLoaded = true;
            gameLogger.log('✅ Все ресурсы загружены, запуск игры');
            initGame();
        }, minLoadTime - elapsedTime);
    }
}

resources.forEach(res => {
    res.onload = function() {
        gameLogger.log(`✅ Изображение загружено: ${res.src}`);
        resourceLoaded();
    };
    res.onerror = function() {
        gameLogger.error(`❌ Ошибка загрузки изображения: ${res.src}`);
        resourceLoaded();
    };
});

// Resize canvas
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Установка внутренних размеров с учетом DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    if (dpr > 1) {
        ctx.scale(dpr, dpr);
    }
    
    // Сохраняем реальные размеры для использования в игре
    canvas._width = width;
    canvas._height = height;
    
    gameLogger.log(`📏 Размеры canvas обновлены: ${width}x${height}`);
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});
resizeCanvas();

// Инициализация игры
function initGame() {
    gameLogger.log('🚀 Инициализация игры');
    
    // Скрыть экран загрузки
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainMenu.classList.add('active');
        gameLogger.log('🏠 Главное меню показано');
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
    
    // Добавляем обработчики событий
    setupEventListeners();
    
    gameLogger.log('✅ Игра успешно инициализирована');
}

// Установка обработчиков событий
function setupEventListeners() {
    gameLogger.log('🎯 Установка обработчиков событий');
    
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
    
    // Управление игрой
    document.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Обработчики для start-screen
    if (startScreen) {
        startScreen.addEventListener('click', handleStartScreenClick);
        startScreen.addEventListener('touchstart', handleTouchStart, { passive: false });
        startScreen.addEventListener('touchend', handleStartScreenClick, { passive: false });
    }
    
    gameLogger.log('✅ Обработчики событий установлены');
}

// Загрузка данных игры
function loadGameData() {
    gameLogger.log('📥 Загрузка данных игры из localStorage');
    
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
    
    // Загрузка рефералов
    const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
    referralsCountElement.textContent = referralData.count;
    referralsBonusElement.textContent = referralData.bonus;
    
    updateUI();
    gameLogger.log(`📊 Загружено: рекорд=${bestScore}, монет=${totalCoins}`);
}

// Обновление UI
function updateUI() {
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    coinsCountElement.textContent = totalCoins;
    initShop();
    initAchievements();
}

// Показать меню
function showMenu(menuName) {
    gameLogger.log(`📂 Показ меню: ${menuName}`);
    
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
    gameLogger.log('🏠 Переход в главное меню');
    
    mainMenu.classList.add('active');
    gameOverMenu.classList.remove('active');
    shopMenu.classList.remove('active');
    achievementsMenu.classList.remove('active');
    referralMenu.classList.remove('active');
    leaderboardMenu.classList.remove('active');
    startScreen.classList.remove('active');
}

// Управление игрой
function handleKey(e) {
    gameLogger.debug(`⌨️ Клавиша нажата: ${e.code}`);
    
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleInput();
    }
}

function handleClick(e) {
    gameLogger.debug(`🖱️ Клик по canvas`);
    e.preventDefault();
    handleInput();
}

function handleTouchStart(e) {
    gameLogger.debug(`👆 Touch start`);
    e.preventDefault();
    touchActive = true;
}

function handleTouchEnd(e) {
    gameLogger.debug(`👆 Touch end`);
    e.preventDefault();
    touchActive = false;
    
    // Коoldown для предотвращения множественных тапов
    const now = Date.now();
    if (now - lastTouchTime < touchCooldown) {
        return;
    }
    lastTouchTime = now;
    
    handleInput();
}

function handleStartScreenClick(e) {
    gameLogger.debug(`🎯 Клик по start-screen`);
    e.preventDefault();
    e.stopPropagation();
    
    if (gameActive && !gameStarted) {
        startPlaying();
    }
}

function handleInput() {
    gameLogger.debug(`🎮 Обработка ввода (gameActive=${gameActive}, gameStarted=${gameStarted})`);
    
    if (!gameActive) return;
    
    if (!gameStarted) {
        gameLogger.log('🎮 Начало игры');
        startPlaying();
    } else {
        gameLogger.debug('飞跃 Прыжок птички');
        jump();
    }
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Старт игры
function startGame() {
    gameLogger.log('🎮 ЗАПУСК ИГРЫ');
    
    // Проверяем, что canvas доступен
    if (!canvas || !ctx) {
        gameLogger.error('❌ Canvas недоступен');
        return;
    }
    
    // Скрыть все меню
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    
    // Показать стартовый экран
    if (startScreen) {
        startScreen.classList.add('active');
        gameLogger.log('🎯 Стартовый экран показан');
    }
    
    // Сбросить игру
    score = 0;
    coinsCollected = 0;
    coinsEarned = 0;
    pipes = [];
    coinsList = [];
    gameSpeed = 2;
    
    // Позиция птицы
    birdX = canvas._width * 0.2;
    birdY = canvas._height / 2;
    velocity = 0;
    gameActive = true;
    gameStarted = false;
    frame = 0;
    bgX = 0;
    fgX = 0;
    lastPipeX = 0;
    
    // Обновить интерфейс
    scoreElement.textContent = `СЧЕТ: ${score}`;
    
    // Добавить первые трубы
    addPipe();
    
    // Запустить музыку
    if (isSoundOn) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(e => gameLogger.warn('Autoplay blocked'));
    }
    
    // Запустить игровой цикл
    if (animationFrame) cancelAnimationFrame(animationFrame);
    lastTime = 0;
    gameLogger.log('🎮 Игровой цикл запущен');
    gameStartTime = Date.now();
    gameLoop();
}

function startPlaying() {
    if (!gameActive) {
        gameLogger.warn('❌ Игра не активна, нельзя начать');
        return;
    }
    
    gameStarted = true;
    gameLogger.log('🚀 Игра началась');
    
    if (startScreen) {
        startScreen.classList.remove('active');
        gameLogger.log('🎯 Стартовый экран скрыт');
    }
    
    jump();
}

function jump() {
    velocity = jumpPower;
    gameLogger.debug(`飞跃 Прыжок: velocity=${velocity}`);
    
    if (isSoundOn) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => gameLogger.warn('Sound playback failed'));
    }
}

// Добавление труб
function addPipe() {
    const canvasWidth = canvas._width;
    const canvasHeight = canvas._height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Минимальное и максимальное расстояние от верха до зазора
    const minTop = 50; // Минимальная высота верхней трубы
    const maxTop = groundY - gap - 50; // Максимальная высота верхней трубы
    
    if (maxTop <= minTop) {
        gameLogger.warn('❌ Недостаточно места для труб');
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
    
    lastPipeX = canvasWidth;
    
    // Добавляем монету между трубами (30% вероятность)
    if (Math.random() > 0.7) {
        coinsList.push({
            x: canvasWidth + 40,
            y: gapY + gap / 2,
            collected: false,
            size: 24,
            value: 1
        });
        gameLogger.debug(`🪙 Монета добавлена между трубами`);
    }
    
    gameLogger.log(`🔧 Труба добавлена: gapY=${gapY}`);
}

// Отрисовка фона
function drawBackground() {
    // Рисуем фон несколько раз для заполнения всего canvas
    const cols = Math.ceil(canvas._width / bg.width) + 1;
    const rows = Math.ceil(canvas._height / bg.height) + 1;
    
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            ctx.drawImage(bg, c * bg.width, r * bg.height);
        }
    }
}

// Отрисовка труб
function drawPipes() {
    pipes.forEach(pipe => {
        // Верхняя труба: начинается сверху и идет вниз до gapY
        const topPipeHeight = pipe.gapY;
        
        if (topPipeHeight > 0) {
            ctx.drawImage(pipeUp, 0, 0, pipeUp.width, topPipeHeight,
                pipe.x, 0, pipeUp.width, topPipeHeight);
        }
        
        // Нижняя труба: начинается с земли и идет вверх до gapY + gap
        const bottomPipeY = pipe.gapY + gap;
        const canvasHeight = canvas._height;
        const fgHeight = fg.naturalHeight || fg.height || 112;
        const groundY = canvasHeight - fgHeight;
        const bottomPipeHeight = groundY - bottomPipeY;
        
        if (bottomPipeHeight > 0 && bottomPipeY < groundY) {
            ctx.drawImage(pipeBottom, 0, 0, pipeBottom.width, bottomPipeHeight,
                pipe.x, bottomPipeY, pipeBottom.width, bottomPipeHeight);
        }
    });
}

// Отрисовка монет
function drawCoins() {
    coinsList.forEach(c => {
        if (!c.collected) {
            // Анимация вращения монетки
            const rotation = Math.sin(frame / 10) * 0.2;
            
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(rotation);
            ctx.drawImage(coin, -c.size/2, -c.size/2, c.size, c.size);
            ctx.restore();
        }
    });
}

// Отрисовка птицы
function drawBird() {
    ctx.save();
    ctx.translate(birdX + birdSize/2, birdY + birdSize/2);
    ctx.rotate(velocity * 0.1);
    ctx.drawImage(bird, -birdSize/2, -birdSize/2, birdSize, birdSize);
    ctx.restore();
}

// Отрисовка земли
function drawForeground() {
    const canvasWidth = canvas._width;
    const canvasHeight = canvas._height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Рисуем передний фон внизу экрана
    const cols = Math.ceil(canvasWidth / fg.width) + 1;
    
    for (let c = 0; c < cols; c++) {
        ctx.drawImage(fg, c * fg.width, groundY, fg.width, fgHeight);
    }
}

// Игровой цикл
let lastTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

function gameLoop(currentTime = performance.now()) {
    if (!gameActive) return;
    
    // Оптимизация по FPS
    const elapsed = currentTime - lastTime;
    if (elapsed < frameTime) {
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }
    lastTime = currentTime - (elapsed % frameTime);
    
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
        ctx.fillRect(0, 0, canvas._width, canvas._height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('КАСНИТЕСЬ ЭКРАНА', canvas._width / 2, canvas._height / 2 - 20);
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText('ЧТОБЫ НАЧАТЬ', canvas._width / 2, canvas._height / 2 + 20);
        
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
    if (frame % 100 === 0) {
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
    
    // Проверка столкновения с землей
    const canvasHeight = canvas._height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    if (birdY + birdSize > groundY) {
        gameLogger.log('💥 Столкновение с землей');
        gameOver();
        return;
    }
    
    // Проверка столкновения с потолком
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
}

function updatePipes() {
    // Скорость увеличивается со временем, но с ограничением
    const speedMultiplier = 1 + Math.min(score * 0.02, 2.0); // Максимум 3x ускорения
    const currentSpeed = gameSpeed * speedMultiplier;
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= currentSpeed;
        
        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x + pipeWidth < birdX) {
            pipes[i].passed = true;
            score++;
            updateScore();
            if (isSoundOn) coinSound.play().catch(e => gameLogger.warn('Sound playback failed'));
        }
        
        // Удаление труб за пределами экрана
        if (pipes[i].x + pipeWidth < 0) {
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
            const birdCenterX = birdX + birdSize / 2;
            const birdCenterY = birdY + birdSize / 2;
            
            const dx = coinCenterX - birdCenterX;
            const dy = coinCenterY - birdCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionDistance = (coinsList[i].size / 2 + birdSize / 2);
            
            if (distance < collisionDistance) {
                coinsList[i].collected = true;
                const coinValue = coinsList[i].value || 1;
                coinsCollected += coinValue;
                coinsEarned += coinValue;
                totalCoins += coinValue;
                coinsCountElement.textContent = totalCoins;
                updateScore();
                if (isSoundOn) coinSound.play().catch(e => gameLogger.warn('Sound playback failed'));
                gameLogger.log(`🪙 Монета собрана: +${coinValue}`);
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
    const birdRight = birdX + birdSize;
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;
    const canvasHeight = canvas._height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Проверка столкновения с землей
    if (birdBottom >= groundY) {
        gameLogger.log('💥 Столкновение с землей');
        gameOver();
        return;
    }
    
    // Проверка столкновения с потолком
    if (birdTop <= 0) {
        gameLogger.log('💥 Столкновение с потолком');
        gameOver();
        return;
    }
    
    // Проверка столкновений с трубами
    for (const pipe of pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeWidth;
        
        // Проверяем только видимые трубы
        if (pipeRight < birdLeft - 50 || pipeLeft > birdRight + 50) {
            continue;
        }
        
        // Проверка горизонтального пересечения
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Верхняя труба
            if (birdTop < pipe.gapY) {
                gameLogger.log(`💥 Столкновение с верхней трубой (gapY=${pipe.gapY})`);
                gameOver();
                return;
            }
            
            // Нижняя труба
            const bottomPipeY = pipe.gapY + gap;
            if (birdBottom > bottomPipeY) {
                gameLogger.log(`💥 Столкновение с нижней трубой (bottomPipeY=${bottomPipeY})`);
                gameOver();
                return;
            }
        }
    }
}

function updateScore() {
    scoreElement.textContent = `СЧЕТ: ${score + coinsCollected}`;
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
            gameLogger.log(`🏆 Достижение разблокировано: ${achievement.name}`);
        }
    });
}

function gameOver() {
    gameActive = false;
    gameStarted = false;
    cancelAnimationFrame(animationFrame);
    
    gameLogger.log(`💀 ИГРА ОКОНЧЕНА. Счет: ${score}, Монеты: ${coinsCollected}`);
    
    if (isSoundOn) {
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play().catch(e => gameLogger.warn('Sound playback failed'));
    }
    
    // Обновление рекорда
    const totalScore = score + coinsCollected;
    if (totalScore > bestScore) {
        bestScore = totalScore;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore);
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
        gameLogger.log(`🏆 Новый рекорд: ${bestScore}`);
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
        bgMusic.play().catch(e => gameLogger.warn('Autoplay blocked'));
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
        gameLogger.error(`Error processing referral: ${e}`);
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
    const shareText = `🎮 Я набрал ${totalScore} очков в RETRO PIXEL FLYER!\nПопробуй побить мой рекорд!\nhttps://pump0n.github.io/01-retro-flyer/`;
    
    if (navigator.share) {
        navigator.share({
            title: 'RETRO PIXEL FLYER',
            text: shareText
        }).catch(console.error);
    } else if (tg) {
        tg.sendData(JSON.stringify({
            action: "share_score",
            score: totalScore
        }));
        tg.showAlert('Результат отправлен в Telegram!');
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Результат скопирован в буфер обмена!');
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    gameLogger.log('📱 DOM загружен, инициализация игры');
    resizeCanvas();
    
    // Если ресурсы не загрузились вовремя, инициализируем игру вручную
    setTimeout(() => {
        if (!gameLoaded) {
            gameLogger.warn('⚠️ Ресурсы не загрузились вовремя, инициализируем вручную');
            gameLoaded = true;
            initGame();
        }
    }, 3000);
});

// Загрузка игры при полной загрузке страницы
window.addEventListener('load', function() {
    gameLogger.log('📄 Страница полностью загружена');
    resizeCanvas();
});

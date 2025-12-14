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
const jumpPower = -8;
const gap = 150;
const pipeWidth = 60;
const birdSize = 40;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default'; // Текущая выбранная птичка

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

// Resize canvas с учетом мобильных устройств
function resizeCanvas() {
    // Получаем реальные размеры экрана
    const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width;
    const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height;
    
    // Устанавливаем CSS размеры
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Устанавливаем правильное разрешение для retina дисплеев
    const dpr = window.devicePixelRatio || 1;
    
    // Устанавливаем внутренние размеры canvas с учетом DPR
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Масштабируем контекст для правильного отображения
    if (dpr > 1) {
        ctx.scale(dpr, dpr);
    }
    
    // Сохраняем реальные размеры для использования в игре
    canvas._width = width;
    canvas._height = height;
}

// Инициализация canvas при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resizeCanvas);
} else {
    resizeCanvas();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// Функция инициализации игры
function initGame() {
    // Убеждаемся, что canvas правильно инициализирован
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
    
    // Для мобильных устройств - предотвращаем зум при двойном тапе
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Предотвращаем контекстное меню на долгое нажатие
    document.addEventListener('contextmenu', function(e) {
        if (gameActive) {
            e.preventDefault();
        }
    });
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
    
    // Загрузка рефералов
    const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
    referralsCountElement.textContent = referralData.count;
    referralsBonusElement.textContent = referralData.bonus;
    
    updateUI();
}

// Сохранение данных игры
function saveGameData() {
    localStorage.setItem('retroPixelFlyerBestScore', bestScore.toString());
    localStorage.setItem('retroPixelFlyerCoins', totalCoins.toString());
    localStorage.setItem('retroPixelFlyerBird', currentBird);
    localStorage.setItem('retroPixelFlyerAchievements', JSON.stringify(achievements.map(a => ({ id: a.id, unlocked: a.unlocked }))));
    localStorage.setItem('retroPixelFlyerShop', JSON.stringify(shopItems.map(s => ({ id: s.id, owned: s.owned }))));
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

// Управление игрой с улучшенной поддержкой мобильных устройств
let touchStartY = 0;
let touchStartTime = 0;

// Touch события для мобильных устройств
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

// Клики для десктопа
canvas.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKey);

function handleKey(e) {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleInput();
    }
}

function handleClick(e) {
    // Игнорируем клики по кнопкам и другим элементам
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || 
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    handleInput();
}

function handleTouchStart(e) {
    // Игнорируем touch по меню и кнопкам
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
}

function handleTouchEnd(e) {
    // Игнорируем touch по меню и кнопкам
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.changedTouches[0];
    const touchEndY = touch.clientY;
    const touchDuration = Date.now() - touchStartTime;
    const touchDistance = Math.abs(touchEndY - touchStartY);
    
    // Обрабатываем только быстрые касания (не свайпы)
    if (touchDuration < 300 && touchDistance < 50) {
        handleInput();
        
        // Тактильная обратная связь для мобильных
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
}

function handleTouchMove(e) {
    // Разрешаем прокрутку только если не в игре
    if (!gameActive) {
        return;
    }
    e.preventDefault();
}

function handleInput() {
    if (!gameActive) return;
    if (!gameStarted) {
        startPlaying();
    } else {
        jump();
    }
}

function startGame() {
    // Убеждаемся, что canvas правильно инициализирован
    resizeCanvas();
    
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
    
    // Правильная инициализация позиции птицы с учетом размеров canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
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
    gameLoop();
}

function startPlaying() {
    gameStarted = true;
    startScreen.classList.remove('active');
}

function jump() {
    velocity = jumpPower;
    if (isSoundOn) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log('Sound playback failed'));
    }
}

function addPipe() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    const fgHeight = fg.height || 112;
    const pipeUpHeight = pipeUp.height || 242;
    const minTop = 100; // Минимальная высота верхней трубы от верха
    const maxTop = canvasHeight - fgHeight - gap - 100; // Максимальная высота с учетом земли
    
    // Убеждаемся, что есть место для трубы
    if (maxTop <= minTop) {
        console.warn('Not enough space for pipes');
        return;
    }
    
    const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    
    pipes.push({
        x: canvasWidth,
        top: topHeight,
        passed: false
    });
    
    // Добавить монетку между трубами
    coinsList.push({
        x: canvasWidth + pipeWidth / 2,
        y: topHeight + gap / 2,
        collected: false,
        size: 20
    });
}

function drawBackground() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    // Рисуем фон с бесконечной прокруткой
    if (!bg.complete || bg.width === 0) {
        // Fallback - рисуем градиент если фон не загружен
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        return;
    }
    
    const bgWidth = bg.width || canvasWidth;
    const tilesNeeded = Math.ceil(canvasWidth / bgWidth) + 2;
    
    // Нормализуем bgX для бесконечной прокрутки
    bgX = bgX % bgWidth;
    if (bgX > 0) bgX -= bgWidth;
    
    // Рисуем все плитки фона
    for (let i = 0; i < tilesNeeded; i++) {
        const x = bgX + (i * bgWidth);
        ctx.drawImage(bg, x, 0, bgWidth, canvasHeight);
    }
    
    // Обновляем позицию фона
    bgX -= 0.5;
}

function drawForeground() {
    // Рисуем землю с бесконечной прокруткой
    if (!fg.complete || fg.width === 0) return;
    
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    const fgWidth = fg.width || 336; // Fallback ширина
    const fgHeight = fg.height || 112; // Fallback высота
    const groundY = canvasHeight - fgHeight;
    
    // Вычисляем сколько плиток нужно для покрытия экрана
    const tilesNeeded = Math.ceil(canvasWidth / fgWidth) + 2;
    
    // Нормализуем fgX для бесконечной прокрутки
    fgX = fgX % fgWidth;
    if (fgX > 0) fgX -= fgWidth;
    
    // Рисуем все плитки земли
    for (let i = 0; i < tilesNeeded; i++) {
        const x = fgX + (i * fgWidth);
        ctx.drawImage(fg, x, groundY, fgWidth, fgHeight);
    }
    
    // Обновляем позицию земли
    fgX -= 2;
}

function drawPipes() {
    if (!pipeUp.complete || !pipeBottom.complete) return;
    
    // Получаем реальные размеры canvas
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    const pipeUpHeight = pipeUp.height || 242;
    const pipeBottomHeight = pipeBottom.height || 242;
    const fgHeight = fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    pipes.forEach(pipe => {
        // Верхняя труба - от самого верха экрана (y=0) до pipe.top
        // Рисуем перевернутую трубу сверху вниз
        const topPipeHeight = pipe.top;
        if (topPipeHeight > 0) {
            // Используем перевернутое изображение для верхней трубы
            ctx.save();
            ctx.translate(pipe.x, pipe.top);
            ctx.scale(1, -1);
            ctx.drawImage(pipeUp, 0, -pipeUpHeight, pipeWidth, pipeUpHeight);
            ctx.restore();
        }
        
        // Нижняя труба - от pipe.top + gap до земли
        const bottomPipeY = pipe.top + gap;
        const bottomPipeHeight = groundY - bottomPipeY;
        if (bottomPipeHeight > 0 && bottomPipeY < groundY) {
            // Растягиваем нижнюю трубу до земли
            ctx.drawImage(pipeBottom, pipe.x, bottomPipeY, pipeWidth, bottomPipeHeight);
        }
    });
}

function drawCoins() {
    if (!coin.complete) return;
    
    coinsList.forEach(coinObj => {
        if (!coinObj.collected) {
            // Анимация вращения монетки
            const rotation = Math.sin(frame / 10) * 0.2;
            ctx.save();
            
            // Перемещаем в центр монетки
            ctx.translate(coinObj.x, coinObj.y);
            ctx.rotate(rotation);
            
            // Рисуем монетку (изображение должно быть с прозрачностью)
            // Используем imageSmoothingEnabled для четкости на мобильных
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(coin, -coinObj.size/2, -coinObj.size/2, coinObj.size, coinObj.size);
            
            ctx.restore();
        }
    });
}

function drawBird() {
    if (!bird.complete) return;
    
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
    ctx.rotate(velocity * 0.1);
    ctx.drawImage(bird, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
    ctx.restore();
}

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
    checkAchievements();
}

function updateBird() {
    if (gameStarted) {
        velocity += gravity;
        birdY += velocity;
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x + pipeWidth < birdX) {
            pipes[i].passed = true;
            score++;
        }
        
        // Удаление труб за пределами экрана
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (let i = coinsList.length - 1; i >= 0; i--) {
        coinsList[i].x -= 2;
        
        // Проверка сбора монеты
        if (!coinsList[i].collected && 
            birdX < coinsList[i].x + coinsList[i].size &&
            birdX + birdSize > coinsList[i].x &&
            birdY < coinsList[i].y + coinsList[i].size &&
            birdY + birdSize > coinsList[i].y) {
            coinsList[i].collected = true;
            coinsCollected++;
            coinsEarned++;
            if (isSoundOn) {
                coinSound.currentTime = 0;
                coinSound.play().catch(e => console.log('Sound playback failed'));
            }
        }
        
        // Удаление монет за пределами экрана
        if (coinsList[i].x + coinsList[i].size < 0) {
            coinsList.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Получаем реальные размеры canvas
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    const fgHeight = fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Проверка столкновения с землей
    if (birdY + birdSize > groundY) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с потолком
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    
    // Проверка столкновения с трубами
    for (const pipe of pipes) {
        if (birdX + birdSize > pipe.x && birdX < pipe.x + pipeWidth) {
            // Верхняя труба - от верха (y=0) до pipe.top
            const topPipeBottom = pipe.top;
            if (birdY < topPipeBottom) {
                gameOver();
                return;
            }
            
            // Нижняя труба - от pipe.top + gap до земли
            const bottomPipeTop = pipe.top + gap;
            if (birdY + birdSize > bottomPipeTop && bottomPipeTop < groundY) {
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
            // Можно показать уведомление о достижении
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

// Глобальные функции для onclick обработчиков
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
    
    // Простое кодирование для реферального кода
    const referralCode = encodeURIComponent(userId).substring(0, 12);
    const referralLink = `https://t.me/your_bot?start=${referralCode}`;
    referralLinkInput.value = referralLink;
    
    // Проверка реферального кода при запуске
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
        const refCode = tg.initDataUnsafe.start_param;
        // Обработка реферального кода
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
            // Fallback для старых браузеров
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
    const shareText = `🎮 Я набрал ${totalScore} очков в НОВОГОДНЕМ ПОЛЕТЕ! 🎄\n\nПопробуй побить мой рекорд!`;
    
    if (tg && tg.shareUrl) {
        // Использование Telegram Share API
        tg.shareUrl(`https://t.me/your_bot?start=share_${totalScore}`, shareText);
    } else if (navigator.share) {
        // Web Share API
        navigator.share({
            title: 'НОВОГОДНИЙ ПОЛЕТ',
            text: shareText,
            url: window.location.href
        }).catch(() => {
            // Fallback - копирование в буфер обмена
            copyToClipboard(shareText);
        });
    } else {
        // Fallback - копирование в буфер обмена
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
    // Инициализация canvas сразу
    resizeCanvas();
    
    // Убедимся, что все ресурсы загружены
    if (loadedResources < resources.length) {
        document.getElementById('loading-progress').style.width = '50%';
    }
    
    // Для iPhone - принудительная инициализация через небольшую задержку
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
            resizeCanvas();
            if (!gameLoaded && loadedResources >= resources.length) {
                initGame();
            }
        }, 100);
    }
});

// Дополнительная инициализация при полной загрузке страницы
window.addEventListener('load', function() {
    resizeCanvas();
    
    // Если ресурсы не загрузились, все равно показываем меню
    setTimeout(() => {
        if (!gameLoaded) {
            console.warn('Some resources failed to load, initializing anyway');
            gameLoaded = true;
            initGame();
        }
    }, 2000);
});

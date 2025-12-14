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
const gravity = 0.4;
const jumpPower = -6.5;
const gap = 150;
const pipeWidth = 52;
const birdSize = 34;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let gameSpeed = 2; // Базовая скорость игры
let minPipeHeight = 50; // Минимальная высота трубы
let maxPipeHeight = 200; // Максимальная высота трубы
let lastPipeX = 0; // Позиция последней трубы

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

// Кэш для обработанного изображения монеты (без белого фона)
let processedCoinImage = null;

function processCoinImage() {
    if (processedCoinImage || !coin.complete) return;
    
    try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = coin.naturalWidth || coin.width;
        tempCanvas.height = coin.naturalHeight || coin.height;
        
        // Рисуем изображение
        tempCtx.drawImage(coin, 0, 0);
        
        // Получаем данные пикселей
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Удаляем белый фон (делаем прозрачным)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Если пиксель белый или почти белый - делаем прозрачным
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Устанавливаем альфа-канал в 0 (прозрачный)
            }
        }
        
        // Сохраняем обработанные данные
        tempCtx.putImageData(imageData, 0, 0);
        processedCoinImage = tempCanvas;
    } catch (e) {
        console.warn('Could not process coin image:', e);
        processedCoinImage = coin; // Используем оригинал если обработка не удалась
    }
}

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
    res.onload = function() {
        // Если это монета - обрабатываем ее после загрузки
        if (res === coin) {
            setTimeout(() => {
                processCoinImage();
            }, 100);
        }
        resourceLoaded();
    };
    res.onerror = function() {
        console.error(`Failed to load resource: ${res.src}`);
        resourceLoaded();
    };
});

// Resize canvas с учетом мобильных устройств
function resizeCanvas() {
    if (!canvas) return;
    
    // Получаем реальные размеры экрана
    const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width || 800;
    const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height || 600;
    
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
    
    // Убеждаемся, что контекст правильно настроен
    if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
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

// Touch события для мобильных устройств - добавляем на canvas и start-screen
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

// Универсальный обработчик для start-screen
function handleStartScreenTouch(e) {
    // Игнорируем только кнопки и меню
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    
    // Если start-screen активен и игра не началась - обрабатываем любое касание
    if (startScreen && startScreen.classList.contains('active') && !gameStarted && gameActive) {
        e.preventDefault();
        e.stopPropagation();
        handleInput();
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
}

// Также добавляем на start-screen, так как он перекрывает canvas
// Добавляем обработчики после загрузки DOM
function setupStartScreenEvents() {
    if (startScreen) {
        // Удаляем старые обработчики если они есть
        startScreen.removeEventListener('touchstart', handleStartScreenTouch);
        startScreen.removeEventListener('touchend', handleStartScreenTouch);
        startScreen.removeEventListener('click', handleStartScreenTouch);
        
        // Добавляем новые обработчики - упрощенная версия
        startScreen.addEventListener('touchstart', handleStartScreenTouch, { passive: false });
        startScreen.addEventListener('touchend', handleStartScreenTouch, { passive: false });
        startScreen.addEventListener('click', handleStartScreenTouch);
        
        // Также добавляем на дочерние элементы
        const startText = startScreen.querySelector('.start-text');
        const startSubtext = startScreen.querySelector('.start-subtext');
        if (startText) {
            startText.addEventListener('touchstart', handleStartScreenTouch, { passive: false });
            startText.addEventListener('touchend', handleStartScreenTouch, { passive: false });
            startText.addEventListener('click', handleStartScreenTouch);
        }
        if (startSubtext) {
            startSubtext.addEventListener('touchstart', handleStartScreenTouch, { passive: false });
            startSubtext.addEventListener('touchend', handleStartScreenTouch, { passive: false });
            startSubtext.addEventListener('click', handleStartScreenTouch);
        }
    }
}

// Вызываем после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStartScreenEvents);
} else {
    setupStartScreenEvents();
}

// Дополнительный обработчик на document для надежности (только когда start-screen активен)
document.addEventListener('touchstart', function(e) {
    if (startScreen && startScreen.classList.contains('active') && !gameStarted && gameActive) {
        // Игнорируем только кнопки и меню
        if (!e.target.closest('button') && !e.target.closest('.menu') && 
            !e.target.closest('.status-bar') && !e.target.closest('.audio-control')) {
            e.preventDefault();
            handleInput();
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (startScreen && startScreen.classList.contains('active') && !gameStarted && gameActive) {
        // Игнорируем только кнопки и меню
        if (!e.target.closest('button') && !e.target.closest('.menu') && 
            !e.target.closest('.status-bar') && !e.target.closest('.audio-control')) {
            e.preventDefault();
            handleInput();
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }
    }
}, { passive: false });

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
    
    // Разрешаем клики по start-screen
    if (e.target.closest('.start-screen') || e.target === startScreen ||
        (startScreen && startScreen.classList.contains('active'))) {
        e.preventDefault();
        e.stopPropagation();
        if (!gameStarted && gameActive) {
            handleInput();
        }
        return;
    }
    
    // Для canvas
    if (e.target === canvas || e.target.closest('#game-canvas')) {
        e.preventDefault();
        e.stopPropagation();
        handleInput();
    }
}

function handleTouchStart(e) {
    // Игнорируем touch по меню и кнопкам
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    
    // Разрешаем touch по start-screen
    if (e.target.closest('.start-screen') || e.target === startScreen) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        return;
    }
    
    // Для canvas
    if (e.target === canvas || e.target.closest('#game-canvas')) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
    }
}

function handleTouchEnd(e) {
    // Игнорируем touch по меню и кнопкам
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
        e.target.closest('.menu') || e.target.closest('.status-bar') ||
        e.target.closest('.audio-control')) {
        return;
    }
    
    // Если start-screen активен - используем упрощенный обработчик
    if (startScreen && startScreen.classList.contains('active')) {
        handleStartScreenTouch(e);
        return;
    }
    
    // Для canvas - проверяем на свайп только во время игры
    if (e.target === canvas || e.target.closest('#game-canvas')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (gameStarted) {
            // Во время игры - проверяем на свайп
            const touch = e.changedTouches[0];
            const touchEndY = touch.clientY;
            const touchDuration = Date.now() - touchStartTime;
            const touchDistance = Math.abs(touchEndY - touchStartY);
            
            if (touchDuration < 300 && touchDistance < 50) {
                handleInput();
                if (tg && tg.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('light');
                }
            }
        } else {
            // Если игра еще не началась - обрабатываем любое касание
            handleInput();
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
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
    
    // Проверяем, что canvas доступен
    if (!canvas || !ctx) {
        console.error('Canvas not available');
        return;
    }
    
    // Настраиваем события для start-screen
    setupStartScreenEvents();
    
    // Скрыть все меню
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    if (startScreen) {
    startScreen.classList.add('active');
    }
    
    // Сбросить игру
    score = 0;
    coinsCollected = 0;
    coinsEarned = 0;
    pipes = [];
    coinsList = [];
    gameSpeed = 2;
    lastPipeX = 0;
    
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
    lastTime = 0; // Сброс времени для плавного старта
    gameLoop();
}

function startPlaying() {
    if (!gameActive) return;
    
    gameStarted = true;
    if (startScreen) {
    startScreen.classList.remove('active');
    }
    // Сразу делаем первый прыжок
    jump();
}

function jump() {
    // Плавный прыжок - применяем силу сразу без задержки
    velocity = jumpPower;
    
    // Ограничиваем максимальную скорость вверх
    if (velocity < -12) velocity = -12;
    
    // Воспроизводим звук асинхронно, чтобы не блокировать
    if (isSoundOn) {
        const sound = jumpSound.cloneNode();
        sound.volume = 0.3;
        sound.play().catch(() => {});
    }
}

function addPipe() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const pipeHeadHeight = 26; // Высота шапки трубы
    const safeZone = 50; // Безопасная зона от верха и низа
    
    // Вычисляем доступную высоту для зазора
    const availableHeight = canvasHeight - fgHeight - safeZone * 2;
    
    // Генерируем проходимую высоту верхней трубы
    // Убеждаемся, что зазор всегда проходим
    const minTop = safeZone + minPipeHeight;
    const maxTop = canvasHeight - fgHeight - gap - minPipeHeight - safeZone;
    
    if (maxTop <= minTop) {
        console.warn('Not enough space for pipes');
        return;
    }
    
    // Генерируем случайную, но проходимую высоту
    const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

        // Добавляем трубу только если прошло достаточно времени с последней
        if (pipes.length === 0 || canvasWidth - lastPipeX > 200) {
            pipes.push({
                x: canvasWidth,
                top: topHeight,
                passed: false
            });
            lastPipeX = canvasWidth;
            
            // Добавляем монетку между трубами (всегда)
            coinsList.push({
                x: canvasWidth + pipeWidth / 2,
                y: topHeight + gap / 2 + (Math.random() - 0.5) * (gap * 0.4), // Немного случайности, но в пределах зазора
                collected: false,
                size: 24,
                value: 1
            });
        }
        
        // Добавляем случайные монетки в труднодоступных местах (не между трубами)
        if (Math.random() > 0.7) {
            const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
            const fgHeight = fg.naturalHeight || fg.height || 112;
            const safeZone = 30;
            
            // Размещаем монетки в труднодоступных местах:
            // 1. Очень близко к верху (труднодоступно)
            // 2. Очень близко к низу (труднодоступно)
            // 3. В узких местах между трубами других пар
            
            const coinType = Math.random();
            let coinY;
            
            if (coinType < 0.4) {
                // Очень близко к верху
                coinY = safeZone + Math.random() * 40;
            } else if (coinType < 0.8) {
                // Очень близко к низу
                coinY = canvasHeight - fgHeight - safeZone - 40 + Math.random() * 40;
            } else {
                // В средних труднодоступных местах
                coinY = safeZone + 100 + Math.random() * (canvasHeight - fgHeight - safeZone * 2 - 200);
            }
            
            coinsList.push({
                x: canvasWidth + 50 + Math.random() * 150,
                y: coinY,
                collected: false,
                size: 28,
                value: 2 // Более ценные монетки в труднодоступных местах
            });
        }
}

function drawBackground() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    // Рисуем фон с бесконечной прокруткой
    if (!bg.complete || bg.naturalWidth === 0 || bg.width === 0) {
        // Fallback - рисуем градиент если фон не загружен
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        return;
    }
    
    const bgWidth = bg.naturalWidth || bg.width || canvasWidth;
    const speedMultiplier = 1 + (score * 0.01); // Фон движется медленнее
    const bgSpeed = 0.5 * speedMultiplier;
    const tilesNeeded = Math.ceil(canvasWidth / bgWidth) + 2;
    
    // Нормализуем bgX для бесконечной прокрутки
    if (bgWidth > 0) {
        bgX = bgX % bgWidth;
        if (bgX > 0) bgX -= bgWidth;
    }
    
    // Рисуем все плитки фона
    for (let i = 0; i < tilesNeeded; i++) {
        const x = bgX + (i * bgWidth);
        ctx.drawImage(bg, x, 0, bgWidth, canvasHeight);
    }
    
    // Обновляем позицию фона
    bgX -= bgSpeed;
}

function drawForeground() {
    // Получаем реальные размеры canvas
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    
    // Рисуем землю с бесконечной прокруткой
    if (!fg.complete || fg.naturalWidth === 0 || fg.width === 0) {
        // Fallback - рисуем простую землю
        ctx.fillStyle = '#8B4513';
        const groundHeight = 50;
        ctx.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
        return;
    }
    
    const fgWidth = fg.naturalWidth || fg.width || 336; // Fallback ширина
    const fgHeight = fg.naturalHeight || fg.height || 112; // Fallback высота
    const groundY = canvasHeight - fgHeight;
    
    // Вычисляем сколько плиток нужно для покрытия экрана
    const tilesNeeded = Math.ceil(canvasWidth / fgWidth) + 2;
    
    // Нормализуем fgX для бесконечной прокрутки
    if (fgWidth > 0) {
        fgX = fgX % fgWidth;
        if (fgX > 0) fgX -= fgWidth;
    }
    
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

function drawPipes() {
    if (!pipeUp.complete || !pipeBottom.complete) return;
    
    // Получаем реальные размеры canvas
    const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    const pipeHeadHeight = 26; // Высота шапки трубы
    const pipeImageHeight = pipeUp.naturalHeight || pipeUp.height || 242;
    const pipeBodySourceHeight = pipeImageHeight - pipeHeadHeight;
    
    pipes.forEach(pipe => {
        // Верхняя труба - от верха экрана (y=0) до pipe.top
        // Используем pipeUp БЕЗ переворота - рисуем сверху вниз
        const topPipeHeight = pipe.top;
        if (topPipeHeight > pipeHeadHeight) {
            const topPipeBodyHeight = topPipeHeight - pipeHeadHeight;
            
            // Рисуем шапку верхней трубы вверху (y=0)
            ctx.drawImage(pipeUp, 0, 0, pipeWidth, pipeHeadHeight,
                         pipe.x, 0, pipeWidth, pipeHeadHeight);
            
            // Рисуем тело верхней трубы от шапки до pipe.top
            // Тайлим тело трубы если нужно
            let bodyY = pipeHeadHeight;
            let remainingHeight = topPipeBodyHeight;
            while (remainingHeight > 0) {
                const drawHeight = Math.min(remainingHeight, pipeBodySourceHeight);
                ctx.drawImage(pipeUp, 0, pipeHeadHeight, pipeWidth, drawHeight,
                             pipe.x, bodyY, pipeWidth, drawHeight);
                bodyY += drawHeight;
                remainingHeight -= drawHeight;
            }
        }
        
        // Нижняя труба - от pipe.top + gap до земли
        // Используем pipeBottom БЕЗ переворота - рисуем снизу вверх
        const bottomPipeY = pipe.top + gap;
        const bottomPipeHeight = groundY - bottomPipeY;
        if (bottomPipeHeight > pipeHeadHeight && bottomPipeY < groundY) {
            const bottomPipeBodyHeight = bottomPipeHeight - pipeHeadHeight;
            
            // Рисуем тело нижней трубы от gap до земли (без шапки)
            // Тайлим тело трубы если нужно
            let bodyY = bottomPipeY;
            let remainingHeight = bottomPipeBodyHeight;
            while (remainingHeight > 0) {
                const drawHeight = Math.min(remainingHeight, pipeBodySourceHeight);
                ctx.drawImage(pipeBottom, 0, pipeHeadHeight, pipeWidth, drawHeight,
                             pipe.x, bodyY, pipeWidth, drawHeight);
                bodyY += drawHeight;
                remainingHeight -= drawHeight;
            }
            
            // Рисуем шапку нижней трубы внизу (у земли)
            ctx.drawImage(pipeBottom, 0, 0, pipeWidth, pipeHeadHeight,
                         pipe.x, groundY - pipeHeadHeight, pipeWidth, pipeHeadHeight);
        }
    });
}

function drawCoins() {
    if (!coin.complete) return;
    
    // Обрабатываем изображение монеты один раз
    if (!processedCoinImage) {
        processCoinImage();
    }
    
    coinsList.forEach(coinObj => {
        if (!coinObj.collected) {
            // Анимация вращения монетки
            const rotation = Math.sin(frame / 10) * 0.2;
            ctx.save();
            
            // Перемещаем в центр монетки
            ctx.translate(coinObj.x, coinObj.y);
            ctx.rotate(rotation);
            
            // Рисуем монетку с прозрачностью
            // Используем imageSmoothingEnabled для четкости на мобильных
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Используем обработанное изображение (без белого фона) или оригинал
            const coinImage = processedCoinImage || coin;
            ctx.drawImage(coinImage, -coinObj.size/2, -coinObj.size/2, coinObj.size, coinObj.size);
            
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

let lastTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

// Оптимизация: кэш для часто используемых значений
let cachedCanvasWidth = 0;
let cachedCanvasHeight = 0;
let cachedGroundY = 0;

function gameLoop(currentTime = performance.now()) {
    if (!gameActive) return;
    
    // Управление FPS для плавности (упрощенная версия без строгого ограничения)
    const deltaTime = currentTime - lastTime;
    
    // Обновляем кэш размеров canvas (только при необходимости)
    if (cachedCanvasWidth === 0 || frame % 60 === 0) {
        cachedCanvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
        cachedCanvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
        const fgHeight = fg.naturalHeight || fg.height || 112;
        cachedGroundY = cachedCanvasHeight - fgHeight;
    }
    
    // Обновляем каждый кадр для максимальной плавности
    lastTime = currentTime;
    
    // Очистка canvas - используем полные размеры canvas (с учетом DPR)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка фона (всегда рисуем, даже если ресурс не загружен)
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
    
    // Обновление позиции труб (включает добавление новых)
    updatePipes();
    
    // Обновление позиции монет
    updateCoins();
    
    // Проверка столкновений с трубами
    checkCollisions();
    
    // Обновление счета
    updateScore();
    
    // Проверка достижений
    checkAchievements();
}

function updateBird() {
    if (gameStarted) {
        // Плавное увеличение скорости падения
    velocity += gravity;
        
        // Ограничиваем максимальную скорость падения
        if (velocity > 10) velocity = 10;
        
        // Плавное движение птички
    birdY += velocity;

        // Проверка столкновения с верхом экрана (точная проверка)
        if (birdY <= 0) {
            gameOver();
            return;
        }
        
        // Проверка столкновения с землей (точная проверка)
        const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
        const fgHeight = fg.naturalHeight || fg.height || 112;
        const groundY = canvasHeight - fgHeight;
        
        if (birdY + birdSize >= groundY) {
            gameOver();
            return;
        }
    }
}

function updatePipes() {
    // Увеличиваем скорость игры со временем
    const speedMultiplier = 1 + (score * 0.02); // Увеличиваем скорость на 2% за каждую трубу
    const currentSpeed = gameSpeed * speedMultiplier;
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= currentSpeed;
        
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
    
    // Добавляем новые трубы по мере необходимости
    const canvasWidth = canvas._width || canvas.width / (window.devicePixelRatio || 1);
    if (pipes.length === 0 || (pipes.length > 0 && pipes[pipes.length - 1].x < canvasWidth - 250)) {
        addPipe();
    }
}

function updateCoins() {
    // Используем ту же скорость, что и для труб
    const speedMultiplier = 1 + (score * 0.02);
    const currentSpeed = gameSpeed * speedMultiplier;
    
    const birdCenterX = birdX + birdSize / 2;
    const birdCenterY = birdY + birdSize / 2;
    
    for (let i = coinsList.length - 1; i >= 0; i--) {
        const coin = coinsList[i];
        coin.x -= currentSpeed;
        
        // Проверка сбора монеты (оптимизированная коллизия)
        if (!coin.collected) {
            const coinCenterX = coin.x;
            const coinCenterY = coin.y;
            const dx = coinCenterX - birdCenterX;
            const dy = coinCenterY - birdCenterY;
            const distanceSquared = dx * dx + dy * dy;
            const collisionDistance = (coin.size / 2 + birdSize / 2);
            const collisionDistanceSquared = collisionDistance * collisionDistance;
            
            if (distanceSquared < collisionDistanceSquared) {
                coin.collected = true;
                const coinValue = coin.value || 1;
                coinsCollected += coinValue;
                coinsEarned += coinValue;
                totalCoins += coinValue;
                coinsCountElement.textContent = totalCoins;
                
                // Воспроизводим звук асинхронно
                if (isSoundOn) {
                    const sound = coinSound.cloneNode();
                    sound.volume = 0.3;
                    sound.play().catch(() => {});
                }
            }
        }
        
        // Удаление монет за пределами экрана
        if (coin.x + coin.size < 0) {
            coinsList.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Проверка столкновения с трубами (точная проверка)
    const birdLeft = birdX;
    const birdRight = birdX + birdSize;
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;
    
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeWidth;
        
        // Проверяем только трубы, которые находятся рядом с птичкой
        if (pipeRight < birdLeft - 20 || pipeLeft > birdRight + 20) {
            continue;
        }
        
        // Проверка горизонтального пересечения (точная)
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Верхняя труба - от верха (y=0) до pipe.top
            // Точная проверка: птичка касается трубы
            if (birdTop < pipe.top) {
                gameOver();
                return;
            }
            
            // Нижняя труба - от pipe.top + gap до земли
            const canvasHeight = canvas._height || canvas.height / (window.devicePixelRatio || 1);
            const fgHeight = fg.naturalHeight || fg.height || 112;
            const groundY = canvasHeight - fgHeight;
            const bottomPipeTop = pipe.top + gap;
            
            // Точная проверка: птичка касается нижней трубы
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

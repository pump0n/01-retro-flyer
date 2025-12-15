// Глобальные переменные
let tg = null;
let canvas = null;
let ctx = null;
let mainMenu = null;
let gameOverMenu = null;
let startScreen = null;
let loadingScreen = null;
let shopMenu = null;
let achievementsMenu = null;
let referralMenu = null;
let leaderboardMenu = null;
let startBtn = null;
let restartBtn = null;
let mainMenuBtn = null;
let shopBtn = null;
let shopBackBtn = null;
let achievementsBtn = null;
let achievementsBackBtn = null;
let referralBtn = null;
let referralBackBtn = null;
let leaderboardBtn = null;
let leaderboardBackBtn = null;
let audioBtn = null;
let finalScoreElement = null;
let coinsEarnedElement = null;
let scoreElement = null;
let bestScoreElement = null;
let coinsCountElement = null;
let shopContent = null;
let achievementsContent = null;
let leaderboardContent = null;
let referralLinkInput = null;
let copyLinkBtn = null;
let referralsCountElement = null;
let referralsBonusElement = null;
let shareBtn = null;

// Игровые переменные
let bird = null;
let bg = null;
let fg = null;
let pipeUp = null;
let pipeBottom = null;
let coin = null;
let jumpSound = null;
let coinSound = null;
let hitSound = null;
let bgMusic = null;
let score = 0;
let coinsCollected = 0;
let coinsEarned = 0;
let totalCoins = 0;
let bestScore = 0;
let gameActive = false;
let gameStarted = false;
let pipes = [];
let coinsList = [];
let birdX = 0;
let birdY = 0;
let velocity = 0;
let gravity = 0.35;
let jumpPower = -6.5;
let gap = 120;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let pipeDistance = 250;
let lastPipeX = 0;
let loadedResources = 0;

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 DOM загружен, инициализация игры...');
    
    // Инициализация Telegram WebApp
    tg = window.Telegram.WebApp;
    if (tg) {
        tg.expand();
        tg.ready();
        console.log('✅ Telegram WebApp инициализирован');
    } else {
        console.warn('⚠️ Telegram WebApp не доступен');
    }
    
    // Инициализация DOM элементов
    initDOMElements();
    
    // Инициализация графических и звуковых ресурсов
    initResources();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Инициализация игры
    initGame();
});

// Инициализация DOM элементов
function initDOMElements() {
    console.log('🔧 Инициализация DOM элементов...');
    
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    mainMenu = document.querySelector('.main-menu');
    gameOverMenu = document.querySelector('.game-over-menu');
    startScreen = document.querySelector('.start-screen');
    loadingScreen = document.getElementById('loading-screen');
    shopMenu = document.querySelector('.shop-menu');
    achievementsMenu = document.querySelector('.achievements-menu');
    referralMenu = document.querySelector('.referral-menu');
    leaderboardMenu = document.querySelector('.leaderboard-menu');
    startBtn = document.getElementById('start-btn');
    restartBtn = document.getElementById('restart-btn');
    mainMenuBtn = document.getElementById('main-menu-btn');
    shopBtn = document.getElementById('shop-btn');
    shopBackBtn = document.getElementById('shop-back-btn');
    achievementsBtn = document.getElementById('achievements-btn');
    achievementsBackBtn = document.getElementById('achievements-back-btn');
    referralBtn = document.getElementById('referral-btn');
    referralBackBtn = document.getElementById('referral-back-btn');
    leaderboardBtn = document.getElementById('leaderboard-btn');
    leaderboardBackBtn = document.getElementById('leaderboard-back-btn');
    audioBtn = document.getElementById('audio-btn');
    finalScoreElement = document.getElementById('final-score');
    coinsEarnedElement = document.getElementById('coins-earned');
    scoreElement = document.querySelector('.score');
    bestScoreElement = document.querySelector('.best-score');
    coinsCountElement = document.getElementById('coins-count');
    shopContent = document.getElementById('shop-content');
    achievementsContent = document.getElementById('achievements-content');
    leaderboardContent = document.getElementById('leaderboard-content');
    referralLinkInput = document.getElementById('referral-link-input');
    copyLinkBtn = document.getElementById('copy-link-btn');
    referralsCountElement = document.getElementById('referrals-count');
    referralsBonusElement = document.getElementById('referrals-bonus');
    shareBtn = document.getElementById('share-btn');
    
    // Проверка наличия ключевых элементов
    const requiredElements = [
        canvas, mainMenu, startBtn, audioBtn, scoreElement,
        bestScoreElement, coinsCountElement
    ];
    
    const missingElements = requiredElements.filter(el => el === null);
    if (missingElements.length > 0) {
        console.error('❌ Отсутствуют обязательные DOM элементы:', missingElements.map(el => el.id || el.className));
    } else {
        console.log('✅ Все обязательные DOM элементы найдены');
    }
}

// Инициализация графических и звуковых ресурсов
function initResources() {
    console.log('🎨 Инициализация ресурсов...');
    
    bird = new Image();
    bg = new Image();
    fg = new Image();
    pipeUp = new Image();
    pipeBottom = new Image();
    coin = new Image();
    
    jumpSound = new Audio();
    coinSound = new Audio();
    hitSound = new Audio();
    bgMusic = new Audio();
    
    // Загрузка ресурсов
    const resources = [
        { img: bird, src: 'assets/flappy_bird_bird.png', name: 'bird' },
        { img: bg, src: 'assets/bg.png', name: 'bg' },
        { img: fg, src: 'assets/fg.png', name: 'fg' },
        { img: pipeUp, src: 'assets/pipeUp.png', name: 'pipeUp' },
        { img: pipeBottom, src: 'assets/pipeBottom.png', name: 'pipeBottom' },
        { img: coin, src: 'assets/coin.png', name: 'coin' }
    ];
    
    const audioResources = [
        { audio: jumpSound, src: 'assets/jump.mp3', name: 'jump' },
        { audio: coinSound, src: 'assets/coin.mp3', name: 'coin' },
        { audio: hitSound, src: 'assets/hit.mp3', name: 'hit' },
        { audio: bgMusic, src: 'assets/music.mp3', name: 'music' }
    ];
    
    // Загрузка изображений
    resources.forEach(res => {
        res.img.onload = function() {
            console.log(`✅ Изображение загружено: ${res.name}`);
            resourceLoaded();
        };
        res.img.onerror = function(e) {
            console.error(`❌ Ошибка загрузки изображения ${res.name}:`, e);
            resourceLoaded();
        };
        res.img.src = res.src;
    });
    
    // Загрузка аудио (с отложенной загрузкой)
    setTimeout(() => {
        audioResources.forEach(res => {
            res.audio.onloadeddata = function() {
                console.log(`🎵 Аудио загружено: ${res.name}`);
                resourceLoaded();
            };
            res.audio.onerror = function(e) {
                console.error(`❌ Ошибка загрузки аудио ${res.name}:`, e);
                resourceLoaded();
            };
            if (isSoundOn) {
                res.audio.src = res.src;
            }
        });
    }, 1000);
}

// Обработчик загрузки ресурсов
function resourceLoaded() {
    loadedResources++;
    const totalResources = 10; // 6 изображений + 4 аудио
    const progress = Math.min(Math.floor((loadedResources / totalResources) * 100), 100);
    document.getElementById('loading-progress').style.width = progress + '%';
    
    console.log(`📊 Прогресс загрузки: ${loadedResources}/${totalResources} (${progress}%)`);
    
    if (loadedResources >= totalResources) {
        gameLoaded = true;
        console.log('✅ Все ресурсы загружены');
        setTimeout(hideLoadingScreen, 300);
    }
}

// Скрытие экрана загрузки
function hideLoadingScreen() {
    console.log('🎬 Скрытие экрана загрузки...');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        showMainMenu();
    }, 300);
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🖱️ Настройка обработчиков событий...');
    
    // Обработчики кнопок главного меню
    if (startBtn) startBtn.addEventListener('click', startGame);
    if (shopBtn) shopBtn.addEventListener('click', () => showMenu('shop'));
    if (achievementsBtn) achievementsBtn.addEventListener('click', () => showMenu('achievements'));
    if (referralBtn) referralBtn.addEventListener('click', () => showMenu('referral'));
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', () => showMenu('leaderboard'));
    
    // Обработчики кнопок Game Over
    if (restartBtn) restartBtn.addEventListener('click', startGame);
    if (mainMenuBtn) mainMenuBtn.addEventListener('click', showMainMenu);
    if (shareBtn) shareBtn.addEventListener('click', shareGame);
    
    // Обработчики кнопок меню
    if (shopBackBtn) shopBackBtn.addEventListener('click', showMainMenu);
    if (achievementsBackBtn) achievementsBackBtn.addEventListener('click', showMainMenu);
    if (referralBackBtn) referralBackBtn.addEventListener('click', showMainMenu);
    if (leaderboardBackBtn) leaderboardBackBtn.addEventListener('click', showMainMenu);
    
    // Обработчик звука
    if (audioBtn) audioBtn.addEventListener('click', toggleSound);
    
    // Обработчик копирования реферальной ссылки
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyReferralLink);
    
    // Управление игрой
    if (canvas) {
        canvas.addEventListener('click', handleInput);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Клавиатура
    document.addEventListener('keydown', handleKey);
    
    // Размеры canvas
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Для мобильных устройств
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// Инициализация игры
function initGame() {
    console.log('🎮 Инициализация игры...');
    
    // Загрузка данных из localStorage
    loadGameData();
    
    // Инициализация меню
    initShop();
    initAchievements();
    initReferral();
    initLeaderboard();
    
    console.log('✅ Игра инициализирована');
}

// Загрузка данных игры
function loadGameData() {
    console.log('💾 Загрузка данных игры...');
    
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    totalCoins = parseInt(localStorage.getItem('retroPixelFlyerCoins') || '0');
    currentBird = localStorage.getItem('retroPixelFlyerBird') || 'default';
    
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    coinsCountElement.textContent = totalCoins;
    
    console.log(`📊 Загружены данные: рекорд=${bestScore}, монеты=${totalCoins}`);
}

// Показ главного меню
function showMainMenu() {
    console.log('🏠 Показ главного меню');
    
    hideAllMenus();
    mainMenu.classList.add('active');
    gameActive = false;
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    if (isSoundOn && bgMusic) {
        bgMusic.pause();
    }
}

// Скрытие всех меню
function hideAllMenus() {
    const menus = [
        mainMenu, gameOverMenu, shopMenu, achievementsMenu,
        referralMenu, leaderboardMenu, startScreen
    ];
    
    menus.forEach(menu => {
        if (menu) menu.classList.remove('active');
    });
}

// Показ меню
function showMenu(menuName) {
    console.log(`📊 Показ меню: ${menuName}`);
    
    hideAllMenus();
    
    switch(menuName) {
        case 'shop':
            shopMenu.classList.add('active');
            initShop();
            break;
        case 'achievements':
            achievementsMenu.classList.add('active');
            initAchievements();
            break;
        case 'referral':
            referralMenu.classList.add('active');
            initReferral();
            break;
        case 'leaderboard':
            leaderboardMenu.classList.add('active');
            initLeaderboard();
            break;
    }
    
    gameActive = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (isSoundOn && bgMusic) bgMusic.pause();
}

// Обработка ввода
function handleInput(e) {
    if (e) e.preventDefault();
    console.log('👆 Обработка ввода');
    
    if (!gameActive) return;
    
    if (!gameStarted) {
        console.log('🛫 Запуск игры');
        startPlaying();
    } else {
        console.log('🐦 Прыжок птицы');
        jump();
    }
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Обработка касаний
function handleTouchStart(e) {
    e.preventDefault();
    console.log('👆 Touch start');
}

function handleTouchEnd(e) {
    e.preventDefault();
    console.log('👆 Touch end');
    handleInput(e);
}

// Обработка клавиатуры
function handleKey(e) {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        console.log('⌨️ Нажата клавиша Space');
        handleInput(e);
    }
}

// Старт игры
function startGame() {
    console.log('🎯 Старт игры');
    
    hideAllMenus();
    startScreen.classList.add('active');
    
    // Сброс переменных
    score = 0;
    coinsCollected = 0;
    coinsEarned = 0;
    pipes = [];
    coinsList = [];
    frame = 0;
    bgX = 0;
    fgX = 0;
    lastPipeX = 0;
    
    // Позиция птицы
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    birdX = canvasWidth * 0.2;
    birdY = canvasHeight / 2;
    velocity = 0;
    
    gameActive = true;
    gameStarted = false;
    
    // Обновление интерфейса
    scoreElement.textContent = `СЧЕТ: ${score}`;
    
    // Добавление первой трубы
    addPipe();
    
    // Запуск музыки
    if (isSoundOn && bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(e => console.log('🔇 Автовоспроизведение заблокировано:', e));
    }
    
    // Запуск игрового цикла
    if (animationFrame) cancelAnimationFrame(animationFrame);
    gameLoop();
}

// Запуск полета
function startPlaying() {
    console.log('🚀 Игра началась');
    gameStarted = true;
    startScreen.classList.remove('active');
    jump();
}

// Прыжок
function jump() {
    velocity = jumpPower;
    console.log('⬆️ Прыжок, скорость:', velocity);
    
    if (isSoundOn && jumpSound) {
        try {
            jumpSound.currentTime = 0;
            jumpSound.play().catch(e => console.log('🔇 Звук прыжка заблокирован:', e));
        } catch (e) {
            console.error('❌ Ошибка воспроизведения звука прыжка:', e);
        }
    }
}

// Добавление трубы
function addPipe() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const fgHeight = 112; // Предполагаемая высота земли
    const groundY = canvasHeight - fgHeight;
    const minTop = 60;
    const maxTop = groundY - gap - 60;
    
    if (maxTop <= minTop) {
        console.warn('⚠️ Недостаточно места для труб');
        return;
    }
    
    const gapY = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    
    pipes.push({
        x: canvasWidth,
        gapY: gapY,
        passed: false
    });
    
    lastPipeX = canvasWidth;
    console.log('🔧 Добавлена труба на позиции:', canvasWidth);
    
    // Добавление монеты (30% вероятность)
    if (Math.random() > 0.7) {
        coinsList.push({
            x: canvasWidth + 40,
            y: gapY + gap / 2,
            collected: false,
            size: 24,
            value: 1
        });
        console.log('🪙 Добавлена монета');
    }
}

// Игровой цикл
function gameLoop() {
    if (!gameActive) return;
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка
    drawBackground();
    drawPipes();
    drawCoins();
    drawBird();
    drawForeground();
    
    // Стартовый экран
    if (!gameStarted) {
        drawStartScreen();
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }
    
    // Обновление
    updateGame();
    
    // Следующий кадр
    animationFrame = requestAnimationFrame(gameLoop);
}

// Отрисовка фона
function drawBackground() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Основной фон
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Облака
    drawClouds();
}

// Отрисовка облаков
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Облако 1
    drawCloud(50, 80, 20);
    drawCloud(70, 70, 25);
    drawCloud(90, 80, 20);
    
    // Облако 2
    drawCloud(canvas.width - 50, 100, 20);
    drawCloud(canvas.width - 70, 90, 25);
    drawCloud(canvas.width - 90, 100, 20);
    
    // Движущееся облако
    const cloudX = (frame * 0.5) % canvas.width;
    drawCloud(cloudX, 120, 15);
    drawCloud(cloudX + 20, 110, 20);
    drawCloud(cloudX + 40, 120, 15);
}

// Отрисовка облака
function drawCloud(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Отрисовка труб
function drawPipes() {
    pipes.forEach(pipe => {
        // Верхняя труба
        ctx.fillStyle = '#7CFC00'; // Зеленый цвет трубы
        ctx.fillRect(pipe.x, 0, 52, pipe.gapY);
        
        // Декоративная часть верхней трубы
        ctx.fillStyle = '#4B0082'; // Индиго для шапки
        ctx.fillRect(pipe.x - 5, pipe.gapY - 15, 62, 10);
        
        // Нижняя труба
        const bottomY = pipe.gapY + gap;
        const canvasHeight = canvas.height;
        const groundY = canvasHeight - 112;
        const bottomHeight = groundY - bottomY;
        
        if (bottomHeight > 0) {
            ctx.fillStyle = '#7CFC00'; // Зеленый цвет трубы
            ctx.fillRect(pipe.x, bottomY, 52, bottomHeight);
            
            // Декоративная часть нижней трубы
            ctx.fillStyle = '#4B0082'; // Индиго для шапки
            ctx.fillRect(pipe.x - 5, bottomY, 62, 10);
        }
    });
}

// Отрисовка монет
function drawCoins() {
    coinsList.forEach(c => {
        if (!c.collected) {
            ctx.fillStyle = '#FFD700'; // Золотой цвет монеты
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Эффект вращения
            const rotation = Math.sin(frame / 10) * 0.1;
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(rotation);
            ctx.restore();
        }
    });
}

// Отрисовка птицы
function drawBird() {
    ctx.save();
    
    // Позиция и поворот птицы
    ctx.translate(birdX + 17, birdY + 12);
    ctx.rotate(velocity * 0.1);
    
    // Тело птицы
    ctx.fillStyle = '#FFD700'; // Золотой
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова
    ctx.fillStyle = '#FF4500'; // Оранжевый
    ctx.beginPath();
    ctx.arc(10, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Клюв
    ctx.fillStyle = '#FFA500'; // Ярко-оранжевый
    ctx.beginPath();
    ctx.moveTo(18, -5);
    ctx.lineTo(28, -5);
    ctx.lineTo(23, -2);
    ctx.closePath();
    ctx.fill();
    
    // Глаз
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(14, -7, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(15, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Отрисовка земли
function drawForeground() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const groundY = canvasHeight - 112;
    
    // Земля
    ctx.fillStyle = '#8B4513'; // Коричневый
    ctx.fillRect(0, groundY, canvasWidth, 112);
    
    // Трава
    ctx.fillStyle = '#228B22'; // Зеленый
    ctx.fillRect(0, groundY - 5, canvasWidth, 5);
}

// Отрисовка стартового экрана
function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px "Press Start 2P", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('КАСНИТЕСЬ ЭКРАНА', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px "Press Start 2P", cursive';
    ctx.fillText('ЧТОБЫ НАЧАТЬ', canvas.width / 2, canvas.height / 2 + 20);
}

// Обновление игры
function updateGame() {
    frame++;
    
    // Обновление птицы
    updateBird();
    
    // Обновление труб
    updatePipes();
    
    // Обновление монет
    updateCoins();
    
    // Проверка столкновений
    checkCollisions();
    
    // Обновление счета
    if (frame % 5 === 0) {
        updateScore();
    }
}

// Обновление птицы
function updateBird() {
    if (gameStarted) {
        velocity += gravity;
        birdY += velocity;
    }
    
    // Проверка столкновения с потолком
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    
    // Проверка столкновения с землей
    const canvasHeight = canvas.height;
    const groundY = canvasHeight - 112;
    if (birdY + 24 > groundY) {
        gameOver();
    }
}

// Обновление труб
function updatePipes() {
    const canvasWidth = canvas.width;
    
    // Добавление новых труб
    if (frame % 100 === 0 || pipes.length === 0 || canvasWidth - lastPipeX > 200) {
        addPipe();
    }
    
    // Обновление позиций труб
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
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

// Обновление монет
function updateCoins() {
    for (let i = coinsList.length - 1; i >= 0; i--) {
        coinsList[i].x -= 2;
        
        // Проверка сбора монеты
        const coin = coinsList[i];
        const birdCenterX = birdX + 17;
        const birdCenterY = birdY + 12;
        const distance = Math.sqrt(
            Math.pow(coin.x - birdCenterX, 2) + 
            Math.pow(coin.y - birdCenterY, 2)
        );
        
        if (!coin.collected && distance < 20) {
            coin.collected = true;
            coinsCollected += coin.value;
            coinsEarned += coin.value;
            totalCoins += coin.value;
            coinsCountElement.textContent = totalCoins;
            
            if (isSoundOn && coinSound) {
                coinSound.currentTime = 0;
                coinSound.play().catch(e => console.log('🔇 Звук монеты заблокирован:', e));
            }
        }
        
        // Удаление монет за пределами экрана
        if (coin.x < -20) {
            coinsList.splice(i, 1);
        }
    }
}

// Проверка столкновений
function checkCollisions() {
    const birdLeft = birdX;
    const birdRight = birdX + 34;
    const birdTop = birdY;
    const birdBottom = birdY + 24;
    
    for (const pipe of pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + 52;
        
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Верхняя труба
            if (birdTop < pipe.gapY) {
                gameOver();
                return;
            }
            
            // Нижняя труба
            const bottomPipeY = pipe.gapY + gap;
            if (birdBottom > bottomPipeY) {
                gameOver();
                return;
            }
        }
    }
}

// Обновление счета
function updateScore() {
    scoreElement.textContent = `СЧЕТ: ${score + coinsCollected}`;
}

// Конец игры
function gameOver() {
    console.log('🏁 Игра окончена, счет:', score + coinsCollected);
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    
    if (isSoundOn && bgMusic) bgMusic.pause();
    if (isSoundOn && hitSound) {
        hitSound.currentTime = 0;
        hitSound.play().catch(e => console.log('🔇 Звук удара заблокирован:', e));
    }
    
    // Обновление рекорда
    const totalScore = score + coinsCollected;
    if (totalScore > bestScore) {
        bestScore = totalScore;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore);
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    }
    
    // Обновление монет
    totalCoins += coinsEarned;
    localStorage.setItem('retroPixelFlyerCoins', totalCoins);
    coinsCountElement.textContent = totalCoins;
    
    // Показать меню Game Over
    finalScoreElement.textContent = totalScore;
    coinsEarnedElement.textContent = coinsEarned;
    gameOverMenu.classList.add('active');
}

// Переключение звука
function toggleSound() {
    isSoundOn = !isSoundOn;
    audioBtn.textContent = isSoundOn ? '🔊' : '🔇';
    console.log(`🔊 Звук ${isSoundOn ? 'включен' : 'выключен'}`);
    
    if (isSoundOn && bgMusic) {
        bgMusic.play().catch(e => console.log('🔇 Автовоспроизведение заблокировано:', e));
    } else if (bgMusic) {
        bgMusic.pause();
    }
}

// Инициализация магазина
function initShop() {
    console.log('🛒 Инициализация магазина');
    shopContent.innerHTML = '';
}

// Инициализация достижений
function initAchievements() {
    console.log('🏆 Инициализация достижений');
    achievementsContent.innerHTML = '';
}

// Инициализация реферальной программы
function initReferral() {
    console.log('🤝 Инициализация реферальной программы');
    
    // Генерация реферальной ссылки
    let userId = 'user_' + Date.now();
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id.toString();
    }
    
    const referralCode = encodeURIComponent(userId).substring(0, 12);
    const referralLink = `https://t.me/your_bot?start=${referralCode}`;
    referralLinkInput.value = referralLink;
    
    // Загрузка данных рефералов
    const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
    referralsCountElement.textContent = referralData.count;
    referralsBonusElement.textContent = referralData.bonus;
}

// Копирование реферальной ссылки
function copyReferralLink() {
    console.log('📋 Копирование реферальной ссылки');
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
    console.log('📊 Инициализация таблицы рекордов');
    leaderboardContent.innerHTML = '';
}

// Поделиться результатом
function shareGame() {
    console.log('📤 Поделиться результатом');
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

// Изменение размера canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log(`📱 Размеры canvas: ${canvas.width}x${canvas.height}`);
}

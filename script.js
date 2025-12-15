// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// DOM элементы - с дополнительной проверкой дублирования
function getUniqueElement(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 1) {
        console.warn(`Найдено несколько элементов ${selector}. Оставляем только первый.`);
        for (let i = 1; i < elements.length; i++) {
            elements[i].remove();
        }
    }
    return document.querySelector(selector);
}

// Получаем элементы с проверкой на дублирование
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const mainMenu = getUniqueElement('.main-menu');
const gameOverMenu = getUniqueElement('.game-over-menu');
const startScreen = getUniqueElement('.start-screen');
const loadingScreen = document.getElementById('loading-screen');
const shopMenu = getUniqueElement('.shop-menu');
const achievementsMenu = getUniqueElement('.achievements-menu');
const referralMenu = getUniqueElement('.referral-menu');
const leaderboardMenu = getUniqueElement('.leaderboard-menu');

// Остальные элементы без изменений
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
const gap = 120;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let lastTouchTime = 0;
let touchCooldown = 100;

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
const minLoadTime = 1500; // 1.5 секунды

// Обработчик загрузки ресурсов
function resourceLoaded() {
    loadedResources++;
    const progress = Math.floor((loadedResources / resources.length) * 100);
    document.getElementById('loading-progress').style.width = progress + '%';
    
    if (loadingStartTime === 0) {
        loadingStartTime = Date.now();
    }
    
    const elapsedTime = Date.now() - loadingStartTime;
    
    if (loadedResources >= resources.length && elapsedTime >= minLoadTime) {
        gameLoaded = true;
        setTimeout(initGame, 300);
    } else if (loadedResources >= resources.length) {
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
    
    // Загрузка рефералов
    const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
    referralsCountElement.textContent = referralData.count;
    referralsBonusElement.textContent = referralData.bonus;
    
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

// Улучшенные обработчики касаний
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

// Старт игры
function startGame() {
    // Скрыть все меню
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    
    // Убедиться, что есть только один start-screen
    if (!startScreen) {
        const newStartScreen = document.createElement('div');
        newStartScreen.className = 'start-screen';
        newStartScreen.innerHTML = `
            <div class="start-text">КАСНИТЕСЬ ЭКРАНА</div>
            <div class="start-subtext">ЧТОБЫ НАЧАТЬ ПОЛЕТ</div>
        `;
        document.getElementById('game-container').appendChild(newStartScreen);
        startScreen = newStartScreen;
    }
    
    startScreen.classList.add('active');
    
    // Сбросить игру
    score = 0;
    coinsCollected = 0;
    coinsEarned = 0;
    pipes = [];
    coinsList = [];
    gameSpeed = 2;
    
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

function startPlaying() {
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

// Добавление труб
function addPipe() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    const minTop = 60;
    const maxTop = groundY - gap - 60;
    
    if (maxTop <= minTop) {
        console.warn('Not enough space for pipes');
        return;
    }
    
    const gapY = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    
    pipes.push({
        x: canvasWidth,
        gapY: gapY,
        passed: false
    });
    
    // Добавляем монету между трубами
    if (Math.random() > 0.7) {
        coinsList.push({
            x: canvasWidth + 40,
            y: gapY + gap / 2,
            collected: false,
            size: 24,
            value: 1
        });
    }
}

// Отрисовка фона
function drawBackground() {
    // Рисуем фон несколько раз для заполнения всего canvas
    const cols = Math.ceil(canvas.width / bg.width) + 1;
    const rows = Math.ceil(canvas.height / bg.height) + 1;
    
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            ctx.drawImage(bg, c * bg.width, r * bg.height);
        }
    }
}

// Отрисовка труб
function drawPipes() {
    const pipeWidth = pipeUp.width;
    
    pipes.forEach(pipe => {
        // Верхняя труба
        const topPipeHeight = pipe.gapY;
        
        if (topPipeHeight > 0) {
            ctx.drawImage(pipeUp, 0, 0, pipeWidth, topPipeHeight,
                pipe.x, 0, pipeWidth, topPipeHeight);
        }
        
        // Нижняя труба
        const bottomPipeY = pipe.gapY + gap;
        const canvasHeight = canvas.height;
        const fgHeight = fg.naturalHeight || fg.height || 112;
        const groundY = canvasHeight - fgHeight;
        const bottomPipeHeight = groundY - bottomPipeY;
        
        if (bottomPipeHeight > 0 && bottomPipeY < groundY) {
            ctx.drawImage(pipeBottom, 0, 0, pipeWidth, bottomPipeHeight,
                pipe.x, bottomPipeY, pipeWidth, bottomPipeHeight);
        }
    });
}

// Отрисовка монет
function drawCoins() {
    coinsList.forEach(c => {
        if (!c.collected) {
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
    ctx.translate(birdX + bird.width/2, birdY + bird.height/2);
    ctx.rotate(velocity * 0.1);
    ctx.drawImage(bird, -bird.width/2, -bird.height/2, bird.width, bird.height);
    ctx.restore();
}

// Отрисовка земли
function drawForeground() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    const cols = Math.ceil(canvasWidth / fg.width) + 1;
    
    for (let c = 0; c < cols; c++) {
        ctx.drawImage(fg, c * fg.width, groundY, fg.width, fgHeight);
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
        // Убедиться, что start-screen отображается только один раз
        if (startScreen && startScreen.classList.contains('active')) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '28px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.fillText('КАСНИТЕСЬ ЭКРАНА', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '16px "Press Start 2P", cursive';
            ctx.fillText('ЧТОБЫ НАЧАТЬ', canvas.width / 2, canvas.height / 2 + 20);
        }
        
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
    
    // Проверка достижений
    if (frame % 10 === 0) {
        checkAchievements();
    }
    
    // Запуск следующего кадра
    animationFrame = requestAnimationFrame(gameLoop);
}

function updateBird() {
    if (gameStarted) {
        velocity += gravity;
        birdY += velocity;
        
        // Проверка столкновения с землей
        const canvasHeight = canvas.height;
        const fgHeight = fg.naturalHeight || fg.height || 112;
        const groundY = canvasHeight - fgHeight;
        if (birdY + bird.height >= groundY) {
            gameOver();
            return;
        }
        
        // Проверка столкновения с потолком
        if (birdY <= 0) {
            birdY = 0;
            velocity = 0;
        }
    }
}

function updatePipes() {
    frame++;
    
    // Добавление новых труб
    if (frame % 100 === 0) {
        addPipe();
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x + pipeUp.width < birdX) {
            pipes[i].passed = true;
            score++;
            updateScore();
            if (isSoundOn) coinSound.play().catch(e => console.log('Sound playback failed'));
        }
        
        // Удаление труб за пределами экрана
        if (pipes[i].x + pipeUp.width < 0) {
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
            birdX + bird.width > coinsList[i].x &&
            birdY < coinsList[i].y + coinsList[i].size &&
            birdY + bird.height > coinsList[i].y) {
            coinsList[i].collected = true;
            coinsCollected++;
            coinsEarned++;
            totalCoins++;
            coinsCountElement.textContent = totalCoins;
            updateScore();
            if (isSoundOn) coinSound.play().catch(e => console.log('Sound playback failed'));
        }
        
        // Удаление монет за пределами экрана
        if (coinsList[i].x + coinsList[i].size < 0) {
            coinsList.splice(i, 1);
        }
    }
}

// Исправленная проверка столкновений
function checkCollisions() {
    const birdLeft = birdX;
    const birdRight = birdX + bird.width;
    const birdTop = birdY;
    const birdBottom = birdY + bird.height;
    const canvasHeight = canvas.height;
    const fgHeight = fg.naturalHeight || fg.height || 112;
    const groundY = canvasHeight - fgHeight;
    
    // Проверка столкновения с землей
    if (birdBottom >= groundY) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с потолком
    if (birdTop <= 0) {
        gameOver();
        return;
    }
    
    // Проверка столкновений с трубами
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeUp.width;
        
        // Проверяем только видимые трубы
        if (pipeRight < birdLeft - 50 || pipeLeft > birdRight + 50) {
            continue;
        }
        
        // Проверка горизонтального пересечения
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
        }
    });
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    
    if (isSoundOn) {
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play().catch(e => console.log('Sound playback failed'));
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
    // Убедиться, что есть только один start-screen
    const startScreens = document.querySelectorAll('.start-screen');
    if (startScreens.length > 1) {
        for (let i = 1; i < startScreens.length; i++) {
            startScreens[i].remove();
        }
        console.log('Удалены дублирующие start-screen');
    }
    
    // Инициализация игры
    if (!gameLoaded) {
        setTimeout(() => {
            if (!gameLoaded) {
                gameLoaded = true;
                initGame();
            }
        }, 1500);
    }
});

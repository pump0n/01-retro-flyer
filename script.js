// Инициализация Telegram WebApp с обработкой ошибок
let tg = null;
try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.ready();
    }
} catch (e) {
    console.error('Ошибка инициализации Telegram WebApp:', e);
    tg = null;
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
const settingsMenu = document.querySelector('.settings-menu');
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
const settingsBtn = document.getElementById('settings-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const soundToggle = document.getElementById('sound-toggle');
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
const jumpSound = new Audio('assets/jump.mp3');
const coinSound = new Audio('assets/coin.mp3');
const hitSound = new Audio('assets/hit.wav');
const bgMusic = new Audio('assets/music.mp3');
bgMusic.loop = true;

// Загрузка ресурсов
bird.src = 'assets/flappy_bird_bird.png';
bg.src = 'assets/bg.png';
fg.src = 'assets/fg.png';
pipeUp.src = 'assets/pipeUp.png';
pipeBottom.src = 'assets/pipeBottom.png';
coin.src = 'assets/coin.png';

// Глобальные переменные для адаптивности
let scale = 1;
let devicePixelRatio = window.devicePixelRatio || 1;
let gameDimensions = {};
let audioUnlocked = false;
let scrollSpeed = 2;

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
const gravity = 0.2;
const jumpPower = -5;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let lastTouchTime = 0;
let touchCooldown = 200;
let lastTime = 0;
let initialized = false;
const fixedStep = 1 / 60;
let accumulator = 0;

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
const minLoadTime = 1500;

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
    res.onerror = resourceLoaded;
});

// Определение мобильного устройства
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

// Обновление размеров игровых объектов
function updateGameDimensions() {
    gameDimensions = {
        birdWidth: 50,
        birdHeight: 40,
        pipeWidth: 70,
        coinSize: 45,
        groundHeight: Math.max(100, 120),
        gap: 180
    };
    
    // Скорость прокрутки зависит от масштаба
    scrollSpeed = 2 * scale;
}

// Resize canvas с debounce
let resizeTimeout;
function resizeCanvas() {
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = document.documentElement.clientHeight;
    
    // Автоматический расчет масштаба в зависимости от размера экрана
    if (screenWidth <= 400) {
        scale = 1.5;
    } else if (screenWidth <= 768) {
        scale = 1.2;
    } else {
        scale = 1;
    }
    
    // Физические размеры canvas с учетом DPI и масштаба
    canvas.width = screenWidth * devicePixelRatio * scale;
    canvas.height = screenHeight * devicePixelRatio * scale;
    
    // CSS размеры устанавливаются в реальные размеры окна
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
    
    // Обновляем размеры игровых объектов
    updateGameDimensions();
    
    // Позиционирование птицы
    birdX = canvas.width / 4;
    birdY = canvas.height / 2 - 60;
    
    ctx.imageSmoothingEnabled = false;
}

// Разблокировка аудио
function unlockAudio() {
    if (audioUnlocked) return;
    
    const sounds = [jumpSound, bgMusic, coinSound, hitSound];
    let unlockPromise = Promise.resolve();
    
    sounds.forEach(sound => {
        sound.volume = isSoundOn ? 0.5 : 0;
        unlockPromise = unlockPromise.then(() => {
            return sound.play()
                .then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                })
                .catch(e => console.warn('Звук не разблокирован:', e));
        });
    });
    
    unlockPromise.then(() => {
        audioUnlocked = true;
        console.log('Аудио успешно разблокировано');
    });
}

// Загрузка данных игры
function loadGameData() {
    totalCoins = parseInt(localStorage.getItem('retroPixelFlyerCoins') || '0');
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    isSoundOn = localStorage.getItem('retroPixelFlyerSound') !== 'false';
    currentBird = localStorage.getItem('retroPixelFlyerCurrentBird') || 'default';
    
    // Загрузка достижений
    const savedAchievements = JSON.parse(localStorage.getItem('retroPixelFlyerAchievements') || '[]');
    achievements.forEach(ach => {
        ach.unlocked = savedAchievements.includes(ach.id);
    });
    
    // Загрузка покупок
    const savedItems = JSON.parse(localStorage.getItem('retroPixelFlyerShopItems') || '[]');
    shopItems.forEach(item => {
        item.owned = item.price === 0 || savedItems.includes(item.id);
    });
    
    // Рефералы
    const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
    referralsCountElement.textContent = referralData.count;
    referralsBonusElement.textContent = referralData.bonus;
    
    coinsCountElement.textContent = totalCoins;
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
}

// Сохранение данных
function saveGameData() {
    localStorage.setItem('retroPixelFlyerCoins', totalCoins);
    localStorage.setItem('retroPixelFlyerBestScore', bestScore);
    localStorage.setItem('retroPixelFlyerSound', isSoundOn);
    localStorage.setItem('retroPixelFlyerCurrentBird', currentBird);
    
    const unlockedAchievements = achievements.filter(ach => ach.unlocked).map(ach => ach.id);
    localStorage.setItem('retroPixelFlyerAchievements', JSON.stringify(unlockedAchievements));
    
    const ownedItems = shopItems.filter(item => item.owned).map(item => item.id);
    localStorage.setItem('retroPixelFlyerShopItems', JSON.stringify(ownedItems));
}

// Инициализация магазина
function initShop() {
    shopContent.innerHTML = '';
    shopItems.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        if (item.owned) {
            shopItem.innerHTML = `
                <div class="shop-name">${item.name}</div>
                <div class="shop-desc">${item.description}</div>
                <button class="btn-small" data-id="${item.id}" ${currentBird === item.id ? 'disabled' : ''}>${currentBird === item.id ? 'ВЫБРАНО' : 'ВЫБРАТЬ'}</button>
            `;
        } else {
            shopItem.innerHTML = `
                <div class="shop-name">${item.name}</div>
                <div class="shop-desc">${item.description}</div>
                <div class="shop-price">${item.price} 🪙</div>
                <button class="btn-small" data-id="${item.id}">КУПИТЬ</button>
            `;
        }
        shopContent.appendChild(shopItem);
    });
    
    // Обработчики покупки/выбора
    shopContent.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.dataset.id;
            const item = shopItems.find(i => i.id === id);
            if (item.owned) {
                currentBird = id;
                initShop();
                saveGameData();
            } else if (totalCoins >= item.price) {
                totalCoins -= item.price;
                item.owned = true;
                currentBird = id;
                coinsCountElement.textContent = totalCoins;
                initShop();
                saveGameData();
            } else {
                if (tg && tg.showAlert) tg.showAlert('Недостаточно монет!');
                else alert('Недостаточно монет!');
            }
        });
    });
}

// Инициализация достижений
function initAchievements() {
    achievementsContent.innerHTML = '';
    achievements.forEach(ach => {
        const achItem = document.createElement('div');
        achItem.className = 'achievement-item';
        achItem.innerHTML = `
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.description}</div>
            ${ach.unlocked ? '<div class="achievement-badge">✅</div>' : ''}
        `;
        achievementsContent.appendChild(achItem);
    });
}

function checkAchievements() {
    let updated = false;
    achievements.forEach(ach => {
        if (!ach.unlocked && score >= ach.score) {
            ach.unlocked = true;
            updated = true;
            if (tg && tg.showAlert) tg.showAlert(`Достижение разблокировано: ${ach.name}!`);
            else alert(`Достижение разблокировано: ${ach.name}!`);
        }
    });
    if (updated) {
        initAchievements();
        saveGameData();
    }
}

// Инициализация рефералов
function initReferral() {
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
    let userId = 'user_' + Date.now();
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id.toString();
    }
    
    try {
        const refUserId = decodeURIComponent(refCode);
        if (refUserId === userId || refUserId.includes(userId)) return;
        
        const processedRefs = JSON.parse(localStorage.getItem('retroPixelFlyerProcessedRefs') || '[]');
        if (processedRefs.includes(refCode)) return;
        
        processedRefs.push(refCode);
        localStorage.setItem('retroPixelFlyerProcessedRefs', JSON.stringify(processedRefs));
        
        const referralData = JSON.parse(localStorage.getItem('retroPixelFlyerReferrals') || '{"count": 0, "bonus": 0}');
        referralData.count++;
        referralData.bonus += 10;
        totalCoins += 10;
        localStorage.setItem('retroPixelFlyerReferrals', JSON.stringify(referralData));
        referralsCountElement.textContent = referralData.count;
        referralsBonusElement.textContent = referralData.bonus;
        coinsCountElement.textContent = totalCoins;
        saveGameData();
        
        if (tg && tg.showAlert) {
            tg.showAlert('Вы получили 10 монет за приглашение друга!');
        } else {
            alert('Вы получили 10 монет за приглашение друга!');
        }
    } catch (e) {
        console.error('Error processing referral:', e);
    }
}

function copyReferralLink() {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999);
    
    try {
        navigator.clipboard.writeText(referralLinkInput.value).then(() => {
            if (tg && tg.showAlert) tg.showAlert('Ссылка скопирована!');
            else alert('Ссылка скопирована!');
        }).catch(() => {
            document.execCommand('copy');
            if (tg && tg.showAlert) tg.showAlert('Ссылка скопирована!');
            else alert('Ссылка скопирована!');
        });
    } catch (e) {
        document.execCommand('copy');
        if (tg && tg.showAlert) tg.showAlert('Ссылка скопирована!');
        else alert('Ссылка скопирована!');
    }
}

// Инициализация таблицы рекордов
function initLeaderboard() {
    leaderboardContent.innerHTML = '';
    
    let leaderboard = JSON.parse(localStorage.getItem('retroPixelFlyerLeaderboard') || '[]');
    
    leaderboard.sort((a, b) => b.score - a.score);
    
    const uniqueLeaderboard = [];
    const seenScores = new Set();
    leaderboard.forEach(entry => {
        if (!seenScores.has(entry.score)) {
            seenScores.add(entry.score);
            uniqueLeaderboard.push(entry);
        }
    });
    
    leaderboard = uniqueLeaderboard.slice(0, 10);
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

function addToLeaderboard(newScore) {
    const date = new Date().toLocaleDateString('ru-RU');
    let leaderboard = JSON.parse(localStorage.getItem('retroPixelFlyerLeaderboard') || '[]');
    leaderboard.push({ score: newScore, date });
    localStorage.setItem('retroPixelFlyerLeaderboard', JSON.stringify(leaderboard));
    initLeaderboard();
}

// Функция поделиться
function shareGame() {
    const totalScore = score + coinsCollected;
    const shareText = `🎮 Я набрал ${totalScore} очков в НОВОГОДНИЙ ПОЛЕТ!\nПопробуй побить мой рекорд!\nhttps://pump0n.github.io/01-retro-flyer/`;
    
    if (navigator.share) {
        navigator.share({
            title: 'НОВОГОДНИЙ ПОЛЕТ',
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

// Инициализация игры
function initGame() {
    if (initialized) return;
    initialized = true;

    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.style.display = 'none', 300);
    
    resizeCanvas();
    loadGameData();
    initShop();
    initAchievements();
    initReferral();
    initLeaderboard();
    updateSoundToggle();
    
    // Установка обработчиков событий
    setupEventListeners();
    
    mainMenu.classList.add('active');
}

// Установка обработчиков событий
function setupEventListeners() {
    // Удаление предыдущих обработчиков
    startBtn.removeEventListener('click', startGame);
    restartBtn.removeEventListener('click', restartGame);
    mainMenuBtn.removeEventListener('click', returnToMainMenu);
    shopBtn.removeEventListener('click', openShop);
    shopBackBtn.removeEventListener('click', closeShop);
    achievementsBtn.removeEventListener('click', openAchievements);
    achievementsBackBtn.removeEventListener('click', closeAchievements);
    referralBtn.removeEventListener('click', openReferral);
    referralBackBtn.removeEventListener('click', closeReferral);
    leaderboardBtn.removeEventListener('click', openLeaderboard);
    leaderboardBackBtn.removeEventListener('click', closeLeaderboard);
    settingsBtn.removeEventListener('click', openSettings);
    settingsBackBtn.removeEventListener('click', closeSettings);
    soundToggle.removeEventListener('click', toggleSound);
    copyLinkBtn.removeEventListener('click', copyReferralLink);
    shareBtn.removeEventListener('click', shareGame);
    document.body.removeEventListener('touchstart', handleInput);
    document.body.removeEventListener('click', handleInput);
    
    // Добавление обработчиков
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    mainMenuBtn.addEventListener('click', returnToMainMenu);
    shopBtn.addEventListener('click', openShop);
    shopBackBtn.addEventListener('click', closeShop);
    achievementsBtn.addEventListener('click', openAchievements);
    achievementsBackBtn.addEventListener('click', closeAchievements);
    referralBtn.addEventListener('click', openReferral);
    referralBackBtn.addEventListener('click', closeReferral);
    leaderboardBtn.addEventListener('click', openLeaderboard);
    leaderboardBackBtn.addEventListener('click', closeLeaderboard);
    settingsBtn.addEventListener('click', openSettings);
    settingsBackBtn.addEventListener('click', closeSettings);
    soundToggle.addEventListener('click', toggleSound);
    copyLinkBtn.addEventListener('click', copyReferralLink);
    shareBtn.addEventListener('click', shareGame);
    
    // Обработка ввода
    if (isMobileDevice()) {
        document.body.addEventListener('touchstart', handleInput, { passive: false });
    } else {
        document.body.addEventListener('click', handleInput);
    }
}

function handleInput(e) {
    if (e.type === 'touchstart') e.preventDefault();
    
    const now = Date.now();
    if (now - lastTouchTime < touchCooldown) return;
    lastTouchTime = now;
    
    // Разблокировка аудио при первом взаимодействии
    unlockAudio();
    
    if (!gameStarted && gameActive) {
        gameStarted = true;
        startScreen.style.display = 'none';
        velocity = jumpPower;
        if (isSoundOn && audioUnlocked) jumpSound.play().catch(e => {});
        if (isSoundOn && audioUnlocked) bgMusic.play().catch(e => {});
    } else if (gameActive) {
        velocity = jumpPower;
        if (isSoundOn && audioUnlocked) jumpSound.play().catch(e => {});
    }
}

// Функции меню
function openShop() {
    mainMenu.classList.remove('active');
    shopMenu.style.display = 'flex';
}

function closeShop() {
    shopMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function openAchievements() {
    mainMenu.classList.remove('active');
    achievementsMenu.style.display = 'flex';
}

function closeAchievements() {
    achievementsMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function openReferral() {
    mainMenu.classList.remove('active');
    referralMenu.style.display = 'flex';
}

function closeReferral() {
    referralMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function openLeaderboard() {
    mainMenu.classList.remove('active');
    leaderboardMenu.style.display = 'flex';
}

function closeLeaderboard() {
    leaderboardMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function openSettings() {
    mainMenu.classList.remove('active');
    settingsMenu.style.display = 'flex';
}

function closeSettings() {
    settingsMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

// Старт игры
function startGame() {
    mainMenu.classList.remove('active');
    startScreen.style.display = 'block';
    gameActive = true;
    resetGame();
    resizeCanvas();
    lastTime = performance.now();
    accumulator = 0;
    requestAnimationFrame(gameLoop);
}

// Сброс игры
function resetGame() {
    score = 0;
    coinsCollected = 0;
    pipes = [];
    coinsList = [];
    birdX = canvas.width / 4;
    birdY = canvas.height / 2 - 60;
    velocity = 0;
    bgX = 0;
    fgX = 0;
    frame = 0;
    gameStarted = false;
    updateScore();
}

// Цикл игры
function gameLoop(timestamp) {
    if (!gameActive) return;
    
    if (!lastTime) lastTime = timestamp;
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    accumulator += delta;

    while (accumulator >= fixedStep) {
        update(fixedStep);
        accumulator -= fixedStep;
    }

    render();

    if (gameActive) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

// Update logic
function update(dt) {
    if (!gameStarted) return;

    velocity += gravity * dt * 60;
    birdY += velocity * dt * 60;

    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }

    frame++;

    // Генерация труб
    if (frame % Math.floor(120 / scale) === 0) {
        const minHeight = 80 * scale;
        const maxHeight = (canvas.height - gameDimensions.groundHeight - gameDimensions.gap) * 0.7;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        
        pipes.push({ 
            x: canvas.width + 50, 
            topHeight, 
            bottomHeight: canvas.height - gameDimensions.groundHeight - topHeight - gameDimensions.gap,
            scored: false 
        });
        
        // Генерация монет
        if (Math.random() > 0.4) {
            coinsList.push({ 
                x: canvas.width + 100, 
                y: topHeight + gameDimensions.gap / 2, 
                collected: false 
            });
        }
    }

    // Движение труб
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= scrollSpeed;
        
        // Подсчет очков
        if (pipe.x + gameDimensions.pipeWidth < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            updateScore();
            checkAchievements();
        }

        // Проверка коллизии
        if (collisionDetection(pipe)) {
            endGame();
            return;
        }

        // Удаление труб
        if (pipe.x < -gameDimensions.pipeWidth) {
            pipes.splice(i, 1);
        }
    }

    // Обработка монет
    for (let i = coinsList.length - 1; i >= 0; i--) {
        const c = coinsList[i];
        c.x -= scrollSpeed;
        
        // Проверка сбора монет
        if (!c.collected) {
            const coinSize = gameDimensions.coinSize / 2;
            if (Math.abs(c.x - (birdX + gameDimensions.birdWidth / 2)) < coinSize && 
                Math.abs(c.y - (birdY + gameDimensions.birdHeight / 2)) < coinSize) {
                coinsCollected++;
                totalCoins++;
                c.collected = true;
                if (isSoundOn && audioUnlocked) coinSound.cloneNode().play().catch(e => {});
                coinsCountElement.textContent = totalCoins;
            }
        }
        
        // Удаление монет
        if (c.x < -gameDimensions.coinSize) {
            coinsList.splice(i, 1);
        }
    }

    // Проверка коллизии с землей
    if (birdY + gameDimensions.birdHeight > canvas.height - gameDimensions.groundHeight) {
        birdY = canvas.height - gameDimensions.groundHeight - gameDimensions.birdHeight;
        endGame();
        return;
    }

    // Движение фона
    bgX -= 0.5 * scale;
    if (bgX <= -bg.width * devicePixelRatio) bgX = 0;

    fgX -= scrollSpeed;
    if (fgX <= -fg.width * devicePixelRatio) fgX = 0;
}

// Проверка коллизии
function collisionDetection(pipe) {
    const birdRight = birdX + gameDimensions.birdWidth;
    const birdBottom = birdY + gameDimensions.birdHeight;
    const groundLevel = canvas.height - gameDimensions.groundHeight;
    
    // Верхняя труба
    if (birdX < pipe.x + gameDimensions.pipeWidth && 
        birdRight > pipe.x &&
        birdY < pipe.topHeight) {
        return true;
    }
    
    // Нижняя труба
    const bottomY = groundLevel - pipe.bottomHeight;
    if (birdX < pipe.x + gameDimensions.pipeWidth && 
        birdRight > pipe.x &&
        birdBottom > bottomY && 
        birdY < groundLevel) {
        return true;
    }
    
    return false;
}

// Отрисовка
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон
    drawTiled(bg, bgX, 0, canvas.height - gameDimensions.groundHeight);

    if (!gameStarted) {
        drawBird();
        return;
    }

    // Трубы
    pipes.forEach(pipe => {
        // Верхняя труба
        ctx.drawImage(pipeUp, 
            pipe.x, 
            0, 
            gameDimensions.pipeWidth, 
            pipe.topHeight
        );
        
        // Нижняя труба
        if (pipe.bottomHeight > 0) {
            ctx.drawImage(pipeBottom, 
                pipe.x, 
                canvas.height - gameDimensions.groundHeight - pipe.bottomHeight,
                gameDimensions.pipeWidth, 
                pipe.bottomHeight
            );
        }
    });

    // Монеты
    coinsList.forEach(c => {
        if (!c.collected && coin.complete) {
            ctx.drawImage(coin, 
                c.x - gameDimensions.coinSize / 2, 
                c.y - gameDimensions.coinSize / 2, 
                gameDimensions.coinSize, 
                gameDimensions.coinSize
            );
        }
    });

    // Земля
    drawTiled(fg, fgX, canvas.height - gameDimensions.groundHeight, gameDimensions.groundHeight);

    drawBird();
}

// Бесшовная отрисовка
function drawTiled(img, x, y, height = img.height) {
    if (!img.complete) return;
    const tileWidth = img.width;
    const startX = x % tileWidth;
    let currentX = startX - tileWidth;
    
    while (currentX < canvas.width) {
        ctx.drawImage(img, currentX, y, tileWidth, height);
        currentX += tileWidth;
    }
}

function drawBird() {
    if (bird.complete) {
        ctx.drawImage(bird, 
            Math.floor(birdX), 
            Math.floor(birdY), 
            gameDimensions.birdWidth, 
            gameDimensions.birdHeight
        );
    }
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    if (isSoundOn && audioUnlocked) {
        hitSound.play().catch(error => console.error('Audio play error:', error));
    }
    if (isSoundOn && audioUnlocked) bgMusic.pause();
    bgMusic.currentTime = 0;
    coinsEarned = coinsCollected;
    finalScoreElement.textContent = score;
    coinsEarnedElement.textContent = coinsEarned;
    if (score > bestScore) bestScore = score;
    saveGameData();
    addToLeaderboard(score);
    gameOverMenu.style.display = 'flex';
}

function restartGame() {
    gameOverMenu.style.display = 'none';
    startGame();
}

function returnToMainMenu() {
    gameOverMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function updateScore() {
    scoreElement.textContent = `СЧЕТ: ${score}`;
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    updateSoundToggle();
    saveGameData();
    
    if (isSoundOn) {
        unlockAudio();
    } else {
        bgMusic.pause();
    }
    
    // Обновление громкости
    jumpSound.volume = isSoundOn ? 0.5 : 0;
    coinSound.volume = isSoundOn ? 0.5 : 0;
    hitSound.volume = isSoundOn ? 0.5 : 0;
    bgMusic.volume = isSoundOn ? 0.3 : 0;
}

function updateSoundToggle() {
    soundToggle.textContent = isSoundOn ? 'ВКЛ' : 'ВЫКЛ';
    soundToggle.style.color = isSoundOn ? '#ffd700' : '#999';
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    // Удаление возможных дубликатов
    const startScreens = document.querySelectorAll('.start-screen');
    for (let i = 1; i < startScreens.length; i++) {
        startScreens[i].remove();
    }
    
    // Настройка обработчиков изменения размера
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (gameActive) {
                resizeCanvas();
            }
        }, 200);
    });
    
    // Обработчик ориентации
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 300);
    });
    
    // Дополнительный таймаут для загрузки
    setTimeout(() => {
        if (!gameLoaded) {
            gameLoaded = true;
            initGame();
        }
    }, 3000);
});

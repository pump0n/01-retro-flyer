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
const hitSound = new Audio('assets/hit.wav'); // Изменено на WAV
const bgMusic = new Audio('assets/music.mp3');
bgMusic.loop = true;

// Загрузка ресурсов
bird.src = 'assets/flappy_bird_bird.png';
bg.src = 'assets/bg.png';
fg.src = 'assets/fg.png';
pipeUp.src = 'assets/pipeUp.png';
pipeBottom.src = 'assets/pipeBottom.png';
coin.src = 'assets/coin.png';

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
const gravity = 0.25; // Настроено для плавности
const jumpPower = -5.5;
const gap = 120;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;
let animationFrame = null;
let currentBird = 'default';
let lastTouchTime = 0;
let touchCooldown = 200; // Настроено для лучшей отзывчивости
let lastTime = 0; // Для delta-time
let initialized = false; // Флаг для предотвращения дублирования

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

// Resize canvas с debounce
let resizeTimeout;
function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    birdX = canvas.width / 4; // Центрировано как в оригинале
    birdY = canvas.height / 2;
}

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

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
            }
        });
        btn.addEventListener('touchend', e => { // Добавлено для mobile Telegram
            e.preventDefault();
            btn.click(); // Симулировать click
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
        }).catch(() => {
            document.execCommand('copy');
            if (tg && tg.showAlert) tg.showAlert('Ссылка скопирована!');
        });
    } catch (e) {
        document.execCommand('copy');
        if (tg && tg.showAlert) tg.showAlert('Ссылка скопирована!');
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

// Инициализация игры
function initGame() {
    if (initialized) return; // Предотвращение дублирования
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
    
    // Event listeners для меню с добавлением touchend для mobile
    const menuButtons = [startBtn, restartBtn, mainMenuBtn, shopBtn, shopBackBtn, achievementsBtn, achievementsBackBtn, referralBtn, referralBackBtn, leaderboardBtn, leaderboardBackBtn, settingsBtn, settingsBackBtn, soundToggle, copyLinkBtn, shareBtn];
    menuButtons.forEach(btn => {
        btn.removeEventListener('click', handleButtonClick); // Удаляем предыдущие, если есть
        btn.addEventListener('click', handleButtonClick);
        btn.removeEventListener('touchend', handleTouchEnd); // Удаляем предыдущие
        btn.addEventListener('touchend', handleTouchEnd);
    });

    function handleButtonClick(e) {
        console.log(`Button clicked: ${e.target.id}`); // Debug
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        e.target.click(); // Симулировать click
    }

    // Функциональные слушатели (без дублирования)
    startBtn.removeEventListener('click', startGame);
    startBtn.addEventListener('click', startGame);
    restartBtn.removeEventListener('click', restartGame);
    restartBtn.addEventListener('click', restartGame);
    mainMenuBtn.removeEventListener('click', returnToMainMenu);
    mainMenuBtn.addEventListener('click', returnToMainMenu);
    shopBtn.removeEventListener('click', openShop);
    shopBtn.addEventListener('click', openShop);
    shopBackBtn.removeEventListener('click', closeShop);
    shopBackBtn.addEventListener('click', closeShop);
    achievementsBtn.removeEventListener('click', openAchievements);
    achievementsBtn.addEventListener('click', openAchievements);
    achievementsBackBtn.removeEventListener('click', closeAchievements);
    achievementsBackBtn.addEventListener('click', closeAchievements);
    referralBtn.removeEventListener('click', openReferral);
    referralBtn.addEventListener('click', openReferral);
    referralBackBtn.removeEventListener('click', closeReferral);
    referralBackBtn.addEventListener('click', closeReferral);
    leaderboardBtn.removeEventListener('click', openLeaderboard);
    leaderboardBtn.addEventListener('click', openLeaderboard);
    leaderboardBackBtn.removeEventListener('click', closeLeaderboard);
    leaderboardBackBtn.addEventListener('click', closeLeaderboard);
    settingsBtn.removeEventListener('click', openSettings);
    settingsBtn.addEventListener('click', openSettings);
    settingsBackBtn.removeEventListener('click', closeSettings);
    settingsBackBtn.addEventListener('click', closeSettings);
    soundToggle.removeEventListener('click', toggleSound);
    soundToggle.addEventListener('click', toggleSound);
    copyLinkBtn.removeEventListener('click', copyReferralLink);
    copyLinkBtn.addEventListener('click', copyReferralLink);
    shareBtn.removeEventListener('click', shareGame);
    shareBtn.addEventListener('click', shareGame);

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
    
    // Touch/click listeners на body для игры
    document.body.addEventListener('touchstart', handleInput, { passive: false });
    document.body.addEventListener('click', handleInput); // Fallback для desktop
    
    mainMenu.classList.add('active');
}

function handleInput(e) {
    if (e.type === 'touchstart') e.preventDefault();
    const now = Date.now();
    if (now - lastTouchTime < touchCooldown) return;
    lastTouchTime = now;

    if (!gameStarted && gameActive) {
        gameStarted = true;
        startScreen.style.display = 'none';
        velocity = jumpPower;
        if (isSoundOn) jumpSound.play();
        if (isSoundOn) bgMusic.play();
    } else if (gameActive) {
        velocity = jumpPower;
        if (isSoundOn) jumpSound.play();
    }
}

// Старт игры
function startGame() {
    mainMenu.classList.remove('active');
    startScreen.style.display = 'block';
    gameActive = true;
    resetGame();
    resizeCanvas(); // Принудительный resize для избежания white screen
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Сброс игры
function resetGame() {
    score = 0;
    coinsCollected = 0;
    pipes = [];
    coinsList = [];
    birdX = canvas.width / 4;
    birdY = canvas.height / 2;
    velocity = 0;
    bgX = 0;
    fgX = 0;
    frame = 0;
    gameStarted = false;
    updateScore();
}

// Цикл игры с delta-time
function gameLoop(timestamp) {
    console.log('Game loop running'); // Debug для проверки, запускается ли loop
    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 16.67; // Нормализация на 60fps
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    if (!gameStarted) {
        drawBird();
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }

    // Обновление физики
    velocity += gravity * delta;
    birdY += velocity * delta;

    // Генерация труб/монет
    if (frame % 100 === 0) {
        const pipeY = Math.floor(Math.random() * 200) + 150; // Рандом 150-350
        pipes.push({ x: canvas.width + 200, y: pipeY });
        if (Math.random() > 0.5) {
            coinsList.push({ x: canvas.width + 250, y: pipeY - gap / 2, collected: false });
        }
    }

    // Движение и рисование труб
    pipes.forEach((pipe, index) => {
        pipe.x -= 2 * delta;
        if (pipeUp.complete) ctx.drawImage(pipeUp, pipe.x, pipe.y - pipeUp.height - gap); // Check complete
        if (pipeBottom.complete) ctx.drawImage(pipeBottom, pipe.x, pipe.y);

        // Счет
        if (pipe.x + pipeUp.width < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            updateScore();
            checkAchievements();
        }

        // Коллизия
        if (collisionDetection(pipe)) {
            endGame();
        }

        if (pipe.x < -pipeUp.width) pipes.splice(index, 1);
    });

    // Монеты
    coinsList.forEach((c, index) => {
        c.x -= 2 * delta;
        if (!c.collected && coin.complete) {
            ctx.drawImage(coin, c.x, c.y, 30, 30);
            if (Math.abs(c.x - birdX) < 20 && Math.abs(c.y - birdY) < 20) {
                coinsCollected++;
                totalCoins++;
                c.collected = true;
                if (isSoundOn) coinSound.cloneNode().play(); // Избежание наложения
                coinsCountElement.textContent = totalCoins;
            }
        }
        if (c.x < -30) coinsList.splice(index, 1);
    });

    // Коллизия с землей
    if (birdY + 24 > canvas.height - fg.height) {
        endGame();
    }

    // Рисование земли
    fgX -= 2 * delta;
    if (fgX <= -canvas.width) fgX = 0;
    if (fg.complete) {
        ctx.drawImage(fg, fgX, canvas.height - fg.height);
        ctx.drawImage(fg, fgX + canvas.width, canvas.height - fg.height);
    }

    drawBird();

    frame++;
    if (pipes.length > 5) pipes.shift(); // Оптимизация массива
    if (coinsList.length > 10) coinsList.shift();

    if (gameActive) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

function drawBackground() {
    bgX -= 0.5; // Медленнее земли
    if (bgX <= -canvas.width) bgX = 0;
    if (bg.complete) {
        ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);
    }
}

function drawBird() {
    if (bird.complete) {
        ctx.drawImage(bird, birdX, birdY, 34, 24);
    }
}

function collisionDetection(pipe) {
    const birdRight = birdX + 34;
    const birdBottom = birdY + 24;

    // Верхняя труба
    if (birdX < pipe.x + pipeUp.width && birdRight > pipe.x &&
        birdY < pipe.y - gap && birdBottom > pipe.y - pipeUp.height - gap) {
        return true;
    }

    // Нижняя труба
    if (birdX < pipe.x + pipeBottom.width && birdRight > pipe.x &&
        birdY < pipe.y + pipeBottom.height && birdBottom > pipe.y) {
        return true;
    }

    return false;
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    if (isSoundOn) {
        hitSound.play().catch(error => console.error('Audio play error:', error)); // Обработка ошибок воспроизведения
    }
    if (isSoundOn) bgMusic.pause();
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

// Настройки
function openSettings() {
    mainMenu.classList.remove('active');
    settingsMenu.style.display = 'flex';
}

function closeSettings() {
    settingsMenu.style.display = 'none';
    mainMenu.classList.add('active');
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    updateSoundToggle();
    localStorage.setItem('retroPixelFlyerSound', isSoundOn);
    if (!isSoundOn && bgMusic.playing) bgMusic.pause();
}

function updateSoundToggle() {
    soundToggle.textContent = isSoundOn ? 'ВКЛ' : 'ВЫКЛ';
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    // Удаление дубликатов start-screen
    const startScreens = document.querySelectorAll('.start-screen');
    for (let i = 1; i < startScreens.length; i++) {
        startScreens[i].remove();
    }
    
    if (!gameLoaded) {
        setTimeout(() => {
            if (!gameLoaded) {
                gameLoaded = true;
                initGame();
            }
        }, 3000);
    }
});

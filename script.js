// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Элементы DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('.score');
const coinsElement = document.querySelector('.coins');
const startBtn = document.getElementById('start-btn');
const shopBtn = document.getElementById('shop-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const restartBtn = document.getElementById('restart-btn');
const submitScoreBtn = document.getElementById('submit-score-btn');
const backShopBtn = document.getElementById('back-shop-btn');
const backLeaderboardBtn = document.getElementById('back-leaderboard-btn');
const finalScoreElement = document.getElementById('final-score');
const earnedCoinsElement = document.getElementById('earned-coins');
const audioBtn = document.getElementById('audio-btn');
const shareBtn = document.getElementById('share-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');

// Аудио элементы
const bgMusic = new Audio('assets/music.mp3');
const jumpSound = new Audio('assets/jump.mp3');
const coinSound = new Audio('assets/coin.mp3');
const hitSound = new Audio('assets/hit.mp3');

// Меню
const mainMenu = document.querySelector('.main-menu');
const gameOverMenu = document.querySelector('.game-over-menu');
const shopMenu = document.querySelector('.shop-menu');
const leaderboardMenu = document.querySelector('.leaderboard-menu');
const loadingScreen = document.getElementById('loading-screen');

// Игровые переменные
let score = 0;
let coins = 0;
let bestScore = 0;
let currentLevel = 1;
let gameActive = false;
let animationFrame;
let obstacles = [];
let coinsArray = [];
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 15,
    velocity: 0,
    gravity: 0.4,
    jumpForce: -7,
    color: '#ff00ff'
};
let frameCount = 0;
let gameData = JSON.parse(localStorage.getItem('retroPixelFlyer')) || {
    totalCoins: 0,
    totalScore: 0,
    items: {},
    achievements: {}
};
let isSoundEnabled = true;

// Обработчики событий
startBtn.addEventListener('click', startGame);
shopBtn.addEventListener('click', showShop);
leaderboardBtn.addEventListener('click', showLeaderboard);
restartBtn.addEventListener('click', startGame);
submitScoreBtn.addEventListener('click', submitScore);
backShopBtn.addEventListener('click', showMainMenu);
backLeaderboardBtn.addEventListener('click', showMainMenu);
audioBtn.addEventListener('click', toggleSound);
shareBtn.addEventListener('click', shareScore);
mainMenuBtn.addEventListener('click', goToMainMenu);

// Управление игрой
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive) {
        bird.velocity = bird.jumpForce;
        playJumpSound();
    }
});

canvas.addEventListener('click', () => {
    if (gameActive) {
        bird.velocity = bird.jumpForce;
        playJumpSound();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameActive) {
        bird.velocity = bird.jumpForce;
        playJumpSound();
    }
});

// Функции игры
function showLoading() {
    loadingScreen.style.display = 'flex';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('loading-progress').style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                init();
            }, 300);
        }
    }, 200);
}

function init() {
    // Загрузка рекорда из localStorage
    bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    document.querySelector('.best-score').textContent = `BEST: ${bestScore}`;
    
    // Показать главное меню
    mainMenu.style.display = 'flex';
    
    // Обновить отображение монет
    coinsElement.textContent = `COINS: ${gameData.totalCoins}`;
    
    // Установить статус звука
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
}

function startGame() {
    // Скрыть все меню
    mainMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    shopMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    
    // Сбросить игру
    score = 0;
    coins = 0;
    obstacles = [];
    coinsArray = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    frameCount = 0;
    gameActive = true;
    currentLevel = 1;
    
    // Анимация появления птицы
    let fadeIn = 0;
    const fadeInInterval = setInterval(() => {
        fadeIn += 0.05;
        if (fadeIn >= 1) {
            clearInterval(fadeInInterval);
            bird.velocity = 0;
            gameLoop();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            
            ctx.globalAlpha = fadeIn;
            updateBird();
            ctx.globalAlpha = 1;
        }
    }, 30);
    
    // Запустить фоновую музыку
    if (isSoundEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(e => console.log('Autoplay blocked'));
    }
}

function gameLoop() {
    if (!gameActive) return;
    
    // Очистить canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    drawBackground();
    
    // Звезды на фоне
    drawStars();
    
    // Добавить препятствие каждые 100 кадров
    frameCount++;
    if (frameCount % 100 === 0) {
        addObstacle();
    }
    
    // Добавить монету каждые 50 кадров
    if (frameCount % 50 === 0) {
        addCoin();
    }
    
    // Обновить препятствия
    updateObstacles();
    
    // Обновить монеты
    updateCoins();
    
    // Обновить птицу
    updateBird();
    
    // Проверить столкновения
    checkCollisions();
    
    // Обновить счет
    score++;
    updateScore();
    
    // Обновить уровень
    updateLevel();
    
    // Запустить следующий кадр
    animationFrame = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Голубое небо
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Облака
    drawClouds();
    
    // Земля
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Трава
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 25, canvas.width, 5);
}

function drawClouds() {
    ctx.fillStyle = '#FFFFFF';
    // Облако 1
    ctx.beginPath();
    ctx.arc(50, 80, 20, 0, Math.PI * 2);
    ctx.arc(70, 70, 25, 0, Math.PI * 2);
    ctx.arc(90, 80, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Облако 2
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 100, 20, 0, Math.PI * 2);
    ctx.arc(canvas.width - 70, 90, 25, 0, Math.PI * 2);
    ctx.arc(canvas.width - 90, 100, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Облако 3 (движущееся)
    const cloudX = (frameCount * 0.5) % canvas.width;
    ctx.beginPath();
    ctx.arc(cloudX, 120, 15, 0, Math.PI * 2);
    ctx.arc(cloudX + 20, 110, 20, 0, Math.PI * 2);
    ctx.arc(cloudX + 40, 120, 15, 0, Math.PI * 2);
    ctx.fill();
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function addObstacle() {
    const gap = 120 + (currentLevel - 1) * 10;
    const topHeight = Math.random() * (canvas.height - gap - 40) + 20;
    
    obstacles.push({
        x: canvas.width,
        width: 40,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        passed: false
    });
}

function addCoin() {
    coinsArray.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 30) + 15,
        width: 12,
        height: 12,
        collected: false
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= 3 + (currentLevel - 1) * 0.2;
        
        // Нарисовать трубы
        drawPipe(obstacle.x, 0, obstacle.width, obstacle.topHeight, true);
        drawPipe(obstacle.x, obstacle.bottomY, obstacle.width, canvas.height - obstacle.bottomY, false);
        
        // Проверить прохождение
        if (!obstacle.passed && obstacle.x + obstacle.width < bird.x) {
            obstacle.passed = true;
            score += 10;
            updateScore();
        }
        
        // Удалить за пределами экрана
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function drawPipe(x, y, width, height, isTop) {
    // Тело трубы
    ctx.fillStyle = '#008000';
    ctx.fillRect(x, y, width, height);
    
    // Ободок
    ctx.fillStyle = '#4B0082';
    if (isTop) {
        ctx.fillRect(x - 5, y + height - 10, width + 10, 10);
    } else {
        ctx.fillRect(x - 5, y, width + 10, 10);
    }
    
    // Детали
    ctx.fillStyle = '#006400';
    ctx.fillRect(x + 5, y + (isTop ? height - 15 : 15), width - 10, 5);
}

function updateCoins() {
    for (let i = coinsArray.length - 1; i >= 0; i--) {
        const coin = coinsArray[i];
        coin.x -= 3;
        
        // Нарисовать монету
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Проверить сбор
        if (!coin.collected && 
            bird.x < coin.x + coin.width &&
            bird.x + bird.width > coin.x &&
            bird.y < coin.y + coin.height &&
            bird.y + bird.height > coin.y) {
            coins++;
            coin.collected = true;
            coinsArray.splice(i, 1);
            updateCoinsDisplay();
            playCoinSound();
        }
        
        // Удалить за пределами экрана
        if (coin.x + coin.width < 0) {
            coinsArray.splice(i, 1);
        }
    }
}

function updateBird() {
    // Применить гравитацию
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Ограничения по высоте
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    if (bird.y + bird.height > canvas.height - 25) {
        bird.y = canvas.height - 25 - bird.height;
        bird.velocity = 0;
        playHitSound();
        gameOver();
        return;
    }
    
    // Анимация взмаха крыльев
    const wingAngle = Math.sin(frameCount / 5) * 0.3;
    const wingFlap = Math.sin(frameCount / 10) * 5;
    
    // Тело птицы
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(bird.x + 15, bird.y + 10, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова
    const headGradient = ctx.createLinearGradient(bird.x + 20, bird.y + 5, bird.x + 30, bird.y + 10);
    headGradient.addColorStop(0, '#FF4500');
    headGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(bird.x + 25, bird.y + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Клюв
    const beakGradient = ctx.createLinearGradient(bird.x + 32, bird.y + 8, bird.x + 42, bird.y + 8);
    beakGradient.addColorStop(0, '#FFA500');
    beakGradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = beakGradient;
    ctx.beginPath();
    ctx.moveTo(bird.x + 32, bird.y + 8);
    ctx.lineTo(bird.x + 42, bird.y + 8);
    ctx.lineTo(bird.x + 37, bird.y + 12);
    ctx.closePath();
    ctx.fill();
    
    // Глаз
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + 28, bird.y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + 29, bird.y + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Блик в глазу
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + 29.5, bird.y + 5.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Крылья
    const wingGradient = ctx.createLinearGradient(
        bird.x + 12, bird.y + 12,
        bird.x + 12 + Math.sin(wingAngle) * 20,
        bird.y + 12 + Math.cos(wingAngle) * 10
    );
    wingGradient.addColorStop(0, '#FF8C00');
    wingGradient.addColorStop(1, '#FF4500');
    
    ctx.fillStyle = wingGradient;
    ctx.beginPath();
    ctx.moveTo(bird.x + 12, bird.y + 12);
    ctx.quadraticCurveTo(
        bird.x + 12 + Math.sin(wingAngle) * 20, 
        bird.y + 12 + Math.cos(wingAngle) * 10 + wingFlap,
        bird.x + 12, 
        bird.y + 22
    );
    ctx.fill();
    
    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(bird.x + 15, bird.y + 15, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function checkCollisions() {
    for (const obstacle of obstacles) {
        if (bird.x + bird.width > obstacle.x && bird.x < obstacle.x + obstacle.width) {
            if (bird.y < obstacle.topHeight || bird.y + bird.height > obstacle.bottomY) {
                playHitSound();
                gameOver();
                return;
            }
        }
    }
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    bgMusic.pause();
    
    // Обновить рекорд
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.querySelector('.best-score').textContent = `BEST: ${bestScore}`;
    }
    
    // Обновить данные игры
    gameData.totalScore += score;
    gameData.totalCoins += coins;
    localStorage.setItem('retroPixelFlyer', JSON.stringify(gameData));
    
    // Показать меню Game Over
    finalScoreElement.textContent = score;
    earnedCoinsElement.textContent = coins;
    gameOverMenu.style.display = 'flex';
}

function updateScore() {
    scoreElement.textContent = `SCORE: ${score}`;
}

function updateCoinsDisplay() {
    coinsElement.textContent = `COINS: ${coins}`;
}

function updateLevel() {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        document.querySelector('.level').textContent = `LVL: ${currentLevel}`;
        
        // Визуальное подтверждение уровня
        document.querySelector('.level').style.color = '#00ff00';
        setTimeout(() => {
            document.querySelector('.level').style.color = '#ffffff';
        }, 1000);
    }
}

function shareScore() {
    const score = document.getElementById('final-score').textContent;
    const message = `Я набрал ${score} очков в RETRO PIXEL FLYER!\n\nСыграйте и вы: https://pump0n.github.io/01-retro-flyer/`;
    
    if (navigator.share) {
        navigator.share({
            title: 'RETRO PIXEL FLYER',
            text: message,
            url: 'https://pump0n.github.io/01-retro-flyer/'
        }).catch(console.error);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Результат скопирован в буфер обмена!');
    }
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    gameOverMenu.style.display = 'none';
    shopMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
}

function goToMainMenu() {
    showMainMenu();
}

function showShop() {
    mainMenu.style.display = 'none';
    shopMenu.style.display = 'flex';
}

function showLeaderboard() {
    mainMenu.style.display = 'none';
    leaderboardMenu.style.display = 'flex';
}

function submitScore() {
    if (tg) {
        tg.sendData(JSON.stringify({
            action: "game_score",
            score: score,
            coins: coins
        }));
        tg.showAlert(`🏆 SCORE SUBMITTED!\nYou earned ${coins} coins!`);
    }
    showMainMenu();
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (!isSoundEnabled) {
        bgMusic.pause();
    }
}

function playJumpSound() {
    if (isSoundEnabled) {
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
}

function playCoinSound() {
    if (isSoundEnabled) {
        coinSound.currentTime = 0;
        coinSound.play();
    }
}

function playHitSound() {
    if (isSoundEnabled) {
        hitSound.currentTime = 0;
        hitSound.play();
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', showLoading);

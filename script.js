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

// Игровые переменные
let score = 0;
let coins = 0;
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
    gravity: 0.5,
    jumpForce: -8,
    color: '#ff00ff'
};

// Загрузка данных из localStorage
let gameData = JSON.parse(localStorage.getItem('retroPixelFlyer')) || {
    totalCoins: 0,
    totalScore: 0,
    items: {
        blueBird: false,
        redBird: false,
        shield: false,
        magnet: false
    },
    achievements: {
        firstFlight: false,
        coinCollector: false,
        highFlyer: false,
        pixelMaster: false
    }
};

// Счетчик кадров для генерации препятствий
let frameCount = 0;
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

// Функции игры
function startGame() {
    // Скрыть главное меню
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
    
    // Обновить интерфейс
    updateScore();
    
    // Запустить игровой цикл
    gameLoop();
    
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
    
    // Голубое небо
    ctx.fillStyle = '#87CEEB'; // Светло-голубой
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Нарисовать облака
    drawClouds();
    
    // Земля внизу
    ctx.fillStyle = '#8B4513'; // Коричневый
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Трава на земле
    ctx.fillStyle = '#228B22'; // Зеленый
    ctx.fillRect(0, canvas.height - 25, canvas.width, 5);
    
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
    
    // Запустить следующий кадр
    animationFrame = requestAnimationFrame(gameLoop);
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

function addObstacle() {
    const gap = 150;
    const topHeight = Math.random() * (canvas.height - gap - 60) + 20;
    
    obstacles.push({
        x: canvas.width,
        width: 60,
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
        obstacle.x -= 3;
        
        // Нарисовать верхнюю трубу
        drawPipe(obstacle.x, 0, obstacle.width, obstacle.topHeight, true);
        
        // Нарисовать нижнюю трубу
        drawPipe(obstacle.x, obstacle.bottomY, obstacle.width, canvas.height - obstacle.bottomY, false);
        
        // Проверить, прошла ли птица препятствие
        if (!obstacle.passed && obstacle.x + obstacle.width < bird.x) {
            obstacle.passed = true;
            score += 10;
            updateScore();
        }
        
        // Удалить препятствие, если оно вышло за экран
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function drawPipe(x, y, width, height, isTop) {
    // Тело трубы
    ctx.fillStyle = '#008000'; // Зеленый
    ctx.fillRect(x, y, width, height);
    
    // Ободок трубы
    ctx.fillStyle = '#4B0082'; // Индиго
    if (isTop) {
        ctx.fillRect(x - 5, y + height - 10, width + 10, 10);
    } else {
        ctx.fillRect(x - 5, y, width + 10, 10);
    }
    
    // Детали трубы
    ctx.fillStyle = '#006400'; // Темно-зеленый
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
        
        // Проверить сбор монеты
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
        
        // Удалить монету, если она вышла за экран
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
    
    if (bird.y + bird.height > canvas.height - 25) { // Учитываем землю
        playHitSound();
        gameOver();
        return;
    }
    
    // Анимация взмаха крыльев
    const wingAngle = Math.sin(frameCount / 5) * 0.3;
    
    // Нарисовать птицу
    ctx.fillStyle = '#FFD700'; // Золотистый
    
    // Тело птицы
    ctx.beginPath();
    ctx.ellipse(bird.x + 15, bird.y + 10, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова
    ctx.fillStyle = '#FF4500'; // Оранжевый
    ctx.beginPath();
    ctx.arc(bird.x + 25, bird.y + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Клюв
    ctx.fillStyle = '#FFA500'; // Оранжевый
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
    
    // Крылья (анимированные)
    ctx.fillStyle = '#FF8C00'; // Темно-оранжевый
    ctx.beginPath();
    ctx.moveTo(bird.x + 12, bird.y + 12);
    ctx.quadraticCurveTo(
        bird.x + 12 + Math.sin(wingAngle) * 20, 
        bird.y + 12 + Math.cos(wingAngle) * 10,
        bird.x + 12, 
        bird.y + 22
    );
    ctx.fill();
}

function checkCollisions() {
    // Проверить столкновения с препятствиями
    for (const obstacle of obstacles) {
        // Проверка столкновения с верхней трубой
        if (bird.x + bird.width > obstacle.x && 
            bird.x < obstacle.x + obstacle.width &&
            bird.y < obstacle.topHeight) {
            playHitSound();
            gameOver();
            return;
        }
        
        // Проверка столкновения с нижней трубой
        if (bird.x + bird.width > obstacle.x && 
            bird.x < obstacle.x + obstacle.width &&
            bird.y + bird.height > obstacle.bottomY) {
            playHitSound();
            gameOver();
            return;
        }
    }
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    
    // Остановить фоновую музыку
    bgMusic.pause();
    
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

function showShop() {
    mainMenu.style.display = 'none';
    shopMenu.style.display = 'flex';
}

function showLeaderboard() {
    mainMenu.style.display = 'none';
    leaderboardMenu.style.display = 'flex';
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    shopMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
}

function submitScore() {
    // Отправить результат в Telegram бота
    tg.sendData(JSON.stringify({
        action: "game_score",
        score: score,
        coins: coins
    }));
    
    tg.showAlert(`🏆 SCORE SUBMITTED!\nYou earned ${coins} coins!`);
    
    // Показать главное меню
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

// Инициализация игры
function init() {
    // Показать главное меню
    mainMenu.style.display = 'flex';
    
    // Обновить отображение монет
    coinsElement.textContent = `COINS: ${gameData.totalCoins}`;
    
    // Установить статус звука
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
}

// Запуск игры
window.onload = init;

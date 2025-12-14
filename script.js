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
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const audioBtn = document.getElementById('audio-btn');
const finalScoreElement = document.getElementById('final-score');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');

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
let bestScore = 0;
let gameActive = false;
let gameStarted = false;
let pipes = [];
let coinsList = [];
let birdX, birdY, velocity = 0;
let gravity = 0.35;
let jumpPower = -8;
let gap = 150;
let pipeWidth = 60;
let frame = 0;
let isSoundOn = true;
let bgX = 0;
let fgX = 0;
let gameLoaded = false;

// Проверка загрузки всех ресурсов
const resources = [bird, bg, fg, pipeUp, pipeBottom, coin];
let loadedResources = 0;

function resourceLoaded() {
    loadedResources++;
    if (loadedResources >= resources.length) {
        gameLoaded = true;
        document.getElementById('loading-progress').style.width = '100%';
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

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Функция инициализации игры
function initGame() {
    // Скрыть экран загрузки
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    }, 300);

    // Загрузка рекорда
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
}

// Кнопки
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
audioBtn.addEventListener('click', toggleSound);

// Управление игрой
document.addEventListener('touchstart', handleTouch, { passive: false });
document.addEventListener('click', handleClick);
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

function handleTouch(e) {
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
    // Скрыть главное меню
    mainMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    startScreen.style.display = 'flex';
    
    // Сбросить игру
    score = 0;
    coinsCollected = 0;
    pipes = [];
    coinsList = [];
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
    gameLoop();
}

function startPlaying() {
    gameStarted = true;
    startScreen.style.display = 'none';
}

function jump() {
    velocity = jumpPower;
    if (isSoundOn) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log('Sound playback failed'));
    }
}

function addPipe() {
    const minTop = 60;
    const maxTop = canvas.height - fg.height - gap - 80;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    
    pipes.push({
        x: canvas.width,
        top: topHeight,
        passed: false
    });
    
    // Добавить монетку между трубами
    coinsList.push({
        x: canvas.width + pipeWidth / 2,
        y: topHeight + gap / 2,
        collected: false,
        size: 20
    });
}

function drawBackground() {
    // Рисуем фон с прокруткой
    const cols = Math.ceil(canvas.width / bg.width) + 1;
    
    for (let c = 0; c < cols; c++) {
        const x = (bgX + c * bg.width) % (cols * bg.width) - bg.width;
        ctx.drawImage(bg, x, 0, canvas.width, canvas.height);
    }
    
    // Обновляем позицию фона
    bgX -= 0.5;
}

function drawForeground() {
    // Рисуем землю с прокруткой
    const cols = Math.ceil(canvas.width / fg.width) + 1;
    
    for (let c = 0; c < cols; c++) {
        const x = (fgX + c * fg.width) % (cols * fg.width) - fg.width;
        ctx.drawImage(fg, x, canvas.height - fg.height, fg.width, fg.height);
    }
    
    // Обновляем позицию земли
    fgX -= 2;
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Верхняя труба
        ctx.drawImage(pipeUp, pipe.x, pipe.top - pipeUp.height);
        
        // Нижняя труба
        const bottomY = pipe.top + gap;
        ctx.drawImage(pipeBottom, pipe.x, bottomY);
    });
}

function drawCoins() {
    coinsList.forEach(coinObj => {
        if (!coinObj.collected) {
            // Анимация вращения монетки
            const rotation = Math.sin(frame / 10) * 0.2;
            ctx.save();
            ctx.translate(coinObj.x, coinObj.y);
            ctx.rotate(rotation);
            ctx.drawImage(coin, -coinObj.size/2, -coinObj.size/2, coinObj.size, coinObj.size);
            ctx.restore();
        }
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(birdX + bird.width/2, birdY + bird.height/2);
    ctx.rotate(velocity * 0.1);
    ctx.drawImage(bird, -bird.width/2, -bird.height/2, bird.width, bird.height);
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
            birdX + bird.width > coinsList[i].x &&
            birdY < coinsList[i].y + coinsList[i].size &&
            birdY + bird.height > coinsList[i].y) {
            coinsList[i].collected = true;
            coinsCollected++;
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
    // Проверка столкновения с землей
    if (birdY + bird.height > canvas.height - fg.height) {
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
        if (birdX + bird.width > pipe.x && birdX < pipe.x + pipeWidth) {
            // Верхняя труба
            if (birdY < pipe.top) {
                gameOver();
                return;
            }
            
            // Нижняя труба
            if (birdY + bird.height > pipe.top + gap) {
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
    }
    
    // Показать меню Game Over
    finalScoreElement.textContent = totalScore;
    gameOverMenu.style.display = 'flex';
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    gameOverMenu.style.display = 'none';
    startScreen.style.display = 'none';
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

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Убедимся, что все ресурсы загружены
    if (loadedResources < resources.length) {
        document.getElementById('loading-progress').style.width = '50%';
    }
});
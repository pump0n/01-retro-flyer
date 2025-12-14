// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    tg.enableClosingConfirmation(); // Предотвращает случайный выход
}

// Элементы DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.querySelector('.main-menu');
const gameOverMenu = document.querySelector('.game-over-menu');
const startScreen = document.querySelector('.start-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const audioBtn = document.getElementById('audio-btn');
const shareBtn = document.getElementById('share-btn');
const finalScoreElement = document.getElementById('final-score');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');

// Графические ресурсы
const bird = new Image();
const bg = new Image();
const fg = new Image();
const pipeUp = new Image();
const pipeBottom = new Image();
let resourcesLoaded = 0;
let totalResources = 5; // Изображения + звуки

// Звуковые файлы
const bgMusic = new Audio();
const jumpSound = new Audio();
const coinSound = new Audio();
const hitSound = new Audio();

// Функция загрузки ресурса
function loadResource(resource, src, type = 'img') {
    return new Promise((resolve) => {
        if (type === 'audio') {
            resource.addEventListener('canplaythrough', () => {
                resourcesLoaded++;
                checkResources();
                resolve();
            });
            resource.src = src;
        } else {
            resource.onload = () => {
                resourcesLoaded++;
                checkResources();
                resolve();
            };
            resource.src = src;
        }
    });
}

// Загрузка всех ресурсов
async function loadResources() {
    await Promise.all([
        loadResource(bird, 'assets/flappy_bird_bird.png'),
        loadResource(bg, 'assets/bg.png'),
        loadResource(fg, 'assets/fg.png'),
        loadResource(pipeUp, 'assets/pipeUp.png'),
        loadResource(pipeBottom, 'assets/pipeBottom.png'),
        loadResource(bgMusic, 'assets/music.mp3', 'audio'),
        loadResource(jumpSound, 'assets/jump.mp3', 'audio'),
        loadResource(coinSound, 'assets/coin.mp3', 'audio'),
        loadResource(hitSound, 'assets/hit.mp3', 'audio')
    ]);
    totalResources = 9; // Обновляем счётчик
}

function checkResources() {
    if (resourcesLoaded >= totalResources) {
        animateLoading();
    }
}

// Игровые переменные
let score = 0;
let bestScore = 0;
let gameActive = false;
let gameStarted = false;
let animationFrame;
let pipes = [];
let xPos = 0;
let yPos = 0;
let velocity = 0;
let grav = 0.25;
let jumpForce = -6;
let gap = 150;
let frameCount = 0;
let isSoundEnabled = true;
let bgX = 0; // Для скролла bg
let fgX = 0; // Для скролла fg
let birdFrame = 0; // Анимация bird
let canvasWidth, canvasHeight;

// Обработчики событий
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
leaderboardBtn.addEventListener('click', showLeaderboard);
audioBtn.addEventListener('click', toggleSound);
shareBtn.addEventListener('click', shareScore);

document.addEventListener('keydown', handleKey);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouch, { passive: false });

if (tg) {
    tg.onEvent('mainButtonClicked', handleClick); // Telegram-specific touch
}

function handleKey(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameActive) {
            if (!gameStarted) startPlaying();
            else jump();
        }
    }
}

function handleClick(e) {
    e.preventDefault();
    if (gameActive) {
        if (!gameStarted) startPlaying();
        else jump();
    }
    if (tg) tg.HapticFeedback.impactOccurred('light'); // Вибрация
}

function handleTouch(e) {
    e.preventDefault();
    handleClick(e);
}

function init() {
    resizeCanvas();
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    loadResources(); // Начинаем загрузку
}

function animateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5; // Более динамично
        if (progress > 100) progress = 100;
        document.getElementById('loading-progress').style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainMenu.classList.add('active');
                }, 300);
            }, 500);
        }
    }, 50);
}

function startGame() {
    mainMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');
    startScreen.classList.add('active');
    
    score = 0;
    pipes = [];
    xPos = canvasWidth * 0.2;
    yPos = canvasHeight / 2;
    velocity = 0;
    gameActive = true;
    gameStarted = false;
    frameCount = 0;
    bgX = 0;
    fgX = 0;
    birdFrame = 0;
    
    addPipe();
    scoreElement.textContent = `СЧЕТ: ${score}`;
    
    if (isSoundEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
        bgMusic.play().catch(() => {}); // Игнор autoplay
    }
    
    gameLoop();
}

function startPlaying() {
    gameStarted = true;
    velocity = jumpForce;
    startScreen.classList.remove('active');
    if (isSoundEnabled) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
    }
}

function jump() {
    if (gameStarted) {
        velocity = jumpForce;
        if (isSoundEnabled) {
            jumpSound.currentTime = 0;
            jumpSound.play().catch(() => {});
        }
    }
}

function addPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvasHeight - gap - 200)) + 50;
    pipes.push({
        x: canvasWidth,
        y: pipeHeight,
        passed: false
    });
}

function drawBg() {
    ctx.drawImage(bg, bgX, 0, canvasWidth, canvasHeight);
    ctx.drawImage(bg, bgX + canvasWidth, 0, canvasWidth, canvasHeight);
    bgX -= 0.5; // Медленный скролл
    if (bgX <= -canvasWidth) bgX = 0;
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Верхняя труба (перевёрнутая)
        ctx.save();
        ctx.translate(pipe.x + pipeUp.width, pipe.y);
        ctx.scale(1, -1);
        ctx.drawImage(pipeUp, 0, 0);
        ctx.restore();
        
        // Нижняя труба
        const bottomY = pipe.y + gap;
        ctx.drawImage(pipeBottom, pipe.x, bottomY);
    });
}

function drawBird() {
    // Простая анимация flap (2 кадра, но поскольку 1 img, симулируем поворот/смещение)
    birdFrame = (birdFrame + 0.2) % (Math.PI * 2);
    const flapOffset = Math.sin(birdFrame) * 2;
    ctx.save();
    ctx.translate(xPos + 20, yPos + 20 + flapOffset);
    ctx.rotate(velocity * 0.05); // Наклон по скорости
    ctx.drawImage(bird, -10, -10, 40, 30); // Масштаб
    ctx.restore();
}

function drawForeground() {
    const speed = 2;
    ctx.drawImage(fg, fgX, canvasHeight - fg.height);
    ctx.drawImage(fg, fgX + fg.width, canvasHeight - fg.height);
    fgX -= speed;
    if (fgX <= -fg.width) fgX = 0;
}

function updatePipes() {
    frameCount++;
    if (frameCount % 90 === 0) addPipe(); // Реже трубы
    
    pipes.forEach((pipe, i) => {
        pipe.x -= 2;
        
        if (!pipe.passed && pipe.x + pipeUp.width < xPos) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = `СЧЕТ: ${score}`;
            if (isSoundEnabled) {
                coinSound.currentTime = 0;
                coinSound.play().catch(() => {});
            }
        }
        
        if (pipe.x + pipeUp.width < 0) {
            pipes.splice(i, 1);
        }
    });
}

function updateBird() {
    if (gameStarted) {
        velocity += grav;
        yPos += velocity;
    }
}

function checkCollisions() {
    const birdBottom = yPos + 30; // Размер bird
    const birdRight = xPos + 40;
    
    // Земля
    if (birdBottom > canvasHeight - fg.height) {
        gameOver();
        return;
    }
    
    // Потолок
    if (yPos < 0) yPos = 0;
    
    // Трубы
    pipes.forEach(pipe => {
        if (xPos < pipe.x + pipeUp.width && birdRight > pipe.x) {
            if (yPos < pipe.y || birdBottom > pipe.y + gap) {
                gameOver();
                return;
            }
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawBg();
    updatePipes();
    updateBird();
    checkCollisions();
    drawPipes();
    drawBird();
    drawForeground();
    
    if (gameActive) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    
    if (isSoundEnabled) {
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
    }
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore.toString());
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    }
    
    finalScoreElement.textContent = score;
    gameOverMenu.classList.add('active');
}

function showMainMenu() {
    gameOverMenu.classList.remove('active');
    mainMenu.classList.add('active');
    startScreen.classList.remove('active');
    if (gameActive) gameOver(); // Остановить игру
}

function showLeaderboard() {
    if (tg) {
        tg.showAlert('Таблица рекордов в разработке! Скоро добавим.');
    } else {
        alert('Таблица рекордов в разработке!');
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (!isSoundEnabled) bgMusic.pause();
    else if (gameActive) bgMusic.play().catch(() => {});
}

function shareScore() {
    const message = `Я набрал ${score} очков в RETRO PIXEL FLYER! Попробуй побить: https://github.com/pump0n/01-retro-flyer`;
    if (tg) {
        tg.sendData(JSON.stringify({ score, action: 'share' }));
        tg.showAlert('Счёт отправлен!');
    } else if (navigator.share) {
        navigator.share({ title: 'RETRO PIXEL FLYER', text: message });
    } else {
        navigator.clipboard.writeText(message).then(() => alert('Скопировано!'));
    }
}

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    if (gameActive) {
        xPos = canvasWidth * 0.2;
        yPos = canvasHeight / 2;
    }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

document.addEventListener('DOMContentLoaded', init);

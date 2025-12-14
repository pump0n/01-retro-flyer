// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
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

// Звуковые файлы
const bgMusic = new Audio();
const jumpSound = new Audio();
const coinSound = new Audio();
const hitSound = new Audio();

// Загрузка ресурсов
bird.src = 'assets/flappy_bird_bird.png';
bg.src = 'assets/bg.png';
fg.src = 'assets/fg.png';
pipeUp.src = 'assets/pipeUp.png';
pipeBottom.src = 'assets/pipeBottom.png';

bgMusic.src = 'assets/music.mp3';
jumpSound.src = 'assets/jump.mp3';
coinSound.src = 'assets/coin.mp3';
hitSound.src = 'assets/hit.mp3';

// Игровые переменные
let score = 0;
let bestScore = 0;
let gameActive = false;
let animationFrame;
let pipes = [];
let xPos = 10;
let yPos = 0;
let pipeX = 0;
let grav = 0.25;
let jumpForce = -4.5;
let gap = 120;
let frameCount = 0;
let isSoundEnabled = true;
let gameStarted = false;
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let pipeHeight = 0;
let fgHeight = 0;

// Обработчики событий
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
leaderboardBtn.addEventListener('click', showLeaderboard);
audioBtn.addEventListener('click', toggleSound);
shareBtn.addEventListener('click', shareScore);

// Управление игрой
document.addEventListener('keydown', handleKey);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouch);

// Обработчики событий
function handleKey(e) {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameActive && gameStarted) {
            jump();
        } else if (gameActive && !gameStarted) {
            startPlaying();
        }
    }
}

function handleClick() {
    if (gameActive && gameStarted) {
        jump();
    } else if (gameActive && !gameStarted) {
        startPlaying();
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (gameActive && gameStarted) {
        jump();
    } else if (gameActive && !gameStarted) {
        startPlaying();
    }
}

// Функции игры
function init() {
    // Настройка размеров canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Получение размеров изображений
    pipeHeight = pipeUp.height;
    fgHeight = fg.height;
    
    // Загрузка рекорда из localStorage
    bestScore = parseInt(localStorage.getItem('retroPixelFlyerBestScore') || '0');
    bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    
    // Запуск анимации загрузки
    animateLoading();
}

function animateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        document.getElementById('loading-progress').style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainMenu.style.display = 'flex';
                }, 300);
            }, 300);
        }
    }, 30);
}

function startGame() {
    // Скрыть все меню
    mainMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    startScreen.style.display = 'flex';
    
    // Сбросить игру
    score = 0;
    pipes = [];
    xPos = canvasWidth * 0.2;
    yPos = canvasHeight / 2;
    pipeX = canvasWidth;
    gameActive = true;
    gameStarted = false;
    
    // Добавить первые трубы
    addPipe();
    
    // Обновить интерфейс
    scoreElement.textContent = `СЧЕТ: ${score}`;
    
    // Запустить музыку
    if (isSoundEnabled) {
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
    yPos += jumpForce;
    if (isSoundEnabled) {
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
}

function addPipe() {
    const pipeY = Math.floor(Math.random() * (canvasHeight - gap - fgHeight - 100)) + 50;
    pipes.push({
        x: canvasWidth,
        y: pipeY,
        passed: false
    });
}

function gameLoop() {
    if (!gameActive) return;
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Отрисовка фона
    drawBackground();
    
    // Отрисовка труб
    drawPipes();
    
    // Отрисовка птицы
    drawBird();
    
    // Отрисовка переднего фона
    drawForeground();
    
    // Если игра не началась - показать стартовый экран
    if (!gameStarted) {
        animationFrame = requestAnimationFrame(gameLoop);
        return;
    }
    
    // Обновление позиции труб
    updatePipes();
    
    // Обновление позиции птицы
    updateBird();
    
    // Проверка столкновений
    checkCollisions();
    
    // Обновление счета
    updateScore();
    
    // Запуск следующего кадра
    animationFrame = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Рисуем фон несколько раз для заполнения всего canvas
    const cols = Math.ceil(canvasWidth / bg.width) + 1;
    const rows = Math.ceil(canvasHeight / bg.height) + 1;
    
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            ctx.drawImage(bg, c * bg.width, r * bg.height);
        }
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Верхняя труба
        ctx.drawImage(pipeUp, pipe.x, pipe.y - pipeUp.height);
        
        // Нижняя труба
        const bottomY = pipe.y + gap;
        ctx.drawImage(pipeBottom, pipe.x, bottomY);
    });
}

function drawBird() {
    ctx.drawImage(bird, xPos, yPos);
}

function drawForeground() {
    // Рисуем передний фон внизу экрана
    ctx.drawImage(fg, 0, canvasHeight - fgHeight);
    
    // Рисуем передний фон поверх - для правильного наложения
    ctx.drawImage(fg, 0, canvasHeight - fgHeight * 2);
}

function updatePipes() {
    frameCount++;
    
    // Добавление новых труб
    if (frameCount % 100 === 0) {
        addPipe();
    }
    
    // Обновление позиции труб
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x + pipeUp.width < xPos) {
            pipes[i].passed = true;
            if (isSoundEnabled) {
                coinSound.currentTime = 0;
                coinSound.play();
            }
        }
        
        // Удаление труб за пределами экрана
        if (pipes[i].x + pipeUp.width < 0) {
            pipes.splice(i, 1);
        }
    }
}

function updateBird() {
    if (gameStarted) {
        yPos += grav;
    }
}

function checkCollisions() {
    // Проверка столкновения с землей
    if (yPos + bird.height > canvasHeight - fgHeight) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с потолком
    if (yPos < 0) {
        yPos = 0;
    }
    
    // Проверка столкновения с трубами
    for (const pipe of pipes) {
        if (xPos + bird.width > pipe.x && xPos < pipe.x + pipeUp.width) {
            // Верхняя труба
            if (yPos < pipe.y) {
                gameOver();
                return;
            }
            
            // Нижняя труба
            if (yPos + bird.height > pipe.y + gap) {
                gameOver();
                return;
            }
        }
    }
}

function updateScore() {
    if (!gameStarted) return;
    
    // Проверка прохождения труб
    pipes.forEach(pipe => {
        if (pipe.passed && xPos > pipe.x + pipeUp.width) {
            pipe.passed = false;
            score += 1;
            scoreElement.textContent = `СЧЕТ: ${score}`;
        }
    });
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);
    
    if (isSoundEnabled) {
        bgMusic.pause();
        hitSound.currentTime = 0;
        hitSound.play();
    }
    
    // Обновление рекорда
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('retroPixelFlyerBestScore', bestScore);
        bestScoreElement.textContent = `РЕКОРД: ${bestScore}`;
    }
    
    // Показать меню Game Over
    finalScoreElement.textContent = score;
    gameOverMenu.style.display = 'flex';
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    gameOverMenu.style.display = 'none';
}

function showLeaderboard() {
    // В реальной версии здесь будет запрос к серверу
    if (tg) {
        tg.showAlert('Таблица рекордов будет добавлена в следующих версиях');
    } else {
        alert('Таблица рекордов будет добавлена в следующих версиях');
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    audioBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
    
    if (isSoundEnabled) {
        bgMusic.play().catch(e => console.log('Autoplay blocked'));
    } else {
        bgMusic.pause();
    }
}

function shareScore() {
    const message = `Я набрал ${score} очков в RETRO PIXEL FLYER!\n\nПопробуй побить мой рекорд: https://pump0n.github.io/01-retro-flyer/`;
    
    if (navigator.share) {
        navigator.share({
            title: 'RETRO PIXEL FLYER',
            text: message
        }).catch(console.error);
    } else if (tg) {
        tg.sendData(JSON.stringify({
            action: "share_score",
            score: score
        }));
        tg.showAlert('Результат отправлен в Telegram!');
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

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    resizeCanvas();
    if (!gameActive) {
        init();
    }
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

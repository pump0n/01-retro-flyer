// Flappy Bird Game
// Адаптировано для оригинальной физики Flappy Bird и работы на смартфонах

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Изображения
const birdImg = new Image();
const bgImg = new Image();
const fgImg = new Image();
const pipeNorthImg = new Image();
const pipeSouthImg = new Image();

birdImg.src = 'assets/flappy_bird_bird.png';
bgImg.src = 'assets/bg.png';
fgImg.src = 'assets/fg.png';
pipeNorthImg.src = 'assets/pipeUp.png';
pipeSouthImg.src = 'assets/pipeBottom.png';

// Аудио
const flapSound = new Audio('assets/jump.mp3');
const scoreSound = new Audio('assets/coin.mp3');
const dieSound = new Audio('assets/hit.wav');
const bgMusic = new Audio('assets/music.mp3');
bgMusic.loop = true;

// Игровые переменные
let birdX, birdY, velocity = 0;
const gravity = 0.2; // Уменьшено для смартфонов
const lift = -5.0; // Увеличено для более сильного прыжка
const pipeGap = 90;
const birdWidth = 34;
const birdHeight = 24;
const pipeWidth = 52;
const groundHeight = 112;
let pipes = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('flappyBestScore') || '0');
let gameState = 'start';
let frameCount = 0;
let bgX = 0;
let fgX = 0;
let lastTime = 0;

// Фиксированный шаг времени (60 FPS)
const fixedStep = 1 / 60;
let accumulator = 0;

// Адаптация канваса
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    birdX = canvas.width / 4;
    birdY = canvas.height / 2;
    ctx.imageSmoothingEnabled = false;
    console.log('Canvas resized:', canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Загрузка ресурсов
let resourcesLoaded = 0;
const resources = [birdImg, bgImg, fgImg, pipeNorthImg, pipeSouthImg];
resources.forEach(img => {
    img.onload = () => {
        resourcesLoaded++;
        if (resourcesLoaded === resources.length) {
            initGame();
        }
    };
    img.onerror = () => {
        console.error('Failed to load image:', img.src);
        resourcesLoaded++;
        if (resourcesLoaded === resources.length) {
            initGame();
        }
    };
});

// Инициализация игры
function initGame() {
    document.addEventListener('keydown', handleInput);
    document.addEventListener('click', handleInput);
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            handleInput(e);
        }
    }, { passive: false });

    resetGame();
    requestAnimationFrame(gameLoop);
}

// Обработка ввода
function handleInput(e) {
    if (e.type === 'touchstart') {
        e.preventDefault();
    }
    if (e.type === 'keydown' && e.key !== ' ') return;

    console.log('Input:', e.type, 'gameState:', gameState);
    if (gameState === 'start') {
        gameState = 'playing';
        velocity = lift;
        playSound(flapSound);
        playMusic();
    } else if (gameState === 'playing') {
        velocity = lift;
        playSound(flapSound);
    } else if (gameState === 'over') {
        resetGame();
        gameState = 'playing';
    }
}

// Сброс игры
function resetGame() {
    pipes = [];
    score = 0;
    birdX = canvas.width / 4;
    birdY = canvas.height / 2;
    velocity = 0;
    bgX = 0;
    fgX = 0;
    frameCount = 0;
    accumulator = 0;
    lastTime = performance.now();
    stopMusic();
}

// Игровой цикл
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    accumulator += delta;
    while (accumulator >= fixedStep) {
        update(fixedStep);
        accumulator -= fixedStep;
    }

    render();
    requestAnimationFrame(gameLoop);
}

// Обновление логики
function update(dt) {
    if (gameState !== 'playing') {
        velocity = 0; // Птичка не падает до старта
        return;
    }

    velocity += gravity / dt;
    birdY += velocity * dt * 60;

    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    if (birdY + birdHeight > canvas.height - groundHeight) {
        die();
        return;
    }

    frameCount++;

    if (frameCount % 90 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - groundHeight - pipeGap - 200)) + 100;
        pipes.push({
            x: canvas.width,
            y: pipeHeight - canvas.height,
            scored: false
        });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 1.5;

        if (pipe.x + pipeWidth < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            playSound(scoreSound);
        }

        if (checkCollision(pipe)) {
            die();
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    bgX -= 0.2;
    if (bgX <= -bgImg.width) bgX = 0;
    fgX -= 1.5;
    if (fgX <= -fgImg.width) fgX = 0;
}

// Проверка столкновений
function checkCollision(pipe) {
    const birdRight = birdX + birdWidth;
    const birdBottom = birdY + birdHeight;

    if (birdRight > pipe.x && birdX < pipe.x + pipeWidth &&
        birdBottom > 0 && birdY < pipe.y + canvas.height) {
        return true;
    }

    const bottomY = pipe.y + canvas.height + pipeGap;
    if (birdRight > pipe.x && birdX < pipe.x + pipeWidth &&
        birdBottom > bottomY && birdY < canvas.height - groundHeight) {
        return true;
    }

    return false;
}

// Отрисовка
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + bgImg.width, 0, canvas.width, canvas.height);

    if (gameState === 'playing' || gameState === 'over') {
        pipes.forEach(pipe => {
            ctx.drawImage(pipeNorthImg, pipe.x, pipe.y, pipeWidth, canvas.height);
            ctx.drawImage(pipeSouthImg, pipe.x, pipe.y + canvas.height + pipeGap, pipeWidth, canvas.height);
        });

        ctx.drawImage(fgImg, fgX, canvas.height - groundHeight);
        ctx.drawImage(fgImg, fgX + fgImg.width, canvas.height - groundHeight);
    }

    ctx.save();
    ctx.translate(birdX + birdWidth / 2, birdY + birdHeight / 2);
    ctx.rotate(velocity * 0.05);
    ctx.drawImage(birdImg, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 40px Arial';
    ctx.strokeText(score, canvas.width / 2, 50);
    ctx.fillText(score, canvas.width / 2, 50);

    if (gameState === 'start') {
        ctx.font = 'bold 30px Arial';
        ctx.strokeText('Нажмите, чтобы начать', canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText('Нажмите, чтобы начать', canvas.width / 2 - 100, canvas.height / 2);
    }

    if (gameState === 'over') {
        ctx.font = 'bold 40px Arial';
        ctx.strokeText('Игра окончена', canvas.width / 2 - 120, canvas.height / 2 - 50);
        ctx.fillText('Игра окончена', canvas.width / 2 - 120, canvas.height / 2 - 50);
        ctx.font = 'bold 30px Arial';
        ctx.strokeText(`Счёт: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
        ctx.fillText(`Счёт: ${score}`, canvas.width / 2 - 80, canvas.height / 2);
        ctx.strokeText(`Рекорд: ${bestScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.fillText(`Рекорд: ${bestScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.strokeText('Нажмите, чтобы перезапустить', canvas.width / 2 - 120, canvas.height / 2 + 80);
        ctx.fillText('Нажмите, чтобы перезапустить', canvas.width / 2 - 120, canvas.height / 2 + 80);
    }
}

// Конец игры
function die() {
    gameState = 'over';
    playSound(dieSound);
    stopMusic();
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBestScore', bestScore);
    }
}

// Управление звуком
function playSound(sound) {
    sound.play().catch(() => {});
}

function playMusic() {
    bgMusic.play().catch(() => {});
}

function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}
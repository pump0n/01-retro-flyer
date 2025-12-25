// Flappy Bird, идентичная https://flappybird.io/
// Использует только файлы из папки assets

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

// Игровые переменные (подогнано под flappybird.io)
let birdX, birdY, velocity = 0;
const gravity = 0.125; // Мягкая гравитация для плавности
const lift = -4.5; // Сила прыжка
const pipeGap = 100; // Зазор между трубами
const birdWidth = 34; // Размеры птички
const birdHeight = 24;
const pipeWidth = 52; // Ширина труб
const groundHeight = 112; // Высота земли
const pipeSpeed = 1.5; // Скорость труб
const pipeSpacing = 150; // Расстояние между трубами
let pipes = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('flappyBestScore') || '0');
let gameState = 'start'; // start, playing, over
let frameCount = 0;
let bgX = 0;
let fgX = 0;
let lastTime = 0;
let lastTouchTime = 0;
const touchCooldown = 50; // Минимальная задержка между касаниями (мс)

// Фиксированный шаг времени (60 FPS)
const fixedStep = 1 / 60;
let accumulator = 0;

// Адаптация канваса
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    birdX = canvas.width / 3; // Птичка чуть правее, как в оригинале
    birdY = canvas.height / 2;
    ctx.imageSmoothingEnabled = false;
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
    // Обработчики ввода
    document.addEventListener('keydown', handleInput);
    document.addEventListener('click', handleInput);
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            handleInput(e);
        }
    }, { passive: false });
    document.addEventListener('touchend', () => {
        lastTouchTime = 0; // Сбрасываем для следующего касания
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

    const now = Date.now();
    if (now - lastTouchTime < touchCooldown) return;
    lastTouchTime = now;

    if (gameState === 'start') {
        gameState = 'playing';
        velocity = lift;
        playSound(flapSound);
    } else if (gameState === 'playing') {
        velocity = lift;
        playSound(flapSound);
    } else if (gameState === 'over') {
        resetGame();
        gameState = 'playing';
        velocity = lift;
        playSound(flapSound);
    }
}

// Сброс игры
function resetGame() {
    pipes = [];
    score = 0;
    birdX = canvas.width / 3;
    birdY = canvas.height / 2;
    velocity = 0;
    bgX = 0;
    fgX = 0;
    frameCount = 0;
    accumulator = 0;
    lastTime = performance.now();
    lastTouchTime = 0;
    gameState = 'start';
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
        velocity = 0; // Птичка неподвижна до старта
        return;
    }

    // Физика
    velocity += gravity;
    birdY += velocity;

    // Границы
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    if (birdY + birdHeight > canvas.height - groundHeight) {
        die();
        return;
    }

    frameCount++;

    // Генерация труб (каждые ~100 кадров, подогнано под pipeSpeed)
    if (frameCount % Math.floor(pipeSpacing / pipeSpeed) === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - groundHeight - pipeGap - minHeight;
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        pipes.push({
            x: canvas.width,
            y: pipeHeight - canvas.height, // Верхняя труба
            scored: false
        });
    }

    // Движение и проверка труб
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        // Очки за прохождение трубы
        if (pipe.x + pipeWidth < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            playSound(scoreSound);
        }

        // Столкновение
        if (checkCollision(pipe)) {
            die();
            return;
        }

        // Удаление труб за экраном
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Сдвиг фона и земли
    bgX -= 0.2;
    if (bgX <= -bgImg.width) bgX = 0;
    fgX -= pipeSpeed;
    if (fgX <= -fgImg.width) fgX = 0;
}

// Проверка столкновений
function checkCollision(pipe) {
    const birdRight = birdX + birdWidth;
    const birdBottom = birdY + birdHeight;

    // Верхняя труба
    if (birdRight > pipe.x && birdX < pipe.x + pipeWidth &&
        birdBottom > 0 && birdY < pipe.y + canvas.height) {
        return true;
    }

    // Нижняя труба
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

    // Фон
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + bgImg.width, 0, canvas.width, canvas.height);

    // Трубы и земля
    if (gameState === 'playing' || gameState === 'over') {
        pipes.forEach(pipe => {
            ctx.drawImage(pipeNorthImg, pipe.x, pipe.y, pipeWidth, canvas.height);
            ctx.drawImage(pipeSouthImg, pipe.x, pipe.y + canvas.height + pipeGap, pipeWidth, canvas.height);
        });
        ctx.drawImage(fgImg, fgX, canvas.height - groundHeight);
        ctx.drawImage(fgImg, fgX + fgImg.width, canvas.height - groundHeight);
    }

    // Птичка
    ctx.save();
    ctx.translate(birdX + birdWidth / 2, birdY + birdHeight / 2);
    ctx.rotate(Math.min(velocity * 0.1, Math.PI / 4)); // Ограничение угла поворота
    ctx.drawImage(birdImg, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);
    ctx.restore();

    // Счёт
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial'; // Как в flappybird.io
    ctx.textAlign = 'center';
    ctx.strokeText(score, canvas.width / 2, 80);
    ctx.fillText(score, canvas.width / 2, 80);

    // Начальный экран
    if (gameState === 'start') {
        ctx.font = 'bold 36px Arial';
        ctx.strokeText('Нажмите для старта', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Нажмите для старта', canvas.width / 2, canvas.height / 2);
    }

    // Экран проигрыша
    if (gameState === 'over') {
        ctx.font = 'bold 48px Arial';
        ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = 'bold 36px Arial';
        ctx.strokeText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(`Best: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText(`Best: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.strokeText('Нажмите для рестарта', canvas.width / 2, canvas.height / 2 + 100);
        ctx.fillText('Нажмите для рестарта', canvas.width / 2, canvas.height / 2 + 100);
    }
}

// Конец игры
function die() {
    gameState = 'over';
    playSound(dieSound);
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBestScore', bestScore);
    }
}

// Управление звуком
function playSound(sound) {
    sound.play().catch(() => {});
}

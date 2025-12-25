// Новогодний Flappy Bird, идентичный https://flappybird.io/
// Использует только файлы из папки assets
// Исправлены столкновения, добавлены монетки и новогодняя тематика

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Изображения
const birdImg = new Image();
const bgImg = new Image();
const fgImg = new Image();
const pipeNorthImg = new Image();
const pipeSouthImg = new Image();
const coinImg = new Image();

birdImg.src = 'assets/flappy_bird_bird.png';
bgImg.src = 'assets/bg.png';
fgImg.src = 'assets/fg.png';
pipeNorthImg.src = 'assets/pipeUp.png';
pipeSouthImg.src = 'assets/pipeBottom.png';
coinImg.src = 'assets/coin.png';

// Аудио
const flapSound = new Audio('assets/jump.mp3');
const scoreSound = new Audio('assets/coin.mp3');
const dieSound = new Audio('assets/hit.wav');

// Игровые переменные
let birdX, birdY, velocity = 0;
const gravity = 0.135; // Мягкая гравитация
const lift = -4.5; // Сила прыжка
const pipeGap = 145; // Увеличено для большего размера птички
const birdWidth = 34;
const birdHeight = 34;
const pipeWidth = 52;
const groundHeight = 112;
const pipeSpeed = 1.5;
const pipeSpacing = 300;
let pipes = [];
let coins = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('flappyBestScore') || '0');
let gameState = 'start'; // start, playing, over
let frameCount = 0;
let bgX = 0;
let fgX = 0;
let lastTime = 0;
let lastTouchTime = 0;
const touchCooldown = 50; // Задержка между касаниями (мс)

// Снежинки для новогоднего настроения
const snowflakes = [];
const snowflakeCount = 50;
function initSnowflakes() {
    for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 4 + 2
        });
    }
}
function updateSnowflakes() {
    snowflakes.forEach(flake => {
        flake.y += flake.speed;
        if (flake.y > canvas.height) flake.y = -flake.size;
    });
}
function renderSnowflakes() {
    ctx.fillStyle = '#FFF';
    snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Фиксированный шаг времени (60 FPS)
const fixedStep = 1 / 60;
let accumulator = 0;

// Адаптация канваса
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    birdX = canvas.width / 3;
    birdY = canvas.height / 2;
    ctx.imageSmoothingEnabled = false;
    // Пересоздаём снежинки при изменении размера
    snowflakes.length = 0;
    initSnowflakes();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Загрузка ресурсов
let resourcesLoaded = 0;
const resources = [birdImg, bgImg, fgImg, pipeNorthImg, pipeSouthImg, coinImg];
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
    document.addEventListener('touchend', () => {
        lastTouchTime = 0;
    }, { passive: false });

    initSnowflakes();
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
    coins = [];
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
        velocity = 0;
        return;
    }

    velocity += gravity;
    birdY += velocity;

    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
    if (birdY + birdHeight > canvas.height - groundHeight) {
        die();
        return;
    }

    frameCount++;

    // Генерация труб и монеток
    if (frameCount % Math.floor(pipeSpacing / pipeSpeed) === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - groundHeight - pipeGap - minHeight;
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        pipes.push({
            x: canvas.width,
            y: pipeHeight - canvas.height,
            scored: false
        });
        // 50% шанс появления монетки
        if (Math.random() > 0.5) {
            coins.push({
                x: canvas.width + pipeWidth / 2,
                y: pipeHeight + pipeGap / 2,
                collected: false
            });
        }
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < birdX && !pipe.scored) {
            score++;
            pipe.scored = true;
            playSound(scoreSound);
        }

        if (checkCollision(pipe)) {
            die();
            return;
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    coins.forEach((coin, index) => {
        coin.x -= pipeSpeed;
        if (!coin.collected &&
            Math.abs(coin.x - birdX) < birdWidth / 2 &&
            Math.abs(coin.y - birdY) < birdHeight / 2) {
            score++;
            coin.collected = true;
            playSound(scoreSound);
        }
        if (coin.x < -30) {
            coins.splice(index, 1);
        }
    });

    bgX -= 0.2;
    if (bgX <= -bgImg.width) bgX = 0;
    updateSnowflakes();
}

// Проверка столкновений
function checkCollision(pipe) {
    const hitboxScale = 0.8;
    const hitboxWidth = birdWidth * hitboxScale;
    const hitboxHeight = birdHeight * hitboxScale;
    const hitboxX = birdX + (birdWidth - hitboxWidth) / 2;
    const hitboxY = birdY + (birdHeight - hitboxHeight) / 2;
    const hitboxRight = hitboxX + hitboxWidth;
    const hitboxBottom = hitboxY + hitboxHeight;

    if (hitboxRight > pipe.x && hitboxX < pipe.x + pipeWidth &&
        hitboxY < pipe.y + canvas.height) {
        return true;
    }

    const bottomY = pipe.y + canvas.height + pipeGap;
    if (hitboxRight > pipe.x && hitboxX < pipe.x + pipeWidth &&
        hitboxBottom > bottomY) {
        return true;
    }

    return false;
}

// Отрисовка
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Бесшовный фон
    if (bgImg.complete) {
        const bgWidth = bgImg.width;
        let x = bgX % bgWidth;
        while (x < canvas.width) {
            ctx.drawImage(bgImg, x, 0, bgWidth, canvas.height);
            x += bgWidth;
        }
    } else {
        ctx.fillStyle = '#70C5CE';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Снежинки
    renderSnowflakes();

    if (gameState === 'playing' || gameState === 'over') {
        pipes.forEach(pipe => {
            ctx.drawImage(pipeNorthImg, pipe.x, pipe.y, pipeWidth, canvas.height);
            ctx.drawImage(pipeSouthImg, pipe.x, pipe.y + canvas.height + pipeGap, pipeWidth, canvas.height);
        });
        if (fgImg.complete) {
            const fgWidth = fgImg.width;
            let x = fgX % fgWidth;
            while (x < canvas.width) {
                ctx.drawImage(fgImg, x, canvas.height - groundHeight, fgWidth, groundHeight);
                x += fgWidth;
            }
        }
        coins.forEach(coin => {
            if (!coin.collected && coinImg.complete) {
                ctx.drawImage(coinImg, coin.x - 15, coin.y - 15, 30, 30);
            }
        });
    }

    if (birdImg.complete) {
        ctx.save();
        ctx.translate(birdX + birdWidth / 2, birdY + birdHeight / 2);
        ctx.rotate(Math.min(velocity * 0.1, Math.PI / 4));
        ctx.drawImage(birdImg, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);
        ctx.restore();
    } else {
        ctx.fillStyle = '#FF0';
        ctx.fillRect(birdX, birdY, birdWidth, birdHeight);
    }

    // Новогодний стиль текста
    ctx.fillStyle = '#FF0000'; // Красный
    ctx.strokeStyle = '#008000'; // Зелёный
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px "Comic Sans MS", Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFF';
    ctx.shadowBlur = 10;
    ctx.strokeText(score, canvas.width / 2, 80);
    ctx.fillText(score, canvas.width / 2, 80);

    if (gameState === 'start') {
        ctx.font = 'bold 36px "Comic Sans MS", Arial';
        ctx.strokeText('🎄 Лети, Санта! ❄️', canvas.width / 2, canvas.height / 2);
        ctx.fillText('🎄 Лети, Санта! ❄️', canvas.width / 2, canvas.height / 2);
    }

    if (gameState === 'over') {
        ctx.font = 'bold 48px "Comic Sans MS", Arial';
        ctx.strokeText('❄️ Сани разбиты! ❄️', canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText('❄️ Сани разбиты! ❄️', canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = 'bold 36px "Comic Sans MS", Arial';
        ctx.strokeText(`Счёт: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Счёт: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(`Рекорд: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText(`Рекорд: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.strokeText('🎅 Нажми для рестарта 🎅', canvas.width / 2, canvas.height / 2 + 100);
        ctx.fillText('🎅 Нажми для рестарта 🎅', canvas.width / 2, canvas.height / 2 + 100);
    }
    ctx.shadowBlur = 0; // Сбрасываем тень
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
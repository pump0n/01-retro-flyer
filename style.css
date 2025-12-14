* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: #87CEEB;
    color: #333;
    font-family: 'Press Start 2P', cursive;
    overflow: hidden;
    height: 100vh;
    position: relative;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

#loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #87CEEB;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.3s;
}

.logo {
    text-align: center;
    margin-bottom: 30px;
}

.logo-text {
    font-size: 2.5em;
    color: #FF4500;
    letter-spacing: 2px;
    text-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
}

.logo-subtext {
    font-size: 2em;
    color: #FFD700;
    letter-spacing: 2px;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.loading-bar {
    width: 250px;
    height: 15px;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid #333;
    border-radius: 0;
    overflow: hidden;
    margin: 20px 0;
}

#loading-progress {
    width: 0%;
    height: 100%;
    background: #FFD700;
    transition: width 0.3s;
}

.loading-text {
    font-size: 1em;
    color: #333;
    letter-spacing: 1px;
}

#game-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    touch-action: manipulation; /* Изменено для лучшего touch в Telegram */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}

#game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: #87CEEB; /* Fallback для не загруженного bg */
}

.status-bar {
    position: fixed;
    top: 10px;
    left: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    z-index: 20;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    display: flex;
    gap: 20px;
}

.audio-control {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.7);
    border: 2px solid #333;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    font-weight: bold;
    color: #333;
    font-size: 14px;
    user-select: none;
}

.main-menu, .game-over-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    display: none; /* По умолчанию скрыто */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(5px); /* Лучше для Telegram */
}

.main-menu.active, .game-over-menu.active {
    display: flex;
}

.menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
    text-align: center;
}

.menu-title {
    font-size: 32px;
    color: #FF4500;
    letter-spacing: 2px;
    margin-bottom: 10px;
    text-shadow: 0 0 5px rgba(255, 69, 0, 0.3);
}

.menu-subtitle {
    font-size: 16px;
    color: #333;
    margin-bottom: 30px;
    max-width: 300px;
    line-height: 1.4;
}

.btn {
    background: linear-gradient(to bottom, #FFD700, #FFA500);
    color: #333;
    border: 2px solid #333;
    padding: 14px 0;
    font-family: 'Press Start 2P', cursive;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0;
    text-shadow: none;
    transition: all 0.1s;
    box-shadow: 0 3px 0 #333;
    min-height: 50px;
    width: 240px;
    letter-spacing: 1px;
    touch-action: manipulation; /* Для touch */
}

.btn:hover, .btn:active {
    background: linear-gradient(to bottom, #FFCC00, #FF9900);
    transform: translateY(3px);
    box-shadow: 0 0 0 #333;
}

.btn-leaderboard {
    background: linear-gradient(to bottom, #90EE90, #7CFC00);
}

.btn-share {
    background: linear-gradient(to bottom, #87CEEB, #4682B4);
}

.game-over {
    background: rgba(255, 255, 255, 0.95);
    border: 3px solid #333;
    padding: 25px;
    text-align: center;
    width: 280px;
    z-index: 1000;
    border-radius: 0;
}

.score-display {
    font-size: 26px;
    color: #FF4500;
    margin-bottom: 20px;
    font-weight: bold;
    text-shadow: 0 0 3px rgba(255, 69, 0, 0.3);
}

.game-over .menu-title {
    font-size: 26px;
    margin-bottom: 15px;
}

.start-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    color: #FFFFFF;
    z-index: 50;
    backdrop-filter: blur(2px);
}

.start-screen.active {
    display: flex;
}

.start-text {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.start-subtext {
    font-size: 18px;
    opacity: 0.9;
    text-shadow: 0 0 3px rgba(255, 255, 255, 0.6);
}

/* Адаптивность */
@media (max-width: 480px) {
    .logo-text { font-size: 2em; }
    .logo-subtext { font-size: 1.6em; }
    .menu-title { font-size: 26px; }
    .btn { width: 220px; padding: 12px 0; font-size: 14px; }
    .game-over { width: 260px; }
    .start-text { font-size: 24px; }
    .start-subtext { font-size: 16px; }
    .loading-bar { width: 200px; }
    .status-bar { font-size: 12px; gap: 10px; }
}

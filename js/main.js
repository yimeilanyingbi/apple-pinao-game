/**
 * 游戏入口模块
 * @module main
 */
import { initGame, bindClickEvent, unbindClickEvent, resetScore } from './game.js';
import { startCountDown, restartGame, resetGameState } from './timer.js';
import { dom } from './dom.js';
import { getInitTime, setInitTime, getBallSpeed, setBallSpeed } from './config.js';

/**
 * 开始游戏
 */
function startGame() {
    dom.startMenu.style.display = 'none';
    // 不立即开始倒计时，等待用户点击
}

/**
 * 返回开始菜单
 */
function backToMenu() {
    dom.over.style.display = 'none';
    dom.mask.style.display = 'none';
    unbindClickEvent();
    
    // 重置游戏状态
    resetGameState();
    resetScore();
    
    initGame(); // 重新初始化游戏，生成红球
    bindClickEvent();
    dom.startMenu.style.display = 'flex';
}

/**
 * 进入设置页面
 */
function openSettings() {
    dom.startMenu.style.display = 'none';
    dom.settingsMenu.style.display = 'flex';
}

/**
 * 从设置页面返回开始菜单
 */
function backFromSettings() {
    // 保存设置
    const gameTimeInput = document.getElementById('game-time');
    if (gameTimeInput) {
        const gameTime = parseFloat(gameTimeInput.value);
        if (!isNaN(gameTime) && gameTime >= 1 && gameTime <= 60) {
            setInitTime(gameTime);
            dom.timer.textContent = gameTime.toFixed(2);
        }
    }
    
    const ballSpeedInput = document.getElementById('ball-speed');
    if (ballSpeedInput) {
        let ballSpeed = parseFloat(ballSpeedInput.value);
        if (!isNaN(ballSpeed)) {
            // 确保速度在有效范围内
            if (ballSpeed < 0.01) {
                ballSpeed = 0.01;
                ballSpeedInput.value = ballSpeed;
            } else if (ballSpeed > 2) {
                ballSpeed = 2;
                ballSpeedInput.value = ballSpeed;
            }
            setBallSpeed(ballSpeed);
        }
    }
    
    dom.settingsMenu.style.display = 'none';
    dom.startMenu.style.display = 'flex';
}

/**
 * 绑定菜单事件
 */
function bindMenuEvents() {
    dom.startBtn.addEventListener('click', startGame);
    dom.settingsBtn.addEventListener('click', openSettings);
    dom.backToMenuBtn.addEventListener('click', backToMenu);
    dom.backFromSettingsBtn.addEventListener('click', backFromSettings);
}

window.onload = () => {
    initGame();
    bindClickEvent();
    bindMenuEvents();
    dom.timer.textContent = getInitTime().toFixed(2);
    
    // 初始化设置界面的值
    const gameTimeInput = document.getElementById('game-time');
    if (gameTimeInput) {
        gameTimeInput.value = getInitTime();
    }
    
    const ballSpeedInput = document.getElementById('ball-speed');
    if (ballSpeedInput) {
        ballSpeedInput.value = getBallSpeed();
    }
};
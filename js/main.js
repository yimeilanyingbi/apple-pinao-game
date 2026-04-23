/**
 * 游戏入口模块
 * @module main
 */
import { initGame, bindClickEvent, unbindClickEvent } from './game.js';
import { startCountDown, restartGame } from './timer.js';
import { dom } from './dom.js';
import { INIT_TIME } from './config.js';

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
    dom.startMenu.style.display = 'flex';
}

/**
 * 绑定菜单事件
 */
function bindMenuEvents() {
    dom.startBtn.addEventListener('click', startGame);
    dom.backToMenuBtn.addEventListener('click', backToMenu);
}

window.onload = () => {
    initGame();
    bindClickEvent();
    bindMenuEvents();
    dom.timer.textContent = INIT_TIME.toFixed(2);
};
/**
 * 游戏入口模块
 * @module main
 */
import { initGame, bindClickEvent, unbindClickEvent, resetScore } from './game.js';
import { startCountDown, restartGame, resetGameState } from './timer.js';
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
    dom.timer.textContent = INIT_TIME.toFixed(2);
};
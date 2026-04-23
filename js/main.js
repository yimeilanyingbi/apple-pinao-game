/**
 * 游戏入口模块
 * @module main
 */
import { initGame, bindClickEvent } from './game.js';
import { dom } from './dom.js';
import { INIT_TIME } from './config.js';

window.onload = () => {
    initGame();
    bindClickEvent();
    dom.timer.textContent = INIT_TIME.toFixed(2);
};
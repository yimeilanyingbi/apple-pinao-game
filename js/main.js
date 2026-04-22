/**
 * 游戏入口模块
 * @module main
 */
import { initGame, bindClickEvent } from './game.js';

window.onload = () => {
    initGame();
    bindClickEvent();
};
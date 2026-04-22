/**
 * 游戏入口模块
 * 页面加载完成后初始化游戏
 * @module main
 */
import { initGrid, bindClickEvent } from './game.js';
import { initBalls } from './ball.js';

/**
 * 页面加载完成后执行初始化
 * 确保DOM元素加载完毕
 */
window.onload = () => {
    initGrid();
    initBalls();
    bindClickEvent();
};
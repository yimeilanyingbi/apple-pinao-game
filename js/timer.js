/**
 * 游戏倒计时与状态管理模块
 * 负责游戏计时、状态控制、游戏结束逻辑
 * @module timer
 */
import { dom } from './dom.js';
import { INIT_TIME } from './config.js';
import { destroyAllBalls, initGrid, bindClickEvent, unbindClickEvent, resetScore } from './game.js';
import { initBalls } from './ball.js';

// 私有化变量 - 禁止外部直接修改，保证数据安全
/** 剩余时间（秒） */
let _time = INIT_TIME;
/** 游戏是否已开始 */
let _isStart = false;
/** 游戏是否已结束 */
let _isEnded = false;
/** 动画帧ID（用于取消倒计时动画） */
let animationFrameId = null;
/** 游戏开始时间戳 */
let _gameStartTime = 0;

// 兼容性能计时API，优先使用performance.now（高精度）
const now = performance?.now?.bind(performance) || Date.now;

/**
 * 获取当前剩余时间
 * @returns {number} 剩余秒数
 */
export function getTime() { return _time; }

/**
 * 判断游戏是否已开始
 * @returns {boolean} 游戏开始状态
 */
export function isGameStarted() { return _isStart; }

/**
 * 判断游戏是否已结束
 * @returns {boolean} 游戏结束状态
 */
export function isGameOver() { return _isEnded; }

/**
 * 启动游戏倒计时
 * 使用requestAnimationFrame实现高精度计时（10ms更新一次）
 */
export function startCountDown() {
    if (_isStart || _isEnded) return;
    _isStart = true;
    _gameStartTime = now();

    let lastTime = now();

    function tick(currentTime) {
        if (!_isStart || _isEnded) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        const delta = currentTime - lastTime;
        if (delta >= 10) {
            _time = Math.max(0, _time - 0.01);
            dom.timer.textContent = _time.toFixed(2);
            lastTime = currentTime;
        }

        if (_time > 0) {
            animationFrameId = requestAnimationFrame(tick);
        } else {
            stopGame();
        }
    }

    animationFrameId = requestAnimationFrame(tick);
}

/**
 * 终止游戏（游戏结束逻辑）
 * 清理定时器、销毁小球、显示结束弹窗
 */
export function stopGame() {
    _isEnded = true;
    _isStart = false;
    cancelAnimationFrame(animationFrameId);

    destroyAllBalls();

    const gameDuration = (now() - _gameStartTime) / 1000;
    const score = parseInt(dom.score.textContent) || 0;
    const cps = gameDuration > 0 ? (score / gameDuration).toFixed(2) : '0.00';
    
    dom.mask.style.display = 'block';
    dom.final.textContent = dom.score.textContent;
    dom.cps.textContent = cps;
    dom.over.style.display = 'block';
    
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.onclick = restartGame;
    }
}

/**
 * 重新开始游戏
 */
export function restartGame() {
    _time = INIT_TIME;
    _isStart = false;
    _isEnded = false;
    _gameStartTime = 0;
    
    dom.timer.textContent = _time.toFixed(2);
    dom.mask.style.display = 'none';
    dom.over.style.display = 'none';
    
    unbindClickEvent();
    destroyAllBalls();
    resetScore();
    
    if (dom.box) {
        dom.box.innerHTML = '';
    }
    
    initGrid();
    initBalls();
    bindClickEvent();
}
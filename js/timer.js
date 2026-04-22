/**
 * 游戏倒计时与状态管理模块
 * 负责游戏计时、状态控制、游戏结束逻辑
 * @module timer
 */
import { dom } from './dom.js';
import { INIT_TIME } from './config.js';
import { clearAllBallTimers, destroyAllBalls, initGrid, bindClickEvent, unbindClickEvent, getScore, resetScore } from './game.js';
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
    // 防止重复启动
    if (_isStart || _isEnded) return;
    _isStart = true;
    _gameStartTime = now(); // 记录游戏开始时间

    let lastTime = now(); // 上一次计时时间

    /**
     * 倒计时核心逻辑
     * @param {number} currentTime - 当前时间戳（由requestAnimationFrame传入）
     */
    function tick(currentTime) {
        // 游戏未开始/已结束则取消动画帧
        if (!_isStart || _isEnded) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // 计算时间差，每10ms更新一次时间（避免高频更新）
        const delta = currentTime - lastTime;
        if (delta >= 10) {
            _time = Math.max(0, _time - 0.01); // 每次减0.01秒（10ms），最小为0
            dom.timer.textContent = _time.toFixed(2); // 保留两位小数显示
            lastTime = currentTime;
        }

        // 时间未到则继续请求动画帧
        if (_time > 0) {
            animationFrameId = requestAnimationFrame(tick);
        } else {
            // 时间到则结束游戏
            stopGame();
        }
    }

    // 启动首次动画帧
    animationFrameId = requestAnimationFrame(tick);
}

/**
 * 终止游戏（游戏结束逻辑）
 * 清理定时器、销毁小球、显示结束弹窗
 */
export function stopGame() {
    // 更新游戏状态
    _isEnded = true;
    _isStart = false;
    // 取消倒计时动画
    cancelAnimationFrame(animationFrameId);

    // 清理小球相关定时器和DOM元素
    clearAllBallTimers();
    destroyAllBalls();

    // 计算CPS (Clicks Per Second)
    const gameDuration = (now() - _gameStartTime) / 1000; // 转换为秒
    const score = parseInt(dom.score.textContent) || 0;
    const cps = gameDuration > 0 ? (score / gameDuration).toFixed(2) : '0.00';
    
    // 显示游戏结束遮罩和弹窗
    dom.mask.style.display = 'block';
    dom.final.textContent = dom.score.textContent; // 显示最终得分
    dom.cps.textContent = cps; // 显示CPS
    dom.over.style.display = 'block';
    
    // 绑定重新开始按钮点击事件
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.onclick = restartGame;
    }
}

/**
 * 重新开始游戏
 */
export function restartGame() {
    // 重置游戏状态
    _time = INIT_TIME;
    _isStart = false;
    _isEnded = false;
    _gameStartTime = 0;
    
    // 重置DOM显示
    dom.timer.textContent = _time.toFixed(2);
    dom.mask.style.display = 'none';
    dom.over.style.display = 'none';
    
    // 清理并重新初始化游戏
    unbindClickEvent();
    destroyAllBalls();
    resetScore(); // 重置分数
    
    // 清空游戏容器
    if (dom.box) {
        dom.box.innerHTML = '';
    }
    
    // 重新初始化游戏
    initGrid();
    initBalls();
    bindClickEvent();
}

/**
 * 页面卸载前清理资源
 * 防止内存泄漏
 */
window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
    clearAllBallTimers();
});
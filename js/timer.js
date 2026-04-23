/**
 * 游戏倒计时与状态管理模块
 * 负责游戏计时、状态控制、游戏结束逻辑
 * @module timer
 */
import { dom } from './dom.js';
import { getInitTime, GAME_OVER } from './config.js';
import { destroyAllBalls, initGame, bindClickEvent, unbindClickEvent, resetScore } from './game.js';
import { flashAllBalls } from './ball.js';

// 私有化变量 - 禁止外部直接修改，保证数据安全
/** 剩余时间（秒） */
let _time = getInitTime();
/** 游戏是否已开始 */
let _isStart = false;
/** 游戏是否已结束 */
let _isEnded = false;
/** 游戏结束时间戳 */
let _gameEndTime = 0;
/** 动画帧ID（用于取消倒计时动画） */
let animationFrameId = null;
/** 游戏开始时间戳 */
let _gameStartTime = 0;
/** 点击允许的时间窗口（毫秒） */
const CLICK_ALLOWED_WINDOW = 100;
/** 游戏结束后的点击次数 */
let _endGameClicks = 0;

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
 * 判断是否允许点击（考虑时间窗口）
 * @returns {boolean} 是否允许点击
 */
export function isClickAllowed() {
    // 允许在游戏结束后的100毫秒内仍然接受点击
    const allowed = !_isEnded || (Date.now() - _gameEndTime) < CLICK_ALLOWED_WINDOW;
    if (allowed && _isEnded) {
        // 游戏结束后点击，增加计数
        _endGameClicks++;
    }
    return allowed;
}

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
    _gameEndTime = Date.now(); // 记录游戏结束时间戳
    cancelAnimationFrame(animationFrameId);

    // 显示"时间到"
    dom.timer.textContent = '时间到';

    // 让所有红球闪烁
    flashAllBalls(GAME_OVER.TIME_UP_FLASH_DURATION, GAME_OVER.TIME_UP_FLASH_INTERVAL);

    // 等待指定时间后显示游戏结束画面
    setTimeout(() => {
        // 确保所有点击事件都已处理
        setTimeout(() => {
            destroyAllBalls();
            const gameDuration = (now() - _gameStartTime) / 1000;
            const score = parseInt(dom.score.textContent) || 0;
            const cps = gameDuration > 0 ? (score / gameDuration).toFixed(2) : '0.00';
            
            dom.mask.style.display = 'block';
            dom.final.textContent = dom.score.textContent;
            dom.cps.textContent = cps;
            
            // 显示游戏结束后的点击次数
            let endClicksElement = document.getElementById('end-clicks');
            if (!endClicksElement) {
                // 如果元素不存在，创建它
                endClicksElement = document.createElement('div');
                endClicksElement.id = 'end-clicks';
                endClicksElement.style.cssText = `
                    margin-top: 10px;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                `;
                const overElement = document.getElementById('over');
                if (overElement) {
                    overElement.appendChild(endClicksElement);
                }
            }
            endClicksElement.innerHTML = `时间结束后点击: <span style="color: #ff4757; font-weight: bold;">${_endGameClicks}</span> 次<br><span style="font-size: 12px; color: #999;">(时间结束后100毫秒内的点击)</span>`;
            
            dom.over.style.display = 'block';
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.onclick = restartGame;
            }
        }, 100); // 确保点击事件处理完成
    }, GAME_OVER.TIME_UP_DISPLAY_DURATION);
}

/**
 * 重新开始游戏
 */
export function restartGame() {
    _time = getInitTime();
    _isStart = false;
    _isEnded = false;
    _gameEndTime = 0;
    _endGameClicks = 0;
    _gameStartTime = 0;

    dom.timer.textContent = _time.toFixed(2);
    dom.mask.style.display = 'none';
    dom.over.style.display = 'none';

    unbindClickEvent();
    destroyAllBalls();
    resetScore();

    initGame();
    bindClickEvent();
    // 不立即开始倒计时，等待用户点击
}

/**
 * 重置游戏状态
 * 用于返回开始菜单时重置所有游戏状态
 */
export function resetGameState() {
    _time = getInitTime();
    _isStart = false;
    _isEnded = false;
    _gameEndTime = 0;
    _endGameClicks = 0;
    _gameStartTime = 0;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    dom.timer.textContent = _time.toFixed(2);
}

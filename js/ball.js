/**
 * 小球和颜色管理模块
 * 负责小球数据结构、颜色处理、小球创建和管理
 * @module ball
 */
import { getConfig, ANIMATION, GAME_CONFIG, getBallSpeed } from './config.js';

/** 预计算颜色RGB值（避免每次创建临时Canvas） */
export const COLOR_RGB = {
    NORMAL: { r: 255, g: 0, b: 0 },      // 红色 'red'
    LIGHT: { r: 255, g: 102, b: 102 }    // 浅红 '#ff6666'
};

/**
 * 颜色插值函数（使用预计算的RGB值）
 * @param {Object} c1 - 起始颜色RGB {r, g, b}
 * @param {Object} c2 - 结束颜色RGB {r, g, b}
 * @param {number} t - 插值因子（0-1）
 * @returns {string} 插值后的颜色值
 */
export function lerpColor(c1, c2, t) {
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 存储所有小球数据的数组
 */
export const balls = [];

/**
 * 小球初始位置集合 [行, 列]
 */
export const initPos = [[0, 3], [1, 0], [2, 1], [3, 0], [4, 1]];

/**
 * 创建单个小球
 * @param {number} row - 小球所在行
 * @param {number} col - 小球所在列
 * @param {boolean} [isAnimate=true] - 是否启用下落动画
 * @returns {Object|null} 创建的小球数据对象（非法参数返回null）
 */
export function createBall(row, col, isAnimate = true) {
    const gameConfig = getConfig();
    const { cellSize, gap, cols } = gameConfig;

    if (
        !Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || col < 0 || col >= cols
    ) {
        return null;
    }

    const targetX = col * (cellSize + gap) + gap + cellSize / 2;
    const targetY = row * (cellSize + gap) + gap + cellSize / 2;

    const ball = {
        row,
        col,
        clicked: false,
        opacity: 1,
        colorProgress: 0,
        targetX,
        targetY,
        currentX: targetX,
        currentY: isAnimate ? -cellSize : targetY,
        isAnimating: isAnimate,
        animationProgress: 0
    };

    balls.push(ball);

    return ball;
}

/**
 * 移动所有小球（向下移动一行）
 * 处理小球出界销毁逻辑
 * @param {Function} [callback] - 移动完成后的回调函数
 */
export function moveAllBalls(callback) {
    const gameConfig = getConfig();
    const { rows, cellSize, gap } = gameConfig;

    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        ball.row++;

        const newTargetY = ball.row * (cellSize + gap) + gap + cellSize / 2;

        ball.targetY = newTargetY;
        ball.isAnimating = true;
        ball.animationProgress = 0;

        if (ball.row >= rows) {
            ball.opacity = 0.9;
            setTimeout(() => {
                const idx = balls.findIndex(x => x === ball);
                if (idx !== -1) balls.splice(idx, 1);
                if (typeof callback === 'function') callback();
            }, 300);
        }
    }
}

/**
 * 在顶部随机列创建新小球
 * 优先选择无小球的列，避免重叠
 * @returns {Object|null} 创建的小球数据对象
 */
export function addNewBallTop() {
    const gameConfig = getConfig();
    const { cols } = gameConfig;
    const used = new Set();
    balls.forEach(b => {
        if (b.row === 0) used.add(b.col);
    });

    const empty = [];
    for (let c = 0; c < cols; c++) {
        if (!used.has(c)) empty.push(c);
    }

    if (empty.length) {
        const randCol = empty[Math.floor(Math.random() * empty.length)];
        return createBall(0, randCol, true);
    } else {
        const randCol = Math.floor(Math.random() * cols);
        const oldIndex = balls.findIndex(b => b.row === 0 && b.col === randCol);
        if (oldIndex !== -1) {
            balls.splice(oldIndex, 1);
        }
        return createBall(0, randCol, true);
    }
}

/**
 * 初始化初始小球
 * 根据initPos数组创建初始位置的小球
 */
export function initBalls() {
    const gameConfig = getConfig();
    balls.length = 0;

    initPos.forEach(([r, c]) => {
        if (r >= 0 && r < gameConfig.rows && c >= 0 && c < gameConfig.cols) {
            createBall(r, c, false);
        }
    });
}

/**
 * 销毁所有小球
 */
export function destroyAllBalls() {
    balls.length = 0; // 清空数组
}

/**
 * 处理小球动画
 * @returns {boolean} 是否有活跃的动画
 */
export function processBallAnimations() {
    let hasActiveAnimations = false;

    balls.forEach(ball => {
        if (ball.isAnimating) {
            hasActiveAnimations = true;

            const speed = getBallSpeed();
            if (speed >= 1.0) {
                // 速度超过1.0时，瞬间完成动画
                ball.animationProgress = 1;
                ball.isAnimating = false;
            } else {
                ball.animationProgress += speed;
                if (ball.animationProgress >= 1) {
                    ball.animationProgress = 1;
                    ball.isAnimating = false;
                }
            }

            const progress = easeOutCubic(ball.animationProgress);
            ball.currentY = ball.currentY + (ball.targetY - ball.currentY) * progress;
        }

        if (GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION && ball.clicked && ball.colorProgress < 1) {
            hasActiveAnimations = true;
            ball.colorProgress += ANIMATION.COLOR_TRANSITION_SPEED;
            if (ball.colorProgress >= 1) {
                ball.colorProgress = 1;
            }
        }

        if (!GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION && ball.clicked) {
            ball.colorProgress = 1;
        }

        if (ball.opacity < 1) {
            hasActiveAnimations = true;
            ball.opacity -= ANIMATION.FADE_OUT_SPEED;
            if (ball.opacity <= 0) {
                ball.opacity = 0;
            }
        }
    });

    return hasActiveAnimations;
}

/**
 * 缓动函数：easeOutCubic
 * @param {number} t - 动画进度（0-1）
 * @returns {number} 缓动后的进度
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * 让所有红球闪烁
 * @param {number} duration - 闪烁持续时间（毫秒）
 * @param {number} interval - 颜色切换间隔时间（毫秒）
 */
export function flashAllBalls(duration, interval) {
    let flashIndex = 0;
    let isFlashing = false;
    const originalStates = [];
    const totalToggles = Math.floor(duration / interval);

    // 保存所有球的原始状态
    balls.forEach(ball => {
        originalStates.push({
            clicked: ball.clicked,
            isFlashing: ball.isFlashing
        });
    });

    function toggleColor() {
        // 让所有球都参与闪烁，无论之前的状态如何
        balls.forEach(ball => {
            ball.isFlashing = isFlashing;
        });

        isFlashing = !isFlashing;
        flashIndex++;

        if (flashIndex < totalToggles) {
            setTimeout(toggleColor, interval);
        } else {
            // 闪烁结束后恢复所有球的状态，但保留在闪烁期间的点击
            balls.forEach((ball, index) => {
                // 只恢复isFlashing状态，保留clicked状态（可能在闪烁期间被点击）
                ball.isFlashing = originalStates[index].isFlashing;
            });
        }
    }

    toggleColor();
}

/**
 * 小球和颜色管理模块
 * 负责小球数据结构、颜色处理、小球创建和管理
 * @module ball
 */
import { getConfig, ANIMATION, COLORS, GAME_CONFIG } from './config.js';

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
    // 线性插值
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

    // 参数合法性校验
    if (
        !Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || col < 0 || col >= cols
    ) {
        return null;
    }

    // 计算目标位置
    const targetX = col * (cellSize + gap) + gap + cellSize / 2;
    const targetY = row * (cellSize + gap) + gap + cellSize / 2;

    // 创建小球数据对象
    const ball = {
        row,
        col,
        clicked: false,
        opacity: 1,
        colorProgress: 0, // 颜色过渡进度（0-1）
        // 动画相关属性
        targetX,
        targetY,
        currentX: targetX,
        currentY: isAnimate ? -cellSize : targetY, // 有动画则从顶部外开始
        isAnimating: isAnimate,
        animationProgress: 0
    };

    balls.push(ball); // 加入小球数组管理

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

    // 遍历所有小球
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        // 更新行号（向下移动一行）
        ball.row++;

        // 计算新的目标位置
        const newTargetY = ball.row * (cellSize + gap) + gap + cellSize / 2;

        // 更新目标位置并启动动画
        ball.targetY = newTargetY;
        ball.isAnimating = true;
        ball.animationProgress = 0;

        // 小球超出网格行数（出界）
        if (ball.row >= rows) {
            // 标记为开始渐隐
            ball.opacity = 0.9;
            // 从数组中移除
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
    // 收集第一行已被占用的列
    const used = new Set();
    balls.forEach(b => {
        if (b.row === 0) used.add(b.col);
    });

    // 找出第一行空列
    const empty = [];
    for (let c = 0; c < cols; c++) {
        if (!used.has(c)) empty.push(c);
    }

    // 有空列则随机选一个空列创建
    if (empty.length) {
        const randCol = empty[Math.floor(Math.random() * empty.length)];
        return createBall(0, randCol, true);
    } else {
        // 无空列则随机选一列，先销毁原有小球再创建
        const randCol = Math.floor(Math.random() * cols);
        const oldIndex = balls.findIndex(b => b.row === 0 && b.col === randCol);
        if (oldIndex !== -1) {
            balls.splice(oldIndex, 1); // 从数组中移除
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
    // 清空小球数组
    balls.length = 0;

    initPos.forEach(([r, c]) => {
        // 校验行列合法性
        if (r >= 0 && r < gameConfig.rows && c >= 0 && c < gameConfig.cols) {
            createBall(r, c, false); // 无动画创建小球
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

    // 遍历所有小球
    balls.forEach(ball => {
        // 处理下落动画
        if (ball.isAnimating) {
            hasActiveAnimations = true;

            // 更新动画进度（0-1）
            ball.animationProgress += ANIMATION.BALL_SPEED;
            if (ball.animationProgress >= 1) {
                ball.animationProgress = 1;
                ball.isAnimating = false;
            }

            // 使用缓动函数计算当前位置
            const progress = easeOutCubic(ball.animationProgress);
            ball.currentY = ball.currentY + (ball.targetY - ball.currentY) * progress;
        }

        // 处理颜色过渡动画（从红色渐变到浅红）
        if (GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION && ball.clicked && ball.colorProgress < 1) {
            hasActiveAnimations = true;
            ball.colorProgress += ANIMATION.COLOR_TRANSITION_SPEED;
            if (ball.colorProgress >= 1) {
                ball.colorProgress = 1;
            }
        }

        // 瞬间改变颜色模式
        if (!GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION && ball.clicked) {
            ball.colorProgress = 1;
        }

        // 处理出界渐隐动画
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

/**
 * 游戏核心逻辑模块
 * 负责网格初始化、点击事件、分数管理
 * @module game
 */
import { ROWS, COLS, CELL_SIZE, CELL_GAP, getConfig, ANIMATION, COLORS, GAME_CONFIG } from './config.js';
import { dom } from './dom.js';
import { isGameStarted, isGameOver, startCountDown } from './timer.js';
import { balls, initBalls, createBall, moveAllBalls, addNewBallTop, destroyAllBalls as destroyAllBallsInBallModule, processBallAnimations, COLOR_RGB, lerpColor } from './ball.js';

// 私有化分数 - 防止外部篡改，仅通过getScore获取
let _score = 0;

/** 点击事件处理器（用于解绑事件） */
let clickHandler = null;
/** Canvas上下文 */
let ctx = null;
/** 游戏配置 */
let gameConfig = getConfig();
/** 动画帧ID */
let animationFrameId = null;

/**
 * 获取当前得分（只读）
 * @returns {number} 当前分数
 */
export function getScore() {
    return _score;
}

/**
 * 重置分数为0
 */
export function resetScore() {
    _score = 0;
    dom.score.textContent = _score;
}

/**
 * 动画循环函数
 */
function animate() {
    // 处理小球动画
    const hasActiveAnimations = processBallAnimations();

    // 重绘小球
    drawBalls();

    // 如果还有动画，继续请求动画帧
    if (hasActiveAnimations) {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        animationFrameId = null;
    }
}

/**
 * 绘制游戏网格
 */
function drawGrid() {
    if (!ctx) return;

    const { rows, cols, cellSize, gap } = gameConfig;

    // 清空Canvas
    ctx.clearRect(0, 0, dom.box.width, dom.box.height);

    // 绘制网格背景
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, dom.box.width, dom.box.height);

    // 绘制格子
    ctx.fillStyle = '#fff';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * (cellSize + gap) + gap;
            const y = row * (cellSize + gap) + gap;
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

/**
 * 绘制所有小球
 */
function drawBalls() {
    if (!ctx) return;

    // 重新绘制网格
    drawGrid();

    const { cellSize } = gameConfig;
    const ballRadius = cellSize * 0.333;

    // 绘制每个小球
    balls.forEach(ball => {
        if (ball.opacity <= 0) return;

        // 使用当前位置（支持动画）
        const x = ball.currentX;
        const y = ball.currentY;

        // 计算颜色
        let color;
        if (GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION) {
            // 使用平滑过渡
            color = lerpColor(COLOR_RGB.NORMAL, COLOR_RGB.LIGHT, ball.colorProgress);
        } else {
            // 瞬间改变颜色
            color = ball.clicked ? COLORS.BALL_LIGHT : COLORS.BALL_NORMAL;
        }
        ctx.fillStyle = color;
        ctx.globalAlpha = ball.opacity;

        // 绘制小球
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // 重置透明度
        ctx.globalAlpha = 1;
    });
}

/**
 * 增加分数（内部方法）
 * 更新分数值并同步到DOM显示
 */
function addScore() {
    _score++;
    dom.score.textContent = _score;
}

// 兼容旧浏览器（Polyfill）：为Element添加closest方法
if (!Element.prototype.closest) {
    /**
     * 查找最近的匹配选择器的祖先元素（包括自身）
     * @param {string} s - CSS选择器
     * @returns {Element|null} 匹配的元素或null
     */
    Element.prototype.closest = function (s) {
        let el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

/**
 * 初始化游戏Canvas
 * 设置Canvas尺寸和上下文
 */
export function initGrid() {
    gameConfig = getConfig();
    const { rows, cols, cellSize, gap, isMobile } = gameConfig;

    // 设置移动端CSS变量
    if (isMobile) {
        dom.box.style.setProperty('--mobile-cell-size', `${cellSize}px`);
    }

    // 设置Canvas尺寸
    dom.box.width = cols * (cellSize + gap) + gap;
    dom.box.height = rows * (cellSize + gap) + gap;

    // 获取Canvas上下文
    ctx = dom.box.getContext('2d');

    // 绘制初始网格
    drawGrid();
}

/**
 * 绑定小球点击事件
 * 处理点击得分、小球移动、新球创建逻辑
 */
export function bindClickEvent() {
    /**
     * 点击事件处理器
     * @param {MouseEvent} e - 点击事件对象
     */
    clickHandler = (e) => {
        const { cellSize, gap, cols } = gameConfig;
        // 游戏结束则忽略点击
        if (isGameOver()) return;

        // 获取Canvas的位置信息
        const boxRect = dom.box.getBoundingClientRect();
        // 计算点击位置相对于Canvas的坐标
        const clickX = e.clientX - boxRect.left;
        // 根据水平坐标计算点击的列
        const clickedCol = Math.floor(clickX / (cellSize + gap));

        // 确保列号有效
        if (clickedCol < 0 || clickedCol >= cols) return;

        // 找出该列中所有有效的小球
        const colBalls = balls.filter(b =>
            !b.clicked &&
            b.col === clickedCol
        );

        if (colBalls.length === 0) return;

        // 找到该列中最底下的小球（行号最大的）
        let bottomBall = colBalls[0];
        let maxRow = bottomBall.row;

        for (let i = 1; i < colBalls.length; i++) {
            const currentRow = colBalls[i].row;
            if (currentRow > maxRow) {
                maxRow = currentRow;
                bottomBall = colBalls[i];
            }
        }

        // 确保该列中最底下的球也是全局最底下的球
        const validBalls = balls.filter(b => !b.clicked);
        if (validBalls.length === 0) return;
        const globalMaxRow = Math.max(...validBalls.map(b => b.row));

        // 如果该列中最底下的球的行号小于全局最大行号，则不允许点击
        if (maxRow < globalMaxRow) return;

        // 游戏未开始则启动倒计时
        if (!isGameStarted()) {
            startCountDown();
        }

        // 标记小球为已点击（防止重复点击）
        bottomBall.clicked = true;

        // 点击反馈闪烁效果（透明度变化）
        bottomBall.opacity = 0.5;
        setTimeout(() => {
            bottomBall.opacity = 1;
        }, ANIMATION.CLICK_FEEDBACK_DURATION);

        // 加分
        addScore();
        // 所有小球向下移动
        moveAllBalls();
        // 顶部创建新小球
        addNewBallTop();

        // 启动动画循环
        if (!animationFrameId) {
            animate();
        }
    };

    // 绑定点击事件到Canvas
    dom.box.addEventListener('click', clickHandler);
}

/**
 * 解绑点击事件
 * 防止内存泄漏
 */
export function unbindClickEvent() {
    if (clickHandler) {
        dom.box.removeEventListener('click', clickHandler);
        clickHandler = null;
    }
}

/**
 * 清理所有小球的定时器
 * 防止内存泄漏
 */
export function clearAllBallTimers() {
    // Canvas版本不需要清理定时器，因为没有DOM元素
}

/**
 * 销毁所有小球
 * 清理定时器并移除DOM元素
 */
export function destroyAllBalls() {
    clearAllBallTimers(); // 先清理定时器

    // 取消动画帧请求
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // 调用ball模块的destroyAllBalls函数
    destroyAllBallsInBallModule();
    drawBalls(); // 重绘Canvas
}

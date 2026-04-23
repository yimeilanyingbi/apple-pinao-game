/**
 * 游戏核心逻辑模块
 * 负责网格初始化、点击事件、分数管理
 * @module game
 */
import { getConfig, ANIMATION, COLORS, GAME_CONFIG } from './config.js';
import { dom } from './dom.js';
import { isGameStarted, isGameOver, isClickAllowed, startCountDown } from './timer.js';
import { balls, initBalls, moveAllBalls, addNewBallTop, destroyAllBalls as destroyAllBallsInBallModule, processBallAnimations, COLOR_RGB, lerpColor } from './ball.js';

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

function animate() {
    const hasActiveAnimations = processBallAnimations();
    drawGrid();
    drawBalls();

    if (hasActiveAnimations) {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        animationFrameId = null;
    }
}

function drawGrid() {
    if (!ctx) return;

    const { rows, cols, cellSize, gap } = gameConfig;

    // 只在必要时清除整个画布
    ctx.clearRect(0, 0, dom.box.width, dom.box.height);

    // 绘制背景
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, dom.box.width, dom.box.height);

    // 绘制网格
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * (cellSize + gap) + gap;
            const y = row * (cellSize + gap) + gap;
            ctx.rect(x, y, cellSize, cellSize);
        }
    }
    ctx.fill();
}

function drawBalls() {
    if (!ctx) return;

    const { cellSize } = gameConfig;
    const ballRadius = cellSize * 0.333;

    // 按颜色和透明度分组绘制，减少状态切换
    const ballsByColorAndOpacity = {};
    
    balls.forEach(ball => {
        if (ball.opacity <= 0) return;

        let color;
        if (ball.isFlashing) {
            color = COLORS.BALL_FLASH;
        } else if (GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION) {
            color = lerpColor(COLOR_RGB.NORMAL, COLOR_RGB.LIGHT, ball.colorProgress);
        } else {
            color = ball.clicked ? COLORS.BALL_LIGHT : COLORS.BALL_NORMAL;
        }

        // 为透明度创建分组键，使用固定小数位减少分组数量
        const opacityKey = ball.opacity.toFixed(2);
        const key = `${color}_${opacityKey}`;

        if (!ballsByColorAndOpacity[key]) {
            ballsByColorAndOpacity[key] = {
                color,
                opacity: ball.opacity,
                balls: []
            };
        }
        ballsByColorAndOpacity[key].balls.push(ball);
    });

    // 批量绘制相同颜色和透明度的小球
    Object.values(ballsByColorAndOpacity).forEach(group => {
        ctx.fillStyle = group.color;
        ctx.globalAlpha = group.opacity;
        ctx.beginPath();
        
        group.balls.forEach(ball => {
            const x = ball.currentX;
            const y = ball.currentY;
            ctx.moveTo(x + ballRadius, y);
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        });
        
        ctx.fill();
    });

    // 重置globalAlpha
    ctx.globalAlpha = 1;
}

function addScore() {
    _score++;
    dom.score.textContent = _score;
}

/**
 * 初始化游戏Canvas
 * 设置Canvas尺寸和上下文
 */
export function initCanvas() {
    gameConfig = getConfig();
    const { rows, cols, cellSize, gap, isMobile } = gameConfig;

    if (isMobile) {
        dom.box.style.setProperty('--mobile-cell-size', `${cellSize}px`);
    }

    dom.box.width = cols * (cellSize + gap) + gap;
    dom.box.height = rows * (cellSize + gap) + gap;

    ctx = dom.box.getContext('2d');
}

export function render() {
    if (!ctx) return;
    drawGrid();
    drawBalls();
}

export function initGame() {
    initBalls();
    initCanvas();
    render();
}

export function initGrid() {
    initCanvas();
    render();
}

export function bindClickEvent() {
    clickHandler = (e) => {
        const { cellSize, gap, cols } = gameConfig;
        if (!isClickAllowed()) return;

        const boxRect = dom.box.getBoundingClientRect();
        const clickX = e.clientX - boxRect.left;
        const clickedCol = Math.floor(clickX / (cellSize + gap));

        if (clickedCol < 0 || clickedCol >= cols) return;

        // 筛选当前列的未点击小球
        const colBalls = balls.filter(b => !b.clicked && b.col === clickedCol);
        if (colBalls.length === 0) return;

        // 找出当前列最底部的球
        let bottomBall = colBalls[0];
        let maxRow = bottomBall.row;

        for (let i = 1; i < colBalls.length; i++) {
            if (colBalls[i].row > maxRow) {
                maxRow = colBalls[i].row;
                bottomBall = colBalls[i];
            }
        }

        // 找出所有未点击小球中的最大行号
        let globalMaxRow = -1;
        for (const ball of balls) {
            if (!ball.clicked && ball.row > globalMaxRow) {
                globalMaxRow = ball.row;
            }
        }

        if (maxRow < globalMaxRow) return;

        if (!isGameStarted()) {
            startCountDown();
        }

        bottomBall.clicked = true;

        bottomBall.opacity = 0.5;
        setTimeout(() => {
            bottomBall.opacity = 1;
        }, ANIMATION.CLICK_FEEDBACK_DURATION);

        addScore();
        moveAllBalls();
        addNewBallTop();

        if (!animationFrameId) {
            animate();
        }
    };

    dom.box.addEventListener('click', clickHandler);
}

export function unbindClickEvent() {
    if (clickHandler) {
        dom.box.removeEventListener('click', clickHandler);
        clickHandler = null;
    }
}

export function destroyAllBalls() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    destroyAllBallsInBallModule();
    drawBalls();
}

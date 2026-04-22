/**
 * 游戏核心逻辑模块
 * 负责网格初始化、点击事件、分数管理
 * @module game
 */
import { getConfig, ANIMATION, COLORS, GAME_CONFIG } from './config.js';
import { dom } from './dom.js';
import { isGameStarted, isGameOver, startCountDown } from './timer.js';
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

    ctx.clearRect(0, 0, dom.box.width, dom.box.height);

    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, dom.box.width, dom.box.height);

    ctx.fillStyle = '#fff';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * (cellSize + gap) + gap;
            const y = row * (cellSize + gap) + gap;
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

function drawBalls() {
    if (!ctx) return;

    drawGrid();

    const { cellSize } = gameConfig;
    const ballRadius = cellSize * 0.333;

    balls.forEach(ball => {
        if (ball.opacity <= 0) return;

        const x = ball.currentX;
        const y = ball.currentY;

        let color;
        if (GAME_CONFIG.USE_SMOOTH_COLOR_TRANSITION) {
            color = lerpColor(COLOR_RGB.NORMAL, COLOR_RGB.LIGHT, ball.colorProgress);
        } else {
            color = ball.clicked ? COLORS.BALL_LIGHT : COLORS.BALL_NORMAL;
        }
        ctx.fillStyle = color;
        ctx.globalAlpha = ball.opacity;

        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    });
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
        if (isGameOver()) return;

        const boxRect = dom.box.getBoundingClientRect();
        const clickX = e.clientX - boxRect.left;
        const clickedCol = Math.floor(clickX / (cellSize + gap));

        if (clickedCol < 0 || clickedCol >= cols) return;

        const colBalls = balls.filter(b =>
            !b.clicked &&
            b.col === clickedCol
        );

        if (colBalls.length === 0) return;

        let bottomBall = colBalls[0];
        let maxRow = bottomBall.row;

        for (let i = 1; i < colBalls.length; i++) {
            const currentRow = colBalls[i].row;
            if (currentRow > maxRow) {
                maxRow = currentRow;
                bottomBall = colBalls[i];
            }
        }

        const validBalls = balls.filter(b => !b.clicked);
        if (validBalls.length === 0) return;
        const globalMaxRow = Math.max(...validBalls.map(b => b.row));

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

/**
 * 游戏核心逻辑模块
 * 负责网格初始化、小球创建/移动/销毁、点击事件、分数管理
 * @module game
 */
import { ROWS, COLS, CELL_SIZE, CELL_GAP } from './config.js';
import { dom } from './dom.js';
import { isGameStarted, isGameOver, startCountDown } from './timer.js';

// 私有化分数 - 防止外部篡改，仅通过getScore获取
let _score = 0;
/** 存储所有小球DOM元素的数组 */
export const balls = [];
/** 小球初始位置集合 [行, 列] */
const initPos = [[0, 3], [1, 0], [2, 1], [3, 0], [4, 1]];

/** 点击事件处理器（用于解绑事件） */
let clickHandler = null;

/**
 * 获取当前得分（只读）
 * @returns {number} 当前分数
 */
export function getScore() {
    return _score;
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
 * 初始化游戏网格
 * 根据行数和列数创建格子DOM元素
 */
export function initGrid() {
    // 循环创建ROWS*COLS个格子
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell'; // 添加格子样式类
        dom.box.appendChild(cell); // 添加到游戏容器
    }
}

/**
 * 初始化初始小球
 * 根据initPos数组创建初始位置的小球
 */
export function initBalls() {
    initPos.forEach(([r, c]) => {
        // 校验行列合法性
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            createBall(r, c, false); // 无动画创建小球
        }
    });
}

/**
 * 创建单个小球
 * @param {number} row - 小球所在行
 * @param {number} col - 小球所在列
 * @param {boolean} [isAnimate=true] - 是否启用下落动画
 * @returns {Element|null} 创建的小球DOM元素（非法参数返回null）
 */
export function createBall(row, col, isAnimate = true) {
    // 参数合法性校验
    if (
        !Number.isInteger(row) || !Number.isInteger(col) ||
        row < 0 || col < 0 || col >= COLS
    ) {
        return null;
    }

    // 创建小球DOM元素
    const ball = document.createElement('div');
    ball.className = 'red-ball'; // 小球样式类
    ball.dataset.row = row; // 存储行数据（用于定位）
    ball.dataset.col = col; // 存储列数据（用于定位）

    // 计算小球定位坐标（居中显示在格子内）
    const targetX = col * CELL_GAP + CELL_SIZE / 2;
    const targetY = row * CELL_GAP + CELL_SIZE / 2;
    // 初始Y坐标：有动画则从顶部外开始，无动画则直接到目标位置
    const initY = isAnimate ? -CELL_GAP + CELL_SIZE / 2 : targetY;

    // 设置小球初始位置
    ball.style.left = `${targetX}px`;
    ball.style.top = `${initY}px`;
    dom.box.appendChild(ball); // 添加到游戏容器
    balls.push(ball); // 加入小球数组管理

    // 启用下落动画（异步更新样式触发过渡）
    if (isAnimate) {
        requestAnimationFrame(() => {
            ball.style.top = `${targetY}px`;
        });
    }

    return ball;
}

/**
 * 移动所有小球（向下移动一行）
 * 处理小球出界销毁逻辑
 */
export function moveAllBalls() {
    // 过滤出仍在游戏容器中的小球（排除已销毁的）
    const valid = balls.filter(b => b.parentElement === dom.box);
    
    valid.forEach(ball => {
        // 更新行号（向下移动一行）
        let row = parseInt(ball.dataset.row) + 1;
        ball.dataset.row = row;
        // 计算新的Y坐标
        const newY = row * CELL_GAP + CELL_SIZE / 2;

        // 动画更新位置
        requestAnimationFrame(() => {
            ball.style.top = `${newY}px`;
        });

        // 小球超出网格行数（出界）
        if (row >= ROWS) {
            ball.style.opacity = '0'; // 渐隐效果
            // 延迟销毁DOM元素（等待动画完成）
            ball.removeTimer = setTimeout(() => {
                if (ball.parentElement) ball.remove();
                // 从数组中移除
                const idx = balls.findIndex(x => x === ball);
                if (idx !== -1) balls.splice(idx, 1);
            }, 300);
        }
    });
}

/**
 * 在顶部随机列创建新小球
 * 优先选择无小球的列，避免重叠
 */
export function addNewBallTop() {
    // 收集第一行已被占用的列
    const used = new Set();
    balls.forEach(b => {
        if (b.dataset.row == 0) used.add(b.dataset.col);
    });

    // 找出第一行空列
    const empty = [];
    for (let c = 0; c < COLS; c++) {
        if (!used.has(c+'')) empty.push(c);
    }

    // 有空列则随机选一个空列创建
    if (empty.length) {
        const randCol = empty[Math.floor(Math.random() * empty.length)];
        createBall(0, randCol, true);
    } else {
        // 无空列则随机选一列，先销毁原有小球再创建
        const randCol = Math.floor(Math.random() * COLS);
        const old = balls.find(b => b.dataset.row == 0 && b.dataset.col == randCol);
        if (old) {
            clearTimeout(old.removeTimer); // 清理原有定时器
            old.remove(); // 移除DOM
            // 从数组中移除
            const idx = balls.findIndex(x => x === old);
            if (idx !== -1) balls.splice(idx, 1);
        }
        createBall(0, randCol, true);
    }
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
        // 游戏结束则忽略点击
        if (isGameOver()) return;

        // 找到点击的小球元素（兼容事件冒泡）
        const ball = e.target.closest('.red-ball');
        // 非小球/已点击过的小球则忽略
        if (!ball || ball.classList.contains('clicked')) return;

        // 游戏未开始则启动倒计时
        if (!isGameStarted()) {
            startCountDown();
        }

        // 标记小球为已点击（防止重复点击）
        ball.classList.add('clicked');
        // 加分
        addScore();
        // 所有小球向下移动
        moveAllBalls();
        // 顶部创建新小球
        addNewBallTop();
    };

    // 绑定点击事件到游戏容器（事件委托）
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
    balls.forEach(b => clearTimeout(b.removeTimer));
}

/**
 * 销毁所有小球
 * 清理定时器并移除DOM元素
 */
export function destroyAllBalls() {
    clearAllBallTimers(); // 先清理定时器
    balls.forEach(b => b.remove()); // 移除DOM
    balls.length = 0; // 清空数组
}
/**
 * 游戏核心配置常量
 * @module config
 */

/** 游戏网格行数 */
export const ROWS = 6;
/** 游戏网格列数 */
export const COLS = 4;
/** 单个格子尺寸（px）- 桌面端 */
export const CELL_SIZE = 120;
/** 格子之间的间隙（px） */
export const GAP = 2;
/** 格子总间隙（尺寸+间隙，用于定位计算）- 桌面端 */
export const CELL_GAP = CELL_SIZE + GAP;
/** 游戏初始倒计时时间（秒） */
export const INIT_TIME = 20.00;
/** 移动端阈值（屏幕宽度小于此值时使用移动端配置） */
export const MOBILE_THRESHOLD = 600;
/** 移动端单个格子尺寸（px） */
export const MOBILE_CELL_SIZE = Math.floor((window.innerWidth - 40 - GAP * (COLS + 1)) / COLS);
/** 移动端格子总间隙 */
export const MOBILE_CELL_GAP = MOBILE_CELL_SIZE + GAP;

/** 动画配置 */
export const ANIMATION = {
    /** 小球下落/移动动画速度（值越大越快） */
    BALL_SPEED: 0.01,
    /** 点击反馈动画时长（毫秒） */
    CLICK_FEEDBACK_DURATION: 100,
    /** 出界渐隐动画速度（值越大越快） */
    FADE_OUT_SPEED: 0.05,
    /** 点击后颜色过渡到浅红的速度（值越大越快） */
    COLOR_TRANSITION_SPEED: 0.03
};

/** 颜色配置 */
export const COLORS = {
    /** 普通小球颜色 */
    BALL_NORMAL: 'red',
    /** 点击后浅红球颜色 */
    BALL_LIGHT: '#ff6666'
};

/** 游戏配置开关 */
export const GAME_CONFIG = {
    /** 是否使用平滑颜色过渡（false为瞬间改颜色） */
    USE_SMOOTH_COLOR_TRANSITION: false
};

/**
 * 获取当前配置（根据屏幕尺寸动态返回）
 * @returns {Object} 当前配置对象
 */
export function getConfig() {
    const isMobile = window.innerWidth < MOBILE_THRESHOLD;
    return {
        rows: ROWS,
        cols: COLS,
        cellSize: isMobile ? MOBILE_CELL_SIZE : CELL_SIZE,
        gap: GAP,
        cellGap: isMobile ? MOBILE_CELL_SIZE + GAP : CELL_SIZE + GAP,
        isMobile
    };
}

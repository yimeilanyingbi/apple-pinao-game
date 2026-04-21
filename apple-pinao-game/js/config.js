/**
 * 游戏核心配置常量
 * @module config
 */

/** 游戏网格行数 */
export const ROWS = 6;
/** 游戏网格列数 */
export const COLS = 4;
/** 单个格子尺寸（px） */
export const CELL_SIZE = 120;
/** 格子之间的间隙（px） */
export const GAP = 2;
/** 格子总间隙（尺寸+间隙，用于定位计算） */
export const CELL_GAP = CELL_SIZE + GAP;
/** 游戏初始倒计时时间（秒） */
export const INIT_TIME = 20.00;
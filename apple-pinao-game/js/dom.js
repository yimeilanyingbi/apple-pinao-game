/**
 * DOM元素统一管理模块
 * 容错处理：防止元素不存在导致页面崩溃
 * @module dom
 */

// 带容错，防止页面崩溃
export const dom = {
    /** 游戏主容器 */
    box: document.getElementById('box') || document.createElement('div'),
    /** 倒计时计时器显示元素 */
    timer: document.getElementById('timer') || document.createElement('div'),
    /** 实时得分显示元素 */
    score: document.getElementById('score') || document.createElement('span'),
    /** 游戏结束弹窗容器 */
    over: document.getElementById('over') || document.createElement('div'),
    /** 最终得分显示元素 */
    final: document.getElementById('final') || document.createElement('span'),
    /** 游戏结束遮罩层 */
    mask: document.getElementById('mask') || document.createElement('div'),
};
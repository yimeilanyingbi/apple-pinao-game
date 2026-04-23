/**
 * DOM元素统一管理模块
 * 容错处理：防止元素不存在导致页面崩溃
 * @module dom
 */

export const dom = {
    box: document.getElementById('box') || document.createElement('div'),
    timer: document.getElementById('timer') || document.createElement('div'),
    score: document.getElementById('score') || document.createElement('span'),
    over: document.getElementById('over') || document.createElement('div'),
    final: document.getElementById('final') || document.createElement('span'),
    cps: document.getElementById('cps') || document.createElement('span'),
    mask: document.getElementById('mask') || document.createElement('div'),
    startMenu: document.getElementById('start-menu') || document.createElement('div'),
    startBtn: document.getElementById('start-btn') || document.createElement('button'),
    settingsBtn: document.getElementById('settings-btn') || document.createElement('button'),
};
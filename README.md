# 钢琴块红球游戏

一个基于Canvas的休闲点击类小游戏，玩家需要在规定时间内点击下落的红球获得分数。

## 功能特性

- ✅ Canvas渲染，性能流畅
- ✅ 响应式设计，支持移动端
- ✅ 垂直判定，点击列即可判定
- ✅ 只能点击最底下的红球
- ✅ 颜色过渡效果（可配置）
- ✅ 平滑动画效果
- ✅ 游戏结束CPS（每秒点击次数）统计
- ✅ 重新开始功能

## 技术栈

- HTML5 + CSS3
- JavaScript (ES6 Modules)
- Canvas 2D API

## 项目结构

```
apple-pinao-game/
├── index.html          # 游戏主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── ball.js         # 小球和颜色管理模块
│   ├── config.js       # 游戏配置模块
│   ├── dom.js          # DOM元素管理模块
│   ├── game.js         # 游戏核心逻辑模块
│   ├── main.js         # 游戏入口模块
│   └── timer.js        # 倒计时与状态管理模块
└── README.md           # 项目说明
```

## 安装和运行

### 方法1：直接打开

1. 下载或克隆项目到本地
2. 直接双击 `index.html` 文件在浏览器中打开

### 方法2：使用本地服务器（推荐）

由于使用了ES6模块，部分浏览器可能需要服务器环境：

**Node.js:**
```bash
npm install -g http-server
cd apple-pinao-game
http-server -c-1
```

**Python:**
```bash
# Python 3
cd apple-pinao-game
python -m http.server 8080

# Python 2
cd apple-pinao-game
python -m SimpleHTTPServer 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 游戏规则

1. 游戏时间为20秒
2. 点击下落的红球获得分数
3. 只能点击最底下的红球
4. 点击列的任何位置即可判定
5. 游戏结束后会显示最终得分和CPS
6. 点击"重新开始"按钮可以再次游戏

## 配置选项

在 `js/config.js` 文件中可以调整以下配置：

### 游戏配置
- `ROWS`: 游戏网格行数（默认6）
- `COLS`: 游戏网格列数（默认4）
- `CELL_SIZE`: 单个格子尺寸（默认120px）
- `INIT_TIME`: 初始倒计时时间（默认20秒）
- `MOBILE_THRESHOLD`: 移动端阈值（默认600px）

### 动画配置
- `BALL_SPEED`: 小球下落/移动动画速度
- `CLICK_FEEDBACK_DURATION`: 点击反馈动画时长
- `FADE_OUT_SPEED`: 出界渐隐动画速度
- `COLOR_TRANSITION_SPEED`: 颜色过渡速度

### 颜色配置
- `BALL_NORMAL`: 普通小球颜色
- `BALL_LIGHT`: 点击后浅红球颜色

### 游戏模式配置
- `USE_SMOOTH_COLOR_TRANSITION`: 是否使用平滑颜色过渡（默认false）

## 开发说明

### 模块职责

| 模块 | 主要职责 | 文件 |
|------|----------|------|
| 小球管理 | 小球创建、移动、颜色处理、动画 | `js/ball.js` |
| 游戏核心 | 网格初始化、点击事件、分数管理 | `js/game.js` |
| 配置管理 | 游戏常量和配置 | `js/config.js` |
| DOM管理 | DOM元素获取和管理 | `js/dom.js` |
| 计时器 | 倒计时和游戏状态管理 | `js/timer.js` |
| 入口 | 游戏初始化 | `js/main.js` |

### 性能优化

- 使用Canvas渲染代替DOM操作，提高性能
- 预计算颜色RGB值，避免频繁创建临时Canvas
- 使用requestAnimationFrame实现平滑动画
- 批量处理动画更新，减少重排

## 浏览器兼容性

- Chrome / Firefox / Safari / Edge 等现代浏览器
- 支持移动端浏览器

## 许可证

MIT License

## 更新日志

### v1.0.1
- 🐛 修复：初始小球不显示 Bug
- 🔧 重构：拆分 initGrid 为 initCanvas 和 render，降低模块耦合
- 📝 新增：统一初始化入口 initGame()，提高代码容错性

### v1.0.0
- ✨ 初始版本
- ✅ Canvas渲染实现
- ✅ 响应式设计
- ✅ 垂直判定
- ✅ 颜色过渡效果
- ✅ 游戏结束统计
- ✅ 重新开始功能

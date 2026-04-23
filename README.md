# Piano Tile Red Ball Game

## Language

- [English README](README.md)
- [Chinese README](README-CN.md)

A Canvas-based casual click game where players need to click on falling red balls within a specified time to score points.

## Features

- ✅ Canvas rendering for smooth performance
- ✅ Responsive design, supporting mobile devices
- ✅ Vertical判定, click on the column to judge
- ✅ Only click the bottom red ball
- ✅ Color transition effect (configurable)
- ✅ Smooth animation effects
- ✅ Game over CPS (clicks per second) statistics
- ✅ Restart functionality

## Tech Stack

- HTML5 + CSS3
- JavaScript (ES6 Modules)
- Canvas 2D API

## Project Structure

```
apple-pinao-game/
├── index.html          # Game main page
├── css/
│   └── style.css       # Style file
├── js/
│   ├── ball.js         # Ball and color management module
│   ├── config.js       # Game configuration module
│   ├── dom.js          # DOM element management module
│   ├── game.js         # Game core logic module
│   ├── main.js         # Game entry module
│   └── timer.js        # Countdown and state management module
├── README.md           # English project description
└── README-CN.md        # Chinese project description
```

## Installation and Running

### Method 1: Direct Opening

1. Download or clone the project to your local machine
2. Double-click `index.html` file to open it in the browser

### Method 2: Using Local Server (Recommended)

Due to the use of ES6 modules, some browsers may require a server environment:

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

Then visit `http://localhost:8080` in your browser

## Game Rules

1. Game time is 20 seconds
2. Click on falling red balls to score points
3. Only click the bottom red ball
4. Click anywhere in the column to judge
5. After the game ends, the final score and CPS will be displayed
6. Click the "Restart" button to play again

## Configuration Options

You can adjust the following configurations in the `js/config.js` file:

### Game Configuration
- `ROWS`: Number of game grid rows (default 6)
- `COLS`: Number of game grid columns (default 4)
- `CELL_SIZE`: Single cell size (default 120px)
- `INIT_TIME`: Initial countdown time (default 20 seconds)
- `MOBILE_THRESHOLD`: Mobile threshold (default 600px)

### Animation Configuration
- `BALL_SPEED`: Ball falling/moving animation speed
- `CLICK_FEEDBACK_DURATION`: Click feedback animation duration
- `FADE_OUT_SPEED`: Out-of-bounds fade-out animation speed
- `COLOR_TRANSITION_SPEED`: Color transition speed

### Color Configuration
- `BALL_NORMAL`: Normal ball color
- `BALL_LIGHT`: Light red color after clicking
- `BALL_FLASH`: Color when flashing

### Game Mode Configuration
- `USE_SMOOTH_COLOR_TRANSITION`: Whether to use smooth color transition (default false)

### Game Over Configuration
- `TIME_UP_DISPLAY_DURATION`: Time up display duration (default 2000ms)
- `TIME_UP_FLASH_DURATION`: Time up flash duration (default 1000ms)
- `TIME_UP_FLASH_INTERVAL`: Time up color switch frequency (default 250ms)

## Development Notes

### Module Responsibilities

| Module | Main Responsibility | File |
|--------|---------------------|------|
| Ball Management | Ball creation, movement, color processing, animation | `js/ball.js` |
| Game Core | Grid initialization, click events, score management | `js/game.js` |
| Configuration | Game constants and configuration | `js/config.js` |
| DOM Management | DOM element acquisition and management | `js/dom.js` |
| Timer | Countdown and game state management | `js/timer.js` |
| Entry | Game initialization | `js/main.js` |

### Performance Optimization

- Using Canvas rendering instead of DOM operations to improve performance
- Pre-calculating color RGB values to avoid frequent temporary Canvas creation
- Using requestAnimationFrame to achieve smooth animations
- Batch processing animation updates to reduce reflows

## Browser Compatibility

- Modern browsers such as Chrome / Firefox / Safari / Edge
- Support for mobile browsers

## License

MIT License

## Changelog

### v1.0.2
- ✨ Added: "Time's up" prompt when game ends
- ✨ Added: Red ball flashing effect when game ends to improve visual reminder
- 🎨 Added: `BALL_FLASH` color configuration to control the color when flashing
- ⚙️ Added: Game over configuration options, including flash duration and frequency
- 🔧 Fixed: Countdown initial value now reads from configuration file instead of hardcoding
- 🔧 Optimized: Flash effect implementation, using independent `isFlashing` property
- 🔧 Optimized: Added time window mechanism, allowing clicks to be accepted within 100ms after game ends to improve user experience
- 📊 Added: Display of clicks within 100ms after game ends on the settlement interface, allowing users to understand their reaction speed

### v1.0.1
- 🐛 Fixed: Initial balls not displaying bug
- 🔧 Refactored: Split initGrid into initCanvas and render to reduce module coupling
- 📝 Added: Unified initialization entry initGame() to improve code fault tolerance

### v1.0.0
- ✨ Initial version
- ✅ Canvas rendering implementation
- ✅ Responsive design
- ✅ Vertical判定
- ✅ Color transition effects
- ✅ Game over statistics
- ✅ Restart functionality
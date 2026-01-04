# Infinite Spiral

A mesmerizing double pendulum visualization that demonstrates chaos theory through interactive physics simulation.

## 🔗 Live Demo

**[View the Live Demo →](https://joe-johnson-23.github.io/infinite-spiral/)**

## Features

- **Double Pendulum Physics**: Real-time simulation of chaotic double pendulum motion
- **Multiple Pendulums**: Add/remove pendulums to see how tiny differences create vastly different trajectories
- **Adjustable Parameters**:
  - Pendulum length
  - Origin position (drag to reposition)
  - Initial angles (theta1, theta2) for each pendulum
  - Gravity strength
- **Visual Effects**:
  - Prism mode (rainbow trail colors)
  - Vacuum mode (trails stay in place)
  - Freefall mode (directional gravity)
  - Gravity reversal

## Keyboard Shortcuts

- `H` - Hide/show pendulum arms
- `J` - Toggle top-left position
- `K` - Reverse gravity direction

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the local server (usually http://localhost:5173)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## About

This project visualizes the chaotic nature of double pendulums - a classic example of deterministic chaos where small differences in initial conditions lead to dramatically different outcomes over time.

Created by Joe Johnson.


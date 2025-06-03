# Bar101 Game Engine

The React.js and Pixi.js-powered game engine for Bar 101. This package contains the interactive web application that renders the game world, handles player interactions, and manages the dynamic storytelling system.

## Technical Overview

The game engine is built as a React application with Pixi.js for 2D rendering. It dynamically loads story content, manages game state persistence, and provides an interactive bartending interface with character dialogue systems.

### Key Technologies
- **React**: Functional components with hooks
- **Pixi.js**: Hardware-accelerated 2D rendering
- **Webpack**: Module bundling and development server
- **Howler.js**: Cross-platform audio management
- **Bootstrap**: UI framework and responsive design

## Installation & Setup

```bash
# Install dependencies
npm install --legacy-peer-deps # --legacy-peer-deps is required for now because of a dependency conflict with the pixi.js package

# Start development server
npm start

# Build for production
npm run build-prod
```

### Required Dependencies
The game engine requires content from other Bar101 packages:
- **Story Content**: Run `bar101-storyline-gen` and extract nodes
- **Voiceovers**: Audio files from `bar101-voiceover` (available via CDN)

## Component Structure
```
src/
├── App.jsx                    # Main orchestrator and state manager
├── layouts/
│   ├── GameLayout.jsx         # Core gameplay interface
│   ├── StartLayout.jsx        # Welcome screen and game state management
│   ├── LoadingScreen.jsx      # Asset loading with progress indication
│   └── StoryTreeLayout.jsx    # Visual story path exploration
├── components/                # Reusable UI components
├── pixi/                      # Pixi.js game world components
├── hooks/
│   └── useGameState.js        # Game state persistence and management
└── audio/                     # Audio system management
```

## State Management
The `useGameState` hook manages all persistent game data:
```javascript
{
  storyPath: ['a', 'b', 'a', ...],        // Current story branch path
  customerTrust: { customer_id: -1.0...1.0 }, // Trust levels with characters
  inventory: { item_name: quantity },       // Player inventory
  balance: 100,                            // In-game currency
  levelProgress: {                         // Current level state
    phase: 'bartending',
    customerIndex: 0
  },
  visitedNodes: ['xaa', 'xab', ...],      // Story nodes player has seen
  dilemmaDecision: 'a'                    // Player's choice at decision points
}
```

## Game Loop & Flow

### Phase Management
The game operates in distinct phases:
1. **Loading**: Asset and story content loading
2. **Start Screen**: Game state management and navigation
3. **Bartending**: Interactive drink mixing with Pixi.js
4. **Conversation**: Character dialogue and trust building
5. **Decision**: Story branching based on player influence
6. **Transition**: Moving to next story node

### Pixi.js Integration
The game world is rendered using Pixi.js for:
- **Interactive Bartending**: Drag-and-drop drink mixing interface
- **Character Animations**: Smooth character movements and reactions
- **Visual Effects**: Particle effects, transitions, and UI animations
- **Asset Management**: Efficient texture loading and caching

Pixi Application is embedded in React Component `ResizeablePixiContainer`

## Development

### Hot Module Replacement
The development server supports HMR for efficient iteration:
```bash
npm start  # Runs on http://localhost:3000
```

### Build Configuration
Webpack configuration includes:
- **Asset Copying**: Automatic copying of story and media files
- **Progressive Web App**: PWA manifest and service worker
- **Content Hashing**: Cache-busting for production builds
- **Code Splitting**: Automatic bundle optimization

### Debugging Tools
The game exposes debugging utilities:
```javascript
// Available in browser console
window.debug = {
  gameState,           // Current game state
  changeTrust,         // Modify character trust
  openStoryPath,       // Jump to specific story nodes
  // ... other state management functions
}
```

## Testing

The project includes unit tests for React components and Pixi.js game logic:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests cover:
- **React Components**: User interactions and rendering
- **Pixi.js Classes**: Game object behavior and inheritance
- **Game Logic**: State management and calculations

## Browser Compatibility

Tested and optimized for:
- **Chrome**: 90+ (recommended for best performance)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+


## Google Analytics

The game uses Google Analytics to track user interactions. The `GA_ID` is set from the environment variable `GA_ID` in the `webpack.config.js` file.

```javascript
const GA_ID = process.env.GA_ID || 'G-XXXXXXX';
```
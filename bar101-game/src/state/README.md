# State Management

This directory contains the refactored state management system for the Bar101 game engine.

## Architecture

The state management has been broken down into focused, domain-specific hooks:

### Core Files

- **`useGameState.js`** - Main orchestrator that combines all state hooks
- **`index.js`** - Barrel export for easy importing
- **`constants.js`** - Default state, storage keys, and validation constants

### Domain-Specific Hooks

- **`useTrust.js`** - Customer trust system management
- **`useStoryPath.js`** - Story navigation and progression
- **`useLevelProgress.js`** - Game phases and level progression
- **`useBalance.js`** - Financial operations and balance management
- **`useInventory.js`** - Item purchasing and inventory management
- **`usePersistence.js`** - localStorage operations and state persistence

## Usage

### Standard Usage
```javascript
import { useGameState } from './state';

const MyComponent = () => {
  const { gameState, changeTrust, buyItem } = useGameState();
  // Use the state and actions...
};
```

### Advanced Usage (Individual Hooks)
```javascript
import { useTrust, useInventory } from './state';

const SpecializedComponent = ({ state, setState }) => {
  const { changeTrust } = useTrust(state, setState, updateTimestamp);
  const { buyItem } = useInventory(state, setState);
  // Use specific domain hooks...
};
```

## Benefits

1. **Separation of Concerns** - Each hook handles a specific domain
2. **Testability** - Individual hooks can be tested in isolation
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Reusability** - Domain hooks can be used independently if needed
5. **Type Safety** - Better TypeScript support with focused interfaces

## Migration

The refactored hooks maintain the same public API as the original `useGameState` hook, ensuring backward compatibility. 
/*
 * PIXI Application Caching Strategy
 * 
 * This component implements caching to decouple PIXI application lifecycle from React component lifecycle.
 * 
 * Problem:
 * React components can mount/unmount rapidly due to:
 * - Route changes and navigation
 * - Conditional rendering ({showGame && <ResizablePixiCanvas />})
 * - Parent component re-renders causing child remounts  
 * - React 18 Strict Mode deliberately double-mounting in development
 * - Hot module reloading during development
 * 
 * Without caching, each mount/unmount cycle would:
 * 1. Destroy WebGL context and GPU resources
 * 2. Release all loaded textures and buffers
 * 3. Recreate WebGL context (expensive GPU operation)
 * 4. Recompile shaders (CPU intensive)
 * 5. Reload assets (47+ textures in this game)
 * 6. Rebuild entire scene graph
 * 
 * Solution:
 * Cache PIXI applications by masterContainer to:
 * - Preserve expensive WebGL contexts and compiled shaders
 * - Keep assets loaded in GPU memory
 * - Maintain scene state via masterContainer.restore()
 * - Simply move canvas DOM element to new container
 * - Restart rendering loop without full recreation
 */

import React, { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import { extensions, ResizePlugin } from 'pixi.js';
import useResizeObserver from '../hooks/useResizeObserver';
import PixiApplicationCache from '../pixi/PixiApplicationCache';

const pixiCache = new PixiApplicationCache(5); // Cache up to 5 apps
// Clean up cache on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    pixiCache.clear();
  });
}

const ResizablePixiCanvas = ({className, style, masterContainer, onReady, cacheKey}) => {
  const [pixiContainer, size] = useResizeObserver();
  const appRef = useRef(null);

  // Use explicit cacheKey prop, or fall back to constructor name for consistent caching
  const cacheId = cacheKey || masterContainer?.constructor?.name || 'default';

  useEffect(() => {
    if(!masterContainer) {
      console.log("[ResizablePixiCanvas] skipping app creation, masterContainer is null");
      return;
    }
    const run = async () => {
      const now = performance.now();
      console.log("[ResizablePixiCanvas] creating app...");

      const cacheItem = pixiCache.get(cacheId);
      if(cacheItem) {
        console.log("[ResizablePixiCanvas] using cached app...");
        appRef.current = cacheItem;
        pixiContainer.current.appendChild(cacheItem.canvas);
        cacheItem.start()
        cacheItem.resizeTo = pixiContainer.current;
        masterContainer.restore();
      } else {
        extensions.add(ResizePlugin);
        const app = new PIXI.Application();
        pixiCache.set(cacheId, app);
        await app.init({ 
          width: pixiContainer.current.clientWidth,
          height: pixiContainer.current.clientHeight,
          backgroundColor: 0x000000,
          resizeTo: pixiContainer.current,
          antialias: true,
        });
        appRef.current = app;
        app.stage.addChild(masterContainer);
        masterContainer.doInit();
        if(pixiContainer.current) {
          pixiContainer.current.appendChild(app.canvas);
          masterContainer.resize(pixiContainer.current.clientWidth, pixiContainer.current.clientHeight);
          app.resize(size.width, size.height);
        } else {
          console.warn("[ResizablePixiCanvas] pixiContainer is null");
        }
      }

      const elapsed = performance.now() - now;
      console.log(`[ResizablePixiCanvas] app ready in ${elapsed.toFixed(2)}ms`);
      onReady()
    }
    run();

    return () => {
      if(appRef.current) {
        console.log("[ResizablePixiCanvas] stopping app...");
        appRef.current.stop()
      }
      appRef.current = null;
    };
  }, [masterContainer]);

  useEffect(() => {
    if(!appRef.current || !masterContainer) {
      console.log(`[ResizablePixiCanvas] skipping resize, app: ${!!appRef.current}, container: ${!!masterContainer}`);
      return;
    }
    if(!size.width || !size.height) {
      console.log(`[ResizablePixiCanvas] skipping resize, size: ${JSON.stringify(size)}`);
      return;
    }
    console.log(`[ResizablePixiCanvas] resizing to ${size.width}x${size.height}`);
    masterContainer.resize(size.width, size.height);
    appRef.current.resize(size.width, size.height);
  }, [size]);

  return <div ref={pixiContainer} style={{backgroundColor: '#000000', ...style}} className={className} />;
};

ResizablePixiCanvas.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  masterContainer: PropTypes.object.isRequired,
  onReady: PropTypes.func,
  cacheKey: PropTypes.string
};

ResizablePixiCanvas.defaultProps = {
  className: "",
  style: {},
  onReady: () => {},
  cacheKey: null
};

export default ResizablePixiCanvas;
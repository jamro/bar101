import React, { useEffect, useRef, memo } from 'react';
import * as PIXI from 'pixi.js';
import { extensions, ResizePlugin } from 'pixi.js';
import useResizeObserver from '../hooks/useResizeObserver';

const pixiCache = new Map(); // TODO:re factor to avoid global variable

const ResizablePixiCanvas = ({className="", style={}, masterContainer=null, onReady=() => {}}) => {
  const [pixiContainer, size] = useResizeObserver();
  const appRef = useRef(null);

  let cacheId = masterContainer

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

export default ResizablePixiCanvas;
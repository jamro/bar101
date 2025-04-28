import React, { useEffect, useRef, memo } from 'react';
import * as PIXI from 'pixi.js';
import { extensions, ResizePlugin } from 'pixi.js';
import useResizeObserver from '../hooks/useResizeObserver';

const ResizablePixiCanvas = ({className="", masterContainer=null}) => {
  const [pixiContainer, size] = useResizeObserver();
  const appRef = useRef(null);

  useEffect(() => {
    if(!masterContainer) {
      console.log("[ResizablePixiCanvas] skipping app creation, masterContainer is null");
      return;
    }
    const run = async () => {
      console.log("[ResizablePixiCanvas] creating app...");
      extensions.add(ResizePlugin);
      const app = new PIXI.Application();
      await app.init({ 
        width: pixiContainer.current.clientWidth,
        height: pixiContainer.current.clientHeight,
        backgroundColor: 0x000000,
        resizeTo: pixiContainer.current,
        antialias: true,
      });
      pixiContainer.current.appendChild(app.canvas);
      appRef.current = app;
      app.stage.addChild(masterContainer);
      masterContainer.resize(pixiContainer.current.clientWidth, pixiContainer.current.clientHeight);
      app.resize(size.width, size.height);
      console.log("[ResizablePixiCanvas] app ready");
    }
    run();

    return () => {
      console.log("[ResizablePixiCanvas] destroying app...");
      appRef.current.destroy({ children: true, texture: true, textureSource: true });
      appRef.current = null;
    };
  }, [masterContainer]);

  useEffect(() => {
    if(!appRef.current || !masterContainer) {
      console.log(`[ResizablePixiCanvas] skipping resize, app: ${!!appRef.current}, container: ${!!masterContainer}`);
      return;
    }
    console.log(`[ResizablePixiCanvas] resizing to ${size.width}x${size.height}`);
    masterContainer.resize(size.width, size.height);
    appRef.current.resize(size.width, size.height);
  }, [size]);

  return <div ref={pixiContainer} className={className} />;
};

export default ResizablePixiCanvas;
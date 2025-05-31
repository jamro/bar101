import React, { useRef, useEffect } from 'react';
import ResizablePixiCanvas from '../components/ResizablePixiCanvas';
import StoryTreeMasterContainer from '../pixi/storyTree/StoryTreeMasterContainer';


let storyTreeMasterContainer; // TODO:re factor to avoid global variable

export default function StoryTreeLayout({ onClose, visitedNodes, storyPath, enableTimeTravel, onStoryPathChange }) {
  if (!storyTreeMasterContainer) {
    storyTreeMasterContainer = new StoryTreeMasterContainer();
  }
  const storyTreeSceneRef = useRef(storyTreeMasterContainer);

  useEffect(() => {
    storyTreeMasterContainer.enableTimeTravel(enableTimeTravel);
  }, [enableTimeTravel]);

  useEffect(() => {
    storyTreeMasterContainer.on('close', () => {
      console.log('close');
      onClose();
    })
    return () => {
      storyTreeMasterContainer.off('close');
    }
  }, []);

  useEffect(() => {
    storyTreeMasterContainer.on('openChapter', (path) => {
      let storyPath = path.replace('x', '').split('')
      onStoryPathChange(storyPath);
    })
  }, []);

  useEffect(() => {
    storyTreeMasterContainer.updateVisitedNodes(visitedNodes);
  }, [visitedNodes]);

  useEffect(() => {
    storyTreeMasterContainer.updateStoryPath(storyPath, true);
  }, [storyPath]);

  return <ResizablePixiCanvas 
      style={{width: '100%', height: '100%'}} 
      masterContainer={storyTreeSceneRef.current} 
      cacheKey="StoryTreeLayout" 
    />
}
import React, { useRef, useEffect } from 'react';
import ResizablePixiCanvas from '../components/ResizablePixiCanvas';
import StoryTreeMasterContainer from '../pixi/storyTree/StoryTreeMasterContainer';


let storyTreeMasterContainer; // TODO:re factor to avoid global variable

export default function StoryTreeLayout({ onClose, visitedNodes, storyPath }) {
  if (!storyTreeMasterContainer) {
    storyTreeMasterContainer = new StoryTreeMasterContainer();
  }
  const storyTreeSceneRef = useRef(storyTreeMasterContainer);

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
    storyTreeMasterContainer.updateVisitedNodes(visitedNodes);
  }, [visitedNodes]);

  useEffect(() => {
    storyTreeMasterContainer.updateStoryPath(storyPath);
  }, [storyPath]);

  return <ResizablePixiCanvas style={{width: '100%', height: '100%'}} masterContainer={storyTreeSceneRef.current} />
}
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ResizablePixiCanvas from '../components/ResizablePixiCanvas';
import StoryTreeMasterContainer from '../pixi/storyTree/StoryTreeMasterContainer';

export default function StoryTreeLayout({ onClose, visitedNodes, storyPath, enableTimeTravel, onStoryPathChange }) {
  const masterContainer = StoryTreeMasterContainer.getInstance();

  useEffect(() => {
    masterContainer.enableTimeTravel(enableTimeTravel);
  }, [enableTimeTravel]);

  useEffect(() => {
    masterContainer.on('close', () => {
      console.log('close');
      onClose();
    })
    return () => {
      masterContainer.off('close');
    }
  }, []);

  useEffect(() => {
    masterContainer.on('openChapter', (path) => {
      let storyPath = path.replace('x', '').split('')
      onStoryPathChange(storyPath);
    })
  }, []);

  useEffect(() => {
    masterContainer.updateVisitedNodes(visitedNodes);
  }, [visitedNodes]);

  useEffect(() => {
    masterContainer.updateStoryPath(storyPath, true);
  }, [storyPath]);

  return <ResizablePixiCanvas 
      style={{width: '100%', height: '100%'}} 
      masterContainer={masterContainer} 
      cacheKey="StoryTreeLayout" 
    />
}

StoryTreeLayout.propTypes = {
  onClose: PropTypes.func.isRequired,
  visitedNodes: PropTypes.array.isRequired,
  storyPath: PropTypes.array.isRequired,
  enableTimeTravel: PropTypes.bool.isRequired,
  onStoryPathChange: PropTypes.func.isRequired
};

StoryTreeLayout.defaultProps = {
  onClose: () => {},
  visitedNodes: [],
  storyPath: [],
  enableTimeTravel: false,
  onStoryPathChange: () => {}
};
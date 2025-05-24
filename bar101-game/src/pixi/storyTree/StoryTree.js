import * as PIXI from 'pixi.js';
import StoryNode from './StoryNode';
import Pulsar from './Pulsar';

const COLOR = 0xdec583

function connectPoints(graphics, x1, y1, x2, y2, color = COLOR, randomRange = 1, segmentCount = 10) {
  // Calculate the base vector for the line
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // Start at the first point
  graphics.moveTo(x1, y1);
  
  // Create intermediate points with random offsets
  for (let i = 1; i < segmentCount; i++) {
    // Calculate the position along the straight line
    const ratio = i / segmentCount;
    const baseX = x1 + dx * ratio;
    const baseY = y1 + dy * ratio;
    
    // Add random offset perpendicular to the line direction
    const perpX = -dy;
    const perpY = dx;
    
    // Normalize the perpendicular vector
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    const normalizedPerpX = perpX / perpLength;
    const normalizedPerpY = perpY / perpLength;
    
    // Random offset magnitude (both positive and negative)
    const randomOffset = (Math.random() * 2 - 1) * randomRange;
    
    // Apply the offset
    const pointX = baseX + normalizedPerpX * randomOffset;
    const pointY = baseY + normalizedPerpY * randomOffset;
    
    // Draw line to this point
    graphics.lineTo(pointX, pointY);
  }
  
  // Finish at the end point
  graphics.lineTo(x2, y2);
  
  // Apply the stroke
  graphics.stroke({width: 3, color});
}


class StoryTree extends PIXI.Container {
  constructor() {
    super();

    this._treeMap = {}
    this._treeLayers = []
    this._treeNodes = new StoryNode("x");
    this._currentNode = this._treeNodes;
    this._currentNode.current = false;

    const fillNode = (parent) => {

      // place node in data strucure --------------------
      this._treeMap[parent.path] = parent;
      this._treeLayers[parent.path.length-1] = this._treeLayers[parent.path.length-1] || [];
      this._treeLayers[parent.path.length-1].push(parent);

      // create children --------------------------------
      if(parent.path.length >= 8) {
        return;
      }
      parent.branchA = new StoryNode(parent.path + "a")
      parent.branchB = new StoryNode(parent.path + "b")
      fillNode(parent.branchA);
      fillNode(parent.branchB);
    }

    fillNode(this._treeNodes);

    this._connectionWeb = new PIXI.Graphics();
    this.addChild(this._connectionWeb);

    const levelSpacing = 20

    for(let level = 0; level < this._treeLayers.length; level++) {
      const layer = this._treeLayers[level];

      for(let i = 0; i < layer.length; i++) {
        const node = layer[i];
        this.addChild(node);
        const randomAngle =(Math.random() - 0.5) * 0.8 * Math.PI/layer.length
        const randomLengthMultiplier = 1 + (Math.random() - 0.5) * 0.05
        node.x = randomLengthMultiplier * (i % 2 === 0 ? level : level*0.9) * (levelSpacing * (1 + 0.2*level)) * Math.cos(i * 2 * Math.PI / layer.length + Math.PI/layer.length + randomAngle)
        node.y = randomLengthMultiplier * (i % 2 === 0 ? level : level*0.9) * (levelSpacing * (1 + 0.2*level)) * Math.sin(i * 2 * Math.PI / layer.length + Math.PI/layer.length + randomAngle)

        if(level > 0) {
          const parentNode = this._treeMap[node.path.slice(0, -1)];
          connectPoints(
            this._connectionWeb, 
            parentNode.x, 
            parentNode.y, 
            node.x, 
            node.y,
            (node.visited && parentNode.visited) ? COLOR : 0x222222
          )
        }
      }
    }

    this._pulsar = new Pulsar();
    this.addChild(this._pulsar);
  }

  get currentNode() {
    return this._currentNode;
  }

  selectNodeAt(x, y) {
    const matches = []
    // do hit test on all nodes
    const nodes = Object.values(this._treeMap);
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.visited) {
        const {hit, distance} = node.hitTest(x, y)
        if(hit) {
          matches.push({node, distance})
        }
      }
    }
    if(matches.length > 0) {
      matches.sort((a, b) => a.distance - b.distance)
      return matches[0].node
    }
    return null;
  }

  update() {
    this._pulsar.update();
  }

  updateStoryPath(storyPath) {
    this._currentNode.current = false;
    const nodePath = "x" + storyPath.join("");
    this._currentNode = this._treeMap[nodePath];
    this._currentNode.current = true;
    this._pulsar.x = this._currentNode.x
    this._pulsar.y = this._currentNode.y
  }

  updateVisitedNodes(visitedNodes) {
    const allNodes = Object.values(this._treeMap);
    for(let i = 0; i < allNodes.length; i++) {
      const node = allNodes[i];
      node.visited = false;
    }
    for(let i = 0; i < visitedNodes.length; i++) {
      const node = this._treeMap[visitedNodes[i]];
      node.visited = true;
    }

    this._connectionWeb.clear();
    for(let level = 0; level < this._treeLayers.length; level++) {
      const layer = this._treeLayers[level];

      for(let i = 0; i < layer.length; i++) {
        const node = layer[i];
      
        if(level > 0) {
          const parentNode = this._treeMap[node.path.slice(0, -1)];
          const grandParentNode = this._treeMap[parentNode.path.slice(0, -1) || 'x'];
          const greatGrandParentNode = this._treeMap[grandParentNode.path.slice(0, -1) || 'x'];
          let color = 0x000000
          if(node.visited && parentNode.visited) {
            color = COLOR
          } else if(!node.visited && parentNode.visited) {
            color = 0x333333
          } else if(!node.visited && !parentNode.visited && grandParentNode.visited) {
            color = 0x222222
          } else if(!node.visited && !parentNode.visited && !grandParentNode.visited && greatGrandParentNode.visited) {
            color = 0x111111
          }
          connectPoints(
            this._connectionWeb, 
            parentNode.x, 
            parentNode.y, 
            node.x, 
            node.y,
            color
          )
        }
      }
    }
  }
}

export default StoryTree;
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Circle, Line, Rect } from 'react-konva';
import useStore from '../store/useStore';

export default function MapCanvas({ roomId }) {
  const { currentTool, mapImage, tokens, updateToken, socket, isDM } = useStore();
  const [imageObj, setImageObj] = useState(null);
  
  // Grid settings
  const gridSize = 50;
  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  // Load map image
  useEffect(() => {
    if (mapImage) {
      const img = new window.Image();
      img.src = mapImage;
      img.onload = () => {
        setImageObj(img);
      };
    }
  }, [mapImage]);

  const handleDragEnd = (e, id) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Snap to grid
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    e.target.position({ x: snappedX, y: snappedY });

    // Update local state
    updateToken(id, { x: snappedX, y: snappedY });

    // Sync with server
    if (socket) {
      const updatedTokens = useStore.getState().tokens.map(t => 
        t.id === id ? { ...t, x: snappedX, y: snappedY } : t
      );
      socket.emit('update_tokens', { roomId, tokens: updatedTokens });
    }
  };

  // Generate grid lines
  const gridLines = [];
  for (let i = 0; i < stageWidth / gridSize; i++) {
    gridLines.push(
      <Line
        key={`v${i}`}
        points={[i * gridSize, 0, i * gridSize, stageHeight]}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={1}
      />
    );
  }
  for (let j = 0; j < stageHeight / gridSize; j++) {
    gridLines.push(
      <Line
        key={`h${j}`}
        points={[0, j * gridSize, stageWidth, j * gridSize]}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={1}
      />
    );
  }

  return (
    <Stage 
      width={stageWidth} 
      height={stageHeight}
      draggable={currentTool === 'select'} // Can pan the whole map
      style={{ cursor: currentTool === 'select' ? 'grab' : 'crosshair' }}
    >
      {/* Background & Grid Layer */}
      <Layer>
        <Rect width={stageWidth} height={stageHeight} fill="#020617" />
        {imageObj && (
          <Image 
            image={imageObj} 
            x={0} 
            y={0} 
          />
        )}
        {gridLines}
      </Layer>

      {/* Objects / Characters Layer */}
      <Layer>
        {tokens.map(token => (
          <Circle
            key={token.id}
            id={token.id}
            x={token.x}
            y={token.y}
            radius={gridSize / 2 - 4}
            fill={token.color}
            stroke="white"
            strokeWidth={2}
            draggable={currentTool === 'select'}
            onDragEnd={(e) => handleDragEnd(e, token.id)}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffset={{ x: 2, y: 2 }}
          />
        ))}
      </Layer>

      {/* Fog of War Layer (Basic representation) */}
      <Layer opacity={0.8}>
        {/* If we have fog enabled, a black rect covers the screen except where erased */}
        {/* WIP: Requires composite operations and mask drawing */}
      </Layer>
    </Stage>
  );
}

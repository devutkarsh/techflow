import React, { memo } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { ArchitectureEdgeData } from '../../../types/architecture';

export const ArchitectureEdgeComponent: React.FC<EdgeProps> = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const edgeData = data as unknown as ArchitectureEdgeData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActiveSim = edgeData?.activeInSimulation;

  const edgeStyle: React.CSSProperties = {
    stroke: isActiveSim ? '#10b981' : (style.stroke || 'rgba(148, 163, 184, 0.4)'),
    strokeWidth: isActiveSim ? 3 : (style.strokeWidth || 1.8),
    strokeDasharray: isActiveSim ? '5,5' : undefined,
    filter: isActiveSim ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' : undefined,
    transition: 'all 0.3s ease',
    ...style,
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      
      {/* Protocol Badge & Latency Tag */}
      {edgeData && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            title={edgeData.description || edgeData.protocol}
          >
            <div className={`edge-protocol-pill ${isActiveSim ? 'active-sim' : ''}`}>
              <span>{edgeData.label || edgeData.protocol}</span>
              {edgeData.latency && (
                <span style={{ opacity: 0.6, fontSize: '0.6rem' }}>
                  ({edgeData.latency})
                </span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

ArchitectureEdgeComponent.displayName = 'ArchitectureEdgeComponent';

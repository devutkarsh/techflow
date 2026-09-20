import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { 
  Layers, 
  Server, 
  Cpu, 
  Database, 
  Globe, 
  ShieldCheck, 
  Workflow,
  Radio,
  Boxes,
  Boxes as DefaultContainerIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ArchitectureNodeData } from '../../../types/architecture';

const CONTAINER_ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Server,
  Cpu,
  Database,
  Globe,
  ShieldCheck,
  Workflow,
  Radio,
  Boxes,
};

export const ContainerNodeComponent: React.FC<NodeProps> = memo(({ data, selected, width, height }) => {
  const nodeData = data as unknown as ArchitectureNodeData & { width?: number; height?: number };
  const IconComponent = (nodeData.iconName && CONTAINER_ICON_MAP[nodeData.iconName]) || DefaultContainerIcon;
  const isActiveSim = nodeData.activeInSimulation;

  const w = (typeof nodeData.width === 'number' ? nodeData.width : undefined) ?? width;
  const h = (typeof nodeData.height === 'number' ? nodeData.height : undefined) ?? height;

  return (
    <div 
      className={`arch-container-box ${selected ? 'selected' : ''} ${isActiveSim ? 'active-sim' : ''}`}
      style={{
        ...(w ? { width: `${w}px` } : {}),
        ...(h ? { height: `${h}px` } : {}),
      }}
    >
      {/* 4 Multi-Directional Handles for clean edge connectivity */}
      <Handle type="target" position={Position.Top} id="top-target" style={{ top: -5 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ top: -5 }} />
      
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: -5 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: -5 }} />
      
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: -5 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: -5 }} />
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ bottom: -5 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ bottom: -5 }} />

      {/* Container Header Bar */}
      <div className="container-header-bar">
        <div className="container-header-left">
          <div className="container-icon-box">
            <IconComponent size={20} />
          </div>
          <div className="container-title-group">
            <div className="container-label-row">
              <span className="container-title-text">{nodeData.label}</span>
              {nodeData.containerBadge && (
                <span className="container-badge-pill">{nodeData.containerBadge}</span>
              )}
            </div>
            {nodeData.subtitle && (
              <div className="container-subtitle-text">{nodeData.subtitle}</div>
            )}
          </div>
        </div>

        <div className="container-header-right">
          <span className="container-status-indicator">
            <span className="status-dot-pulse"></span>
            <span>Active Cluster</span>
          </span>
          <span className="node-category-pill cat-compute">
            {nodeData.category || 'compute'}
          </span>
        </div>
      </div>

      {/* Internal Grid Backdrop & Watermark */}
      <div className="container-interior-area">
        <div className="container-watermark-tag">
          <span>☸️ Kubernetes Cluster Boundary</span>
        </div>
      </div>
    </div>
  );
});

ContainerNodeComponent.displayName = 'ContainerNodeComponent';

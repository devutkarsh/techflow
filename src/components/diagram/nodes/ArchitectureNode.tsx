import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { 
  ShieldCheck, 
  Database, 
  Server, 
  Layers, 
  Zap, 
  Cpu, 
  Bot, 
  Radio, 
  Activity, 
  Globe, 
  Lock, 
  HardDrive, 
  Shuffle, 
  Workflow, 
  Smartphone, 
  Key, 
  UploadCloud, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ArchitectureNodeData, NodeCategory } from '../../../types/architecture';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Database,
  Server,
  Layers,
  Zap,
  Cpu,
  Bot,
  Radio,
  Activity,
  Globe,
  Lock,
  HardDrive,
  Shuffle,
  Workflow,
  Smartphone,
  Key,
  UploadCloud
};

const CATEGORY_COLORS: Record<NodeCategory, { bg: string; iconBg: string }> = {
  gateway: { bg: 'cat-gateway', iconBg: 'linear-gradient(135deg, #0284c7, #0ea5e9)' },
  compute: { bg: 'cat-compute', iconBg: 'linear-gradient(135deg, #059669, #10b981)' },
  database: { bg: 'cat-database', iconBg: 'linear-gradient(135deg, #4f46e5, #818cf8)' },
  queue: { bg: 'cat-queue', iconBg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  cache: { bg: 'cat-cache', iconBg: 'linear-gradient(135deg, #e11d48, #f43f5e)' },
  ai: { bg: 'cat-ai', iconBg: 'linear-gradient(135deg, #9333ea, #c084fc)' },
  storage: { bg: 'cat-storage', iconBg: 'linear-gradient(135deg, #0d9488, #2dd4bf)' },
  security: { bg: 'cat-security', iconBg: 'linear-gradient(135deg, #dc2626, #ef4444)' },
  client: { bg: 'cat-client', iconBg: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
  monitoring: { bg: 'cat-monitoring', iconBg: 'linear-gradient(135deg, #65a30d, #a3e635)' },
};

export const ArchitectureNodeComponent: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as ArchitectureNodeData;
  const categoryStyle = CATEGORY_COLORS[nodeData.category] || CATEGORY_COLORS.compute;
  const IconComponent = (nodeData.iconName && ICON_MAP[nodeData.iconName]) || HelpCircle;

  const isActiveSim = nodeData.activeInSimulation;

  return (
    <div className={`arch-node ${selected ? 'selected' : ''} ${isActiveSim ? 'active-sim' : ''}`}>
      {/* Handles on 4 sides for clean routing */}
      <Handle type="target" position={Position.Top} id="top-target" style={{ top: -5 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ top: -5 }} />
      
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: -5 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: -5 }} />
      
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: -5 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: -5 }} />
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ bottom: -5 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ bottom: -5 }} />

      {/* Header */}
      <div className="node-header">
        <div className="node-icon-box" style={{ background: categoryStyle.iconBg }}>
          <IconComponent size={18} />
        </div>
        <span className={`node-category-pill ${categoryStyle.bg}`}>
          {nodeData.category}
        </span>
      </div>

      {/* Body */}
      <div className="node-body">
        <div className="node-title">{nodeData.label}</div>
        {nodeData.subtitle && <div className="node-subtitle">{nodeData.subtitle}</div>}

        {/* Clickable External URL Link */}
        {nodeData.url && (
          <a
            href={nodeData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="node-external-link-btn"
            onClick={(e) => e.stopPropagation()}
            title={`Open ${nodeData.url}`}
          >
            <ExternalLink size={11} />
            <span>{nodeData.url.replace(/^https?:\/\//, '')}</span>
          </a>
        )}

        {/* Tech Stack Tags */}
        {nodeData.techStack && nodeData.techStack.length > 0 && (
          <div className="node-tech-tags">
            {nodeData.techStack.slice(0, 3).map((tech, idx) => (
              <span key={idx} className="tech-tag">
                {tech}
              </span>
            ))}
            {nodeData.techStack.length > 3 && (
              <span className="tech-tag">+{nodeData.techStack.length - 3}</span>
            )}
          </div>
        )}

        {/* Specs Grid */}
        {nodeData.specs && (
          <div className="node-specs-grid">
            {nodeData.specs.qps && (
              <div className="node-spec-item">
                <span className="node-spec-label">Throughput</span>
                <span className="node-spec-value">{nodeData.specs.qps}</span>
              </div>
            )}
            {nodeData.specs.p99Latency && (
              <div className="node-spec-item">
                <span className="node-spec-label">P99 SLA</span>
                <span className="node-spec-value">{nodeData.specs.p99Latency}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ArchitectureNodeComponent.displayName = 'ArchitectureNodeComponent';

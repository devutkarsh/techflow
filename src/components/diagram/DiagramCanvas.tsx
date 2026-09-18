import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { 
  Sparkles, 
  Grid, 
  MapPin,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { ArchitectureItem, ArchitectureNodeData } from '../../types/architecture';
import { ArchitectureNodeComponent } from './nodes/ArchitectureNode';
import { ArchitectureEdgeComponent } from './edges/ArchitectureEdge';

const nodeTypes = {
  architectureNode: ArchitectureNodeComponent,
};

const edgeTypes = {
  architectureEdge: ArchitectureEdgeComponent,
};

interface DiagramCanvasProps {
  architecture: ArchitectureItem;
  selectedNodeId: string | null;
  onSelectNode: (node: ArchitectureNodeData | null) => void;
  activeSimulationStep: number | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

// Dagre Auto-layout calculation
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: isHorizontal ? 60 : 80, 
    ranksep: isHorizontal ? 120 : 100 
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 290, height: 190 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 145,
        y: nodeWithPosition.y - 95,
      },
    };
  });

  return { nodes: newNodes, edges };
};

const FlowInner: React.FC<DiagramCanvasProps> = ({
  architecture,
  selectedNodeId,
  onSelectNode,
  activeSimulationStep,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const { fitView } = useReactFlow();
  const [showMinimap, setShowMinimap] = React.useState(false);
  const [bgVariant, setBgVariant] = React.useState<BackgroundVariant>(BackgroundVariant.Lines);

  // Active step highlights
  const activeStep = useMemo(() => {
    if (activeSimulationStep === null || !architecture.simulationFlow) return null;
    return architecture.simulationFlow.find((s) => s.step === activeSimulationStep) || null;
  }, [activeSimulationStep, architecture]);

  // Transform architecture.nodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => {
    return architecture.nodes.map((n) => {
      const isNodeActive = activeStep?.activeNodeIds.includes(n.id) ?? false;
      return {
        id: n.id,
        type: 'architectureNode',
        position: n.position || { x: 0, y: 0 },
        data: {
          ...n.data,
          activeInSimulation: isNodeActive,
        },
      };
    });
  }, [architecture.nodes, activeStep]);

  // Transform architecture.edges to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() => {
    return architecture.edges.map((e) => {
      const isEdgeActive = activeStep?.activeEdgeIds.includes(e.id) ?? false;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'architectureEdge',
        animated: isEdgeActive || e.animated,
        style: e.style,
        data: {
          ...e.data,
          activeInSimulation: isEdgeActive,
        },
      };
    });
  }, [architecture.edges, activeStep]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state whenever architecture or simulation changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 60);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.data as unknown as ArchitectureNodeData);
    },
    [onSelectNode]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  // Auto Layout trigger
  const applyAutoLayout = useCallback(
    (direction: 'LR' | 'TB' = 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 60);
    },
    [nodes, edges, fitView, setNodes, setEdges]
  );

  return (
    <div className="diagram-canvas-container" style={{ height: isFullscreen ? '100vh' : '580px' }}>
      {/* Top Floating Controls */}
      <div className="canvas-floating-controls">
        <button
          className="canvas-control-button"
          onClick={() => applyAutoLayout('LR')}
          title="Auto-organize architecture layout"
        >
          <Sparkles size={14} />
          <span>Auto Layout</span>
        </button>

        <button
          className={`canvas-control-button ${showMinimap ? 'active' : ''}`}
          onClick={() => setShowMinimap(!showMinimap)}
          title="Toggle Canvas MiniMap"
        >
          <MapPin size={14} />
          <span>Minimap</span>
        </button>

        <button
          className={`canvas-control-button ${bgVariant === BackgroundVariant.Lines ? 'active' : ''}`}
          onClick={() =>
            setBgVariant((v) =>
              v === BackgroundVariant.Lines
                ? BackgroundVariant.Dots
                : BackgroundVariant.Lines
            )
          }
          title="Toggle Canvas Grid Style (Lines / Dots)"
        >
          <Grid size={14} />
          <span>Grid</span>
        </button>

        <button
          className={`canvas-control-button ${isFullscreen ? 'active' : ''}`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Diagram Canvas'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{isFullscreen ? 'Exit' : 'Expand'}</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          selected: n.id === selectedNodeId,
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{ type: 'architectureEdge' }}
      >
        <Controls 
          showFitView={false}
          showInteractive={false}
          className="techflow-canvas-controls"
        />
        {showMinimap && (
          <MiniMap
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              bottom: 16,
              right: 16,
            }}
            nodeColor={(node) => {
              const d = node.data as unknown as ArchitectureNodeData;
              if (d?.category === 'gateway') return '#38bdf8';
              if (d?.category === 'compute') return '#34d399';
              if (d?.category === 'database') return '#818cf8';
              if (d?.category === 'queue') return '#fbbf24';
              if (d?.category === 'ai') return '#c084fc';
              if (d?.category === 'cache') return '#f43f5e';
              return '#64748b';
            }}
            nodeStrokeWidth={3}
            maskColor="rgba(8, 11, 17, 0.8)"
          />
        )}
        <Background
          variant={bgVariant}
          gap={24}
          size={1.5}
          color="rgba(148, 163, 184, 0.12)"
        />
      </ReactFlow>
    </div>
  );
};

export const DiagramCanvas: React.FC<DiagramCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
};

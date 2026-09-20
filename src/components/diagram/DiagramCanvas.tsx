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
import { ContainerNodeComponent } from './nodes/ContainerNode';
import { ArchitectureEdgeComponent } from './edges/ArchitectureEdge';

const nodeTypes = {
  architectureNode: ArchitectureNodeComponent,
  containerNode: ContainerNodeComponent,
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

// Dagre Auto-layout calculation with smart ContainerNode bounding-box wrapping and relative child coordinates
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: isHorizontal ? 60 : 70, 
    ranksep: isHorizontal ? 120 : 100,
  });

  // Separate container nodes from regular workload nodes
  const containerNodes = nodes.filter(
    (n) => n.type === 'containerNode' || (n.data as unknown as ArchitectureNodeData)?.isContainer
  );
  const regularNodes = nodes.filter(
    (n) => n.type !== 'containerNode' && !(n.data as unknown as ArchitectureNodeData)?.isContainer
  );

  if (containerNodes.length === 0) {
    // Standard Dagre layout for flat architectures
    regularNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 190, height: 160 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = regularNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        width: 190,
        height: 160,
        initialWidth: 190,
        initialHeight: 160,
        position: {
          x: (nodeWithPosition?.x ?? 110) - 95,
          y: (nodeWithPosition?.y ?? 80) - 80,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }

  // Build parent-to-child and child-to-parent mapping for containerized architectures
  const childToParentMap = new Map<string, string>();
  containerNodes.forEach((container) => {
    const containerData = container.data as unknown as ArchitectureNodeData;
    let childIds: string[] = 
      (container as unknown as { childNodes?: string[] }).childNodes ||
      containerData?.childNodes ||
      [];

    if (childIds.length === 0) {
      childIds = nodes
        .filter((n) => n.parentId === container.id || (n.data as unknown as { parentId?: string })?.parentId === container.id)
        .map((n) => n.id);
    }

    childIds.forEach((cId) => {
      childToParentMap.set(cId, container.id);
    });
  });

  const externalNodes = regularNodes.filter((n) => !childToParentMap.has(n.id));
  const childNodes = regularNodes.filter((n) => childToParentMap.has(n.id));

  // Add container and external nodes to macro Dagre graph
  containerNodes.forEach((container) => {
    const cWidth = typeof container.width === 'number' ? container.width : 1140;
    const cHeight = typeof container.height === 'number' ? container.height : 580;
    dagreGraph.setNode(container.id, { width: cWidth, height: cHeight });
  });

  externalNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 190, height: 160 });
  });

  // Map edges to macro graph: redirect child endpoints to their container node
  const macroEdgeSet = new Set<string>();
  edges.forEach((edge) => {
    const src = childToParentMap.get(edge.source) || edge.source;
    const tgt = childToParentMap.get(edge.target) || edge.target;
    if (src !== tgt) {
      const key = `${src}->${tgt}`;
      if (!macroEdgeSet.has(key)) {
        macroEdgeSet.add(key);
        dagreGraph.setEdge(src, tgt);
      }
    }
  });

  dagre.layout(dagreGraph);

  // Position containers with bounded dimensions
  const positionedContainers = containerNodes.map((container) => {
    const nodePos = dagreGraph.node(container.id);
    const cWidth = typeof container.width === 'number' ? container.width : 1140;
    const cHeight = typeof container.height === 'number' ? container.height : 580;
    const containerX = nodePos ? nodePos.x - cWidth / 2 : 260;
    const containerY = nodePos ? nodePos.y - cHeight / 2 : 40;

    return {
      ...container,
      width: cWidth,
      height: cHeight,
      initialWidth: cWidth,
      initialHeight: cHeight,
      position: {
        x: containerX,
        y: containerY,
      },
      style: {
        ...container.style,
        width: cWidth,
        height: cHeight,
        zIndex: -1,
      },
    };
  });

  // Position external nodes
  const positionedExternalNodes = externalNodes.map((node) => {
    const nodePos = dagreGraph.node(node.id);
    return {
      ...node,
      width: 190,
      height: 160,
      initialWidth: 190,
      initialHeight: 160,
      parentId: undefined,
      extent: undefined,
      position: {
        x: nodePos ? nodePos.x - 95 : 40,
        y: nodePos ? nodePos.y - 80 : 120,
      },
    };
  });

  // Position child nodes within their parent container in a clean 2-row grid with relative coordinates
  const positionedChildNodes = childNodes.map((node, index) => {
    const parentContainerId = childToParentMap.get(node.id) || containerNodes[0]?.id;
    const siblings = childNodes.filter((c) => childToParentMap.get(c.id) === parentContainerId);
    const siblingIndex = siblings.findIndex((c) => c.id === node.id);
    const idx = siblingIndex !== -1 ? siblingIndex : index;

    const row = Math.floor(idx / 5);
    const col = idx % 5;
    const relX = 40 + col * 220;
    const relY = 80 + row * 260;

    return {
      ...node,
      width: 190,
      height: 160,
      initialWidth: 190,
      initialHeight: 160,
      parentId: parentContainerId,
      extent: 'parent' as const,
      position: {
        x: relX,
        y: relY,
      },
    };
  });

  // Container nodes MUST come first in array for subflows to render properly behind children
  return { 
    nodes: [...positionedContainers, ...positionedExternalNodes, ...positionedChildNodes], 
    edges 
  };
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
  const prevArchIdRef = React.useRef<string>(architecture.id);

  // Active step highlights
  const activeStep = useMemo(() => {
    if (activeSimulationStep === null || !architecture.simulationFlow) return null;
    return architecture.simulationFlow.find((s) => s.step === activeSimulationStep) || null;
  }, [activeSimulationStep, architecture]);

  // Transform architecture.nodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => {
    // Sort so container nodes come first in the ReactFlow array hierarchy (renders behind)
    const sorted = [...architecture.nodes].sort((a, b) => {
      const aIsContainer = a.type === 'containerNode' || a.data?.isContainer;
      const bIsContainer = b.type === 'containerNode' || b.data?.isContainer;
      if (aIsContainer && !bIsContainer) return -1;
      if (!aIsContainer && bIsContainer) return 1;
      return 0;
    });

    return sorted.map((n) => {
      const isNodeActive = activeStep?.activeNodeIds.includes(n.id) ?? false;
      const isContainer = n.type === 'containerNode' || n.data?.isContainer;
      const childNodes = n.childNodes || n.data?.childNodes || [];
      const parentId = n.parentId || (n.data as unknown as { parentId?: string })?.parentId;
      
      const nodeWidth = typeof n.width === 'number' ? n.width : (typeof n.style?.width === 'number' ? n.style.width : (isContainer ? 1140 : 190));
      const nodeHeight = typeof n.height === 'number' ? n.height : (typeof n.style?.height === 'number' ? n.style.height : (isContainer ? 580 : 160));

      const nodeStyle: React.CSSProperties = {
        width: nodeWidth,
        height: nodeHeight,
        ...(isContainer ? { zIndex: -1 } : {}),
        ...n.style,
      };

      return {
        id: n.id,
        type: isContainer ? 'containerNode' : (n.type || 'architectureNode'),
        position: n.position || { x: 0, y: 0 },
        parentId: parentId || undefined,
        extent: parentId ? ('parent' as const) : undefined,
        width: nodeWidth,
        height: nodeHeight,
        initialWidth: nodeWidth,
        initialHeight: nodeHeight,
        style: Object.keys(nodeStyle).length > 0 ? nodeStyle : undefined,
        data: {
          ...n.data,
          isContainer,
          childNodes,
          parentId,
          width: nodeWidth,
          height: nodeHeight,
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

    // Only fitView on initial load or when architecture chapter changes
    if (prevArchIdRef.current !== architecture.id) {
      prevArchIdRef.current = architecture.id;
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [initialNodes, initialEdges, architecture.id, fitView, setNodes, setEdges]);

  // Initial mount fitView
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Memoize nodes with selection state to avoid recreating new object references on every render
  const nodesWithSelection = useMemo(() => {
    return nodes.map((n) => {
      const isSelected = n.id === selectedNodeId;
      if (n.selected === isSelected) return n;
      return { ...n, selected: isSelected };
    });
  }, [nodes, selectedNodeId]);

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
      const timer = setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 60);
      return () => clearTimeout(timer);
    },
    [nodes, edges, fitView, setNodes, setEdges]
  );

  return (
    <div className="diagram-canvas-container" style={{ height: isFullscreen ? '100vh' : '435px' }}>
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
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.05}
        maxZoom={2.0}
        preventScrolling={false}
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

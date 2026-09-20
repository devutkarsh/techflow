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
  const containerIds = new Set(containerNodes.map((c) => c.id));

  // Build parent-to-child and child-to-parent mapping
  const childToParentMap = new Map<string, string>();
  containerNodes.forEach((container) => {
    const containerData = container.data as unknown as ArchitectureNodeData;
    let childIds: string[] = 
      (container as unknown as { childNodes?: string[] }).childNodes ||
      containerData?.childNodes ||
      [];

    if (childIds.length === 0) {
      childIds = nodes
        .filter((n) => (n.data as unknown as { parentId?: string })?.parentId === container.id || (n as unknown as { parentId?: string })?.parentId === container.id)
        .map((n) => n.id);
    }

    childIds.forEach((cId) => {
      childToParentMap.set(cId, container.id);
    });
  });

  // 1. Add all regular nodes to dagre
  regularNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 160 });
  });

  // 2. Add edges between regular nodes to dagre (skip edges attached to container itself)
  edges.forEach((edge) => {
    if (!containerIds.has(edge.source) && !containerIds.has(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  // 3. Compute global positions for regular nodes from dagre output
  const globalPositionMap = new Map<string, { x: number; y: number }>();
  regularNodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (nodeWithPosition) {
      globalPositionMap.set(node.id, {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 80,
      });
    }
  });

  // 4. Calculate bounding boxes and positions for container nodes
  const containerPositionsMap = new Map<string, { x: number; y: number; width: number; height: number; childIds: string[] }>();

  const positionedContainerNodes = containerNodes.map((container) => {
    const containerData = container.data as unknown as ArchitectureNodeData;
    let childIds: string[] = 
      (container as unknown as { childNodes?: string[] }).childNodes ||
      containerData?.childNodes ||
      [];

    if (childIds.length === 0) {
      childIds = nodes
        .filter((n) => (n.data as unknown as { parentId?: string })?.parentId === container.id || (n as unknown as { parentId?: string })?.parentId === container.id)
        .map((n) => n.id);
    }

    // Find global positions of child nodes that belong to this container
    const childPositions = childIds
      .map((id) => globalPositionMap.get(id))
      .filter((pos): pos is { x: number; y: number } => pos !== undefined);

    if (childPositions.length > 0) {
      const minX = Math.min(...childPositions.map((p) => p.x));
      const maxX = Math.max(...childPositions.map((p) => p.x + 220));
      const minY = Math.min(...childPositions.map((p) => p.y));
      const maxY = Math.max(...childPositions.map((p) => p.y + 160));

      const paddingLeft = 45;
      const paddingRight = 45;
      const paddingTop = 85; // Space for the container header bar
      const paddingBottom = 45;

      const width = (maxX - minX) + paddingLeft + paddingRight;
      const height = (maxY - minY) + paddingTop + paddingBottom;

      const containerX = minX - paddingLeft;
      const containerY = minY - paddingTop;

      containerPositionsMap.set(container.id, {
        x: containerX,
        y: containerY,
        width,
        height,
        childIds,
      });

      return {
        ...container,
        position: {
          x: containerX,
          y: containerY,
        },
        style: {
          ...container.style,
          width,
          height,
          zIndex: -1,
        },
        data: {
          ...containerData,
          width,
          height,
          childNodes: childIds,
        },
      };
    }

    // Fallback if no child nodes found
    return {
      ...container,
      style: {
        ...container.style,
        width: typeof container.style?.width === 'number' ? container.style.width : 920,
        height: typeof container.style?.height === 'number' ? container.style.height : 620,
        zIndex: -1,
      },
    };
  });

  // 5. Position regular nodes (relative to parent container if inside a container)
  const positionedRegularNodes = regularNodes.map((node) => {
    const globalPos = globalPositionMap.get(node.id) || { x: 0, y: 0 };
    const parentId = childToParentMap.get(node.id);

    if (parentId && containerPositionsMap.has(parentId)) {
      const parentContainer = containerPositionsMap.get(parentId)!;
      // Convert to relative coordinates inside the parent container
      const relativeX = globalPos.x - parentContainer.x;
      const relativeY = globalPos.y - parentContainer.y;

      return {
        ...node,
        parentId,
        extent: 'parent' as const,
        position: {
          x: relativeX,
          y: relativeY,
        },
        data: {
          ...node.data,
          parentId,
        },
      };
    }

    return {
      ...node,
      position: {
        x: globalPos.x,
        y: globalPos.y,
      },
    };
  });

  // Container nodes sorted first so they render underneath child nodes
  return { 
    nodes: [...positionedContainerNodes, ...positionedRegularNodes], 
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
    // Collect child-to-parent mapping from architecture nodes
    const childToParentMap = new Map<string, string>();
    architecture.nodes.forEach((n) => {
      const isContainer = n.type === 'containerNode' || n.data?.isContainer;
      if (isContainer) {
        const cIds = n.childNodes || n.data?.childNodes || [];
        cIds.forEach((cId) => childToParentMap.set(cId, n.id));
      }
      if (n.parentId || n.parentNode) {
        childToParentMap.set(n.id, (n.parentId || n.parentNode)!);
      }
    });

    // Sort so container nodes come first in the ReactFlow array hierarchy
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
      const parentId = childToParentMap.get(n.id);
      
      const nodeStyle: React.CSSProperties = {
        ...(n.width ? { width: n.width } : {}),
        ...(n.height ? { height: n.height } : {}),
        ...(isContainer ? { zIndex: -1 } : {}),
        ...n.style,
      };

      return {
        id: n.id,
        type: isContainer ? 'containerNode' : (n.type || 'architectureNode'),
        position: n.position || { x: 0, y: 0 },
        ...(parentId ? { parentId, extent: 'parent' as const } : {}),
        style: Object.keys(nodeStyle).length > 0 ? nodeStyle : undefined,
        data: {
          ...n.data,
          isContainer,
          childNodes,
          width: n.width,
          height: n.height,
          parentId,
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

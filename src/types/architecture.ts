export type NodeCategory = 
  | 'gateway'
  | 'compute'
  | 'database'
  | 'queue'
  | 'cache'
  | 'ai'
  | 'storage'
  | 'security'
  | 'client'
  | 'monitoring';

export type ProtocolType = 
  | 'gRPC'
  | 'REST / HTTPS'
  | 'Kafka Topic'
  | 'WebSocket'
  | 'GraphQL'
  | 'TCP / TLS'
  | 'Redis Protocol'
  | 'SQL'
  | 'Vector Query'
  | 'eBPF / Mesh';

export interface ArchitectureNodeSpecs {
  qps?: string;
  p99Latency?: string;
  replicas?: string;
  sla?: string;
  failoverStrategy?: string;
  stateful?: boolean;
  resourceAllocation?: string;
}

export interface ArchitectureNodeData {
  id: string;
  label: string;
  subtitle?: string;
  category: NodeCategory;
  description: string;
  iconName?: string;
  techStack: string[];
  url?: string;
  specs?: ArchitectureNodeSpecs;
  responsibilities?: string[];
  failureModes?: string[];
  configSnippet?: {
    language: string;
    code: string;
  };
  highlighted?: boolean;
  activeInSimulation?: boolean;
  pulse?: boolean;
}

export interface ArchitectureNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: ArchitectureNodeData;
}

export interface ArchitectureEdgeData {
  id: string;
  label?: string;
  protocol: ProtocolType;
  latency?: string;
  payloadType?: string;
  payloadSample?: string;
  authRequired?: boolean;
  rateLimit?: string;
  activeInSimulation?: boolean;
  bidirectional?: boolean;
  description?: string;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  data?: ArchitectureEdgeData;
}

export interface SimulationStep {
  step: number;
  title: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  payload?: {
    action: string;
    sample: Record<string, unknown> | string;
    protocol: string;
  };
  durationMs?: number;
  latencyExpectation?: string;
}

export interface TradeoffItem {
  decision: string;
  chosenApproach: string;
  pros: string[];
  cons: string[];
  rejectedAlternatives: string[];
}

export interface SecurityPolicy {
  area: string;
  standard: string;
  implementation: string;
}

export interface ArchitectureItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'FinTech & Streaming' | 'AI & LLM Orchestration' | 'Cloud Native & SaaS' | 'Media & Edge' | 'Security & Zero Trust' | string;
  version: string;
  enabled?: boolean; // If false, chapter is disabled and hidden from the architecture book
  publishedDate?: string; // Optional custom published date (e.g. "2026-09-18")
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  lastUpdated: string;
  readingTime: string;
  tags: string[];
  overview: {
    summary: string;
    problemStatement: string;
    corePrinciples: string[];
    targetScale: {
      dailyActiveUsers?: string;
      throughput?: string;
      storageVolume?: string;
      globalLatencyP99?: string;
    };
  };
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  simulationFlow: SimulationStep[];
  tradeoffs: TradeoffItem[];
  securityAndCompliance: SecurityPolicy[];
  keyMetrics: {
    availabilitySLA: string;
    readLatencyP99: string;
    writeLatencyP99: string;
    resilienceTier: string;
    costOptimizationTier: string;
  };
}

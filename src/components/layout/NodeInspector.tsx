import React from 'react';
import { 
  X, 
  Zap, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Server,
  ExternalLink 
} from 'lucide-react';
import type { ArchitectureNodeData, ArchitectureItem } from '../../types/architecture';

interface NodeInspectorProps {
  node: ArchitectureNodeData | null;
  architecture: ArchitectureItem;
  onClose: () => void;
  onSelectNodeById: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  architecture,
  onClose,
  onSelectNodeById,
}) => {
  if (!node) return null;

  // Compute inbound and outbound edges
  const inboundEdges = architecture.edges.filter((e) => e.target === node.id);
  const outboundEdges = architecture.edges.filter((e) => e.source === node.id);

  return (
    <div className="inspector-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="inspector-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Component Inspector</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="inspector-body">
          {/* Main Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className={`node-category-pill cat-${node.category}`}>
                {node.category}
              </span>
              {node.specs?.stateful !== undefined && (
                <span className="badge-version">
                  {node.specs.stateful ? 'Stateful' : 'Stateless'}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {node.label}
            </h3>
            {node.subtitle && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {node.subtitle}
              </p>
            )}
            {node.url && (
              <div style={{ marginTop: '0.6rem' }}>
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--neon-cyan)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.22)';
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Visit {node.url.replace(/^https?:\/\//, '')}</span>
                </a>
              </div>
            )}
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              {node.description}
            </p>
          </div>

          {/* Tech Stack */}
          {node.techStack && node.techStack.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Technologies & Protocols
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {node.techStack.map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specs Sheet */}
          {node.specs && (
            <div className="card-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={14} color="var(--accent-cyan)" />
                Operational Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {node.specs.qps && (
                  <div>
                    <div className="node-spec-label">Throughput / QPS</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {node.specs.qps}
                    </div>
                  </div>
                )}
                {node.specs.p99Latency && (
                  <div>
                    <div className="node-spec-label">P99 SLA</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {node.specs.p99Latency}
                    </div>
                  </div>
                )}
                {node.specs.replicas && (
                  <div>
                    <div className="node-spec-label">Topology / Pods</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                      {node.specs.replicas}
                    </div>
                  </div>
                )}
                {node.specs.sla && (
                  <div>
                    <div className="node-spec-label">Availability Target</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                      {node.specs.sla}
                    </div>
                  </div>
                )}
                {node.specs.failoverStrategy && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div className="node-spec-label">Failover Strategy</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {node.specs.failoverStrategy}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Responsibilities */}
          {node.responsibilities && node.responsibilities.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Core Responsibilities
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {node.responsibilities.map((resp, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Failure Modes & Edge Cases */}
          {node.failureModes && node.failureModes.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-rose)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={14} />
                Failure Handling
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {node.failureModes.map((fm, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {fm}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Connected Peers (Inbound & Outbound) */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Connected Data Pathways
            </div>
            
            {/* Inbound */}
            {inboundEdges.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <ArrowLeft size={12} /> Inbound Traffic ({inboundEdges.length})
                </div>
                {inboundEdges.map((e) => {
                  const sourceNode = architecture.nodes.find((n) => n.id === e.source);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onSelectNodeById(e.source)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.3rem',
                        fontSize: '0.78rem',
                        textAlign: 'left',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sourceNode?.data.label || e.source}
                      </span>
                      <span className="edge-protocol-pill" style={{ fontSize: '0.62rem' }}>
                        {e.data?.protocol || e.label || 'Link'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Outbound */}
            {outboundEdges.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <ArrowRight size={12} /> Outbound Traffic ({outboundEdges.length})
                </div>
                {outboundEdges.map((e) => {
                  const targetNode = architecture.nodes.find((n) => n.id === e.target);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onSelectNodeById(e.target)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.3rem',
                        fontSize: '0.78rem',
                        textAlign: 'left',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {targetNode?.data.label || e.target}
                      </span>
                      <span className="edge-protocol-pill" style={{ fontSize: '0.62rem' }}>
                        {e.data?.protocol || e.label || 'Link'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

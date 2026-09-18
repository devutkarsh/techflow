import React, { useState } from 'react';
import { 
  FileText, 
  Workflow, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import type { ArchitectureItem } from '../../types/architecture';

interface ArchitectureDocsProps {
  architecture: ArchitectureItem;
  onSelectSimulationStep: (stepIndex: number) => void;
}

export const ArchitectureDocs: React.FC<ArchitectureDocsProps> = ({
  architecture,
  onSelectSimulationStep,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'tradeoffs' | 'security'>('overview');

  return (
    <section className="docs-section" id="docs-section">
      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} />
          <span>System Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('flow')}
        >
          <Workflow size={16} />
          <span>Sequence Flow ({architecture.simulationFlow?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'tradeoffs' ? 'active' : ''}`}
          onClick={() => setActiveTab('tradeoffs')}
        >
          <Scale size={16} />
          <span>Architectural Trade-offs</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={16} />
          <span>Security & Compliance</span>
        </button>
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="card-panel">
            <h3 className="card-panel-title">
              <TrendingUp size={18} color="var(--neon-cyan)" />
              Executive Summary & Business Impact
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              {architecture.overview?.summary}
            </p>

            {architecture.overview?.problemStatement && (
              <div style={{ marginTop: '1rem', padding: '0.95rem 1.1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--neon-amber)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neon-amber)', marginBottom: '0.25rem' }}>
                  Problem Statement & Bottlenecks Solved
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  {architecture.overview.problemStatement}
                </div>
              </div>
            )}
          </div>

          {/* Target Scale Capacity */}
          {architecture.overview?.targetScale && (
            <div className="card-panel">
              <h3 className="card-panel-title">Target Operational Scale</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginTop: '0.5rem' }}>
                {architecture.overview.targetScale.dailyActiveUsers && (
                  <div className="hud-metric-card">
                    <span className="hud-metric-header">Daily Active Users / Seats</span>
                    <span className="hud-metric-value">{architecture.overview.targetScale.dailyActiveUsers}</span>
                  </div>
                )}
                {architecture.overview.targetScale.throughput && (
                  <div className="hud-metric-card">
                    <span className="hud-metric-header">Peak Throughput</span>
                    <span className="hud-metric-value">{architecture.overview.targetScale.throughput}</span>
                  </div>
                )}
                {architecture.overview.targetScale.storageVolume && (
                  <div className="hud-metric-card">
                    <span className="hud-metric-header">Data Storage Volume</span>
                    <span className="hud-metric-value" style={{ color: 'var(--neon-purple)' }}>{architecture.overview.targetScale.storageVolume}</span>
                  </div>
                )}
                {architecture.overview.targetScale.globalLatencyP99 && (
                  <div className="hud-metric-card">
                    <span className="hud-metric-header">End-to-End Latency Target</span>
                    <span className="hud-metric-value" style={{ color: 'var(--neon-emerald)' }}>{architecture.overview.targetScale.globalLatencyP99}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Core Principles */}
          {architecture.overview?.corePrinciples && (
            <div className="card-panel">
              <h3 className="card-panel-title">Core Architectural Tenets</h3>
              <ul className="principles-list">
                {architecture.overview.corePrinciples.map((principle, idx) => (
                  <li key={idx} className="principle-item">
                    <CheckCircle2 size={16} color="var(--neon-cyan)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sequence Flow */}
      {activeTab === 'flow' && (
        <div className="tab-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {architecture.simulationFlow?.map((step, idx) => (
              <div
                key={step.step}
                className="card-panel"
                style={{
                  cursor: 'pointer',
                  borderLeft: '3px solid var(--neon-emerald)',
                  transition: 'all var(--transition-fast)',
                }}
                onClick={() => onSelectSimulationStep(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="arch-category-badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--neon-emerald)', borderColor: 'rgba(52, 211, 153, 0.35)', marginBottom: 0 }}>
                      Step 0{step.step}
                    </span>
                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {step.title}
                    </span>
                  </div>
                  {step.latencyExpectation && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {step.latencyExpectation}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {step.description}
                </p>

                {/* Payload Preview */}
                {step.payload && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--neon-cyan)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      <span>{step.payload.action}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{step.payload.protocol}</span>
                    </div>
                    <pre style={{ margin: 0, color: '#94a3b8', overflowX: 'auto' }}>
                      {typeof step.payload.sample === 'string' ? step.payload.sample : JSON.stringify(step.payload.sample, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Trade-offs */}
      {activeTab === 'tradeoffs' && (
        <div className="tab-content">
          <div className="tradeoff-grid">
            {architecture.tradeoffs?.map((tradeoff, idx) => (
              <div key={idx} className="tradeoff-card">
                <div className="tradeoff-heading">{tradeoff.decision}</div>
                <div className="tradeoff-chosen">
                  <CheckCircle2 size={15} />
                  <span>Chosen: {tradeoff.chosenApproach}</span>
                </div>

                {/* Pros */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#86efac', marginBottom: '0.35rem' }}>
                    Architectural Advantages (Pros)
                  </div>
                  <ul className="pro-con-list">
                    {tradeoff.pros.map((p, i) => (
                      <li key={i} className="pro-item">
                        <span>+</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#fca5a5', marginBottom: '0.35rem' }}>
                    Compromises & Complexities (Cons)
                  </div>
                  <ul className="pro-con-list">
                    {tradeoff.cons.map((c, i) => (
                      <li key={i} className="con-item">
                        <span>-</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rejected Alternatives */}
                {tradeoff.rejectedAlternatives && tradeoff.rejectedAlternatives.length > 0 && (
                  <div style={{ paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>Rejected Options: </span>
                    {tradeoff.rejectedAlternatives.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Compliance */}
      {activeTab === 'security' && (
        <div className="tab-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {architecture.securityAndCompliance?.map((sec, idx) => (
              <div key={idx} className="card-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {sec.area}
                  </span>
                  <span className="arch-category-badge" style={{ marginBottom: 0, color: 'var(--neon-indigo)' }}>
                    {sec.standard}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.55 }}>
                  {sec.implementation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
};

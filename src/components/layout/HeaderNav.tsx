import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  BookOpen,
  Sparkles, 
  Clock, 
  Info, 
  X, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers,
  ListFilter,
  Share2,
  Check
} from 'lucide-react';
import type { ArchitectureItem } from '../../types/architecture';
import { ChapterPickerModal } from './ChapterPickerModal';

interface HeaderNavProps {
  architectures: ArchitectureItem[];
  currentIndex: number;
  onNavigateIndex: (index: number) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  architectures,
  currentIndex,
  onNavigateIndex,
  isSimulating,
  onToggleSimulation,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const currentArch = architectures[currentIndex] || architectures[0];
  const total = architectures.length;

  const handleShareChapter = () => {
    const chapterUrl = `${window.location.origin}/${currentArch.slug}`;
    navigator.clipboard.writeText(chapterUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!currentArch) return null;

  const { title, subtitle, category, version, readingTime, author, keyMetrics } = currentArch;

  return (
    <header className="center-header-section">
      {/* 1. Top Heading at Center Top */}
      <div className="top-brand-heading">
        <div className="brand-logo-glow">
          <Layers size={18} />
        </div>
        <h1 className="brand-heading-text">TechFlow Architecture Book</h1>
      </div>

      {/* 2. Chapter Stepper: Previous | Chapter X of Y (Clickable) | Next */}
      <div className="chapter-stepper-row">
        <button
          className="stepper-nav-button"
          onClick={() => onNavigateIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          title="Previous Architecture (Left Arrow Key)"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Clickable Chapter Badge */}
        <button
          className="chapter-indicator-badge clickable-chapter-btn"
          onClick={() => setShowChapterPicker(true)}
          title="Click to view all chapters & search"
        >
          <ListFilter size={13} style={{ marginRight: '0.3rem' }} />
          <span>CHAPTER {currentIndex + 1} OF {total}</span>
        </button>

        <button
          className="stepper-nav-button"
          onClick={() => onNavigateIndex(Math.min(total - 1, currentIndex + 1))}
          disabled={currentIndex === total - 1}
          title="Next Architecture (Right Arrow Key)"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 3. Title, Tags, Description, Author Block (Mobile & Desktop Responsive) */}
      <div className="architecture-meta-block">
        {/* Main Title (Placed right below chapter nav) */}
        <h2 className="architecture-center-title">{title}</h2>

        {/* Tags & Meta Row (Category, Version, Reading Time, and Desktop Inline Author) */}
        <div className="meta-badges-row">
          <span className="arch-category-pill">
            <Sparkles size={12} />
            {category}
          </span>
          <span className="arch-version-pill desktop-only-badge">{version}</span>
          <span className="arch-reading-time desktop-only-badge">
            <Clock size={12} />
            {readingTime}
          </span>

          {/* Desktop Author Attribution (Inline after reading time) */}
          {author && (
            <div className="author-desktop-attribution desktop-only-badge">
              <div className="author-avatar-tiny">
                {author.avatar || author.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="author-text-wrap">
                <span className="author-name-bold">{author.name}</span>
                <span className="author-role-dim">• {author.role}</span>
              </div>
            </div>
          )}

          {/* Share Chapter Link Button */}
          <button
            className="share-chapter-btn"
            onClick={handleShareChapter}
            title="Copy unique link to this chapter"
          >
            {copiedLink ? (
              <>
                <Check size={12} color="var(--neon-emerald)" />
                <span style={{ color: 'var(--neon-emerald)' }}>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={12} />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Mobile "More Info" Button (Inline with Category Tag on Mobile) */}
          <button
            className="mobile-info-trigger-btn"
            onClick={() => setShowInfoModal(true)}
            title="View full description, version, and author"
          >
            <Info size={13} />
            <span>More Info</span>
          </button>
        </div>

        {/* Description (Hidden on mobile, shown in More Info modal) */}
        <p className="architecture-center-desc">{subtitle}</p>

        {/* Desktop Key Metrics Row */}
        {keyMetrics && (
          <div className="desktop-metrics-hud-row">
            <div className="desktop-metric-pill">
              <Activity size={13} color="var(--neon-emerald)" />
              <span className="metric-label-dim">Availability:</span>
              <span className="metric-value-highlight" style={{ color: 'var(--neon-emerald)' }}>
                {keyMetrics.availabilitySLA}
              </span>
            </div>

            <div className="desktop-metric-pill">
              <Zap size={13} color="var(--neon-cyan)" />
              <span className="metric-label-dim">P99 Read:</span>
              <span className="metric-value-highlight" style={{ color: 'var(--neon-cyan)' }}>
                {keyMetrics.readLatencyP99}
              </span>
            </div>

            <div className="desktop-metric-pill">
              <Zap size={13} color="var(--neon-amber)" />
              <span className="metric-label-dim">P99 Write:</span>
              <span className="metric-value-highlight" style={{ color: 'var(--neon-amber)' }}>
                {keyMetrics.writeLatencyP99}
              </span>
            </div>

            <div className="desktop-metric-pill">
              <ShieldCheck size={13} color="var(--neon-indigo)" />
              <span className="metric-label-dim">Resilience:</span>
              <span className="metric-value-highlight" style={{ color: 'var(--neon-indigo)' }}>
                {keyMetrics.resilienceTier}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Buttons: Simulate & Expand */}
      <div className="center-actions-row">
        {currentArch.simulationFlow && currentArch.simulationFlow.length > 0 && (
          <button
            className={`action-pill-button ${isSimulating ? 'active-sim' : 'primary-sim'}`}
            onClick={onToggleSimulation}
            title="Toggle Step-by-Step Data Flow Simulator (Press 'S')"
          >
            {isSimulating ? (
              <>
                <Pause size={15} />
                <span>Simulating Request...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="#fff" />
                <span>Simulate Flow</span>
              </>
            )}
          </button>
        )}

        <button
          className="action-pill-button secondary-expand"
          onClick={() => {
            document.getElementById('docs-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Scroll down to System Overview and Deep Dive Documentation"
        >
          <BookOpen size={15} />
          <span>Read Docs</span>
        </button>
      </div>

      {/* Chapter Picker Modal (Opens when clicking Chapter X of Y) */}
      <ChapterPickerModal
        isOpen={showChapterPicker}
        onClose={() => setShowChapterPicker(false)}
        architectures={architectures}
        currentIndex={currentIndex}
        onSelectIndex={onNavigateIndex}
      />

      {/* "More Info" Modal (Contains Version, Author, Full Description, and KPIs) */}
      {showInfoModal && (
        <div className="inspector-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="mobile-info-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-info-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--neon-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Architecture Details</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowInfoModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="mobile-info-body">
              {/* Category, Version & Read time header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span className="arch-category-pill">
                  {category}
                </span>
                <span className="arch-version-pill">{version}</span>
                <span className="arch-reading-time">
                  <Clock size={12} />
                  {readingTime}
                </span>
              </div>

              {/* Title & Full Description */}
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '0.5rem', lineHeight: 1.55 }}>
                  {subtitle}
                </p>
              </div>

              {/* Author Card */}
              {author && (
                <div className="hud-metric-card" style={{ padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Systems Architect
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="author-avatar-tiny" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                      {author.avatar || author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{author.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{author.role}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Metrics HUD */}
              {keyMetrics && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="hud-metric-card">
                    <div className="hud-metric-header">
                      <Activity size={12} color="var(--neon-emerald)" />
                      <span>Availability</span>
                    </div>
                    <div className="hud-metric-value" style={{ color: 'var(--neon-emerald)', fontSize: '0.92rem' }}>
                      {keyMetrics.availabilitySLA}
                    </div>
                  </div>

                  <div className="hud-metric-card">
                    <div className="hud-metric-header">
                      <Zap size={12} color="var(--neon-cyan)" />
                      <span>P99 Read</span>
                    </div>
                    <div className="hud-metric-value" style={{ fontSize: '0.92rem' }}>
                      {keyMetrics.readLatencyP99}
                    </div>
                  </div>

                  <div className="hud-metric-card">
                    <div className="hud-metric-header">
                      <Zap size={12} color="var(--neon-amber)" />
                      <span>P99 Write</span>
                    </div>
                    <div className="hud-metric-value" style={{ color: 'var(--neon-amber)', fontSize: '0.92rem' }}>
                      {keyMetrics.writeLatencyP99}
                    </div>
                  </div>

                  <div className="hud-metric-card">
                    <div className="hud-metric-header">
                      <ShieldCheck size={12} color="var(--neon-indigo)" />
                      <span>Resilience</span>
                    </div>
                    <div className="hud-metric-value" style={{ color: 'var(--neon-indigo)', fontSize: '0.8rem' }}>
                      {keyMetrics.resilienceTier}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Clock, 
  Layers, 
  Calendar,
  CheckCircle2 
} from 'lucide-react';
import type { ArchitectureItem } from '../../types/architecture';

interface ChapterPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  architectures: ArchitectureItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const ChapterPickerModal: React.FC<ChapterPickerModalProps> = ({
  isOpen,
  onClose,
  architectures,
  currentIndex,
  onSelectIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    return architectures
      .map((arch, originalIdx) => ({ arch, originalIdx }))
      .filter(({ arch }) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          arch.title.toLowerCase().includes(q) ||
          arch.subtitle.toLowerCase().includes(q) ||
          arch.category.toLowerCase().includes(q) ||
          arch.tags.some((t) => t.toLowerCase().includes(q)) ||
          arch.nodes.some((n) => n.data.label.toLowerCase().includes(q))
        );
      });
  }, [architectures, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="inspector-overlay" onClick={onClose}>
      <div className="chapter-picker-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="chapter-picker-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} color="var(--neon-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Table of Contents</h3>
            <span className="chapter-indicator-badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
              {architectures.length} Chapters
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Search Box */}
        <div className="chapter-picker-search">
          <div className="search-input-wrapper">
            <Search size={15} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search chapters, patterns, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chapters List */}
        <div className="chapter-picker-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No architecture chapters matched "{searchQuery}"
            </div>
          ) : (
            filtered.map(({ arch, originalIdx }) => {
              const isActive = originalIdx === currentIndex;
              return (
                <button
                  key={arch.id || originalIdx}
                  className={`chapter-picker-card-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectIndex(originalIdx);
                    onClose();
                  }}
                >
                  <div className="chapter-picker-num">
                    {originalIdx + 1 < 10 ? `0${originalIdx + 1}` : originalIdx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span className="arch-category-pill" style={{ fontSize: '0.64rem', padding: '0.12rem 0.5rem' }}>
                        {arch.category}
                      </span>
                      {isActive && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--neon-cyan)', fontWeight: 700 }}>
                          <CheckCircle2 size={13} /> Active
                        </span>
                      )}
                    </div>

                    <div className="chapter-picker-title">
                      {arch.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {(arch.publishedDate || arch.lastUpdated) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neon-cyan)' }}>
                          <Calendar size={11} />
                          {new Date(arch.publishedDate || arch.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} />
                        {arch.readingTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Layers size={11} />
                        {arch.nodes?.length || 0} Components
                      </span>
                      {arch.author && (
                        <span style={{ color: 'var(--text-dim)' }}>
                          By {arch.author.name}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

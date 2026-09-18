import React, { useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SimulationStep } from '../../types/architecture';

interface SimulationBarProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onSelectStepIndex: (idx: number) => void;
  onClose: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  onSelectStepIndex,
  onClose,
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      const duration = currentStep?.durationMs || 2000;
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          onNextStep();
        } else {
          // Finished flow! Trigger subtle celebratory confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
          onTogglePlay();
        }
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, currentStep?.durationMs, onNextStep, onTogglePlay]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="simulation-bar">
      {/* Play / Step Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          className="sim-btn"
          onClick={onPrevStep}
          disabled={currentStepIndex === 0}
          title="Step Backward"
        >
          <SkipBack size={15} />
        </button>

        <button
          className={`sim-btn ${isPlaying ? '' : 'sim-btn-play'}`}
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause Simulation' : 'Auto-Play Simulation'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} fill="#fff" />}
        </button>

        <button
          className="sim-btn"
          onClick={onNextStep}
          disabled={currentStepIndex === steps.length - 1}
          title="Step Forward"
        >
          <SkipForward size={15} />
        </button>

        <button
          className="sim-btn"
          onClick={onReset}
          title="Restart from Step 1"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-medium)' }} />

      {/* Step Info */}
      <div className="sim-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="sim-step-badge">
            STEP {currentStepIndex + 1}/{steps.length}
          </span>
          {currentStep?.latencyExpectation && (
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
              ({currentStep.latencyExpectation})
            </span>
          )}
        </div>
        <div className="sim-title" title={currentStep?.title}>
          {currentStep?.title}
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectStepIndex(idx)}
            style={{
              width: idx === currentStepIndex ? '20px' : '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: idx === currentStepIndex ? 'var(--accent-emerald)' : idx < currentStepIndex ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
              transition: 'all 0.2s ease',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
            title={`Step ${idx + 1}: ${s.title}`}
          />
        ))}
      </div>

      {/* Close Simulation Button */}
      <button
        className="btn-icon"
        style={{ width: '28px', height: '28px', marginLeft: '0.25rem' }}
        onClick={onClose}
        title="Exit Simulation Mode"
      >
        <X size={14} />
      </button>
    </div>
  );
};
